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
import { AdminUserActionDto } from './dto/admin-user-action.dto';
import { ChangeUserRoleDto } from './dto/change-user-role.dto';
import { ListAdminActionLogsQueryDto } from './dto/list-admin-action-logs-query.dto';
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
        statuses: Object.values(AccountStatus),
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
    const byStatus = this.toCountMap(statusRows, Object.values(AccountStatus));

    return {
      total,
      byRole,
      byStatus,
      activeUsers: byRole.User,
      activeOwners: byRole.Owner,
      banned: byStatus.Banned,
      disabled: byStatus.Disabled,
      pending: byStatus.Pending,
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

  private toCountMap<T extends string>(rows: CountRow[], keys: T[]) {
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
