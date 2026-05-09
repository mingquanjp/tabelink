import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { JwtPayload } from '../auth/auth.types';
import { MenuItem } from '../entities/menu-item.entity';
import { Restaurant } from '../entities/restaurant.entity';

interface TopMenuRow {
  itemid: number | string;
  restaurantid: number | string;
  namevn: string;
  namejp: string;
  imageurl: string | null;
  ordercount: number | string;
  revenue: number | string;
}

interface RestaurantViewRow {
  restaurantid: number | string;
  statdate: string;
  visitcount: number | string;
  japanesevisitcount: number | string;
}

interface MenuItemViewRow {
  itemid: number | string;
  statdate: string;
  viewcount: number | string;
}

interface MonthlyViewsRow {
  currentmonthviews: number | string | null;
  previousmonthviews: number | string | null;
}

interface JapaneseAverageRatingRow {
  averagerating: number | string | null;
  reviewcount: number | string;
}

interface CampaignWeeklyOrdersRow {
  activecampaigncount: number | string;
  weeklyordercount: number | string;
}

interface PublishedReviewsRow {
  reviewcount: number | string;
}

interface VisitorTrendRow {
  statdate: string;
  japanese: number | string;
  others: number | string;
}

interface RevenueTrendRow {
  date: string;
  revenue: number | string;
  ordercount: number | string;
}

interface UserAttributeRow {
  label: string;
  count: number | string;
}

interface ReviewSentimentRow {
  positive: number | string;
  neutral: number | string;
  negative: number | string;
}

interface BusyHourRow {
  hour: number | string;
  reservationcount: number | string;
}

interface VerificationRow {
  appid: number | string;
  restaurantid: number | string;
  badgeid: number | string;
  badgecode: string | null;
  badgenamevn: string | null;
  badgenamejp: string | null;
  submittedbyowneraccountid: number | string;
  businesslicenseurl: string | null;
  businesslicensepublicid: string | null;
  foodsafetycerturl: string | null;
  foodsafetycertpublicid: string | null;
  status: string;
  submittedat: Date | string;
  reviewedbyadminid: number | string | null;
  reviewedat: Date | string | null;
  reviewnote: string | null;
}

const PUBLISHED_REVIEW_TARGET = 100;

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
    private readonly dataSource: DataSource,
  ) {}

  async getDashboard(restaurantId: number, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const [
      monthlyViews,
      japaneseAverageRating,
      campaignWeeklyOrders,
      publishedReviews,
      visitorTrend,
      revenueTrend,
      userAttributes,
      reviewSentiment,
      topMenu,
      busyHoursToday,
      verification,
    ] = await Promise.all([
      this.getMonthlyViews(restaurantId),
      this.getJapaneseAverageRating(restaurantId),
      this.getCampaignWeeklyOrders(restaurantId),
      this.getPublishedReviews(restaurantId),
      this.getVisitorTrend(restaurantId),
      this.getRevenueTrend(restaurantId),
      this.getUserAttributes(restaurantId),
      this.getReviewSentiment(restaurantId),
      this.getTopMenuItems(restaurantId),
      this.getBusyHoursToday(restaurantId),
      this.getVerificationStatus(restaurantId, user.sub),
    ]);

    return {
      restaurantId,
      period: {
        month: this.formatCurrentMonth(),
      },
      summary: {
        monthlyViews,
        japaneseAverageRating,
        campaignWeeklyOrders,
        publishedReviews,
      },
      visitorTrend,
      revenueTrend,
      userAttributes,
      reviewSentiment,
      topMenus: topMenu.items,
      busyHoursToday,
      verification,
    };
  }

  async getTopMenu(restaurantId: number, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);

    return this.getTopMenuItems(restaurantId);
  }

  private async getTopMenuItems(restaurantId: number) {
    const rows = await this.dataSource.query<TopMenuRow[]>(
      `
        SELECT
          mi.itemid,
          mi.restaurantid,
          mi.namevn,
          mi.namejp,
          mi.imageurl,
          COALESCE(SUM(ri.quantity), 0)::int AS ordercount,
          COALESCE(SUM(ri.quantity * ri.unitprice), 0)::numeric(12, 2) AS revenue
        FROM menu_item mi
        INNER JOIN reservation_item ri
          ON ri.itemid = mi.itemid
          AND ri.restaurantid = mi.restaurantid
        INNER JOIN reservation r
          ON r.reservationid = ri.reservationid
          AND r.restaurantid = ri.restaurantid
        WHERE mi.restaurantid = $1
          AND mi.deletedat IS NULL
          AND r.status = 'Completed'
        GROUP BY mi.itemid, mi.restaurantid, mi.namevn, mi.namejp, mi.imageurl
        ORDER BY SUM(ri.quantity) DESC, mi.itemid ASC
        LIMIT 3
      `,
      [restaurantId],
    );

    return {
      restaurantId,
      count: rows.length,
      items: rows.map((row, index) => ({
        rank: index + 1,
        itemId: Number(row.itemid),
        restaurantId: Number(row.restaurantid),
        nameVn: row.namevn,
        nameJp: row.namejp,
        imageUrl: row.imageurl ?? null,
        orderCount: Number(row.ordercount),
        revenue: Number(row.revenue),
      })),
    };
  }

  private async getMonthlyViews(restaurantId: number) {
    const rows = await this.dataSource.query<MonthlyViewsRow[]>(
      `
        SELECT
          COALESCE(SUM(VisitCount) FILTER (
            WHERE StatDate >= DATE_TRUNC('month', CURRENT_DATE)::date
              AND StatDate < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')::date
          ), 0)::int AS CurrentMonthViews,
          COALESCE(SUM(VisitCount) FILTER (
            WHERE StatDate >= (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::date
              AND StatDate < DATE_TRUNC('month', CURRENT_DATE)::date
          ), 0)::int AS PreviousMonthViews
        FROM RESTAURANT_ANALYTICS_DAILY
        WHERE RestaurantID = $1
          AND StatDate >= (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::date
          AND StatDate < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')::date
      `,
      [restaurantId],
    );

    const row = rows[0] ?? {
      currentmonthviews: 0,
      previousmonthviews: 0,
    };
    const value = Number(row.currentmonthviews ?? 0);
    const previousMonthValue = Number(row.previousmonthviews ?? 0);

    return {
      value,
      previousMonthValue,
      changeRate: this.calculateChangeRate(value, previousMonthValue),
    };
  }

  private async getJapaneseAverageRating(restaurantId: number) {
    const rows = await this.dataSource.query<JapaneseAverageRatingRow[]>(
      `
        SELECT
          AVG(r.Rating)::numeric(10, 2) AS AverageRating,
          COUNT(*)::int AS ReviewCount
        FROM REVIEW r
        INNER JOIN CUSTOMER_PROFILE cp
          ON cp.AccountID = r.CustomerAccountID
        WHERE r.RestaurantID = $1
          AND r.Status = 'Visible'
          AND (
            r.IsJapaneseTag = TRUE
            OR LOWER(COALESCE(cp.Nationality, '')) IN ('japan', 'japanese')
            OR cp.Nationality IN ('日本', '日本人')
          )
      `,
      [restaurantId],
    );

    const row = rows[0] ?? {
      averagerating: null,
      reviewcount: 0,
    };
    const value =
      row.averagerating === null
        ? null
        : Number(Number(row.averagerating).toFixed(1));

    return {
      value,
      reviewCount: Number(row.reviewcount),
    };
  }

  private async getCampaignWeeklyOrders(restaurantId: number) {
    const rows = await this.dataSource.query<CampaignWeeklyOrdersRow[]>(
      `
        SELECT
          COUNT(DISTINCT pr.ReservationID) FILTER (
            WHERE pr.RedemptionStatus = 'Redeemed'
              AND pr.RedeemedAt >= DATE_TRUNC('week', CURRENT_DATE)
              AND pr.RedeemedAt < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
          )::int AS WeeklyOrderCount,
          COUNT(DISTINCT p.PromotionID) FILTER (
            WHERE p.Status = 'Active'
              AND p.StartDate <= CURRENT_TIMESTAMP
              AND p.EndDate >= CURRENT_TIMESTAMP
          )::int AS ActiveCampaignCount
        FROM PROMOTION p
        LEFT JOIN PROMOTION_REDEMPTION pr
          ON pr.PromotionID = p.PromotionID
          AND pr.RestaurantID = p.RestaurantID
        WHERE p.RestaurantID = $1
          AND p.PromotionType = 'Campaign'
      `,
      [restaurantId],
    );

    return {
      value: Number(rows[0]?.weeklyordercount ?? 0),
      activeCampaignCount: Number(rows[0]?.activecampaigncount ?? 0),
      isTracked: true,
    };
  }

  private async getPublishedReviews(restaurantId: number) {
    const rows = await this.dataSource.query<PublishedReviewsRow[]>(
      `
        SELECT COUNT(*)::int AS ReviewCount
        FROM REVIEW
        WHERE RestaurantID = $1
          AND Status = 'Visible'
      `,
      [restaurantId],
    );

    const value = Number(rows[0]?.reviewcount ?? 0);

    return {
      value,
      target: PUBLISHED_REVIEW_TARGET,
      progressRate: this.calculateProgressRate(value, PUBLISHED_REVIEW_TARGET),
    };
  }

  private async getVisitorTrend(restaurantId: number) {
    const rows = await this.dataSource.query<VisitorTrendRow[]>(
      `
        SELECT
          StatDate::text AS StatDate,
          JapaneseVisitCount::int AS Japanese,
          (VisitCount - JapaneseVisitCount)::int AS Others
        FROM RESTAURANT_ANALYTICS_DAILY
        WHERE RestaurantID = $1
          AND StatDate >= DATE_TRUNC('month', CURRENT_DATE)::date
          AND StatDate <= CURRENT_DATE
        ORDER BY StatDate ASC
      `,
      [restaurantId],
    );

    return rows.map((row) => ({
      date: row.statdate,
      japanese: Number(row.japanese),
      others: Number(row.others),
    }));
  }

  private async getRevenueTrend(restaurantId: number) {
    const rows = await this.dataSource.query<RevenueTrendRow[]>(
      `
        SELECT
          r.ReservationDateTime::date::text AS Date,
          COALESCE(SUM(ri.Quantity * ri.UnitPrice), 0)::numeric(12, 2) AS Revenue,
          COUNT(DISTINCT r.ReservationID)::int AS OrderCount
        FROM RESERVATION r
        INNER JOIN RESERVATION_ITEM ri
          ON ri.ReservationID = r.ReservationID
          AND ri.RestaurantID = r.RestaurantID
        WHERE r.RestaurantID = $1
          AND r.Status = 'Completed'
          AND r.ReservationDateTime >= DATE_TRUNC('month', CURRENT_DATE)
          AND r.ReservationDateTime < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        GROUP BY r.ReservationDateTime::date
        ORDER BY r.ReservationDateTime::date ASC
      `,
      [restaurantId],
    );

    return rows.map((row) => ({
      date: row.date,
      revenue: Number(row.revenue),
      orderCount: Number(row.ordercount),
    }));
  }

  private async getUserAttributes(restaurantId: number) {
    const rows = await this.dataSource.query<UserAttributeRow[]>(
      `
        WITH customers AS (
          SELECT DISTINCT
            r.CustomerAccountID,
            CASE
              WHEN LOWER(COALESCE(cp.Nationality, '')) IN ('japan', 'japanese')
                OR cp.Nationality IN ('日本', '日本人')
              THEN 'Japanese'
              ELSE 'Others'
            END AS Label
          FROM RESERVATION r
          INNER JOIN CUSTOMER_PROFILE cp
            ON cp.AccountID = r.CustomerAccountID
          WHERE r.RestaurantID = $1
            AND r.Status IN ('Approved', 'Completed')
        )
        SELECT Label, COUNT(*)::int AS Count
        FROM customers
        GROUP BY Label
        ORDER BY Label ASC
      `,
      [restaurantId],
    );

    const total = rows.reduce((sum, row) => sum + Number(row.count), 0);

    return rows.map((row) => {
      const count = Number(row.count);

      return {
        label: row.label,
        count,
        percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
      };
    });
  }

  private async getReviewSentiment(restaurantId: number) {
    const rows = await this.dataSource.query<ReviewSentimentRow[]>(
      `
        WITH visible_reviews AS (
          SELECT
            COALESCE(
              Sentiment,
              CASE
                WHEN Rating >= 4 THEN 'Positive'
                WHEN Rating = 3 THEN 'Neutral'
                ELSE 'Negative'
              END
            ) AS EffectiveSentiment
          FROM REVIEW
          WHERE RestaurantID = $1
            AND Status = 'Visible'
        )
        SELECT
          COUNT(*) FILTER (WHERE EffectiveSentiment = 'Positive')::int AS Positive,
          COUNT(*) FILTER (WHERE EffectiveSentiment = 'Neutral')::int AS Neutral,
          COUNT(*) FILTER (WHERE EffectiveSentiment = 'Negative')::int AS Negative
        FROM visible_reviews
      `,
      [restaurantId],
    );

    const row = rows[0] ?? {
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    const counts = {
      positive: Number(row.positive),
      neutral: Number(row.neutral),
      negative: Number(row.negative),
    };
    const total = counts.positive + counts.neutral + counts.negative;

    return {
      positive: this.toPercentage(counts.positive, total),
      neutral: this.toPercentage(counts.neutral, total),
      negative: this.toPercentage(counts.negative, total),
    };
  }

  private async getBusyHoursToday(restaurantId: number) {
    const rows = await this.dataSource.query<BusyHourRow[]>(
      `
        SELECT
          EXTRACT(HOUR FROM ReservationDateTime)::int AS Hour,
          COUNT(*)::int AS ReservationCount
        FROM RESERVATION
        WHERE RestaurantID = $1
          AND ReservationDateTime >= CURRENT_DATE
          AND ReservationDateTime < CURRENT_DATE + INTERVAL '1 day'
          AND Status IN ('Pending', 'Approved', 'Completed')
        GROUP BY Hour
        ORDER BY Hour ASC
      `,
      [restaurantId],
    );

    const items = rows.map((row) => ({
      hour: Number(row.hour),
      reservationCount: Number(row.reservationcount),
    }));
    const peak = items.reduce<{ hour: number | null; reservationCount: number }>(
      (currentPeak, item) =>
        item.reservationCount > currentPeak.reservationCount
          ? item
          : currentPeak,
      {
        hour: null,
        reservationCount: 0,
      },
    );

    return {
      date: this.formatToday(),
      peakHour: peak.hour,
      items,
      insight:
        peak.hour === null
          ? '本日の予約データはまだありません。'
          : `${String(peak.hour).padStart(2, '0')}:00頃が混雑ピークです。スタッフ配置を増やすことをおすすめします。`,
    };
  }

  private async getVerificationStatus(restaurantId: number, ownerAccountId: number) {
    const rows = await this.dataSource.query<VerificationRow[]>(
      `
        SELECT
          ba.AppID,
          ba.RestaurantID,
          ba.BadgeID,
          bm.BadgeCode,
          bm.BadgeNameVN,
          bm.BadgeNameJP,
          ba.SubmittedByOwnerAccountID,
          ba.BusinessLicenseURL,
          ba.BusinessLicensePublicID,
          ba.FoodSafetyCertURL,
          ba.FoodSafetyCertPublicID,
          ba.Status,
          ba.SubmittedAt,
          ba.ReviewedByAdminID,
          ba.ReviewedAt,
          ba.ReviewNote
        FROM BADGE_APPLICATION ba
        LEFT JOIN BADGE_MASTER bm
          ON bm.BadgeID = ba.BadgeID
        WHERE ba.RestaurantID = $1
          AND ba.SubmittedByOwnerAccountID = $2
        ORDER BY ba.SubmittedAt DESC, ba.AppID DESC
        LIMIT 1
      `,
      [restaurantId, ownerAccountId],
    );

    const application = rows[0];

    if (!application) {
      return {
        status: 'NotSubmitted',
        application: null,
      };
    }

    return {
      status: application.status,
      application: {
        appId: Number(application.appid),
        restaurantId: Number(application.restaurantid),
        badgeId: Number(application.badgeid),
        badge: application.badgecode
          ? {
              badgeId: Number(application.badgeid),
              badgeCode: application.badgecode,
              badgeNameVn: application.badgenamevn,
              badgeNameJp: application.badgenamejp,
            }
          : null,
        submittedByOwnerAccountId: Number(application.submittedbyowneraccountid),
        businessLicenseUrl: application.businesslicenseurl,
        businessLicensePublicId: application.businesslicensepublicid,
        foodSafetyCertUrl: application.foodsafetycerturl,
        foodSafetyCertPublicId: application.foodsafetycertpublicid,
        status: application.status,
        submittedAt: application.submittedat,
        reviewedByAdminId:
          application.reviewedbyadminid === null
            ? null
            : Number(application.reviewedbyadminid),
        reviewedAt: application.reviewedat,
        reviewNote: application.reviewnote,
      },
    };
  }

  async recordRestaurantView(restaurantId: number, isJapaneseVisitor = false) {
    const restaurant = await this.restaurantRepo.findOne({
      where: {
        restaurantId,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found.');
    }

    const japaneseVisitIncrement = isJapaneseVisitor ? 1 : 0;
    const rows = await this.dataSource.query<RestaurantViewRow[]>(
      `
        INSERT INTO RESTAURANT_ANALYTICS_DAILY (
          RestaurantID,
          StatDate,
          VisitCount,
          JapaneseVisitCount
        )
        VALUES ($1, CURRENT_DATE, 1, $2)
        ON CONFLICT (RestaurantID, StatDate)
        DO UPDATE SET
          VisitCount = RESTAURANT_ANALYTICS_DAILY.VisitCount + 1,
          JapaneseVisitCount = RESTAURANT_ANALYTICS_DAILY.JapaneseVisitCount + EXCLUDED.JapaneseVisitCount
        RETURNING
          RestaurantID,
          StatDate::text AS StatDate,
          VisitCount,
          JapaneseVisitCount
      `,
      [restaurantId, japaneseVisitIncrement],
    );

    const row = rows[0];

    return {
      restaurantId: Number(row.restaurantid),
      statDate: row.statdate,
      visitCount: Number(row.visitcount),
      japaneseVisitCount: Number(row.japanesevisitcount),
    };
  }

  async recordMenuItemView(itemId: number) {
    const menuItem = await this.menuItemRepo.findOne({
      where: {
        itemId,
        isActive: true,
        deletedAt: IsNull(),
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Active menu item not found.');
    }

    const rows = await this.dataSource.query<MenuItemViewRow[]>(
      `
        INSERT INTO MENU_ITEM_ANALYTICS_DAILY (
          ItemID,
          StatDate,
          ViewCount
        )
        VALUES ($1, CURRENT_DATE, 1)
        ON CONFLICT (ItemID, StatDate)
        DO UPDATE SET
          ViewCount = MENU_ITEM_ANALYTICS_DAILY.ViewCount + 1
        RETURNING
          ItemID,
          StatDate::text AS StatDate,
          ViewCount
      `,
      [itemId],
    );

    const row = rows[0];

    return {
      itemId: Number(row.itemid),
      statDate: row.statdate,
      viewCount: Number(row.viewcount),
    };
  }

  private calculateChangeRate(value: number, previousValue: number) {
    if (previousValue === 0) {
      return value > 0 ? 100 : 0;
    }

    return Number((((value - previousValue) / previousValue) * 100).toFixed(2));
  }

  private calculateProgressRate(value: number, target: number) {
    if (target <= 0) {
      return 0;
    }

    return Number(Math.min((value / target) * 100, 100).toFixed(1));
  }

  private toPercentage(value: number, total: number) {
    if (total <= 0) {
      return 0;
    }

    return Number(((value / total) * 100).toFixed(1));
  }

  private formatCurrentMonth() {
    return new Date().toISOString().slice(0, 7);
  }

  private formatToday() {
    return new Date().toISOString().slice(0, 10);
  }

  private async assertOwnerRestaurant(restaurantId: number, user: JwtPayload) {
    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException(
        'Only restaurant owners can view analytics.',
      );
    }

    const restaurant = await this.restaurantRepo.findOne({
      where: {
        restaurantId,
        ownerAccountId: user.sub,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found for this owner.');
    }

    return restaurant;
  }
}
