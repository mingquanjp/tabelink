import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import type { JwtPayload } from '../auth/auth.types';

const HOT_RESTAURANT_LIMIT = 3;
const SUGGESTED_REVIEWER_LIMIT = 5;
const TRENDING_TOPIC_LIMIT = 4;

interface HomeProfileRow {
  accountId: number | string;
  fullName: string;
  displayName: string | null;
  avatarUrl: string | null;
  followingCount: number | string;
  followerCount: number | string;
}

interface HotRestaurantRow {
  restaurantId: number | string;
  nameVN: string;
  nameJP: string;
  heroImageUrl: string | null;
  averageRating: number | string | null;
  reviewCount: number | string;
  positiveReviewCount: number | string;
}

interface SuggestedReviewerRow {
  accountId: number | string;
  fullName: string;
  displayName: string | null;
  avatarUrl: string | null;
  nationality: string | null;
  followerCount: number | string;
  isFollowing: boolean;
}

interface TrendingTopicRow {
  tagId: number | string;
  name: string;
  usedCount: number | string;
}

interface AdvertisedRestaurantRow {
  promotionId: number | string;
  restaurantId: number | string;
  restaurantNameVN: string;
  restaurantNameJP: string;
  heroImageUrl: string | null;
  contentVN: string | null;
  contentJP: string | null;
  averageRating: number | string | null;
  reviewCount: number | string;
}

@Injectable()
export class UserHomeService {
  constructor(private readonly dataSource: DataSource) {}

  async getProfile(user: JwtPayload) {
    this.assertCustomerUser(user);

    const rows = await this.dataSource.query<HomeProfileRow[]>(
      `
        SELECT
          cp.AccountID AS "accountId",
          cp.FullName AS "fullName",
          cp.DisplayName AS "displayName",
          cp.AvatarURL AS "avatarUrl",
          (
            SELECT COUNT(*)
            FROM USER_FOLLOW uf
            WHERE uf.FollowerAccountID = cp.AccountID
          ) AS "followingCount",
          (
            SELECT COUNT(*)
            FROM USER_FOLLOW uf
            WHERE uf.FollowedAccountID = cp.AccountID
          ) AS "followerCount"
        FROM CUSTOMER_PROFILE cp
        WHERE cp.AccountID = $1
      `,
      [user.sub],
    );

    const row = rows[0];
    if (!row) {
      throw new NotFoundException('Customer profile was not found.');
    }

    return {
      accountId: Number(row.accountId),
      fullName: row.fullName,
      displayName: row.displayName,
      handle: this.toHandle(row.accountId),
      avatarUrl: row.avatarUrl,
      followingCount: Number(row.followingCount),
      followerCount: Number(row.followerCount),
    };
  }

  async getHotRestaurants() {
    const rows = await this.dataSource.query<HotRestaurantRow[]>(
      `
        SELECT
          r.RestaurantID AS "restaurantId",
          r.NameVN AS "nameVN",
          r.NameJP AS "nameJP",
          media.MediaURL AS "heroImageUrl",
          COALESCE(ROUND(AVG(rv.Rating)::numeric, 1), 0) AS "averageRating",
          COUNT(rv.ReviewID) AS "reviewCount",
          COUNT(*) FILTER (WHERE rv.Rating >= 4) AS "positiveReviewCount"
        FROM RESTAURANT r
        JOIN REVIEW rv
          ON rv.RestaurantID = r.RestaurantID
         AND rv.Status = 'Visible'
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
        WHERE r.Status = 'Active'
        GROUP BY r.RestaurantID, r.NameVN, r.NameJP, media.MediaURL
        ORDER BY "positiveReviewCount" DESC, "averageRating" DESC, r.RestaurantID ASC
        LIMIT $1
      `,
      [HOT_RESTAURANT_LIMIT],
    );

    return {
      items: rows.map((row) => ({
        restaurantId: Number(row.restaurantId),
        nameVN: row.nameVN,
        nameJP: row.nameJP,
        heroImageUrl: row.heroImageUrl,
        averageRating: Number(row.averageRating),
        reviewCount: Number(row.reviewCount),
        positiveReviewCount: Number(row.positiveReviewCount),
      })),
    };
  }

  async getSuggestedReviewers(user?: JwtPayload) {
    const viewerAccountId = user?.role === AuthRole.User ? user.sub : 0;

    const rows = await this.dataSource.query<SuggestedReviewerRow[]>(
      `
        SELECT
          cp.AccountID AS "accountId",
          cp.FullName AS "fullName",
          cp.DisplayName AS "displayName",
          cp.AvatarURL AS "avatarUrl",
          cp.Nationality AS "nationality",
          COUNT(followers.FollowerAccountID) AS "followerCount",
          EXISTS (
            SELECT 1
            FROM USER_FOLLOW my_follow
            WHERE my_follow.FollowerAccountID = $1
              AND my_follow.FollowedAccountID = cp.AccountID
          ) AS "isFollowing"
        FROM CUSTOMER_PROFILE cp
        LEFT JOIN USER_FOLLOW followers
          ON followers.FollowedAccountID = cp.AccountID
        WHERE cp.AccountID <> $1
        GROUP BY
          cp.AccountID,
          cp.FullName,
          cp.DisplayName,
          cp.AvatarURL,
          cp.Nationality
        ORDER BY "followerCount" DESC, cp.AccountID ASC
        LIMIT $2
      `,
      [viewerAccountId, SUGGESTED_REVIEWER_LIMIT],
    );

    return {
      items: rows.map((row) => ({
        accountId: Number(row.accountId),
        fullName: row.fullName,
        displayName: row.displayName,
        handle: this.toHandle(row.accountId),
        avatarUrl: row.avatarUrl,
        nationality: row.nationality,
        followerCount: Number(row.followerCount),
        isFollowing: row.isFollowing,
      })),
    };
  }

  async getTrendingTopics() {
    const rows = await this.dataSource.query<TrendingTopicRow[]>(
      `
        SELECT
          h.TagID AS "tagId",
          h.Name AS "name",
          COUNT(bt.BlogID) AS "usedCount"
        FROM HASHTAG h
        JOIN BLOG_TAG bt
          ON bt.TagID = h.TagID
        JOIN BLOG_POST bp
          ON bp.BlogID = bt.BlogID
        WHERE bp.Status = 'Published'
        GROUP BY h.TagID, h.Name
        ORDER BY "usedCount" DESC, h.Name ASC
        LIMIT $1
      `,
      [TRENDING_TOPIC_LIMIT],
    );

    return {
      items: rows.map((row) => ({
        tagId: Number(row.tagId),
        name: row.name,
        usedCount: Number(row.usedCount),
      })),
    };
  }

  async getAdvertisedRestaurants() {
    const rows = await this.dataSource.query<AdvertisedRestaurantRow[]>(
      `
        SELECT
          p.PromotionID AS "promotionId",
          r.RestaurantID AS "restaurantId",
          r.NameVN AS "restaurantNameVN",
          r.NameJP AS "restaurantNameJP",
          COALESCE(p.MediaURL, media.MediaURL) AS "heroImageUrl",
          p.ContentVN AS "contentVN",
          p.ContentJP AS "contentJP",
          COALESCE(ROUND(AVG(rv.Rating)::numeric, 1), 0) AS "averageRating",
          COUNT(rv.ReviewID) AS "reviewCount"
        FROM PROMOTION p
        JOIN RESTAURANT r
          ON r.RestaurantID = p.RestaurantID
        LEFT JOIN REVIEW rv
          ON rv.RestaurantID = r.RestaurantID
         AND rv.Status = 'Visible'
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
        WHERE p.PromotionType = 'Advertisement'
          AND p.AdvertisementType = 'SNS'
          AND p.Status = 'Active'
          AND p.ApprovedByAdminID IS NOT NULL
          AND p.StartDate <= CURRENT_TIMESTAMP
          AND p.EndDate >= CURRENT_TIMESTAMP
          AND r.Status = 'Active'
        GROUP BY
          p.PromotionID,
          r.RestaurantID,
          r.NameVN,
          r.NameJP,
          p.MediaURL,
          p.ContentVN,
          p.ContentJP,
          media.MediaURL
        ORDER BY p.StartDate DESC, p.PromotionID DESC
      `,
    );

    return {
      items: rows.map((row) => ({
        promotionId: Number(row.promotionId),
        restaurantId: Number(row.restaurantId),
        restaurantNameVN: row.restaurantNameVN,
        restaurantNameJP: row.restaurantNameJP,
        heroImageUrl: row.heroImageUrl,
        contentVN: row.contentVN,
        contentJP: row.contentJP,
        averageRating: Number(row.averageRating),
        reviewCount: Number(row.reviewCount),
      })),
    };
  }

  async followReviewer(accountId: number, user: JwtPayload) {
    this.assertCustomerUser(user);
    await this.ensureReviewerExists(accountId);

    if (accountId === user.sub) {
      throw new ForbiddenException('Users cannot follow themselves.');
    }

    await this.dataSource.query(
      `
        INSERT INTO USER_FOLLOW (FollowerAccountID, FollowedAccountID)
        VALUES ($1, $2)
        ON CONFLICT (FollowerAccountID, FollowedAccountID) DO NOTHING
      `,
      [user.sub, accountId],
    );

    return {
      accountId,
      isFollowing: true,
    };
  }

  async unfollowReviewer(accountId: number, user: JwtPayload) {
    this.assertCustomerUser(user);
    await this.ensureReviewerExists(accountId);

    await this.dataSource.query(
      `
        DELETE FROM USER_FOLLOW
        WHERE FollowerAccountID = $1
          AND FollowedAccountID = $2
      `,
      [user.sub, accountId],
    );

    return {
      accountId,
      isFollowing: false,
    };
  }

  private async ensureReviewerExists(accountId: number) {
    const rows = await this.dataSource.query<Array<{ exists: boolean }>>(
      `
        SELECT EXISTS (
          SELECT 1
          FROM CUSTOMER_PROFILE
          WHERE AccountID = $1
        ) AS "exists"
      `,
      [accountId],
    );

    if (!rows[0]?.exists) {
      throw new NotFoundException('Target reviewer was not found.');
    }
  }

  private assertCustomerUser(user: JwtPayload) {
    if (user.role !== AuthRole.User) {
      throw new ForbiddenException(
        'Only customer users can use this endpoint.',
      );
    }
  }

  private toHandle(accountId: number | string) {
    return `@user${Number(accountId)}`;
  }
}
