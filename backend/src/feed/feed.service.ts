import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import type { JwtPayload } from '../auth/auth.types';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FeedQueryDto } from './dto/feed-query.dto';

const POST_DETAIL_COMMENT_LIMIT = 20;

interface FeedPostRow {
  blogId: number | string;
  restaurantId: number | string | null;
  title: string | null;
  content: string;
  tasteRating: number | string | null;
  hygieneRating: number | string | null;
  serviceRating: number | string | null;
  createdAt: Date | string;
  authorAccountId: number | string;
  authorFullName: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
  likeCount: number | string;
  commentCount: number | string;
  isLiked: boolean;
}

interface FeedHashtagRow {
  blogId: number | string;
  tagId: number | string;
  name: string;
}

interface FeedMediaRow {
  blogId: number | string;
  mediaId: number | string;
  mediaUrl: string;
  mediaType: 'Photo' | 'Video';
  sortOrder: number | string;
}

interface CountRow {
  total: number | string;
}

interface CommentRow {
  commentId: number | string;
  content: string;
  createdAt: Date | string;
  authorAccountId: number | string;
  authorFullName: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
}

interface CreatedCommentRow {
  commentId: number | string;
  blogId: number | string;
  content: string;
  createdAt: Date | string;
}

@Injectable()
export class FeedService {
  constructor(private readonly dataSource: DataSource) {}

  async getFeed(query: FeedQueryDto, user: JwtPayload) {
    this.assertCustomerOrGuest(user);

    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;

    const [rows, totalRows] = await Promise.all([
      this.dataSource.query<FeedPostRow[]>(
        this.feedPostSql(
          '',
          'ORDER BY bp.CreatedAt DESC, bp.BlogID DESC LIMIT $2 OFFSET $3',
        ),
        [user.sub, limit, offset],
      ),
      this.dataSource.query<CountRow[]>(
        `
          SELECT COUNT(*) AS "total"
          FROM BLOG_POST bp
          WHERE bp.Status = 'Published'
        `,
      ),
    ]);

    const blogIds = rows.map((row) => Number(row.blogId));
    const [hashtags, media] = await Promise.all([
      this.getHashtagsByBlogIds(blogIds),
      this.getMediaByBlogIds(blogIds),
    ]);
    const total = Number(totalRows[0]?.total ?? 0);

    return {
      items: rows.map((row) => this.toFeedPost(row, hashtags, media)),
      pagination: {
        page,
        limit,
        total,
        hasNext: offset + rows.length < total,
      },
    };
  }

  async getPostDetail(blogId: number, user: JwtPayload) {
    this.assertCustomerOrGuest(user);

    const rows = await this.dataSource.query<FeedPostRow[]>(
      this.feedPostSql('AND bp.BlogID = $2', ''),
      [user.sub, blogId],
    );
    const row = rows[0];
    if (!row) {
      throw new NotFoundException('Published blog post was not found.');
    }

    const [hashtags, media, comments] = await Promise.all([
      this.getHashtagsByBlogIds([blogId]),
      this.getMediaByBlogIds([blogId]),
      this.getCommentRows(blogId, POST_DETAIL_COMMENT_LIMIT, 0),
    ]);

    return {
      ...this.toFeedPost(row, hashtags, media),
      comments: comments.map((comment) => this.toComment(comment)),
    };
  }

  async likePost(blogId: number, user: JwtPayload) {
    this.assertCustomerUser(user);
    await this.ensurePublishedBlog(blogId);

    await this.dataSource.query(
      `
        INSERT INTO BLOG_LIKE (BlogID, CustomerAccountID)
        VALUES ($1, $2)
        ON CONFLICT (BlogID, CustomerAccountID) DO NOTHING
      `,
      [blogId, user.sub],
    );

    return {
      blogId,
      isLiked: true,
    };
  }

  async unlikePost(blogId: number, user: JwtPayload) {
    this.assertCustomerUser(user);
    await this.ensurePublishedBlog(blogId);

    await this.dataSource.query(
      `
        DELETE FROM BLOG_LIKE
        WHERE BlogID = $1
          AND CustomerAccountID = $2
      `,
      [blogId, user.sub],
    );

    return {
      blogId,
      isLiked: false,
    };
  }

  async getComments(blogId: number, query: CommentQueryDto, user: JwtPayload) {
    this.assertCustomerOrGuest(user);
    await this.ensurePublishedBlog(blogId);

    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;

    const [rows, totalRows] = await Promise.all([
      this.getCommentRows(blogId, limit, offset),
      this.dataSource.query<CountRow[]>(
        `
          SELECT COUNT(*) AS "total"
          FROM BLOG_COMMENT bc
          WHERE bc.BlogID = $1
            AND bc.Status = 'Visible'
        `,
        [blogId],
      ),
    ]);
    const total = Number(totalRows[0]?.total ?? 0);

    return {
      items: rows.map((row) => this.toComment(row)),
      pagination: {
        page,
        limit,
        total,
        hasNext: offset + rows.length < total,
      },
    };
  }

  async createComment(blogId: number, dto: CreateCommentDto, user: JwtPayload) {
    this.assertCustomerUser(user);
    await this.ensurePublishedBlog(blogId);

    const content = dto.content.trim();
    if (!content) {
      throw new BadRequestException('Comment content cannot be blank.');
    }

    const rows = await this.dataSource.query<CreatedCommentRow[]>(
      `
        INSERT INTO BLOG_COMMENT (
          BlogID,
          CustomerAccountID,
          Content
        )
        VALUES ($1, $2, $3)
        RETURNING
          CommentID AS "commentId",
          BlogID AS "blogId",
          Content AS "content",
          CreatedAt AS "createdAt"
      `,
      [blogId, user.sub, content],
    );
    const row = rows[0];

    return {
      commentId: Number(row.commentId),
      blogId: Number(row.blogId),
      content: row.content,
      createdAt: this.toIso(row.createdAt),
    };
  }

  private feedPostSql(extraWhereSql: string, tailSql: string) {
    return `
      SELECT
        bp.BlogID AS "blogId",
        bp.RestaurantID AS "restaurantId",
        bp.Title AS "title",
        bp.Content AS "content",
        bp.TasteRating AS "tasteRating",
        bp.HygieneRating AS "hygieneRating",
        bp.ServiceRating AS "serviceRating",
        bp.CreatedAt AS "createdAt",
        cp.AccountID AS "authorAccountId",
        cp.FullName AS "authorFullName",
        cp.DisplayName AS "authorDisplayName",
        cp.AvatarURL AS "authorAvatarUrl",
        COUNT(DISTINCT bl.CustomerAccountID) AS "likeCount",
        COUNT(DISTINCT bc.CommentID) FILTER (WHERE bc.Status = 'Visible') AS "commentCount",
        EXISTS (
          SELECT 1
          FROM BLOG_LIKE my_like
          WHERE my_like.BlogID = bp.BlogID
            AND my_like.CustomerAccountID = $1
        ) AS "isLiked"
      FROM BLOG_POST bp
      JOIN CUSTOMER_PROFILE cp
        ON cp.AccountID = bp.CustomerAccountID
      LEFT JOIN BLOG_LIKE bl
        ON bl.BlogID = bp.BlogID
      LEFT JOIN BLOG_COMMENT bc
        ON bc.BlogID = bp.BlogID
      WHERE bp.Status = 'Published'
        ${extraWhereSql}
      GROUP BY
        bp.BlogID,
        bp.RestaurantID,
        bp.Title,
        bp.Content,
        bp.TasteRating,
        bp.HygieneRating,
        bp.ServiceRating,
        bp.CreatedAt,
        cp.AccountID,
        cp.FullName,
        cp.DisplayName,
        cp.AvatarURL
      ${tailSql}
    `;
  }

  private async getHashtagsByBlogIds(blogIds: number[]) {
    const map = new Map<number, Array<{ tagId: number; name: string }>>();
    if (blogIds.length === 0) {
      return map;
    }

    const rows = await this.dataSource.query<FeedHashtagRow[]>(
      `
        SELECT
          bt.BlogID AS "blogId",
          h.TagID AS "tagId",
          h.Name AS "name"
        FROM BLOG_TAG bt
        JOIN HASHTAG h
          ON h.TagID = bt.TagID
        WHERE bt.BlogID = ANY($1::int[])
        ORDER BY h.Name ASC
      `,
      [blogIds],
    );

    rows.forEach((row) => {
      const id = Number(row.blogId);
      const current = map.get(id) ?? [];
      current.push({
        tagId: Number(row.tagId),
        name: row.name,
      });
      map.set(id, current);
    });

    return map;
  }

  private async getMediaByBlogIds(blogIds: number[]) {
    const map = new Map<
      number,
      Array<{
        mediaId: number;
        mediaUrl: string;
        mediaType: 'Photo' | 'Video';
        sortOrder: number;
      }>
    >();
    if (blogIds.length === 0) {
      return map;
    }

    const rows = await this.dataSource.query<FeedMediaRow[]>(
      `
        SELECT
          bm.BlogID AS "blogId",
          bm.MediaID AS "mediaId",
          bm.MediaURL AS "mediaUrl",
          bm.MediaType AS "mediaType",
          bm.SortOrder AS "sortOrder"
        FROM BLOG_MEDIA bm
        WHERE bm.BlogID = ANY($1::int[])
        ORDER BY bm.BlogID ASC, bm.SortOrder ASC, bm.MediaID ASC
      `,
      [blogIds],
    );

    rows.forEach((row) => {
      const id = Number(row.blogId);
      const current = map.get(id) ?? [];
      current.push({
        mediaId: Number(row.mediaId),
        mediaUrl: row.mediaUrl,
        mediaType: row.mediaType,
        sortOrder: Number(row.sortOrder),
      });
      map.set(id, current);
    });

    return map;
  }

  private getCommentRows(blogId: number, limit: number, offset: number) {
    return this.dataSource.query<CommentRow[]>(
      `
        SELECT
          bc.CommentID AS "commentId",
          bc.Content AS "content",
          bc.CreatedAt AS "createdAt",
          cp.AccountID AS "authorAccountId",
          cp.FullName AS "authorFullName",
          cp.DisplayName AS "authorDisplayName",
          cp.AvatarURL AS "authorAvatarUrl"
        FROM BLOG_COMMENT bc
        JOIN CUSTOMER_PROFILE cp
          ON cp.AccountID = bc.CustomerAccountID
        WHERE bc.BlogID = $1
          AND bc.Status = 'Visible'
        ORDER BY bc.CreatedAt ASC, bc.CommentID ASC
        LIMIT $2 OFFSET $3
      `,
      [blogId, limit, offset],
    );
  }

  private async ensurePublishedBlog(blogId: number) {
    const rows = await this.dataSource.query<Array<{ exists: boolean }>>(
      `
        SELECT EXISTS (
          SELECT 1
          FROM BLOG_POST
          WHERE BlogID = $1
            AND Status = 'Published'
        ) AS "exists"
      `,
      [blogId],
    );

    if (!rows[0]?.exists) {
      throw new NotFoundException('Published blog post was not found.');
    }
  }

  private toFeedPost(
    row: FeedPostRow,
    hashtags: Map<number, Array<{ tagId: number; name: string }>>,
    media: Map<
      number,
      Array<{
        mediaId: number;
        mediaUrl: string;
        mediaType: 'Photo' | 'Video';
        sortOrder: number;
      }>
    >,
  ) {
    const blogId = Number(row.blogId);

    return {
      blogId,
      restaurantId:
        row.restaurantId === null ? null : Number(row.restaurantId),
      author: {
        accountId: Number(row.authorAccountId),
        name: row.authorDisplayName ?? row.authorFullName,
        handle: this.toHandle(row.authorAccountId),
        avatarUrl: row.authorAvatarUrl,
      },
      createdAt: this.toIso(row.createdAt),
      hashtags: hashtags.get(blogId) ?? [],
      title: row.title,
      content: row.content,
      media: media.get(blogId) ?? [],
      ratings: {
        taste: this.optionalNumber(row.tasteRating),
        hygiene: this.optionalNumber(row.hygieneRating),
        service: this.optionalNumber(row.serviceRating),
      },
      likeCount: Number(row.likeCount),
      commentCount: Number(row.commentCount),
      isLiked: row.isLiked,
    };
  }

  private toComment(row: CommentRow) {
    return {
      commentId: Number(row.commentId),
      author: {
        accountId: Number(row.authorAccountId),
        name: row.authorDisplayName ?? row.authorFullName,
        handle: this.toHandle(row.authorAccountId),
        avatarUrl: row.authorAvatarUrl,
      },
      content: row.content,
      createdAt: this.toIso(row.createdAt),
    };
  }

  private assertCustomerUser(user: JwtPayload) {
    if (user.role !== AuthRole.User) {
      throw new ForbiddenException(
        'Only customer users can use this endpoint.',
      );
    }
  }

  private assertCustomerOrGuest(user: JwtPayload) {
    if (![AuthRole.User, AuthRole.Guest].includes(user.role)) {
      throw new ForbiddenException(
        'Only customer or guest users can use this endpoint.',
      );
    }
  }

  private optionalNumber(value: number | string | null) {
    return value === null ? null : Number(value);
  }

  private toHandle(accountId: number | string) {
    return `@user${Number(accountId)}`;
  }

  private toIso(value: Date | string) {
    return value instanceof Date
      ? value.toISOString()
      : new Date(value).toISOString();
  }
}
