import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { JwtPayload } from '../auth/auth.types';
import { CreateBlogDto } from './dto/create-blog.dto';
import { CreateBlogTagDto } from './dto/create-blog-tag.dto';
import { ListBlogTagsQueryDto } from './dto/list-blog-tags-query.dto';
import { SearchRestaurantOptionsQueryDto } from './dto/search-restaurant-options-query.dto';

const BLOG_TAG_LIMIT = 10;
const BLOG_TAG_SEARCH_LIMIT = 30;

interface RestaurantSearchOptionRow {
  restaurantId: number | string;
  nameVn: string;
  nameJp: string;
  address: string;
  latitude: number | string | null;
  longitude: number | string | null;
  coverImageUrl: string | null;
}

interface BlogTagRow {
  tagId: number | string;
  name: string;
}

interface CreatedTagRow extends BlogTagRow {
  created: boolean;
}

interface CreatedBlogRow {
  blogId: number | string;
  customerAccountId: number | string;
  restaurantId: number | string | null;
  title: string | null;
  content: string;
  tasteRating: number | string | null;
  hygieneRating: number | string | null;
  serviceRating: number | string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CreatedBlogMediaRow {
  mediaId: number | string;
  mediaUrl: string;
  mediaType: string;
  sortOrder: number | string;
}

@Injectable()
export class BlogsService {
  constructor(private readonly dataSource: DataSource) {}

  async searchRestaurantOptions(query: SearchRestaurantOptionsQueryDto) {
    const keyword = this.optionalTrim(query.keyword);

    if (!keyword) {
      return {
        keyword: '',
        items: [],
      };
    }

    const pattern = `%${keyword}%`;
    const prefixPattern = `${keyword}%`;
    const rows = await this.dataSource.query<RestaurantSearchOptionRow[]>(
      `
        SELECT
          r.RestaurantID AS "restaurantId",
          r.NameVN AS "nameVn",
          r.NameJP AS "nameJp",
          r.Address AS "address",
          r.Latitude AS "latitude",
          r.Longitude AS "longitude",
          media.MediaURL AS "coverImageUrl"
        FROM RESTAURANT r
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
          AND (
            r.NameVN ILIKE $1
            OR r.NameJP ILIKE $1
          )
        ORDER BY
          CASE
            WHEN r.NameJP ILIKE $2 OR r.NameVN ILIKE $2 THEN 0
            ELSE 1
          END,
          r.NameJP ASC,
          r.NameVN ASC,
          r.RestaurantID ASC
      `,
      [pattern, prefixPattern],
    );

    return {
      keyword,
      items: rows.map((row) => ({
        restaurantId: Number(row.restaurantId),
        nameVn: row.nameVn,
        nameJp: row.nameJp,
        address: row.address,
        latitude: row.latitude === null ? null : Number(row.latitude),
        longitude: row.longitude === null ? null : Number(row.longitude),
        coverImageUrl: row.coverImageUrl,
      })),
    };
  }

  async listTags(query: ListBlogTagsQueryDto) {
    const keyword = this.optionalTrim(query.keyword);
    const rows = await this.dataSource.query<BlogTagRow[]>(
      `
        SELECT
          TagID AS "tagId",
          Name AS "name"
        FROM HASHTAG
        WHERE $1::text IS NULL
          OR Name ILIKE $2
        ORDER BY
          CASE
            WHEN $1::text IS NOT NULL AND Name ILIKE $3 THEN 0
            ELSE 1
          END,
          Name ASC,
          TagID ASC
        LIMIT $4
      `,
      [
        keyword ?? null,
        keyword ? `%${keyword}%` : null,
        keyword ? `${keyword}%` : null,
        BLOG_TAG_SEARCH_LIMIT,
      ],
    );

    return {
      keyword: keyword ?? '',
      items: rows.map((row) => ({
        tagId: Number(row.tagId),
        name: row.name,
      })),
    };
  }

  async createTag(dto: CreateBlogTagDto, user: JwtPayload) {
    if (user.role !== AuthRole.User) {
      throw new ForbiddenException('Only customer users can create blog tags.');
    }

    const name = this.normalizeTagName(dto.name);
    const rows = await this.dataSource.query<CreatedTagRow[]>(
      `
        WITH inserted AS (
          INSERT INTO HASHTAG (Name)
          VALUES ($1)
          ON CONFLICT (Name) DO NOTHING
          RETURNING TagID, Name, TRUE AS created
        )
        SELECT
          TagID AS "tagId",
          Name AS "name",
          created
        FROM inserted
        UNION ALL
        SELECT
          TagID AS "tagId",
          Name AS "name",
          FALSE AS created
        FROM HASHTAG
        WHERE Name = $1
          AND NOT EXISTS (SELECT 1 FROM inserted)
        LIMIT 1
      `,
      [name],
    );
    const row = rows[0];

    if (!row) {
      throw new BadRequestException('Unable to create blog tag.');
    }

    return {
      tagId: Number(row.tagId),
      name: row.name,
      created: row.created,
    };
  }

  async createBlog(restaurantId: number, dto: CreateBlogDto, user: JwtPayload) {
    if (user.role !== AuthRole.User) {
      throw new ForbiddenException(
        'Only customer users can create blog posts.',
      );
    }

    const title = this.optionalTrim(dto.title) ?? null;
    const content = this.requiredTrim(dto.content, 'content');
    const tagIds = dto.tagIds ?? [];
    const media = (dto.media ?? []).map((item, index) => ({
      mediaUrl: item.mediaUrl.trim(),
      mediaType: item.mediaType,
      sortOrder: item.sortOrder ?? index,
    }));

    if (tagIds.length > BLOG_TAG_LIMIT) {
      throw new BadRequestException(
        `A blog post can have at most ${BLOG_TAG_LIMIT} tags.`,
      );
    }

    const { blog, mediaRows, tagRows } = await this.dataSource.transaction(
      async (manager) => {
        const blogRows = await manager.query<CreatedBlogRow[]>(
          `
            INSERT INTO BLOG_POST (
              CustomerAccountID,
              RestaurantID,
              Title,
              Content,
              TasteRating,
              HygieneRating,
              ServiceRating,
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
              'Published'
            FROM RESTAURANT r
            INNER JOIN CUSTOMER_PROFILE cp
              ON cp.AccountID = $1
            WHERE r.RestaurantID = $2
              AND r.Status = 'Active'
            RETURNING
              BlogID AS "blogId",
              CustomerAccountID AS "customerAccountId",
              RestaurantID AS "restaurantId",
              Title AS "title",
              Content AS "content",
              TasteRating AS "tasteRating",
              HygieneRating AS "hygieneRating",
              ServiceRating AS "serviceRating",
              Status AS "status",
              CreatedAt AS "createdAt",
              UpdatedAt AS "updatedAt"
          `,
          [
            user.sub,
            restaurantId,
            title,
            content,
            dto.tasteRating,
            dto.hygieneRating,
            dto.serviceRating,
          ],
        );
        const createdBlog = blogRows[0];

        if (!createdBlog) {
          throw new NotFoundException(
            'Active restaurant or customer profile was not found.',
          );
        }

        const blogId = Number(createdBlog.blogId);
        const createdMedia = media.length
          ? await manager.query<CreatedBlogMediaRow[]>(
              `
                INSERT INTO BLOG_MEDIA (
                  BlogID,
                  MediaURL,
                  MediaType,
                  SortOrder
                )
                SELECT
                  $1,
                  item->>'mediaUrl',
                  item->>'mediaType',
                  COALESCE((item->>'sortOrder')::int, ordinality - 1)
                FROM jsonb_array_elements($2::jsonb)
                  WITH ORDINALITY AS media_items(item, ordinality)
                RETURNING
                  MediaID AS "mediaId",
                  MediaURL AS "mediaUrl",
                  MediaType AS "mediaType",
                  SortOrder AS "sortOrder"
              `,
              [blogId, JSON.stringify(media)],
            )
          : [];
        const selectedTags = tagIds.length
          ? await this.attachTags(manager, blogId, tagIds)
          : [];

        return {
          blog: createdBlog,
          mediaRows: createdMedia,
          tagRows: selectedTags,
        };
      },
    );

    return {
      blogId: Number(blog.blogId),
      customerAccountId: Number(blog.customerAccountId),
      restaurantId:
        blog.restaurantId === null ? null : Number(blog.restaurantId),
      title: blog.title,
      content: blog.content,
      tasteRating: Number(blog.tasteRating),
      hygieneRating: Number(blog.hygieneRating),
      serviceRating: Number(blog.serviceRating),
      status: blog.status,
      media: mediaRows.map((item) => ({
        mediaId: Number(item.mediaId),
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType,
        sortOrder: Number(item.sortOrder),
      })),
      tags: tagRows.map((tag) => ({
        tagId: Number(tag.tagId),
        name: tag.name,
      })),
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  }

  async deleteBlog(blogId: number, user: JwtPayload) {
    if (user.role !== AuthRole.User) {
      throw new ForbiddenException(
        'Only customer users can delete blog posts.',
      );
    }

    const result = await this.dataSource.query<{ blogId: number | string }[]>(
      `
        UPDATE BLOG_POST
        SET Status = 'Deleted',
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE BlogID = $1
          AND CustomerAccountID = $2
          AND Status = 'Published'
        RETURNING BlogID AS "blogId"
      `,
      [blogId, user.sub],
    );

    if (!result[0]) {
      throw new NotFoundException('Published blog post not found.');
    }
  }

  private async attachTags(
    manager: {
      query: <T = unknown>(query: string, parameters?: unknown[]) => Promise<T>;
    },
    blogId: number,
    tagIds: number[],
  ) {
    const tagRows = await manager.query<BlogTagRow[]>(
      `
        SELECT
          TagID AS "tagId",
          Name AS "name"
        FROM HASHTAG
        WHERE TagID = ANY($1::int[])
        ORDER BY Name ASC, TagID ASC
      `,
      [tagIds],
    );

    if (tagRows.length !== tagIds.length) {
      throw new BadRequestException('Blog tag selection contains unknown IDs.');
    }

    await manager.query(
      `
        INSERT INTO BLOG_TAG (BlogID, TagID)
        SELECT $1, UNNEST($2::int[])
        ON CONFLICT (BlogID, TagID) DO NOTHING
      `,
      [blogId, tagRows.map((tag) => Number(tag.tagId))],
    );

    return tagRows;
  }

  private normalizeTagName(value: string) {
    const name = value.trim().replace(/^#+/, '').trim().toLowerCase();

    if (!name) {
      throw new BadRequestException('Blog tag name must not be empty.');
    }

    return name;
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
