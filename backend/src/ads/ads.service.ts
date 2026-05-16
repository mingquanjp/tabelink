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
  CreatePromotionDto,
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

interface OwnerRestaurantRow {
  restaurantId: number | string;
}

@Injectable()
export class AdsService {
  constructor(private readonly dataSource: DataSource) {}

  async listOwnerPromotions(user: JwtPayload) {
    const restaurantId = await this.resolveOwnerRestaurantId(user);

    return this.listPromotions(restaurantId, user);
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

    const targetAudience = this.optionalTrim(dto.targetAudience);
    if (!targetAudience) {
      throw new BadRequestException('Target audience is required.');
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
      dto.targetAudience !== undefined
        ? this.optionalTrim(dto.targetAudience)
        : current.targetAudience;

    if (!targetAudience) {
      throw new BadRequestException('Target audience is required.');
    }

    const startDate =
      dto.startDate !== undefined ? new Date(dto.startDate) : current.startDate;
    const endDate =
      dto.endDate !== undefined ? new Date(dto.endDate) : current.endDate;
    this.assertValidDateRange(startDate, endDate);
    const discountType =
      dto.discountType !== undefined
        ? this.optionalTrim(dto.discountType)
        : current.discountType;
    const discountValue =
      dto.discountValue !== undefined
        ? this.optionalTrim(dto.discountValue)
        : current.discountValue;
    const advertisementType =
      dto.advertisementType !== undefined
        ? dto.advertisementType
        : current.advertisementType;
    const targetRadiusKm =
      dto.targetRadiusKm !== undefined
        ? dto.targetRadiusKm
        : current.targetRadiusKm;

    if (
      current.promotionType === 'Campaign' &&
      (!discountType || !discountValue)
    ) {
      throw new BadRequestException(
        'Campaign discountType and discountValue are required.',
      );
    }

    if (
      current.promotionType === 'Advertisement' &&
      (!advertisementType ||
        targetRadiusKm === null ||
        targetRadiusKm === undefined)
    ) {
      throw new BadRequestException(
        'Advertisement advertisementType and targetRadiusKm are required.',
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
        dto.totalCost !== undefined ? dto.totalCost : current.totalCost,
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

  private resolvePromotionSpecificFields(dto: CreatePromotionDto) {
    if (dto.promotionType === 'Campaign') {
      const discountType = this.optionalTrim(dto.discountType);
      const discountValue =
        this.optionalTrim(dto.discountValue) ?? discountType;

      if (!discountType || !discountValue) {
        throw new BadRequestException(
          'Campaign discountType and discountValue are required.',
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

    if (dto.targetRadiusKm === undefined || dto.targetRadiusKm === null) {
      throw new BadRequestException(
        'Advertisement targetRadiusKm is required.',
      );
    }

    const discountType = this.optionalTrim(dto.discountType);
    const discountValue = this.optionalTrim(dto.discountValue) ?? discountType;

    if (advertisementType === 'Banner' && (!discountType || !discountValue)) {
      throw new BadRequestException(
        'Banner advertisement discountType and discountValue are required.',
      );
    }

    return {
      discountType,
      discountValue,
      advertisementType,
      targetRadiusKm: dto.targetRadiusKm,
    };
  }

  private unwrapFirstRow<T>(rows: T[] | [T[], number]): T | undefined {
    const firstResult = rows[0];
    return Array.isArray(firstResult) ? firstResult[0] : firstResult;
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
      discountType: row.discountType,
      discountValue: row.discountValue,
      advertisementType: row.advertisementType,
      targetRadiusKm:
        row.targetRadiusKm === null || row.targetRadiusKm === undefined
          ? null
          : Number(row.targetRadiusKm),
    };
  }
}
