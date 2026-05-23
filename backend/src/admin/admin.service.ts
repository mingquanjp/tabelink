import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, ILike, Repository } from 'typeorm';
import { AccountStatus, AuthRole, UserRole } from '../auth/auth.constants';
import { JwtPayload } from '../auth/auth.types';
import { CustomerProfile } from '../auth/entities/customer-profile.entity';
import { OwnerProfile } from '../auth/entities/owner-profile.entity';
import { UserAccount } from '../auth/entities/user-account.entity';
import { ADMIN_ACCOUNT_STATUSES } from './admin.constants';
import { AdminUserActionDto } from './dto/admin-user-action.dto';
import { AdminVerificationActionDto } from './dto/admin-verification-action.dto';
import { ChangeUserRoleDto } from './dto/change-user-role.dto';
import { ListAdminActionLogsQueryDto } from './dto/list-admin-action-logs-query.dto';
import { ListAdminVerificationApplicationsQueryDto } from './dto/list-admin-verification-applications-query.dto';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import {
  AdminActionLog,
  AdminActionType,
} from './entities/admin-action-log.entity';

interface CountRow {
  key: string;
  count: number | string;
}

interface TotalCountRow {
  totalItems: number | string;
}

interface AdminVerificationCountsRow {
  allCount: number | string;
  pendingCount: number | string;
  approvedCount: number | string;
  rejectedCount: number | string;
}

interface AdminVerificationApplicationRow {
  appId: number | string;
  restaurantId: number | string;
  badgeId: number | string;
  submittedByOwnerAccountId: number | string;
  reviewedByAdminId: number | string | null;
  businessLicenseUrl: string | null;
  foodSafetyCertUrl: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: Date | string;
  reviewedAt: Date | string | null;
  reviewNote: string | null;
  badgeCode: string | null;
  badgeNameVn: string | null;
  badgeNameJp: string | null;
  nameVn: string;
  nameJp: string;
  address: string;
  issuesVat: boolean;
  thumbnailUrl: string | null;
  mainImageUrl: string | null;
  ratingAverage: number | string | null;
  reviewCount: number | string;
  hasActiveBadge: boolean;
  evidencePhotos: string[] | string | null;
}

interface AdminVerificationDocumentRow {
  businessLicenseUrl: string | null;
  businessLicensePublicId: string | null;
  foodSafetyCertUrl: string | null;
  foodSafetyCertPublicId: string | null;
}

interface VerificationApplicationLockRow {
  appId: number | string;
  restaurantId: number | string;
  badgeId: number | string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userRepo: Repository<UserAccount>,
    @InjectRepository(CustomerProfile)
    private readonly customerRepo: Repository<CustomerProfile>,
    @InjectRepository(OwnerProfile)
    private readonly ownerRepo: Repository<OwnerProfile>,
    @InjectRepository(AdminActionLog)
    private readonly actionLogRepo: Repository<AdminActionLog>,
    private readonly dataSource: DataSource,
  ) {}

  async listUsers(query: ListAdminUsersQueryDto, admin: JwtPayload) {
    this.assertAdmin(admin);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.userRepo
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.customerProfile', 'customerProfile')
      .leftJoinAndSelect('account.ownerProfile', 'ownerProfile');

    if (query.search?.trim()) {
      const keyword = `%${query.search.trim()}%`;
      qb.andWhere(
        `(
          account.email ILIKE :keyword
          OR "customerProfile".fullname ILIKE :keyword
          OR "customerProfile".displayname ILIKE :keyword
          OR "ownerProfile".fullname ILIKE :keyword
          OR "ownerProfile".businessname ILIKE :keyword
        )`,
        { keyword },
      );
    }

    if (query.role) {
      qb.andWhere('account.role = :role', { role: query.role });
    }

    if (query.status) {
      qb.andWhere('account.status = :status', { status: query.status });
    }

    qb.orderBy('account.createdAt', 'DESC')
      .addOrderBy('account.accountId', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [accounts, total] = await qb.getManyAndCount();
    const kpi = await this.getUserKpis(admin);

    return {
      items: accounts.map((account) => this.toAdminUserResponse(account)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      kpi,
      filters: {
        roles: Object.values(UserRole),
        statuses: ADMIN_ACCOUNT_STATUSES,
      },
    };
  }

  async getUserKpis(admin: JwtPayload) {
    this.assertAdmin(admin);

    const [total, roleRows, statusRows] = await Promise.all([
      this.userRepo.count(),
      this.userRepo
        .createQueryBuilder('account')
        .select('account.role', 'key')
        .addSelect('COUNT(*)::int', 'count')
        .groupBy('account.role')
        .getRawMany<CountRow>(),
      this.userRepo
        .createQueryBuilder('account')
        .select('account.status', 'key')
        .addSelect('COUNT(*)::int', 'count')
        .groupBy('account.status')
        .getRawMany<CountRow>(),
    ]);

    const byRole = this.toCountMap(roleRows, Object.values(UserRole));
    const byStatus = this.toCountMap(statusRows, ADMIN_ACCOUNT_STATUSES);

    return {
      total,
      byRole,
      byStatus,
      activeUsers: byRole.User,
      activeOwners: byRole.Owner,
      banned: byStatus.Banned,
      disabled: byStatus.Disabled,
    };
  }

  async updateUser(
    accountId: number,
    dto: UpdateAdminUserDto,
    admin: JwtPayload,
  ) {
    this.assertAdmin(admin);
    this.assertNotSelfLockout(accountId, admin, dto.role, dto.status);

    return this.dataSource.transaction(async (manager) => {
      const account = await manager.findOne(UserAccount, {
        where: { accountId },
        relations: {
          customerProfile: true,
          ownerProfile: true,
        },
      });

      if (!account) {
        throw new NotFoundException('User account was not found.');
      }

      const before = this.snapshotAccount(account);

      if (dto.email !== undefined) {
        const email = dto.email.trim().toLowerCase();
        const existing = await manager.findOne(UserAccount, {
          where: { email: ILike(email) },
        });

        if (existing && existing.accountId !== accountId) {
          throw new ConflictException('Email is already used by another user.');
        }

        account.email = email;
      }

      if (dto.role !== undefined) {
        account.role = dto.role;
      }

      if (dto.status !== undefined) {
        account.status = dto.status;
      }

      await manager.save(UserAccount, account);
      await this.upsertProfile(manager, account, dto);

      const saved = await manager.findOneOrFail(UserAccount, {
        where: { accountId },
        relations: {
          customerProfile: true,
          ownerProfile: true,
        },
      });

      const after = this.snapshotAccount(saved);
      await manager.save(
        AdminActionLog,
        manager.create(AdminActionLog, {
          adminAccountId: admin.sub,
          targetAccountId: accountId,
          actionType:
            before.role !== after.role
              ? AdminActionType.ChangeRole
              : AdminActionType.UpdateUser,
          actionContent: this.describeChange(before, after),
          reason: this.optionalTrim(dto.reason) ?? null,
        }),
      );

      return this.toAdminUserResponse(saved);
    });
  }

  changeRole(accountId: number, dto: ChangeUserRoleDto, admin: JwtPayload) {
    return this.updateUser(
      accountId,
      {
        role: dto.role,
        reason: dto.reason,
      },
      admin,
    );
  }

  setBan(accountId: number, dto: AdminUserActionDto, admin: JwtPayload) {
    return this.setStatusWithReason(
      accountId,
      AccountStatus.Banned,
      AdminActionType.Ban,
      dto.reason,
      admin,
    );
  }

  restore(accountId: number, dto: AdminUserActionDto, admin: JwtPayload) {
    return this.setStatusWithReason(
      accountId,
      AccountStatus.Active,
      AdminActionType.Restore,
      dto.reason,
      admin,
    );
  }

  softDelete(accountId: number, dto: AdminUserActionDto, admin: JwtPayload) {
    return this.setStatusWithReason(
      accountId,
      AccountStatus.Disabled,
      AdminActionType.SoftDelete,
      dto.reason,
      admin,
    );
  }

  async listActionLogs(query: ListAdminActionLogsQueryDto, admin: JwtPayload) {
    this.assertAdmin(admin);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.actionLogRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.admin', 'admin')
      .leftJoinAndSelect('log.target', 'target');

    if (query.targetAccountId) {
      qb.andWhere('log.targetaccountid = :targetAccountId', {
        targetAccountId: query.targetAccountId,
      });
    }

    if (query.actionType) {
      qb.andWhere('log.actiontype = :actionType', {
        actionType: query.actionType,
      });
    }

    qb.orderBy('log.createdAt', 'DESC')
      .addOrderBy('log.logId', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [logs, total] = await qb.getManyAndCount();

    return {
      items: logs.map((log) => ({
        logId: log.logId,
        adminAccountId: log.adminAccountId,
        adminEmail: log.admin?.email ?? null,
        targetAccountId: log.targetAccountId,
        targetEmail: log.target?.email ?? null,
        actionType: log.actionType,
        actionContent: log.actionContent,
        reason: log.reason ?? null,
        createdAt: log.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listVerificationApplications(
    query: ListAdminVerificationApplicationsQueryDto,
    admin: JwtPayload,
  ) {
    this.assertAdmin(admin);

    const page = query.page ?? 1;
    const limit = query.limit ?? 24;
    const offset = (page - 1) * limit;
    const params: Array<string | number> = [];
    const whereClauses: string[] = [];

    if (query.status && query.status !== 'all') {
      params.push(query.status);
      whereClauses.push(`ba.Status = $${params.length}`);
    }

    const whereSql = whereClauses.length
      ? `WHERE ${whereClauses.join(' AND ')}`
      : '';

    const [countRows, statusRows] = await Promise.all([
      this.dataSource.query<TotalCountRow[]>(
        `
          SELECT COUNT(*) AS "totalItems"
          FROM BADGE_APPLICATION ba
          ${whereSql}
        `,
        params,
      ),
      this.dataSource.query<AdminVerificationCountsRow[]>(
        `
          SELECT
            COUNT(*) AS "allCount",
            COUNT(*) FILTER (WHERE Status = 'Pending') AS "pendingCount",
            COUNT(*) FILTER (WHERE Status = 'Approved') AS "approvedCount",
            COUNT(*) FILTER (WHERE Status = 'Rejected') AS "rejectedCount"
          FROM BADGE_APPLICATION
        `,
      ),
    ]);

    const totalItems = Number(countRows[0]?.totalItems ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const rows = await this.dataSource.query<AdminVerificationApplicationRow[]>(
      `
        ${this.adminVerificationApplicationSelectSql()}
        ${whereSql}
        ORDER BY
          CASE ba.Status
            WHEN 'Pending' THEN 1
            WHEN 'Approved' THEN 2
            WHEN 'Rejected' THEN 3
            ELSE 4
          END,
          ba.SubmittedAt DESC,
          ba.AppID DESC
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2}
      `,
      [...params, limit, offset],
    );

    const counts = statusRows[0] ?? {
      allCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    };

    return {
      items: rows.map((row) => this.toAdminVerificationApplication(row)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
      counts: {
        all: Number(counts.allCount),
        pending: Number(counts.pendingCount),
        approved: Number(counts.approvedCount),
        rejected: Number(counts.rejectedCount),
      },
    };
  }

  async getVerificationApplication(appId: number, admin: JwtPayload) {
    this.assertAdmin(admin);

    const row = await this.findVerificationApplicationRow(appId);
    return this.toAdminVerificationApplication(row);
  }

  async getVerificationDocument(
    appId: number,
    documentType: 'business-license' | 'food-safety-certificate',
    admin: JwtPayload,
  ) {
    this.assertAdmin(admin);

    const rows = await this.dataSource.query<AdminVerificationDocumentRow[]>(
      `
        SELECT
          BusinessLicenseURL AS "businessLicenseUrl",
          BusinessLicensePublicID AS "businessLicensePublicId",
          FoodSafetyCertURL AS "foodSafetyCertUrl",
          FoodSafetyCertPublicID AS "foodSafetyCertPublicId"
        FROM BADGE_APPLICATION
        WHERE AppID = $1
      `,
      [appId],
    );
    const row = rows[0];

    if (!row) {
      throw new NotFoundException('Badge application was not found.');
    }

    const sourceUrl =
      documentType === 'business-license'
        ? row.businessLicenseUrl
        : row.foodSafetyCertUrl;
    const publicId =
      documentType === 'business-license'
        ? row.businessLicensePublicId
        : row.foodSafetyCertPublicId;

    if (!sourceUrl) {
      throw new NotFoundException('Verification document was not found.');
    }

    return {
      fileName:
        documentType === 'business-license'
          ? 'business-license'
          : 'food-safety-certificate',
      contentType: this.inferVerificationDocumentContentType(
        sourceUrl,
        publicId,
      ),
      urls: this.toVerificationDocumentUrlCandidates(sourceUrl, publicId),
    };
  }

  async approveVerificationApplication(
    appId: number,
    dto: AdminVerificationActionDto,
    admin: JwtPayload,
  ) {
    this.assertAdmin(admin);

    await this.dataSource.transaction(async (manager) => {
      const current = await this.findVerificationApplicationForUpdate(
        manager,
        appId,
      );

      if (current.status !== 'Pending') {
        throw new BadRequestException(
          'Only pending badge applications can be approved.',
        );
      }

      await manager.query(
        `
          UPDATE BADGE_APPLICATION
          SET
            Status = 'Approved',
            ReviewedByAdminID = $2,
            ReviewedAt = CURRENT_TIMESTAMP,
            ReviewNote = $3
          WHERE AppID = $1
        `,
        [appId, admin.sub, this.optionalTrim(dto.reason) ?? null],
      );

      await manager.query(
        `
          INSERT INTO RESTAURANT_BADGE (
            RestaurantID,
            BadgeID,
            GrantedByAdminID,
            GrantedAt,
            ExpiresAt
          )
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP, NULL)
          ON CONFLICT (RestaurantID, BadgeID)
          DO UPDATE SET
            GrantedByAdminID = EXCLUDED.GrantedByAdminID,
            GrantedAt = CURRENT_TIMESTAMP,
            ExpiresAt = NULL
        `,
        [current.restaurantId, current.badgeId, admin.sub],
      );

      await this.insertBadgeModerationLog(
        manager,
        admin.sub,
        appId,
        'Approve',
        this.optionalTrim(dto.reason) ?? null,
      );
    });

    return this.getVerificationApplication(appId, admin);
  }

  async rejectVerificationApplication(
    appId: number,
    dto: AdminVerificationActionDto,
    admin: JwtPayload,
  ) {
    this.assertAdmin(admin);
    const reason = this.requiredTrim(dto.reason ?? '', 'rejection reason');

    await this.dataSource.transaction(async (manager) => {
      const current = await this.findVerificationApplicationForUpdate(
        manager,
        appId,
      );

      if (current.status !== 'Pending') {
        throw new BadRequestException(
          'Only pending badge applications can be rejected.',
        );
      }

      await manager.query(
        `
          UPDATE BADGE_APPLICATION
          SET
            Status = 'Rejected',
            ReviewedByAdminID = $2,
            ReviewedAt = CURRENT_TIMESTAMP,
            ReviewNote = $3
          WHERE AppID = $1
        `,
        [appId, admin.sub, reason],
      );

      await this.insertBadgeModerationLog(
        manager,
        admin.sub,
        appId,
        'Reject',
        reason,
      );
    });

    return this.getVerificationApplication(appId, admin);
  }

  async requestVerificationInformation(
    appId: number,
    dto: AdminVerificationActionDto,
    admin: JwtPayload,
  ) {
    this.assertAdmin(admin);
    const reason = this.requiredTrim(dto.reason ?? '', 'message');

    await this.dataSource.transaction(async (manager) => {
      const current = await this.findVerificationApplicationForUpdate(
        manager,
        appId,
      );

      if (current.status !== 'Pending') {
        throw new BadRequestException(
          'Only pending badge applications can request additional information.',
        );
      }

      await manager.query(
        `
          UPDATE BADGE_APPLICATION
          SET
            ReviewedByAdminID = $2,
            ReviewedAt = CURRENT_TIMESTAMP,
            ReviewNote = $3
          WHERE AppID = $1
        `,
        [appId, admin.sub, reason],
      );
    });

    return this.getVerificationApplication(appId, admin);
  }

  async revokeVerificationBadge(
    appId: number,
    dto: AdminVerificationActionDto,
    admin: JwtPayload,
  ) {
    this.assertAdmin(admin);
    const reason = this.requiredTrim(dto.reason ?? '', 'revoke reason');

    await this.dataSource.transaction(async (manager) => {
      const current = await this.findVerificationApplicationForUpdate(
        manager,
        appId,
      );

      if (current.status !== 'Approved') {
        throw new BadRequestException(
          'Only approved badge applications can be revoked.',
        );
      }

      await manager.query(
        `
          DELETE FROM RESTAURANT_BADGE
          WHERE RestaurantID = $1
            AND BadgeID = $2
        `,
        [current.restaurantId, current.badgeId],
      );

      await manager.query(
        `
          UPDATE BADGE_APPLICATION
          SET
            Status = 'Rejected',
            ReviewedByAdminID = $2,
            ReviewedAt = CURRENT_TIMESTAMP,
            ReviewNote = $3
          WHERE AppID = $1
        `,
        [appId, admin.sub, `Badge revoked: ${reason}`],
      );

      await this.insertBadgeModerationLog(
        manager,
        admin.sub,
        appId,
        'Delete',
        reason,
      );
    });

    return this.getVerificationApplication(appId, admin);
  }

  private async setStatusWithReason(
    accountId: number,
    status: AccountStatus,
    actionType: AdminActionType,
    reason: string,
    admin: JwtPayload,
  ) {
    this.assertAdmin(admin);
    this.assertNotSelfLockout(accountId, admin, undefined, status);

    const trimmedReason = this.requiredTrim(reason, 'reason');

    return this.dataSource.transaction(async (manager) => {
      const account = await manager.findOne(UserAccount, {
        where: { accountId },
        relations: {
          customerProfile: true,
          ownerProfile: true,
        },
      });

      if (!account) {
        throw new NotFoundException('User account was not found.');
      }

      const previousStatus = account.status;
      account.status = status;
      await manager.save(UserAccount, account);

      await manager.save(
        AdminActionLog,
        manager.create(AdminActionLog, {
          adminAccountId: admin.sub,
          targetAccountId: accountId,
          actionType,
          actionContent: `Status changed from ${previousStatus} to ${status}.`,
          reason: trimmedReason,
        }),
      );

      return this.toAdminUserResponse(account);
    });
  }

  private async upsertProfile(
    manager: EntityManager,
    account: UserAccount,
    dto: UpdateAdminUserDto,
  ) {
    if (account.role === UserRole.User) {
      let profile =
        account.customerProfile ??
        (await manager.findOne(CustomerProfile, {
          where: { accountId: account.accountId },
        }));

      if (!profile) {
        profile = manager.create(CustomerProfile, {
          accountId: account.accountId,
          fullName:
            this.optionalTrim(dto.fullName) ??
            account.ownerProfile?.fullName ??
            account.email,
        });
      }

      if (dto.fullName !== undefined) {
        profile.fullName = this.requiredTrim(dto.fullName, 'fullName');
      }

      if (dto.displayName !== undefined) {
        profile.displayName = this.optionalTrim(dto.displayName);
      }

      await manager.save(CustomerProfile, profile);
    }

    if (account.role === UserRole.Owner) {
      let profile =
        account.ownerProfile ??
        (await manager.findOne(OwnerProfile, {
          where: { accountId: account.accountId },
        }));

      if (!profile) {
        profile = manager.create(OwnerProfile, {
          accountId: account.accountId,
          fullName:
            this.optionalTrim(dto.fullName) ??
            account.customerProfile?.fullName ??
            account.email,
        });
      }

      if (dto.fullName !== undefined) {
        profile.fullName = this.requiredTrim(dto.fullName, 'fullName');
      }

      if (dto.phone !== undefined) {
        profile.phone = this.optionalTrim(dto.phone);
      }

      if (dto.businessName !== undefined) {
        profile.businessName = this.optionalTrim(dto.businessName);
      }

      await manager.save(OwnerProfile, profile);
    }
  }

  private assertAdmin(user: JwtPayload) {
    if (user.role !== AuthRole.Admin) {
      throw new ForbiddenException('Only admins can use this endpoint.');
    }
  }

  private assertNotSelfLockout(
    accountId: number,
    admin: JwtPayload,
    role?: UserRole,
    status?: AccountStatus,
  ) {
    if (accountId !== admin.sub) {
      return;
    }

    if (role && role !== UserRole.Admin) {
      throw new BadRequestException(
        'Admins cannot remove their own admin role.',
      );
    }

    if (
      status &&
      [AccountStatus.Banned, AccountStatus.Disabled].includes(status)
    ) {
      throw new BadRequestException('Admins cannot ban or disable themselves.');
    }
  }

  private adminVerificationApplicationSelectSql() {
    return `
      SELECT
        ba.AppID AS "appId",
        ba.RestaurantID AS "restaurantId",
        ba.BadgeID AS "badgeId",
        ba.SubmittedByOwnerAccountID AS "submittedByOwnerAccountId",
        ba.ReviewedByAdminID AS "reviewedByAdminId",
        ba.BusinessLicenseURL AS "businessLicenseUrl",
        ba.FoodSafetyCertURL AS "foodSafetyCertUrl",
        ba.Status AS "status",
        ba.SubmittedAt AS "submittedAt",
        ba.ReviewedAt AS "reviewedAt",
        ba.ReviewNote AS "reviewNote",
        bm.BadgeCode AS "badgeCode",
        bm.BadgeNameVN AS "badgeNameVn",
        bm.BadgeNameJP AS "badgeNameJp",
        r.NameVN AS "nameVn",
        r.NameJP AS "nameJp",
        r.Address AS "address",
        r.IssuesVAT AS "issuesVat",
        (
          SELECT rm.MediaURL
          FROM RESTAURANT_MEDIA rm
          WHERE rm.RestaurantID = r.RestaurantID
          ORDER BY
            CASE rm.MediaType
              WHEN 'Cover' THEN 0
              WHEN 'Photo' THEN 1
              ELSE 2
            END,
            rm.SortOrder ASC,
            rm.MediaID ASC
          LIMIT 1
        ) AS "thumbnailUrl",
        (
          SELECT rm.MediaURL
          FROM RESTAURANT_MEDIA rm
          WHERE rm.RestaurantID = r.RestaurantID
          ORDER BY
            CASE rm.MediaType
              WHEN 'Cover' THEN 0
              WHEN 'Photo' THEN 1
              ELSE 2
            END,
            rm.SortOrder ASC,
            rm.MediaID ASC
          LIMIT 1
        ) AS "mainImageUrl",
        (
          SELECT ROUND(AVG(rv.Rating)::numeric, 1)
          FROM REVIEW rv
          WHERE rv.RestaurantID = r.RestaurantID
            AND rv.Status = 'Visible'
        ) AS "ratingAverage",
        (
          SELECT COUNT(*)::int
          FROM REVIEW rv
          WHERE rv.RestaurantID = r.RestaurantID
            AND rv.Status = 'Visible'
        ) AS "reviewCount",
        EXISTS (
          SELECT 1
          FROM RESTAURANT_BADGE rb
          WHERE rb.RestaurantID = ba.RestaurantID
            AND rb.BadgeID = ba.BadgeID
            AND (rb.ExpiresAt IS NULL OR rb.ExpiresAt > CURRENT_TIMESTAMP)
        ) AS "hasActiveBadge",
        COALESCE(
          (
            SELECT json_agg(photo.MediaURL ORDER BY photo.SortOrder, photo.MediaID)
            FROM (
              SELECT rm.MediaURL, rm.SortOrder, rm.MediaID
              FROM RESTAURANT_MEDIA rm
              WHERE rm.RestaurantID = r.RestaurantID
              ORDER BY
                CASE rm.MediaType
                  WHEN 'Photo' THEN 0
                  WHEN 'Cover' THEN 1
                  ELSE 2
                END,
                rm.SortOrder ASC,
                rm.MediaID ASC
              LIMIT 2
            ) photo
          ),
          '[]'::json
        ) AS "evidencePhotos"
      FROM BADGE_APPLICATION ba
      INNER JOIN RESTAURANT r
        ON r.RestaurantID = ba.RestaurantID
      LEFT JOIN BADGE_MASTER bm
        ON bm.BadgeID = ba.BadgeID
    `;
  }

  private async findVerificationApplicationRow(appId: number) {
    const rows = await this.dataSource.query<AdminVerificationApplicationRow[]>(
      `
        ${this.adminVerificationApplicationSelectSql()}
        WHERE ba.AppID = $1
      `,
      [appId],
    );

    const row = rows[0];

    if (!row) {
      throw new NotFoundException('Badge application was not found.');
    }

    return row;
  }

  private async findVerificationApplicationForUpdate(
    manager: EntityManager,
    appId: number,
  ) {
    const rows = await manager.query<VerificationApplicationLockRow[]>(
      `
        SELECT
          AppID AS "appId",
          RestaurantID AS "restaurantId",
          BadgeID AS "badgeId",
          Status AS "status"
        FROM BADGE_APPLICATION
        WHERE AppID = $1
        FOR UPDATE
      `,
      [appId],
    );

    const row = rows[0];

    if (!row) {
      throw new NotFoundException('Badge application was not found.');
    }

    return row;
  }

  private async insertBadgeModerationLog(
    manager: EntityManager,
    adminAccountId: number,
    appId: number,
    actionType: 'Approve' | 'Reject' | 'Delete',
    reason: string | null,
  ) {
    await manager.query(
      `
        INSERT INTO MODERATION_LOG (
          AdminAccountID,
          TargetType,
          TargetID,
          ActionType,
          Reason
        )
        VALUES ($1, 'BadgeApplication', $2, $3, $4)
      `,
      [adminAccountId, appId, actionType, reason],
    );
  }

  private toAdminVerificationApplication(row: AdminVerificationApplicationRow) {
    const evidencePhotos =
      typeof row.evidencePhotos === 'string'
        ? (JSON.parse(row.evidencePhotos) as string[])
        : (row.evidencePhotos ?? []);

    return {
      appId: Number(row.appId),
      restaurantId: Number(row.restaurantId),
      badgeId: Number(row.badgeId),
      status: row.status,
      submittedAt: row.submittedAt,
      reviewedAt: row.reviewedAt,
      reviewNote: row.reviewNote,
      submittedByOwnerAccountId: Number(row.submittedByOwnerAccountId),
      reviewedByAdminId:
        row.reviewedByAdminId === null ? null : Number(row.reviewedByAdminId),
      badge: {
        badgeId: Number(row.badgeId),
        badgeCode: row.badgeCode,
        badgeNameVn: row.badgeNameVn,
        badgeNameJp: row.badgeNameJp,
      },
      restaurant: {
        restaurantId: Number(row.restaurantId),
        nameVn: row.nameVn,
        nameJp: row.nameJp,
        address: row.address,
        areaLabel: this.toAreaLabel(row.address),
        issuesVat: row.issuesVat,
        thumbnailUrl: row.thumbnailUrl,
        mainImageUrl: row.mainImageUrl,
        publicUrl: `/user/restaurants/${row.restaurantId}`,
        ratingAverage:
          row.ratingAverage === null ? null : Number(row.ratingAverage),
        reviewCount: Number(row.reviewCount ?? 0),
      },
      documents: {
        businessLicenseUrl: row.businessLicenseUrl,
        businessLicenseViewUrl: `/admin/verification/applications/${row.appId}/documents/business-license`,
        foodSafetyCertUrl: row.foodSafetyCertUrl,
        foodSafetyCertViewUrl: `/admin/verification/applications/${row.appId}/documents/food-safety-certificate`,
      },
      evidencePhotos,
      details: {
        hasJapaneseStaff: true,
        canIssueVatInvoice: row.issuesVat,
      },
      hasActiveBadge: row.hasActiveBadge,
    };
  }

  private toAreaLabel(address: string) {
    return address
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 2)
      .join('・');
  }

  private toVerificationDocumentUrlCandidates(
    sourceUrl: string,
    publicId: string | null,
  ) {
    const candidates = [sourceUrl];

    if (/\/image\/upload\//.test(sourceUrl) && /\.pdf($|\?)/i.test(sourceUrl)) {
      candidates.unshift(sourceUrl.replace('/image/upload/', '/raw/upload/'));
    }

    if (/\/raw\/upload\//.test(sourceUrl) && /\.pdf($|\?)/i.test(sourceUrl)) {
      candidates.push(sourceUrl.replace('/raw/upload/', '/image/upload/'));
    }

    if (
      publicId &&
      /\.pdf$/i.test(publicId) &&
      /\/image\/upload\//.test(sourceUrl)
    ) {
      candidates.unshift(sourceUrl.replace('/image/upload/', '/raw/upload/'));
    }

    return [...new Set(candidates)];
  }

  private inferVerificationDocumentContentType(
    sourceUrl: string,
    publicId: string | null,
  ) {
    const value = `${sourceUrl} ${publicId ?? ''}`.toLowerCase();

    if (value.includes('.pdf')) {
      return 'application/pdf';
    }

    if (value.includes('.png')) {
      return 'image/png';
    }

    if (value.includes('.jpg') || value.includes('.jpeg')) {
      return 'image/jpeg';
    }

    return 'application/octet-stream';
  }

  private toCountMap<T extends string>(rows: CountRow[], keys: readonly T[]) {
    return keys.reduce(
      (acc, key) => ({
        ...acc,
        [key]:
          rows.find((row) => row.key === key)?.count === undefined
            ? 0
            : Number(rows.find((row) => row.key === key)?.count),
      }),
      {} as Record<T, number>,
    );
  }

  private snapshotAccount(account: UserAccount) {
    const profile = account.customerProfile ?? account.ownerProfile ?? null;

    return {
      accountId: account.accountId,
      email: account.email,
      role: account.role,
      status: account.status,
      fullName: profile?.fullName ?? null,
      displayName: account.customerProfile?.displayName ?? null,
      phone: account.ownerProfile?.phone ?? null,
      businessName: account.ownerProfile?.businessName ?? null,
    };
  }

  private describeChange(
    before: ReturnType<AdminService['snapshotAccount']>,
    after: ReturnType<AdminService['snapshotAccount']>,
  ) {
    const changes = Object.keys(before)
      .filter(
        (key) =>
          before[key as keyof typeof before] !==
          after[key as keyof typeof after],
      )
      .map((key) => ({
        field: key,
        from: before[key as keyof typeof before],
        to: after[key as keyof typeof after],
      }));

    return JSON.stringify({ changes });
  }

  private toAdminUserResponse(account: UserAccount) {
    const customerProfile = account.customerProfile;
    const ownerProfile = account.ownerProfile;
    const displayName =
      customerProfile?.displayName ??
      customerProfile?.fullName ??
      ownerProfile?.businessName ??
      ownerProfile?.fullName ??
      null;

    return {
      accountId: account.accountId,
      email: account.email,
      role: account.role,
      status: account.status,
      displayName,
      profile:
        account.role === UserRole.Owner
          ? {
              fullName: ownerProfile?.fullName ?? null,
              phone: ownerProfile?.phone ?? null,
              businessName: ownerProfile?.businessName ?? null,
              avatarUrl: ownerProfile?.avatarUrl ?? null,
            }
          : {
              fullName: customerProfile?.fullName ?? null,
              displayName: customerProfile?.displayName ?? null,
              gender: customerProfile?.gender ?? null,
              dob: customerProfile?.dob ?? null,
              nationality: customerProfile?.nationality ?? null,
              purpose: customerProfile?.purpose ?? null,
              avatarUrl: customerProfile?.avatarUrl ?? null,
            },
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  private requiredTrim(value: string, fieldName: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new BadRequestException(`${fieldName} must not be empty.`);
    }

    return trimmed;
  }

  private optionalTrim(value?: string) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }
}
