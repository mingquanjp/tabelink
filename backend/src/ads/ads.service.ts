import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { JwtPayload } from '../auth/auth.types';
import {
  AdminPromotionsQueryDto,
  CampaignTargetAudience,
  CAMPAIGN_FIXED_AMOUNT_DISCOUNT_VALUES,
  CAMPAIGN_PERCENTAGE_DISCOUNT_VALUES,
  CreatePromotionDto,
  PromotionType,
  UpdatePromotionDto,
} from './dto/create-promotion.dto';

interface PromotionCounterRow {
  promotionId: number | string;
  impressions: number | string;
  clicks: number | string;
}

interface PromotionRow {
  promotionId: number | string;
  restaurantId: number | string;
  createdByOwnerAccountId: number | string;
  promotionType: string;
  targetAudience: string | null;
  titleVn: string;
  titleJp: string;
  contentVn: string | null;
  contentJp: string | null;
  mediaUrl: string | null;
  termsVn: string | null;
  termsJp: string | null;
  discountType: string | null;
  discountValue: string | null;
  advertisementType: string | null;
  targetRadiusKm: number | string | null;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
  impressions: number | string;
  clicks: number | string;
  totalCost: number | string;
}

interface AvailableCampaignRow {
  promotionId: number | string;
  restaurantId: number | string;
  restaurantNameVN: string;
  restaurantNameJP: string;
  imageUrl: string | null;
  promotionType: string;
  campaignNameVN: string;
  campaignNameJP: string;
  campaignDescriptionVN: string | null;
  campaignDescriptionJP: string | null;
  targetAudience: string | null;
  discountType: string | null;
  discountValue: string | null;
  noteVN: string | null;
  noteJP: string | null;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
}

interface UserNotificationRow {
  notificationId: number | string;
  restaurantId: number | string;
  restaurantNameVN: string;
  restaurantNameJP: string;
  titleVn: string;
  titleJp: string;
  messageVn: string | null;
  messageJp: string | null;
  mediaUrl: string | null;
  startDate: Date | string;
  endDate: Date | string;
}

interface OwnerRestaurantRow {
  restaurantId: number | string;
}

interface AdminPromotionSummaryRow {
  pendingCount: number | string;
  activeCount: number | string;
  totalImpressions: number | string | null;
  totalClicks: number | string | null;
  averageCtr: number | string | null;
}

interface AdminPromotionRow extends PromotionRow {
  restaurantNameVN: string;
  restaurantNameJP: string;
  restaurantImageUrl: string | null;
}

interface CountRow {
  totalItems: number | string;
}

@Injectable()
export class AdsService {
  constructor(private readonly dataSource: DataSource) {}

  async listAvailableCampaigns() {
    const rows = await this.dataSource.query<AvailableCampaignRow[]>(
      `
        SELECT
          p.PromotionID AS "promotionId",
          r.RestaurantID AS "restaurantId",
          r.NameVN AS "restaurantNameVN",
          r.NameJP AS "restaurantNameJP",
          media.MediaURL AS "imageUrl",
          p.PromotionType AS "promotionType",
          p.TitleVN AS "campaignNameVN",
          p.TitleJP AS "campaignNameJP",
          p.ContentVN AS "campaignDescriptionVN",
          p.ContentJP AS "campaignDescriptionJP",
          p.TargetAudience AS "targetAudience",
          p.DiscountType AS "discountType",
          p.DiscountValue AS "discountValue",
          p.TermsVN AS "noteVN",
          p.TermsJP AS "noteJP",
          p.StartDate AS "startDate",
          p.EndDate AS "endDate",
          p.Status AS "status"
        FROM PROMOTION p
        JOIN RESTAURANT r
          ON r.RestaurantID = p.RestaurantID
        LEFT JOIN LATERAL (
          SELECT rm.MediaURL
          FROM RESTAURANT_MEDIA rm
          WHERE rm.RestaurantID = r.RestaurantID
            AND rm.Status = 'Approved'
          ORDER BY
            CASE WHEN rm.MediaType = 'Cover' THEN 0 ELSE 1 END,
            rm.SortOrder ASC,
            rm.MediaID ASC
          LIMIT 1
        ) media ON TRUE
        WHERE p.PromotionType = 'Campaign'
          AND p.Status = 'Active'
          AND p.ApprovedByAdminID IS NOT NULL
          AND p.StartDate <= CURRENT_TIMESTAMP
          AND p.EndDate >= CURRENT_TIMESTAMP
          AND r.Status = 'Active'
        ORDER BY p.StartDate DESC, p.PromotionID DESC
      `,
    );

    return {
      items: rows.map((row) => ({
        promotionId: Number(row.promotionId),
        restaurantId: Number(row.restaurantId),
        restaurantNameVN: row.restaurantNameVN,
        restaurantNameJP: row.restaurantNameJP,
        imageUrl: row.imageUrl,
        promotionType: row.promotionType,
        campaignNameVN: row.campaignNameVN,
        campaignNameJP: row.campaignNameJP,
        campaignDescriptionVN: row.campaignDescriptionVN,
        campaignDescriptionJP: row.campaignDescriptionJP,
        targetAudience: row.targetAudience,
        discountType: row.discountType,
        discountValue: row.discountValue,
        noteVN: row.noteVN,
        noteJP: row.noteJP,
        startDate: this.toIsoString(row.startDate),
        endDate: this.toIsoString(row.endDate),
        status: row.status,
      })),
    };
  }

  async listUserNotifications(user: JwtPayload) {
    if (user.role !== AuthRole.User) {
      throw new ForbiddenException('Only users can view notifications.');
    }

    const rows = await this.dataSource.query<UserNotificationRow[]>(
      `
        SELECT
          p.PromotionID AS "notificationId",
          r.RestaurantID AS "restaurantId",
          r.NameVN AS "restaurantNameVN",
          r.NameJP AS "restaurantNameJP",
          p.TitleVN AS "titleVn",
          p.TitleJP AS "titleJp",
          p.ContentVN AS "messageVn",
          p.ContentJP AS "messageJp",
          p.MediaURL AS "mediaUrl",
          p.StartDate AS "startDate",
          p.EndDate AS "endDate"
        FROM PROMOTION p
        JOIN RESTAURANT r
          ON r.RestaurantID = p.RestaurantID
        WHERE p.PromotionType = 'Advertisement'
          AND p.AdvertisementType = 'Notification'
          AND p.Status = 'Active'
          AND p.ApprovedByAdminID IS NOT NULL
          AND p.StartDate <= CURRENT_TIMESTAMP
          AND p.EndDate >= CURRENT_TIMESTAMP
          AND r.Status = 'Active'
        ORDER BY p.StartDate DESC, p.PromotionID DESC
        LIMIT 20
      `,
    );

    return {
      unreadCount: rows.length,
      items: rows.map((row) => ({
        notificationId: Number(row.notificationId),
        restaurantId: Number(row.restaurantId),
        restaurantNameVN: row.restaurantNameVN,
        restaurantNameJP: row.restaurantNameJP,
        titleVn: row.titleVn,
        titleJp: row.titleJp,
        messageVn: row.messageVn,
        messageJp: row.messageJp,
        mediaUrl: row.mediaUrl,
        startDate: this.toIsoString(row.startDate),
        endDate: this.toIsoString(row.endDate),
      })),
    };
  }

  async listOwnerPromotions(user: JwtPayload) {
    const restaurantId = await this.resolveOwnerRestaurantId(user);

    return this.listPromotions(restaurantId, user);
  }

  async getAdminPromotionSummary(user: JwtPayload) {
    this.assertAdmin(user);

    const rows = await this.dataSource.query<AdminPromotionSummaryRow[]>(
      `
        SELECT
          COUNT(*) FILTER (WHERE Status = 'Pending') AS "pendingCount",
          COUNT(*) FILTER (
            WHERE Status = 'Active'
              AND ApprovedByAdminID IS NOT NULL
              AND StartDate <= CURRENT_TIMESTAMP
              AND EndDate >= CURRENT_TIMESTAMP
          ) AS "activeCount",
          COALESCE(SUM(Impressions) FILTER (
            WHERE Status = 'Active'
              AND ApprovedByAdminID IS NOT NULL
              AND StartDate <= CURRENT_TIMESTAMP
              AND EndDate >= CURRENT_TIMESTAMP
          ), 0) AS "totalImpressions",
          COALESCE(SUM(Clicks) FILTER (
            WHERE Status = 'Active'
              AND ApprovedByAdminID IS NOT NULL
              AND StartDate <= CURRENT_TIMESTAMP
              AND EndDate >= CURRENT_TIMESTAMP
          ), 0) AS "totalClicks",
          CASE
            WHEN COALESCE(SUM(Impressions) FILTER (
              WHERE Status = 'Active'
                AND ApprovedByAdminID IS NOT NULL
                AND StartDate <= CURRENT_TIMESTAMP
                AND EndDate >= CURRENT_TIMESTAMP
            ), 0) > 0
              THEN ROUND(
                (
                  COALESCE(SUM(Clicks) FILTER (
                    WHERE Status = 'Active'
                      AND ApprovedByAdminID IS NOT NULL
                      AND StartDate <= CURRENT_TIMESTAMP
                      AND EndDate >= CURRENT_TIMESTAMP
                  ), 0)::numeric
                  / COALESCE(SUM(Impressions) FILTER (
                    WHERE Status = 'Active'
                      AND ApprovedByAdminID IS NOT NULL
                      AND StartDate <= CURRENT_TIMESTAMP
                      AND EndDate >= CURRENT_TIMESTAMP
                  ), 0)::numeric
                ) * 100,
                1
              )
            ELSE 0
          END AS "averageCtr"
        FROM PROMOTION
        WHERE PromotionType IN ('Advertisement', 'Campaign')
      `,
    );

    const summary = this.unwrapFirstRow(rows);

    return {
      pendingCount: Number(summary?.pendingCount ?? 0),
      activeCount: Number(summary?.activeCount ?? 0),
      totalImpressions: Number(summary?.totalImpressions ?? 0),
      totalClicks: Number(summary?.totalClicks ?? 0),
      averageCtr: Number(summary?.averageCtr ?? 0),
    };
  }

  async listAdminPromotions(query: AdminPromotionsQueryDto, user: JwtPayload) {
    this.assertAdmin(user);

    const params: Array<string> = [];
    const whereClauses = ["p.PromotionType IN ('Advertisement', 'Campaign')"];
    const search = this.optionalTrim(query.search);
    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`
        (
          r.NameVN ILIKE $${params.length}
          OR r.NameJP ILIKE $${params.length}
          OR p.TitleVN ILIKE $${params.length}
          OR p.TitleJP ILIKE $${params.length}
        )
      `);
    }
    if (query.status) {
      params.push(query.status);
      whereClauses.push(`p.Status = $${params.length}`);
    }
    const page = this.resolvePositiveInteger(query.page, 1);
    const limit = Math.min(this.resolvePositiveInteger(query.limit, 3), 50);
    const offset = (page - 1) * limit;
    const whereSql = whereClauses.join('\n          AND ');

    const countRows = await this.dataSource.query<CountRow[]>(
      `
        SELECT COUNT(*) AS "totalItems"
        FROM PROMOTION p
        JOIN RESTAURANT r
          ON r.RestaurantID = p.RestaurantID
        WHERE ${whereSql}
      `,
      params,
    );
    const totalItems = Number(this.unwrapFirstRow(countRows)?.totalItems ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const dataParams = [...params, limit, offset];

    const rows = await this.dataSource.query<AdminPromotionRow[]>(
      `
        ${this.adminPromotionSelectSql()}
        WHERE ${whereSql}
        ORDER BY
          CASE p.Status
            WHEN 'Pending' THEN 1
            WHEN 'Active' THEN
              CASE
                WHEN p.StartDate > CURRENT_TIMESTAMP THEN 3
                WHEN p.EndDate >= CURRENT_TIMESTAMP THEN 2
                ELSE 5
              END
            WHEN 'Rejected' THEN 4
            WHEN 'Ended' THEN 5
            ELSE 6
          END,
          p.StartDate DESC,
          p.PromotionID DESC
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2}
      `,
      dataParams,
    );

    const items = rows.map((row) => this.toAdminPromotionResponse(row));

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  async getAdminPromotion(promotionId: number, user: JwtPayload) {
    this.assertAdmin(user);

    const row = await this.findAdminPromotion(promotionId);

    return this.toAdminPromotionResponse(row);
  }

  async approveAdminPromotion(promotionId: number, user: JwtPayload) {
    this.assertAdmin(user);

    const current = await this.findAdminPromotion(promotionId);
    if (current.status !== 'Pending') {
      throw new BadRequestException('Only pending promotions can be approved.');
    }

    await this.dataSource.query(
      `
        UPDATE PROMOTION
        SET
          Status = 'Active',
          ApprovedByAdminID = $2
        WHERE PromotionID = $1
          AND PromotionType IN ('Advertisement', 'Campaign')
          AND Status = 'Pending'
      `,
      [promotionId, user.sub],
    );
    await this.insertPromotionModerationLog(
      user.sub,
      promotionId,
      'Approve',
      null,
    );

    return this.getAdminPromotion(promotionId, user);
  }

  async rejectAdminPromotion(
    promotionId: number,
    reason: string,
    user: JwtPayload,
  ) {
    this.assertAdmin(user);

    const trimmedReason = this.optionalTrim(reason);
    if (!trimmedReason) {
      throw new BadRequestException('Rejection reason is required.');
    }

    const current = await this.findAdminPromotion(promotionId);
    if (current.status !== 'Pending') {
      throw new BadRequestException('Only pending promotions can be rejected.');
    }

    await this.dataSource.query(
      `
        UPDATE PROMOTION
        SET
          Status = 'Rejected',
          ApprovedByAdminID = $2
        WHERE PromotionID = $1
          AND PromotionType IN ('Advertisement', 'Campaign')
          AND Status = 'Pending'
      `,
      [promotionId, user.sub],
    );
    await this.insertPromotionModerationLog(
      user.sub,
      promotionId,
      'Reject',
      trimmedReason,
    );

    return this.getAdminPromotion(promotionId, user);
  }

  async listPromotions(restaurantId: number, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const rows = await this.dataSource.query<PromotionRow[]>(
      `
        SELECT
          PromotionID AS "promotionId",
          RestaurantID AS "restaurantId",
          CreatedByOwnerAccountID AS "createdByOwnerAccountId",
          PromotionType AS "promotionType",
          TargetAudience AS "targetAudience",
          TitleVN AS "titleVn",
          TitleJP AS "titleJp",
          ContentVN AS "contentVn",
          ContentJP AS "contentJp",
          MediaURL AS "mediaUrl",
          TermsVN AS "termsVn",
          TermsJP AS "termsJp",
          DiscountType AS "discountType",
          DiscountValue AS "discountValue",
          AdvertisementType AS "advertisementType",
          TargetRadiusKm AS "targetRadiusKm",
          StartDate AS "startDate",
          EndDate AS "endDate",
          Status AS "status",
          Impressions AS "impressions",
          Clicks AS "clicks",
          TotalCost AS "totalCost"
        FROM PROMOTION
        WHERE RestaurantID = $1
          AND CreatedByOwnerAccountID = $2
        ORDER BY
          CASE Status
            WHEN 'Active' THEN 1
            WHEN 'Pending' THEN 2
            WHEN 'Rejected' THEN 3
            WHEN 'Ended' THEN 4
            ELSE 5
          END,
          EndDate DESC,
          PromotionID DESC
      `,
      [restaurantId, user.sub],
    );

    const items = rows.map((row) => this.toPromotionResponse(row));

    return {
      restaurantId,
      count: items.length,
      summary: {
        activeCount: items.filter((item) => item.status === 'Active').length,
        pendingCount: items.filter((item) => item.status === 'Pending').length,
        advertisementCount: items.filter(
          (item) => item.promotionType === 'Advertisement',
        ).length,
        campaignCount: items.filter((item) => item.promotionType === 'Campaign')
          .length,
        totalImpressions: items.reduce(
          (sum, item) => sum + item.impressions,
          0,
        ),
        totalClicks: items.reduce((sum, item) => sum + item.clicks, 0),
        monthOverMonth: this.buildOwnerPromotionMonthOverMonth(items),
      },
      items,
    };
  }

  async createPromotion(
    restaurantId: number,
    dto: CreatePromotionDto,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const titleVn = this.requiredBilingualValue(dto.titleVn, dto.titleJp);
    const titleJp = this.requiredBilingualValue(dto.titleJp, dto.titleVn);
    const contentVn = this.optionalTrim(dto.contentVn);
    const contentJp = this.optionalTrim(dto.contentJp);

    if (!contentVn && !contentJp) {
      throw new BadRequestException('Promotion content is required.');
    }

    const targetAudience =
      dto.promotionType === PromotionType.Advertisement
        ? 'all'
        : this.optionalTrim(dto.targetAudience);
    if (!targetAudience) {
      throw new BadRequestException('Target audience is required.');
    }
    if (dto.promotionType === PromotionType.Campaign) {
      this.assertCampaignTargetAudience(targetAudience);
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    this.assertValidDateRange(startDate, endDate);
    const promotionSpecificFields = this.resolvePromotionSpecificFields(dto);

    const rows = await this.dataSource.query<PromotionRow[]>(
      `
        INSERT INTO PROMOTION (
          RestaurantID,
          CreatedByOwnerAccountID,
          PromotionType,
          TargetAudience,
          TitleVN,
          TitleJP,
          ContentVN,
          ContentJP,
          MediaURL,
          TermsVN,
          TermsJP,
          DiscountType,
          DiscountValue,
          AdvertisementType,
          TargetRadiusKm,
          StartDate,
          EndDate,
          Status,
          TotalCost
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'Pending', $18)
        RETURNING
          PromotionID AS "promotionId",
          RestaurantID AS "restaurantId",
          CreatedByOwnerAccountID AS "createdByOwnerAccountId",
          PromotionType AS "promotionType",
          TargetAudience AS "targetAudience",
          TitleVN AS "titleVn",
          TitleJP AS "titleJp",
          ContentVN AS "contentVn",
          ContentJP AS "contentJp",
          MediaURL AS "mediaUrl",
          TermsVN AS "termsVn",
          TermsJP AS "termsJp",
          DiscountType AS "discountType",
          DiscountValue AS "discountValue",
          AdvertisementType AS "advertisementType",
          TargetRadiusKm AS "targetRadiusKm",
          StartDate AS "startDate",
          EndDate AS "endDate",
          Status AS "status",
          Impressions AS "impressions",
          Clicks AS "clicks",
          TotalCost AS "totalCost"
      `,
      [
        restaurantId,
        user.sub,
        dto.promotionType,
        targetAudience,
        titleVn,
        titleJp,
        contentVn,
        contentJp,
        this.optionalTrim(dto.mediaUrl),
        this.optionalTrim(dto.termsVn),
        this.optionalTrim(dto.termsJp),
        promotionSpecificFields.discountType,
        promotionSpecificFields.discountValue,
        promotionSpecificFields.advertisementType,
        promotionSpecificFields.targetRadiusKm,
        startDate,
        endDate,
        dto.totalCost ?? 0,
      ],
    );

    const row = this.unwrapFirstRow(rows);
    if (!row) {
      throw new BadRequestException('Promotion could not be created.');
    }

    return this.toPromotionResponse(row);
  }

  async createOwnerPromotion(dto: CreatePromotionDto, user: JwtPayload) {
    const restaurantId = await this.resolveOwnerRestaurantId(user);

    return this.createPromotion(restaurantId, dto, user);
  }

  async getOwnerPromotion(promotionId: number, user: JwtPayload) {
    const restaurantId = await this.resolveOwnerRestaurantId(user);

    return this.getPromotion(restaurantId, promotionId, user);
  }

  async getPromotion(
    restaurantId: number,
    promotionId: number,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const row = await this.findOwnedPromotion(
      restaurantId,
      promotionId,
      user.sub,
    );

    return this.toPromotionResponse(row);
  }

  async updateOwnerPromotion(
    promotionId: number,
    dto: UpdatePromotionDto,
    user: JwtPayload,
  ) {
    const restaurantId = await this.resolveOwnerRestaurantId(user);

    return this.updatePromotion(restaurantId, promotionId, dto, user);
  }

  async endOwnerPromotion(promotionId: number, user: JwtPayload) {
    const restaurantId = await this.resolveOwnerRestaurantId(user);

    return this.endPromotion(restaurantId, promotionId, user);
  }

  async resumeOwnerPromotion(promotionId: number, user: JwtPayload) {
    const restaurantId = await this.resolveOwnerRestaurantId(user);

    return this.resumePromotion(restaurantId, promotionId, user);
  }

  async endPromotion(
    restaurantId: number,
    promotionId: number,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const current = await this.findOwnedPromotion(
      restaurantId,
      promotionId,
      user.sub,
    );

    if (current.status !== 'Active') {
      throw new BadRequestException('Only active promotions can be ended.');
    }

    const rows = await this.dataSource.query<PromotionRow[]>(
      `
        UPDATE PROMOTION
        SET Status = 'Ended'
        WHERE PromotionID = $1
          AND RestaurantID = $2
          AND CreatedByOwnerAccountID = $3
        RETURNING
          PromotionID AS "promotionId",
          RestaurantID AS "restaurantId",
          CreatedByOwnerAccountID AS "createdByOwnerAccountId",
          PromotionType AS "promotionType",
          TargetAudience AS "targetAudience",
          TitleVN AS "titleVn",
          TitleJP AS "titleJp",
          ContentVN AS "contentVn",
          ContentJP AS "contentJp",
          MediaURL AS "mediaUrl",
          TermsVN AS "termsVn",
          TermsJP AS "termsJp",
          DiscountType AS "discountType",
          DiscountValue AS "discountValue",
          AdvertisementType AS "advertisementType",
          TargetRadiusKm AS "targetRadiusKm",
          StartDate AS "startDate",
          EndDate AS "endDate",
          Status AS "status",
          Impressions AS "impressions",
          Clicks AS "clicks",
          TotalCost AS "totalCost"
      `,
      [promotionId, restaurantId, user.sub],
    );

    const row = this.unwrapFirstRow(rows);
    if (!row) {
      throw new NotFoundException('Promotion not found for this owner.');
    }

    return this.toPromotionResponse(row);
  }

  async resumePromotion(
    restaurantId: number,
    promotionId: number,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const current = await this.findOwnedPromotion(
      restaurantId,
      promotionId,
      user.sub,
    );

    if (current.status !== 'Ended') {
      throw new BadRequestException('Only ended promotions can be resumed.');
    }

    const rows = await this.dataSource.query<PromotionRow[]>(
      `
        UPDATE PROMOTION
        SET Status = 'Active'
        WHERE PromotionID = $1
          AND RestaurantID = $2
          AND CreatedByOwnerAccountID = $3
        RETURNING
          PromotionID AS "promotionId",
          RestaurantID AS "restaurantId",
          CreatedByOwnerAccountID AS "createdByOwnerAccountId",
          PromotionType AS "promotionType",
          TargetAudience AS "targetAudience",
          TitleVN AS "titleVn",
          TitleJP AS "titleJp",
          ContentVN AS "contentVn",
          ContentJP AS "contentJp",
          MediaURL AS "mediaUrl",
          TermsVN AS "termsVn",
          TermsJP AS "termsJp",
          DiscountType AS "discountType",
          DiscountValue AS "discountValue",
          AdvertisementType AS "advertisementType",
          TargetRadiusKm AS "targetRadiusKm",
          StartDate AS "startDate",
          EndDate AS "endDate",
          Status AS "status",
          Impressions AS "impressions",
          Clicks AS "clicks",
          TotalCost AS "totalCost"
      `,
      [promotionId, restaurantId, user.sub],
    );

    const row = this.unwrapFirstRow(rows);
    if (!row) {
      throw new NotFoundException('Promotion not found for this owner.');
    }

    return this.toPromotionResponse(row);
  }

  async updatePromotion(
    restaurantId: number,
    promotionId: number,
    dto: UpdatePromotionDto,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const current = await this.findOwnedPromotion(
      restaurantId,
      promotionId,
      user.sub,
    );

    const titleVn =
      dto.titleVn !== undefined
        ? this.requiredBilingualValue(dto.titleVn, current.titleJp)
        : current.titleVn;
    const titleJp =
      dto.titleJp !== undefined
        ? this.requiredBilingualValue(dto.titleJp, titleVn)
        : current.titleJp;
    const contentVn =
      dto.contentVn !== undefined
        ? this.optionalTrim(dto.contentVn)
        : current.contentVn;
    const contentJp =
      dto.contentJp !== undefined
        ? this.optionalTrim(dto.contentJp)
        : current.contentJp;

    if (!contentVn && !contentJp) {
      throw new BadRequestException('Promotion content is required.');
    }

    const targetAudience =
      current.promotionType === 'Advertisement'
        ? 'all'
        : dto.targetAudience !== undefined
          ? this.optionalTrim(dto.targetAudience)
          : current.targetAudience;

    if (!targetAudience) {
      throw new BadRequestException('Target audience is required.');
    }
    if (current.promotionType === 'Campaign') {
      this.assertCampaignTargetAudience(targetAudience);
    }

    const startDate =
      dto.startDate !== undefined ? new Date(dto.startDate) : current.startDate;
    const endDate =
      dto.endDate !== undefined ? new Date(dto.endDate) : current.endDate;
    this.assertValidDateRange(startDate, endDate);
    const discountType =
      current.promotionType === 'Advertisement'
        ? null
        : dto.discountType !== undefined
          ? this.optionalTrim(dto.discountType)
          : current.discountType;
    const discountValue =
      current.promotionType === 'Advertisement'
        ? null
        : dto.discountValue !== undefined
          ? this.optionalTrim(dto.discountValue)
          : current.discountValue;
    const advertisementType =
      current.promotionType === 'Campaign'
        ? null
        : dto.advertisementType !== undefined
          ? dto.advertisementType
          : current.advertisementType;
    const targetRadiusKm =
      current.promotionType === 'Campaign' ||
      current.promotionType === 'Advertisement'
        ? null
        : dto.targetRadiusKm !== undefined
          ? dto.targetRadiusKm
          : current.targetRadiusKm;

    if (
      current.promotionType === 'Campaign' &&
      (!discountType ||
        !discountValue ||
        !this.isCampaignDiscountPair(discountType, discountValue))
    ) {
      throw new BadRequestException(
        'Campaign discountType and discountValue must match the locked dropdown options.',
      );
    }

    if (current.promotionType === 'Advertisement' && !advertisementType) {
      throw new BadRequestException(
        'Advertisement advertisementType is required.',
      );
    }

    const mediaUrl =
      current.promotionType === 'Campaign'
        ? null
        : dto.mediaUrl !== undefined
          ? this.optionalTrim(dto.mediaUrl)
          : current.mediaUrl;

    const rows = await this.dataSource.query<PromotionRow[]>(
      `
        UPDATE PROMOTION
        SET
          TargetAudience = $4,
          TitleVN = $5,
          TitleJP = $6,
          ContentVN = $7,
          ContentJP = $8,
          MediaURL = $9,
          TermsVN = $10,
          TermsJP = $11,
          DiscountType = $12,
          DiscountValue = $13,
          AdvertisementType = $14,
          TargetRadiusKm = $15,
          StartDate = $16,
          EndDate = $17,
          TotalCost = $18,
          Status = 'Pending',
          ApprovedByAdminID = NULL
        WHERE PromotionID = $1
          AND RestaurantID = $2
          AND CreatedByOwnerAccountID = $3
        RETURNING
          PromotionID AS "promotionId",
          RestaurantID AS "restaurantId",
          CreatedByOwnerAccountID AS "createdByOwnerAccountId",
          PromotionType AS "promotionType",
          TargetAudience AS "targetAudience",
          TitleVN AS "titleVn",
          TitleJP AS "titleJp",
          ContentVN AS "contentVn",
          ContentJP AS "contentJp",
          MediaURL AS "mediaUrl",
          TermsVN AS "termsVn",
          TermsJP AS "termsJp",
          DiscountType AS "discountType",
          DiscountValue AS "discountValue",
          AdvertisementType AS "advertisementType",
          TargetRadiusKm AS "targetRadiusKm",
          StartDate AS "startDate",
          EndDate AS "endDate",
          Status AS "status",
          Impressions AS "impressions",
          Clicks AS "clicks",
          TotalCost AS "totalCost"
      `,
      [
        promotionId,
        restaurantId,
        user.sub,
        targetAudience,
        titleVn,
        titleJp,
        contentVn,
        contentJp,
        mediaUrl,
        dto.termsVn !== undefined
          ? this.optionalTrim(dto.termsVn)
          : current.termsVn,
        dto.termsJp !== undefined
          ? this.optionalTrim(dto.termsJp)
          : current.termsJp,
        discountType,
        discountValue,
        advertisementType,
        targetRadiusKm,
        startDate,
        endDate,
        current.promotionType === 'Campaign'
          ? 0
          : dto.totalCost !== undefined
            ? dto.totalCost
            : current.totalCost,
      ],
    );

    const row = this.unwrapFirstRow(rows);
    if (!row) {
      throw new NotFoundException('Promotion not found for this owner.');
    }

    return this.toPromotionResponse(row);
  }

  async recordImpression(adId: number) {
    const row = await this.updateActiveAdCounters(
      adId,
      `
        Impressions = Impressions + 1
      `,
    );

    return this.toCounterResponse(row);
  }

  async recordClick(adId: number) {
    const row = await this.updateActiveAdCounters(
      adId,
      `
        Clicks = Clicks + 1,
        Impressions = GREATEST(Impressions, Clicks + 1)
      `,
    );

    return this.toCounterResponse(row);
  }

  private async updateActiveAdCounters(adId: number, setClause: string) {
    const result = await this.dataSource.query<PromotionCounterRow[]>(
      `
        UPDATE PROMOTION
        SET ${setClause}
        WHERE PromotionID = $1
          AND PromotionType = 'Advertisement'
          AND Status = 'Active'
          AND ApprovedByAdminID IS NOT NULL
          AND StartDate <= CURRENT_TIMESTAMP
          AND EndDate >= CURRENT_TIMESTAMP
        RETURNING
          PromotionID AS "promotionId",
          Impressions AS "impressions",
          Clicks AS "clicks"
      `,
      [adId],
    );

    const firstResult = result[0];
    const row = Array.isArray(firstResult)
      ? (firstResult[0] as PromotionCounterRow | undefined)
      : firstResult;

    if (!row) {
      throw new NotFoundException('Active ad not found.');
    }

    return row;
  }

  private toCounterResponse(row: PromotionCounterRow) {
    const impressions = Number(row.impressions);
    const clicks = Number(row.clicks);

    return {
      adId: Number(row.promotionId),
      impressions,
      clicks,
      ctr: impressions > 0 ? Number((clicks / impressions).toFixed(4)) : 0,
    };
  }

  private assertAdmin(user: JwtPayload) {
    if (user.role !== AuthRole.Admin) {
      throw new ForbiddenException('Only admins can review promotions.');
    }
  }

  private adminPromotionSelectSql() {
    return `
      SELECT
        p.PromotionID AS "promotionId",
        p.RestaurantID AS "restaurantId",
        p.CreatedByOwnerAccountID AS "createdByOwnerAccountId",
        p.PromotionType AS "promotionType",
        p.TargetAudience AS "targetAudience",
        p.TitleVN AS "titleVn",
        p.TitleJP AS "titleJp",
        p.ContentVN AS "contentVn",
        p.ContentJP AS "contentJp",
        p.MediaURL AS "mediaUrl",
        p.TermsVN AS "termsVn",
        p.TermsJP AS "termsJp",
        p.DiscountType AS "discountType",
        p.DiscountValue AS "discountValue",
        p.AdvertisementType AS "advertisementType",
        p.TargetRadiusKm AS "targetRadiusKm",
        p.StartDate AS "startDate",
        p.EndDate AS "endDate",
        p.Status AS "status",
        p.Impressions AS "impressions",
        p.Clicks AS "clicks",
        p.TotalCost AS "totalCost",
        r.NameVN AS "restaurantNameVN",
        r.NameJP AS "restaurantNameJP",
        media.MediaURL AS "restaurantImageUrl"
      FROM PROMOTION p
      JOIN RESTAURANT r
        ON r.RestaurantID = p.RestaurantID
      LEFT JOIN LATERAL (
        SELECT rm.MediaURL
        FROM RESTAURANT_MEDIA rm
        WHERE rm.RestaurantID = r.RestaurantID
          AND rm.Status = 'Approved'
        ORDER BY
          CASE WHEN rm.MediaType = 'Cover' THEN 0 ELSE 1 END,
          rm.SortOrder ASC,
          rm.MediaID ASC
        LIMIT 1
      ) media ON TRUE
    `;
  }

  private async findAdminPromotion(promotionId: number) {
    const rows = await this.dataSource.query<AdminPromotionRow[]>(
      `
        ${this.adminPromotionSelectSql()}
        WHERE p.PromotionID = $1
          AND p.PromotionType IN ('Advertisement', 'Campaign')
      `,
      [promotionId],
    );

    const row = this.unwrapFirstRow(rows);
    if (!row) {
      throw new NotFoundException('Promotion not found.');
    }

    return row;
  }

  private async insertPromotionModerationLog(
    adminAccountId: number,
    promotionId: number,
    actionType: 'Approve' | 'Reject',
    reason: string | null,
  ) {
    await this.dataSource.query(
      `
        INSERT INTO MODERATION_LOG (
          AdminAccountID,
          TargetType,
          TargetID,
          ActionType,
          Reason
        )
        VALUES ($1, 'Promotion', $2, $3, $4)
      `,
      [adminAccountId, promotionId, actionType, reason],
    );
  }

  private toAdminPromotionResponse(row: AdminPromotionRow) {
    const promotion = this.toPromotionResponse(row);
    const impressions = Number(row.impressions);
    const clicks = Number(row.clicks);
    const displayStatus = this.toAdminDisplayStatus(row);
    const hidesPerformance =
      displayStatus === '審査待ち' || displayStatus === '開始前';

    return {
      ...promotion,
      restaurantNameVN: row.restaurantNameVN,
      restaurantNameJP: row.restaurantNameJP,
      imageUrl: row.mediaUrl || row.restaurantImageUrl,
      displayTitle: row.titleJp || row.titleVn,
      displayContent: row.contentJp || row.contentVn,
      periodLabel: this.toAdminPeriodLabel(row, displayStatus),
      displayStatus,
      impressions: hidesPerformance ? null : impressions,
      clicks: hidesPerformance ? null : clicks,
      ctr: hidesPerformance
        ? null
        : impressions > 0
          ? Number(((clicks / impressions) * 100).toFixed(1))
          : 0,
    };
  }

  private toAdminDisplayStatus(
    row: Pick<PromotionRow, 'status' | 'startDate' | 'endDate'>,
  ) {
    if (row.status === 'Pending') {
      return '審査待ち';
    }

    if (row.status === 'Rejected') {
      return '却下済み';
    }

    if (row.status === 'Ended') {
      return '終了済み';
    }

    if (row.status === 'Active') {
      const now = new Date();
      const startDate = new Date(row.startDate);
      const endDate = new Date(row.endDate);

      if (startDate > now) {
        return '開始前';
      }

      if (endDate >= now) {
        return '配信中';
      }

      return '終了済み';
    }

    return row.status;
  }

  private toAdminPeriodLabel(
    row: Pick<PromotionRow, 'status' | 'startDate' | 'endDate'>,
    displayStatus: string,
  ) {
    if (displayStatus === '審査待ち') {
      return `${this.calendarDaySpan(row.startDate, row.endDate)}日間`;
    }

    if (displayStatus === '配信中') {
      return `掲載中 (残り${this.remainingDays(row.endDate)}日)`;
    }

    if (displayStatus === '開始前') {
      return '予約済み';
    }

    return displayStatus;
  }

  private calendarDaySpan(
    startDateValue: Date | string,
    endDateValue: Date | string,
  ) {
    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);
    const startUtc = Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
    );
    const endUtc = Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate(),
    );

    return Math.max(1, Math.round((endUtc - startUtc) / 86_400_000) + 1);
  }

  private remainingDays(endDateValue: Date | string) {
    const endDate = new Date(endDateValue);
    const now = new Date();

    return Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / 86_400_000),
    );
  }

  private resolvePositiveInteger(value: number | undefined, fallback: number) {
    if (!Number.isInteger(value) || value === undefined || value < 1) {
      return fallback;
    }

    return value;
  }

  private async resolveOwnerRestaurantId(user: JwtPayload) {
    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException(
        'Only restaurant owners can create promotions.',
      );
    }

    const rows = await this.dataSource.query<OwnerRestaurantRow[]>(
      `
        SELECT RestaurantID AS "restaurantId"
        FROM RESTAURANT
        WHERE OwnerAccountID = $1
        ORDER BY RestaurantID ASC
        LIMIT 1
      `,
      [user.sub],
    );

    const restaurant = this.unwrapFirstRow(rows);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found for this owner.');
    }

    return Number(restaurant.restaurantId);
  }

  private async assertOwnerRestaurant(restaurantId: number, user: JwtPayload) {
    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException(
        'Only restaurant owners can create promotions.',
      );
    }

    const rows = await this.dataSource.query<
      { restaurantId: number | string }[]
    >(
      `
        SELECT RestaurantID AS "restaurantId"
        FROM RESTAURANT
        WHERE RestaurantID = $1
          AND OwnerAccountID = $2
      `,
      [restaurantId, user.sub],
    );

    if (!this.unwrapFirstRow(rows)) {
      throw new NotFoundException('Restaurant not found for this owner.');
    }
  }

  private async findOwnedPromotion(
    restaurantId: number,
    promotionId: number,
    ownerAccountId: number,
  ) {
    const rows = await this.dataSource.query<PromotionRow[]>(
      `
        SELECT
          PromotionID AS "promotionId",
          RestaurantID AS "restaurantId",
          CreatedByOwnerAccountID AS "createdByOwnerAccountId",
          PromotionType AS "promotionType",
          TargetAudience AS "targetAudience",
          TitleVN AS "titleVn",
          TitleJP AS "titleJp",
          ContentVN AS "contentVn",
          ContentJP AS "contentJp",
          MediaURL AS "mediaUrl",
          TermsVN AS "termsVn",
          TermsJP AS "termsJp",
          DiscountType AS "discountType",
          DiscountValue AS "discountValue",
          AdvertisementType AS "advertisementType",
          TargetRadiusKm AS "targetRadiusKm",
          StartDate AS "startDate",
          EndDate AS "endDate",
          Status AS "status",
          Impressions AS "impressions",
          Clicks AS "clicks",
          TotalCost AS "totalCost"
        FROM PROMOTION
        WHERE PromotionID = $1
          AND RestaurantID = $2
          AND CreatedByOwnerAccountID = $3
      `,
      [promotionId, restaurantId, ownerAccountId],
    );

    const row = this.unwrapFirstRow(rows);
    if (!row) {
      throw new NotFoundException('Promotion not found for this owner.');
    }

    return row;
  }

  private requiredBilingualValue(preferred?: string, fallback?: string) {
    const value = this.optionalTrim(preferred) ?? this.optionalTrim(fallback);

    if (!value) {
      throw new BadRequestException('Promotion title is required.');
    }

    return value;
  }

  private optionalTrim(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private assertValidDateRange(
    startDate: Date | string,
    endDate: Date | string,
  ) {
    const parsedStartDate =
      startDate instanceof Date ? startDate : new Date(startDate);
    const parsedEndDate = endDate instanceof Date ? endDate : new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime()) ||
      parsedEndDate <= parsedStartDate
    ) {
      throw new BadRequestException('endDate must be after startDate.');
    }
  }

  private assertCampaignTargetAudience(targetAudience: string) {
    if (
      !Object.values(CampaignTargetAudience).includes(
        targetAudience as CampaignTargetAudience,
      )
    ) {
      throw new BadRequestException(
        'Campaign targetAudience must be one of: all, new.',
      );
    }
  }

  private isCampaignDiscountPair(discountType: string, discountValue: string) {
    if (discountType === 'Percentage') {
      return CAMPAIGN_PERCENTAGE_DISCOUNT_VALUES.includes(
        discountValue as (typeof CAMPAIGN_PERCENTAGE_DISCOUNT_VALUES)[number],
      );
    }

    if (discountType === 'FixedAmount') {
      return CAMPAIGN_FIXED_AMOUNT_DISCOUNT_VALUES.includes(
        discountValue as (typeof CAMPAIGN_FIXED_AMOUNT_DISCOUNT_VALUES)[number],
      );
    }

    return false;
  }

  private resolvePromotionSpecificFields(dto: CreatePromotionDto) {
    if (dto.promotionType === PromotionType.Campaign) {
      const discountType = this.optionalTrim(dto.discountType);
      const discountValue = this.optionalTrim(dto.discountValue);

      if (
        !discountType ||
        !discountValue ||
        !this.isCampaignDiscountPair(discountType, discountValue)
      ) {
        throw new BadRequestException(
          'Campaign discountType and discountValue must match the locked dropdown options.',
        );
      }

      return {
        discountType,
        discountValue,
        advertisementType: null,
        targetRadiusKm: null,
      };
    }

    const advertisementType = dto.advertisementType;
    if (!advertisementType) {
      throw new BadRequestException(
        'Advertisement advertisementType is required.',
      );
    }

    return {
      discountType: null,
      discountValue: null,
      advertisementType,
      targetRadiusKm: null,
    };
  }

  private unwrapFirstRow<T>(rows: T[] | [T[], number]): T | undefined {
    const firstResult = rows[0];
    return Array.isArray(firstResult) ? firstResult[0] : firstResult;
  }

  private toIsoString(value: Date | string) {
    return value instanceof Date
      ? value.toISOString()
      : new Date(value).toISOString();
  }

  private isPromotionInMonth(
    item: { startDate: Date | string },
    monthOffset: number,
  ) {
    const startDate =
      item.startDate instanceof Date
        ? item.startDate
        : new Date(item.startDate);
    if (Number.isNaN(startDate.getTime())) {
      return false;
    }

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthOffset);

    return (
      startDate.getFullYear() === targetDate.getFullYear() &&
      startDate.getMonth() === targetDate.getMonth()
    );
  }

  private buildOwnerPromotionMonthOverMonth(
    items: Array<{
      status: string;
      promotionType: string;
      startDate: Date | string;
      impressions: number;
      clicks: number;
    }>,
  ) {
    const activeCount = (monthOffset: number) =>
      items.filter(
        (item) =>
          item.status === 'Active' &&
          this.isPromotionInMonth(item, monthOffset),
      ).length;

    const totalImpressions = (monthOffset: number) =>
      items
        .filter((item) => this.isPromotionInMonth(item, monthOffset))
        .reduce((sum, item) => sum + item.impressions, 0);

    const campaignClicks = (monthOffset: number) =>
      items
        .filter(
          (item) =>
            item.promotionType === 'Campaign' &&
            this.isPromotionInMonth(item, monthOffset),
        )
        .reduce((sum, item) => sum + item.clicks, 0);

    const ctr = (monthOffset: number) => {
      const impressions = totalImpressions(monthOffset);
      const clicks = items
        .filter((item) => this.isPromotionInMonth(item, monthOffset))
        .reduce((sum, item) => sum + item.clicks, 0);

      return impressions > 0
        ? Number(((clicks / impressions) * 100).toFixed(1))
        : 0;
    };

    const currentMonth = {
      activeCount: activeCount(0),
      totalImpressions: totalImpressions(0),
      campaignClicks: campaignClicks(0),
      ctr: ctr(0),
    };
    const previousMonth = {
      activeCount: activeCount(-1),
      totalImpressions: totalImpressions(-1),
      campaignClicks: campaignClicks(-1),
      ctr: ctr(-1),
    };
    const percentChange = (
      currentValue: number,
      previousValue: number,
    ): number =>
      previousValue > 0
        ? Number(
            (((currentValue - previousValue) / previousValue) * 100).toFixed(1),
          )
        : currentValue > 0
          ? 100
          : 0;

    return {
      currentMonth,
      previousMonth,
      change: {
        activeCount: currentMonth.activeCount - previousMonth.activeCount,
        totalImpressions:
          currentMonth.totalImpressions - previousMonth.totalImpressions,
        campaignClicks:
          currentMonth.campaignClicks - previousMonth.campaignClicks,
        ctr: Number((currentMonth.ctr - previousMonth.ctr).toFixed(1)),
      },
      percentChange: {
        activeCount: percentChange(
          currentMonth.activeCount,
          previousMonth.activeCount,
        ),
        totalImpressions: percentChange(
          currentMonth.totalImpressions,
          previousMonth.totalImpressions,
        ),
        campaignClicks: percentChange(
          currentMonth.campaignClicks,
          previousMonth.campaignClicks,
        ),
      },
    };
  }

  private toPromotionResponse(row: PromotionRow) {
    const base = {
      promotionId: Number(row.promotionId),
      restaurantId: Number(row.restaurantId),
      createdByOwnerAccountId: Number(row.createdByOwnerAccountId),
      promotionType: row.promotionType,
      startDate: row.startDate,
      endDate: row.endDate,
      status: row.status,
      impressions: Number(row.impressions),
      clicks: Number(row.clicks),
      totalCost: Number(row.totalCost),
    };

    if (row.promotionType === 'Campaign') {
      return {
        ...base,
        campaignName: row.titleJp || row.titleVn,
        campaignDescription: row.contentJp || row.contentVn,
        targetAudience: row.targetAudience,
        discountType: row.discountType,
        discountValue: row.discountValue,
        note: row.termsJp || row.termsVn,
      };
    }

    return {
      ...base,
      targetAudience: row.targetAudience,
      titleVn: row.titleVn,
      titleJp: row.titleJp,
      contentVn: row.contentVn,
      contentJp: row.contentJp,
      mediaUrl: row.mediaUrl,
      termsVn: row.termsVn,
      termsJp: row.termsJp,
      advertisementType: row.advertisementType,
      targetRadiusKm:
        row.targetRadiusKm === null || row.targetRadiusKm === undefined
          ? null
          : Number(row.targetRadiusKm),
    };
  }
}
