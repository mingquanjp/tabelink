import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { JwtPayload } from '../auth/auth.types';
import { FeatureMaster } from './entities/feature-master.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { RestaurantFeature } from './entities/restaurant-feature.entity';
import {
  RestaurantMedia,
  RestaurantMediaStatus,
  RestaurantMediaType,
} from './entities/restaurant-media.entity';
import { RestaurantPaymentMethod } from './entities/restaurant-payment-method.entity';
import {
  RestaurantSocialLink,
  RestaurantSocialProvider,
} from './entities/restaurant-social-link.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantReviewDto } from './dto/create-restaurant-review.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

interface OwnerHomeMenuSummaryRow {
  totalCount: number | string;
  activeCount: number | string;
  recommendedForJpCount: number | string;
}

interface OwnerHomeMenuCategoryRow {
  categoryId: number | string;
  restaurantId: number | string;
  categoryCode: string;
  categoryNameVn: string;
  categoryNameJp: string;
  sortOrder: number | string;
  itemCount: number | string;
}

interface OwnerHomeMenuItemRow {
  itemId: number | string;
  restaurantId: number | string;
  categoryId: number | string | null;
  categoryCode: string | null;
  categoryNameVn: string | null;
  categoryNameJp: string | null;
  categorySortOrder: number | string | null;
  nameVn: string;
  nameJp: string;
  price: number | string;
  descriptionVn: string | null;
  descriptionJp: string | null;
  imageUrl: string | null;
  isRecommendedForJp: boolean;
  isActive: boolean;
  criteria: Array<{
    criterionId: number | string;
    criterionName: string;
    ratingLevel: number | string;
    sortOrder: number | string;
  }> | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface OwnerHomePromotionRow {
  promotionId: number | string;
  restaurantId: number | string;
  promotionType: string;
  targetAudience: string | null;
  titleVn: string;
  titleJp: string;
  contentVn: string | null;
  contentJp: string | null;
  mediaUrl: string | null;
  termsVn: string | null;
  termsJp: string | null;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
  impressions: number | string;
  clicks: number | string;
  totalCost: number | string;
}

interface PublicRestaurantPromotionRow {
  promotionId: number | string;
  restaurantId: number | string;
  promotionType: string;
  targetAudience: string | null;
  titleVn: string;
  titleJp: string;
  contentVn: string | null;
  contentJp: string | null;
  mediaUrl: string | null;
  termsVn: string | null;
  termsJp: string | null;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
}

interface OwnerHomeReviewSummaryRow {
  visibleCount: number | string;
  averageRating: number | string | null;
  japaneseReviewCount: number | string;
  positiveCount: number | string;
  neutralCount: number | string;
  negativeCount: number | string;
}

interface OwnerHomeReviewRow {
  reviewId: number | string;
  restaurantId: number | string;
  customerAccountId: number | string;
  customerName: string | null;
  customerAvatarUrl: string | null;
  rating: number | string;
  toiletCleanliness: number | string | null;
  dishCleanliness: number | string | null;
  spaceCleanliness: number | string | null;
  content: string | null;
  isJapaneseTag: boolean;
  createdAt: Date | string;
}

interface OwnerHomeBadgeRow {
  badgeId: number | string;
  badgeCode: string;
  badgeNameVn: string;
  badgeNameJp: string;
  descriptionVn: string | null;
  descriptionJp: string | null;
  grantedAt: Date | string;
  expiresAt: Date | string | null;
}

interface OwnerHomeSocialLinkRow {
  socialLinkId: number | string;
  restaurantId: number | string;
  provider: string;
  url: string;
  displayLabel: string | null;
  sortOrder: number | string;
}

interface CreatedReviewRow {
  reviewId: number | string;
  customerAccountId: number | string;
  restaurantId: number | string;
  reservationId: number | string | null;
  rating: number | string;
  toiletCleanliness: number | string | null;
  dishCleanliness: number | string | null;
  spaceCleanliness: number | string | null;
  content: string | null;
  isJapaneseTag: boolean;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(FeatureMaster)
    private readonly featureRepo: Repository<FeatureMaster>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
    private readonly dataSource: DataSource,
  ) {}

  async getOptions() {
    const [features, paymentMethods] = await Promise.all([
      this.featureRepo.find({ order: { featureId: 'ASC' } }),
      this.paymentMethodRepo.find({ order: { paymentMethodId: 'ASC' } }),
    ]);

    return {
      features: features.map((feature) => ({
        featureId: feature.featureId,
        featureCode: feature.featureCode,
        featureNameVn: feature.featureNameVn,
        featureNameJp: feature.featureNameJp,
      })),
      paymentMethods: paymentMethods.map((method) => ({
        paymentMethodId: method.paymentMethodId,
        methodCode: method.methodCode,
        methodName: method.methodName,
      })),
    };
  }

  async findOwnerRestaurant(user: JwtPayload) {
    const restaurant = await this.findOwnedRestaurantWithRelations(user);
    return this.toDetailResponse(restaurant);
  }

  async getOwnerHome(user: JwtPayload) {
    const restaurant = await this.findOwnedRestaurantWithRelations(user);
    const restaurantId = restaurant.restaurantId;

    const [menu, promotions, reviews, badges] = await Promise.all([
      this.getOwnerHomeMenu(restaurantId),
      this.getOwnerHomePromotions(restaurantId),
      this.getOwnerHomeReviews(restaurantId),
      this.getOwnerHomeBadges(restaurantId),
    ]);

    return {
      restaurantId,
      restaurant: this.toHomeRestaurantResponse(restaurant),
      menu,
      promotions,
      reviews,
      badges,
      reviewSubmission: {
        enabled: true,
        method: 'POST',
        endpoint: `/restaurants/${restaurantId}/reviews`,
      },
    };
  }

  async getPublicRestaurantDetail(restaurantId: number, user: JwtPayload) {
    this.assertCustomerViewer(user);

    const restaurant =
      await this.findActiveRestaurantWithRelations(restaurantId);

    const [promotions, reviews, badges] = await Promise.all([
      this.getPublicRestaurantPromotions(restaurantId),
      this.getOwnerHomeReviews(restaurantId),
      this.getOwnerHomeBadges(restaurantId),
    ]);

    return {
      restaurantId,
      restaurant: this.toHomeRestaurantResponse(restaurant),
      promotions,
      reviews,
      badges,
      reviewSubmission: {
        enabled: user.role === AuthRole.User,
        method: 'POST',
        endpoint: `/restaurants/${restaurantId}/reviews`,
      },
    };
  }

  async update(dto: UpdateRestaurantDto, user: JwtPayload) {
    const existing = await this.assertOwnerRestaurant(user);
    const restaurantId = existing.restaurantId;

    const saved = await this.dataSource.transaction(async (manager) => {
      const restaurant = await manager.findOneOrFail(Restaurant, {
        where: { restaurantId },
      });

      if (dto.nameVn !== undefined) {
        restaurant.nameVn = this.requiredTrim(dto.nameVn, 'nameVn');
      }

      if (dto.nameJp !== undefined) {
        restaurant.nameJp = this.requiredTrim(dto.nameJp, 'nameJp');
      }

      if (dto.address !== undefined) {
        restaurant.address = this.requiredTrim(dto.address, 'address');
      }

      if (dto.latitude !== undefined) {
        restaurant.latitude = dto.latitude.toFixed(8);
      }

      if (dto.longitude !== undefined) {
        restaurant.longitude = dto.longitude.toFixed(8);
      }

      if (dto.descriptionVn !== undefined) {
        restaurant.descriptionVn = this.optionalTrim(dto.descriptionVn) ?? null;
      }

      if (dto.descriptionJp !== undefined) {
        restaurant.descriptionJp = this.optionalTrim(dto.descriptionJp) ?? null;
      }

      if (dto.phone !== undefined) {
        restaurant.phone = this.optionalTrim(dto.phone) ?? null;
      }

      if (dto.openingHours !== undefined) {
        restaurant.openingHours = this.optionalTrim(dto.openingHours) ?? null;
      }

      if (dto.issuesVat !== undefined) {
        restaurant.issuesVat = dto.issuesVat;
      }

      await manager.save(Restaurant, restaurant);

      if (dto.featureIds !== undefined) {
        await this.replaceFeatureLinks(manager, restaurantId, dto.featureIds);
      }

      if (dto.paymentMethodIds !== undefined) {
        await this.replacePaymentMethodLinks(
          manager,
          restaurantId,
          dto.paymentMethodIds,
        );
      }

      if (dto.media !== undefined) {
        await manager.delete(RestaurantMedia, { restaurantId });

        if (dto.media.length) {
          const media = dto.media.map((item, index) =>
            manager.create(RestaurantMedia, {
              restaurantId,
              mediaUrl: item.mediaUrl.trim(),
              mediaType: item.mediaType,
              sortOrder: item.sortOrder ?? index,
              status: RestaurantMediaStatus.Pending,
            }),
          );

          await manager.save(RestaurantMedia, media);
        }
      }

      if (dto.socialLinks !== undefined) {
        await manager.delete(RestaurantSocialLink, { restaurantId });

        if (dto.socialLinks.length) {
          const links = dto.socialLinks.map((item, index) =>
            manager.create(RestaurantSocialLink, {
              restaurantId,
              provider: item.provider,
              url: item.url.trim(),
              displayLabel: item.displayLabel?.trim() ?? null,
              sortOrder: item.sortOrder ?? index,
              isActive: item.isActive ?? true,
            }),
          );

          await manager.save(RestaurantSocialLink, links);
        }
      }

      return manager.findOneOrFail(Restaurant, {
        where: { restaurantId },
        relations: {
          media: true,
          socialLinks: true,
          featureLinks: { feature: true },
          paymentMethodLinks: { paymentMethod: true },
        },
        order: {
          media: { sortOrder: 'ASC', mediaId: 'ASC' },
          socialLinks: { sortOrder: 'ASC', socialLinkId: 'ASC' },
          featureLinks: { featureId: 'ASC' },
          paymentMethodLinks: { paymentMethodId: 'ASC' },
        },
      });
    });

    return this.toDetailResponse(saved);
  }

  async createReview(
    restaurantId: number,
    dto: CreateRestaurantReviewDto,
    user: JwtPayload,
  ) {
    if (user.role !== AuthRole.User) {
      throw new ForbiddenException(
        'Only customer users can submit restaurant reviews.',
      );
    }

    const content = this.optionalTrim(dto.content) ?? null;

    const rows = await this.dataSource.query<CreatedReviewRow[]>(
      `
        INSERT INTO REVIEW (
          CustomerAccountID,
          RestaurantID,
          ReservationID,
          Rating,
          ToiletCleanliness,
          DishCleanliness,
          SpaceCleanliness,
          Content,
          IsJapaneseTag,
          Status
        )
        SELECT
          $1,
          r.RestaurantID,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          'Visible'
        FROM RESTAURANT r
        INNER JOIN CUSTOMER_PROFILE cp
          ON cp.AccountID = $1
        WHERE r.RestaurantID = $2
          AND (
            $3::int IS NULL
            OR EXISTS (
              SELECT 1
              FROM RESERVATION rv
              WHERE rv.ReservationID = $3
                AND rv.RestaurantID = r.RestaurantID
                AND rv.CustomerAccountID = $1
                AND rv.Status = 'Completed'
            )
          )
        RETURNING
          ReviewID AS "reviewId",
          CustomerAccountID AS "customerAccountId",
          RestaurantID AS "restaurantId",
          ReservationID AS "reservationId",
          Rating AS "rating",
          ToiletCleanliness AS "toiletCleanliness",
          DishCleanliness AS "dishCleanliness",
          SpaceCleanliness AS "spaceCleanliness",
          Content AS "content",
          IsJapaneseTag AS "isJapaneseTag",
          Status AS "status",
          CreatedAt AS "createdAt",
          UpdatedAt AS "updatedAt"
      `,
      [
        user.sub,
        restaurantId,
        dto.reservationId ?? null,
        dto.rating,
        dto.toiletCleanliness ?? null,
        dto.dishCleanliness ?? null,
        dto.spaceCleanliness ?? null,
        content,
        dto.isJapaneseTag ?? false,
      ],
    );

    const row = rows[0];

    if (!row) {
      throw new NotFoundException(
        'Restaurant, customer profile, or completed reservation was not found.',
      );
    }

    return {
      reviewId: Number(row.reviewId),
      customerAccountId: Number(row.customerAccountId),
      restaurantId: Number(row.restaurantId),
      reservationId:
        row.reservationId === null ? null : Number(row.reservationId),
      rating: Number(row.rating),
      toiletCleanliness:
        row.toiletCleanliness === null ? null : Number(row.toiletCleanliness),
      dishCleanliness:
        row.dishCleanliness === null ? null : Number(row.dishCleanliness),
      spaceCleanliness:
        row.spaceCleanliness === null ? null : Number(row.spaceCleanliness),
      content: row.content,
      isJapaneseTag: row.isJapaneseTag,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private assertOwner(user: JwtPayload) {
    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException(
        'Only restaurant owners can manage restaurant information.',
      );
    }
  }

  private assertCustomerViewer(user: JwtPayload) {
    if (![AuthRole.User, AuthRole.Guest].includes(user.role)) {
      throw new ForbiddenException(
        'Only customer or guest users can view restaurant detail.',
      );
    }
  }

  private async assertOwnerRestaurant(user: JwtPayload) {
    this.assertOwner(user);

    const restaurant = await this.restaurantRepo.findOne({
      where: { ownerAccountId: user.sub },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found for this owner.');
    }

    return restaurant;
  }

  private async findOwnedRestaurantWithRelations(user: JwtPayload) {
    this.assertOwner(user);

    const restaurant = await this.restaurantRepo.findOne({
      where: { ownerAccountId: user.sub },
      relations: {
        media: true,
        socialLinks: true,
        featureLinks: { feature: true },
        paymentMethodLinks: { paymentMethod: true },
      },
      order: {
        media: { sortOrder: 'ASC', mediaId: 'ASC' },
        socialLinks: { sortOrder: 'ASC', socialLinkId: 'ASC' },
        featureLinks: { featureId: 'ASC' },
        paymentMethodLinks: { paymentMethodId: 'ASC' },
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found for this owner.');
    }

    return restaurant;
  }

  private async findActiveRestaurantWithRelations(restaurantId: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId, status: 'Active' },
      relations: {
        media: true,
        socialLinks: true,
        featureLinks: { feature: true },
        paymentMethodLinks: { paymentMethod: true },
      },
      order: {
        media: { sortOrder: 'ASC', mediaId: 'ASC' },
        socialLinks: { sortOrder: 'ASC', socialLinkId: 'ASC' },
        featureLinks: { featureId: 'ASC' },
        paymentMethodLinks: { paymentMethodId: 'ASC' },
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Active restaurant was not found.');
    }

    return restaurant;
  }

  private async replaceFeatureLinks(
    manager: EntityManager,
    restaurantId: number,
    featureIds: number[],
  ) {
    await this.assertIdsExist(
      manager.getRepository(FeatureMaster),
      featureIds,
      'featureId',
      'Feature',
    );

    await manager.delete(RestaurantFeature, { restaurantId });

    if (!featureIds.length) {
      return;
    }

    await manager.save(
      RestaurantFeature,
      featureIds.map((featureId) => ({ restaurantId, featureId })),
    );
  }

  private async replacePaymentMethodLinks(
    manager: EntityManager,
    restaurantId: number,
    paymentMethodIds: number[],
  ) {
    await this.assertIdsExist(
      manager.getRepository(PaymentMethod),
      paymentMethodIds,
      'paymentMethodId',
      'Payment method',
    );

    await manager.delete(RestaurantPaymentMethod, { restaurantId });

    if (!paymentMethodIds.length) {
      return;
    }

    await manager.save(
      RestaurantPaymentMethod,
      paymentMethodIds.map((paymentMethodId) => ({
        restaurantId,
        paymentMethodId,
      })),
    );
  }

  private async getOwnerHomeMenu(restaurantId: number) {
    const [summaryRows, categories, items] = await Promise.all([
      this.dataSource.query<OwnerHomeMenuSummaryRow[]>(
        `
          SELECT
            COUNT(*)::int AS "totalCount",
            COUNT(*) FILTER (WHERE IsActive = TRUE)::int AS "activeCount",
            COUNT(*) FILTER (
              WHERE IsRecommendedForJP = TRUE
            )::int AS "recommendedForJpCount"
          FROM MENU_ITEM
          WHERE RestaurantID = $1
            AND DeletedAt IS NULL
        `,
        [restaurantId],
      ),
      this.dataSource.query<OwnerHomeMenuCategoryRow[]>(
        `
          SELECT
            mc.CategoryID AS "categoryId",
            mc.RestaurantID AS "restaurantId",
            mc.CategoryCode AS "categoryCode",
            mc.CategoryNameVN AS "categoryNameVn",
            mc.CategoryNameJP AS "categoryNameJp",
            mc.SortOrder AS "sortOrder",
            COUNT(mi.ItemID) FILTER (
              WHERE mi.DeletedAt IS NULL
            )::int AS "itemCount"
          FROM MENU_CATEGORY mc
          LEFT JOIN MENU_ITEM mi
            ON mi.CategoryID = mc.CategoryID
            AND mi.RestaurantID = mc.RestaurantID
          WHERE mc.RestaurantID = $1
            AND mc.IsActive = TRUE
          GROUP BY
            mc.CategoryID,
            mc.RestaurantID,
            mc.CategoryCode,
            mc.CategoryNameVN,
            mc.CategoryNameJP,
            mc.SortOrder
          ORDER BY mc.SortOrder ASC, mc.CategoryID ASC
        `,
        [restaurantId],
      ),
      this.dataSource.query<OwnerHomeMenuItemRow[]>(
        `
          WITH RankedItems AS (
            SELECT
              mi.ItemID AS "itemId",
              mi.RestaurantID AS "restaurantId",
              mi.CategoryID AS "categoryId",
              mc.CategoryCode AS "categoryCode",
              mc.CategoryNameVN AS "categoryNameVn",
              mc.CategoryNameJP AS "categoryNameJp",
              mc.SortOrder AS "categorySortOrder",
              mi.NameVN AS "nameVn",
              mi.NameJP AS "nameJp",
              mi.Price AS "price",
              mi.DescriptionVN AS "descriptionVn",
              mi.DescriptionJP AS "descriptionJp",
              mi.ImageURL AS "imageUrl",
              mi.IsRecommendedForJP AS "isRecommendedForJp",
              mi.IsActive AS "isActive",
              mi.CreatedAt AS "createdAt",
              mi.UpdatedAt AS "updatedAt",
              ROW_NUMBER() OVER(
                PARTITION BY mi.CategoryID 
                ORDER BY mi.UpdatedAt DESC, mi.ItemID ASC
              ) as rn
            FROM MENU_ITEM mi
            LEFT JOIN MENU_CATEGORY mc
              ON mc.CategoryID = mi.CategoryID
              AND mc.RestaurantID = mi.RestaurantID
            WHERE mi.RestaurantID = $1
              AND mi.DeletedAt IS NULL
              AND mi.IsRecommendedForJP = TRUE
          )
          SELECT
            ri."itemId",
            ri."restaurantId",
            ri."categoryId",
            ri."categoryCode",
            ri."categoryNameVn",
            ri."categoryNameJp",
            ri."categorySortOrder",
            ri."nameVn",
            ri."nameJp",
            ri."price",
            ri."descriptionVn",
            ri."descriptionJp",
            ri."imageUrl",
            ri."isRecommendedForJp",
            ri."isActive",
            COALESCE(
              JSON_AGG(
                JSON_BUILD_OBJECT(
                  'criterionId', mic.CriterionID,
                  'criterionName', mic.CriterionName,
                  'ratingLevel', mic.RatingLevel,
                  'sortOrder', mic.SortOrder
                )
                ORDER BY mic.SortOrder, mic.CriterionID
              ) FILTER (WHERE mic.CriterionID IS NOT NULL),
              '[]'::json
            ) AS "criteria",
            ri."createdAt",
            ri."updatedAt"
          FROM RankedItems ri
          LEFT JOIN MENU_ITEM_CRITERION mic
            ON mic.ItemID = ri."itemId"
          WHERE ri.rn <= 4
          GROUP BY
            ri."itemId",
            ri."restaurantId",
            ri."categoryId",
            ri."categoryCode",
            ri."categoryNameVn",
            ri."categoryNameJp",
            ri."categorySortOrder",
            ri."nameVn",
            ri."nameJp",
            ri."price",
            ri."descriptionVn",
            ri."descriptionJp",
            ri."imageUrl",
            ri."isRecommendedForJp",
            ri."isActive",
            ri."createdAt",
            ri."updatedAt",
            ri.rn
          ORDER BY
            COALESCE(ri."categorySortOrder", 9999) ASC,
            ri.rn ASC
        `,
        [restaurantId],
      ),
    ]);

    const summary = summaryRows[0] ?? {
      totalCount: 0,
      activeCount: 0,
      recommendedForJpCount: 0,
    };

    return {
      count: Number(summary.totalCount),
      activeCount: Number(summary.activeCount),
      recommendedForJpCount: Number(summary.recommendedForJpCount),
      categories: categories.map((category) => ({
        categoryId: Number(category.categoryId),
        restaurantId: Number(category.restaurantId),
        categoryCode: category.categoryCode,
        categoryNameVn: category.categoryNameVn,
        categoryNameJp: category.categoryNameJp,
        sortOrder: Number(category.sortOrder),
        itemCount: Number(category.itemCount),
      })),
      items: items.map((item) => ({
        itemId: Number(item.itemId),
        restaurantId: Number(item.restaurantId),
        categoryId: item.categoryId === null ? null : Number(item.categoryId),
        category:
          item.categoryId === null
            ? null
            : {
                categoryId: Number(item.categoryId),
                categoryCode: item.categoryCode,
                categoryNameVn: item.categoryNameVn,
                categoryNameJp: item.categoryNameJp,
              },
        nameVn: item.nameVn,
        nameJp: item.nameJp,
        price: Number(item.price),
        descriptionVn: item.descriptionVn,
        descriptionJp: item.descriptionJp,
        imageUrl: item.imageUrl,
        isRecommendedForJp: item.isRecommendedForJp,
        isActive: item.isActive,
        criteria: (item.criteria ?? []).map((criterion) => ({
          criterionId: Number(criterion.criterionId),
          criterionName: criterion.criterionName,
          ratingLevel: Number(criterion.ratingLevel),
          sortOrder: Number(criterion.sortOrder),
        })),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      filters: {
        categories: categories.map((category) => ({
          value: category.categoryCode,
          label: category.categoryNameJp,
          categoryId: Number(category.categoryId),
        })),
      },
    };
  }

  private async getOwnerHomePromotions(restaurantId: number) {
    const rows = await this.dataSource.query<OwnerHomePromotionRow[]>(
      `
        SELECT
          PromotionID AS "promotionId",
          RestaurantID AS "restaurantId",
          PromotionType AS "promotionType",
          TargetAudience AS "targetAudience",
          TitleVN AS "titleVn",
          TitleJP AS "titleJp",
          ContentVN AS "contentVn",
          ContentJP AS "contentJp",
          MediaURL AS "mediaUrl",
          TermsVN AS "termsVn",
          TermsJP AS "termsJp",
          StartDate AS "startDate",
          EndDate AS "endDate",
          Status AS "status",
          Impressions AS "impressions",
          Clicks AS "clicks",
          TotalCost AS "totalCost"
        FROM PROMOTION
        WHERE RestaurantID = $1
          AND PromotionType = 'Campaign'
        ORDER BY
          CASE
            WHEN Status = 'Active'
              AND StartDate <= CURRENT_TIMESTAMP
              AND EndDate >= CURRENT_TIMESTAMP
            THEN 0
            WHEN Status = 'Pending' THEN 1
            WHEN StartDate > CURRENT_TIMESTAMP THEN 2
            ELSE 3
          END,
          StartDate DESC,
          PromotionID DESC
        LIMIT 5
      `,
      [restaurantId],
    );

    return {
      count: rows.length,
      items: rows.map((row) => ({
        promotionId: Number(row.promotionId),
        restaurantId: Number(row.restaurantId),
        promotionType: row.promotionType,
        targetAudience: row.targetAudience,
        titleVn: row.titleVn,
        titleJp: row.titleJp,
        contentVn: row.contentVn,
        contentJp: row.contentJp,
        mediaUrl: row.mediaUrl,
        termsVn: row.termsVn,
        termsJp: row.termsJp,
        startDate: row.startDate,
        endDate: row.endDate,
        status: row.status,
        impressions: Number(row.impressions),
        clicks: Number(row.clicks),
        totalCost: Number(row.totalCost),
        ctr:
          Number(row.impressions) > 0
            ? Number((Number(row.clicks) / Number(row.impressions)).toFixed(4))
            : 0,
      })),
    };
  }

  private async getPublicRestaurantPromotions(restaurantId: number) {
    const rows = await this.dataSource.query<PublicRestaurantPromotionRow[]>(
      `
        SELECT
          PromotionID AS "promotionId",
          RestaurantID AS "restaurantId",
          PromotionType AS "promotionType",
          TargetAudience AS "targetAudience",
          TitleVN AS "titleVn",
          TitleJP AS "titleJp",
          ContentVN AS "contentVn",
          ContentJP AS "contentJp",
          MediaURL AS "mediaUrl",
          TermsVN AS "termsVn",
          TermsJP AS "termsJp",
          StartDate AS "startDate",
          EndDate AS "endDate",
          Status AS "status"
        FROM PROMOTION
        WHERE RestaurantID = $1
          AND PromotionType = 'Campaign'
          AND Status = 'Active'
          AND StartDate <= CURRENT_TIMESTAMP
          AND EndDate >= CURRENT_TIMESTAMP
        ORDER BY EndDate ASC, StartDate DESC, PromotionID DESC
      `,
      [restaurantId],
    );

    return {
      count: rows.length,
      items: rows.map((row) => ({
        promotionId: Number(row.promotionId),
        restaurantId: Number(row.restaurantId),
        promotionType: row.promotionType,
        targetAudience: row.targetAudience,
        titleVn: row.titleVn,
        titleJp: row.titleJp,
        contentVn: row.contentVn,
        contentJp: row.contentJp,
        mediaUrl: row.mediaUrl,
        termsVn: row.termsVn,
        termsJp: row.termsJp,
        startDate: row.startDate,
        endDate: row.endDate,
        status: row.status,
      })),
    };
  }

  private async getOwnerHomeReviews(restaurantId: number) {
    const [summaryRows, rows] = await Promise.all([
      this.dataSource.query<OwnerHomeReviewSummaryRow[]>(
        `
          SELECT
            COUNT(*)::int AS "visibleCount",
            AVG(Rating)::numeric(10, 2) AS "averageRating",
            COUNT(*) FILTER (WHERE IsJapaneseTag = TRUE)::int AS "japaneseReviewCount",
            COUNT(*) FILTER (WHERE Rating >= 4)::int AS "positiveCount",
            COUNT(*) FILTER (WHERE Rating = 3)::int AS "neutralCount",
            COUNT(*) FILTER (WHERE Rating <= 2)::int AS "negativeCount"
          FROM REVIEW
          WHERE RestaurantID = $1
            AND Status = 'Visible'
        `,
        [restaurantId],
      ),
      this.dataSource.query<OwnerHomeReviewRow[]>(
        `
          SELECT
            r.ReviewID AS "reviewId",
            r.RestaurantID AS "restaurantId",
            r.CustomerAccountID AS "customerAccountId",
            COALESCE(cp.DisplayName, cp.FullName) AS "customerName",
            cp.AvatarURL AS "customerAvatarUrl",
            r.Rating AS "rating",
            r.ToiletCleanliness AS "toiletCleanliness",
            r.DishCleanliness AS "dishCleanliness",
            r.SpaceCleanliness AS "spaceCleanliness",
            r.Content AS "content",
            r.IsJapaneseTag AS "isJapaneseTag",
            r.CreatedAt AS "createdAt"
          FROM REVIEW r
          INNER JOIN CUSTOMER_PROFILE cp
            ON cp.AccountID = r.CustomerAccountID
          WHERE r.RestaurantID = $1
            AND r.Status = 'Visible'
          ORDER BY r.CreatedAt DESC, r.ReviewID DESC
        `,
        [restaurantId],
      ),
    ]);

    const summary = summaryRows[0] ?? {
      visibleCount: 0,
      averageRating: null,
      japaneseReviewCount: 0,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0,
    };

    return {
      summary: {
        visibleCount: Number(summary.visibleCount),
        averageRating:
          summary.averageRating === null
            ? null
            : Number(Number(summary.averageRating).toFixed(1)),
        japaneseReviewCount: Number(summary.japaneseReviewCount),
        sentiment: {
          positiveCount: Number(summary.positiveCount),
          neutralCount: Number(summary.neutralCount),
          negativeCount: Number(summary.negativeCount),
        },
      },
      items: rows.map((row) => ({
        reviewId: Number(row.reviewId),
        restaurantId: Number(row.restaurantId),
        customerAccountId: Number(row.customerAccountId),
        customerName: row.customerName,
        customerAvatarUrl: row.customerAvatarUrl,
        rating: Number(row.rating),
        toiletCleanliness:
          row.toiletCleanliness === null ? null : Number(row.toiletCleanliness),
        dishCleanliness:
          row.dishCleanliness === null ? null : Number(row.dishCleanliness),
        spaceCleanliness:
          row.spaceCleanliness === null ? null : Number(row.spaceCleanliness),
        content: row.content,
        isJapaneseTag: row.isJapaneseTag,
        createdAt: row.createdAt,
      })),
      filters: {
        audience: [
          { value: 'all', label: 'すべて' },
          { value: 'japanese', label: '在住日本人' },
          { value: 'vietnamese', label: 'ベトナム人' },
        ],
        ratings: [5, 4, 3, 2, 1],
      },
    };
  }

  private async getOwnerHomeBadges(restaurantId: number) {
    const rows = await this.dataSource.query<OwnerHomeBadgeRow[]>(
      `
        SELECT
          bm.BadgeID AS "badgeId",
          bm.BadgeCode AS "badgeCode",
          bm.BadgeNameVN AS "badgeNameVn",
          bm.BadgeNameJP AS "badgeNameJp",
          bm.DescriptionVN AS "descriptionVn",
          bm.DescriptionJP AS "descriptionJp",
          rb.GrantedAt AS "grantedAt",
          rb.ExpiresAt AS "expiresAt"
        FROM RESTAURANT_BADGE rb
        INNER JOIN BADGE_MASTER bm
          ON bm.BadgeID = rb.BadgeID
        WHERE rb.RestaurantID = $1
          AND (rb.ExpiresAt IS NULL OR rb.ExpiresAt > CURRENT_TIMESTAMP)
        ORDER BY rb.GrantedAt DESC, bm.BadgeID ASC
      `,
      [restaurantId],
    );

    return {
      count: rows.length,
      isVerified: rows.some((row) => row.badgeCode === 'VERIFIED'),
      items: rows.map((row) => ({
        badgeId: Number(row.badgeId),
        badgeCode: row.badgeCode,
        badgeNameVn: row.badgeNameVn,
        badgeNameJp: row.badgeNameJp,
        descriptionVn: row.descriptionVn,
        descriptionJp: row.descriptionJp,
        grantedAt: row.grantedAt,
        expiresAt: row.expiresAt,
      })),
    };
  }

  private async getOwnerHomeSocialLinks(restaurantId: number) {
    const rows = await this.dataSource.query<OwnerHomeSocialLinkRow[]>(
      `
        SELECT
          SocialLinkID AS "socialLinkId",
          RestaurantID AS "restaurantId",
          Provider AS "provider",
          URL AS "url",
          DisplayLabel AS "displayLabel",
          SortOrder AS "sortOrder"
        FROM RESTAURANT_SOCIAL_LINK
        WHERE RestaurantID = $1
          AND IsActive = TRUE
        ORDER BY SortOrder ASC, SocialLinkID ASC
      `,
      [restaurantId],
    );

    return {
      count: rows.length,
      items: rows.map((row) => ({
        socialLinkId: Number(row.socialLinkId),
        restaurantId: Number(row.restaurantId),
        provider: row.provider,
        url: row.url,
        displayLabel: row.displayLabel,
        sortOrder: Number(row.sortOrder),
      })),
    };
  }

  private async assertIdsExist<Entity extends object>(
    repository: Repository<Entity>,
    ids: number[],
    property: keyof Entity,
    label: string,
  ) {
    if (!ids.length) {
      return;
    }

    const where = {
      [property]: In(ids),
    } as FindOptionsWhere<Entity>;
    const rows = await repository.find({
      where,
    });

    if (rows.length !== ids.length) {
      throw new BadRequestException(`${label} selection contains unknown IDs.`);
    }
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

  private toSummaryResponse(restaurant: Restaurant) {
    return {
      restaurantId: restaurant.restaurantId,
      ownerAccountId: restaurant.ownerAccountId,
      nameVn: restaurant.nameVn,
      nameJp: restaurant.nameJp,
      address: restaurant.address,
      status: restaurant.status,
      updatedAt: restaurant.updatedAt,
    };
  }

  private toDetailResponse(restaurant: Restaurant) {
    return {
      restaurantId: restaurant.restaurantId,
      ownerAccountId: restaurant.ownerAccountId,
      nameVn: restaurant.nameVn,
      nameJp: restaurant.nameJp,
      address: restaurant.address,
      latitude:
        restaurant.latitude === null || restaurant.latitude === undefined
          ? null
          : Number(restaurant.latitude),
      longitude:
        restaurant.longitude === null || restaurant.longitude === undefined
          ? null
          : Number(restaurant.longitude),
      descriptionVn: restaurant.descriptionVn ?? null,
      descriptionJp: restaurant.descriptionJp ?? null,
      phone: restaurant.phone ?? null,
      openingHours: restaurant.openingHours ?? null,
      issuesVat: restaurant.issuesVat,
      status: restaurant.status,
      features: (restaurant.featureLinks ?? [])
        .sort((a, b) => a.featureId - b.featureId)
        .map((link) => ({
          featureId: link.featureId,
          featureCode: link.feature?.featureCode,
          featureNameVn: link.feature?.featureNameVn,
          featureNameJp: link.feature?.featureNameJp,
        })),
      paymentMethods: (restaurant.paymentMethodLinks ?? [])
        .sort((a, b) => a.paymentMethodId - b.paymentMethodId)
        .map((link) => ({
          paymentMethodId: link.paymentMethodId,
          methodCode: link.paymentMethod?.methodCode,
          methodName: link.paymentMethod?.methodName,
        })),
      media: (restaurant.media ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder || a.mediaId - b.mediaId)
        .map((media) => ({
          mediaId: media.mediaId,
          mediaUrl: media.mediaUrl,
          mediaType: media.mediaType,
          sortOrder: media.sortOrder,
          status: media.status,
        })),
      socialLinks: (restaurant.socialLinks ?? [])
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder || a.socialLinkId - b.socialLinkId,
        )
        .map((link) => ({
          socialLinkId: link.socialLinkId,
          provider: link.provider,
          url: link.url,
          displayLabel: link.displayLabel,
          sortOrder: link.sortOrder,
          isActive: link.isActive,
        })),
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    };
  }

  private toHomeRestaurantResponse(restaurant: Restaurant) {
    const socialLinks = (restaurant.socialLinks ?? [])
      .filter((link) => link.isActive)
      .sort(
        (a, b) => a.sortOrder - b.sortOrder || a.socialLinkId - b.socialLinkId,
      )
      .map((link) => ({
        socialLinkId: link.socialLinkId,
        restaurantId: link.restaurantId,
        provider: link.provider,
        url: link.url,
        displayLabel: link.displayLabel,
        sortOrder: link.sortOrder,
      }));
    const media = (restaurant.media ?? []).sort(
      (a, b) => a.sortOrder - b.sortOrder || a.mediaId - b.mediaId,
    );
    const cover =
      media.find((item) => item.mediaType === RestaurantMediaType.Cover) ??
      media[0];

    return {
      restaurantId: restaurant.restaurantId,
      ownerAccountId: restaurant.ownerAccountId,
      nameVn: restaurant.nameVn,
      nameJp: restaurant.nameJp,
      address: restaurant.address,
      latitude:
        restaurant.latitude === null || restaurant.latitude === undefined
          ? null
          : Number(restaurant.latitude),
      longitude:
        restaurant.longitude === null || restaurant.longitude === undefined
          ? null
          : Number(restaurant.longitude),
      descriptionVn: restaurant.descriptionVn ?? null,
      descriptionJp: restaurant.descriptionJp ?? null,
      phone: restaurant.phone ?? null,
      openingHours: restaurant.openingHours ?? null,
      issuesVat: restaurant.issuesVat,
      status: restaurant.status,
      socialLinks,
      sns: {
        facebook:
          socialLinks.find(
            (link) => link.provider === RestaurantSocialProvider.Facebook,
          )?.url ?? null,
        instagram:
          socialLinks.find(
            (link) => link.provider === RestaurantSocialProvider.Instagram,
          )?.url ?? null,
      },
      map: {
        latitude:
          restaurant.latitude === null || restaurant.latitude === undefined
            ? null
            : Number(restaurant.latitude),
        longitude:
          restaurant.longitude === null || restaurant.longitude === undefined
            ? null
            : Number(restaurant.longitude),
        embedUrl:
          restaurant.latitude && restaurant.longitude
            ? `https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`
            : null,
      },
      coverImageUrl: cover?.mediaUrl ?? null,
      media: media.map((item) => ({
        mediaId: item.mediaId,
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType,
        sortOrder: item.sortOrder,
        status: item.status,
      })),
      features: (restaurant.featureLinks ?? [])
        .sort((a, b) => a.featureId - b.featureId)
        .map((link) => ({
          featureId: link.featureId,
          featureCode: link.feature?.featureCode,
          featureNameVn: link.feature?.featureNameVn,
          featureNameJp: link.feature?.featureNameJp,
        })),
      paymentMethods: (restaurant.paymentMethodLinks ?? [])
        .sort((a, b) => a.paymentMethodId - b.paymentMethodId)
        .map((link) => ({
          paymentMethodId: link.paymentMethodId,
          methodCode: link.paymentMethod?.methodCode,
          methodName: link.paymentMethod?.methodName,
        })),
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    };
  }
}
