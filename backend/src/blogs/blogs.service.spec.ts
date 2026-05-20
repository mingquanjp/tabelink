import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { BlogsService } from './blogs.service';

describe('BlogsService', () => {
  let service: BlogsService;
  let dataSource: { query: jest.Mock; transaction: jest.Mock };

  const user = {
    sub: 40,
    email: 'user@example.com',
    role: AuthRole.User,
  };

  const owner = {
    sub: 5,
    email: 'owner@example.com',
    role: AuthRole.Owner,
  };

  beforeEach(async () => {
    dataSource = {
      query: jest.fn(),
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
  });

  it('returns empty restaurant suggestions without keyword', async () => {
    await expect(service.searchRestaurantOptions({})).resolves.toEqual({
      keyword: '',
      items: [],
    });

    expect(dataSource.query).not.toHaveBeenCalled();
  });

  it('searches active restaurants for ID7 linking', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        restaurantId: '1',
        nameVn: 'Pizza 4P Hanoi',
        nameJp: 'ピザフォーピース ハノイ店',
        address: '24 Ly Quoc Su, Hoan Kiem, Hanoi',
        latitude: '21.03194400',
        longitude: '105.84944400',
        coverImageUrl: 'https://example.com/restaurants/1/cover.jpg',
      },
    ]);

    await expect(
      service.searchRestaurantOptions({ keyword: ' Pizza 4P ' }),
    ).resolves.toEqual({
      keyword: 'Pizza 4P',
      items: [
        {
          restaurantId: 1,
          nameVn: 'Pizza 4P Hanoi',
          nameJp: 'ピザフォーピース ハノイ店',
          address: '24 Ly Quoc Su, Hoan Kiem, Hanoi',
          latitude: 21.031944,
          longitude: 105.849444,
          coverImageUrl: 'https://example.com/restaurants/1/cover.jpg',
        },
      ],
    });

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.not.stringContaining('r.Address ILIKE'),
      ['%Pizza 4P%', 'Pizza 4P%'],
    );
  });

  it('lists existing blog tags', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        tagId: '1',
        name: 'hanoidining',
      },
    ]);

    await expect(service.listTags({ keyword: 'hanoi' })).resolves.toEqual({
      keyword: 'hanoi',
      items: [
        {
          tagId: 1,
          name: 'hanoidining',
        },
      ],
    });
  });

  it('creates a new tag after normalizing the name', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        tagId: '1',
        name: 'hanoidining',
        created: true,
      },
    ]);

    await expect(
      service.createTag({ name: ' #HanoiDining ' }, user),
    ).resolves.toEqual({
      tagId: 1,
      name: 'hanoidining',
      created: true,
    });

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO HASHTAG'),
      ['hanoidining'],
    );
  });

  it('rejects blank tag names', async () => {
    await expect(
      service.createTag({ name: ' ### ' }, user),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects non-user tag creation', async () => {
    await expect(
      service.createTag({ name: 'hanoidining' }, owner),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(dataSource.query).not.toHaveBeenCalled();
  });

  it('creates a blog post with media and selected tags', async () => {
    const manager = {
      query: jest
        .fn()
        .mockResolvedValueOnce([
          {
            blogId: '100',
            customerAccountId: '40',
            restaurantId: '1',
            title: 'Một bữa tối ở Hà Nội',
            content: 'Nội dung blog',
            tasteRating: '5',
            hygieneRating: '4',
            serviceRating: '5',
            status: 'Published',
            createdAt: '2026-05-15T00:00:00.000Z',
            updatedAt: '2026-05-15T00:00:00.000Z',
          },
        ])
        .mockResolvedValueOnce([
          {
            mediaId: '1',
            mediaUrl: 'https://example.com/blogs/100/photo.jpg',
            mediaType: 'Photo',
            sortOrder: '0',
          },
        ])
        .mockResolvedValueOnce([
          {
            tagId: '1',
            name: 'hanoidining',
          },
          {
            tagId: '2',
            name: 'clean',
          },
        ])
        .mockResolvedValueOnce([]),
    };
    dataSource.transaction.mockImplementation((callback) => callback(manager));

    await expect(
      service.createBlog(
        1,
        {
          title: ' Một bữa tối ở Hà Nội ',
          content: ' Nội dung blog ',
          tasteRating: 5,
          hygieneRating: 4,
          serviceRating: 5,
          media: [
            {
              mediaUrl: 'https://example.com/blogs/100/photo.jpg',
              mediaType: 'Photo',
            },
          ],
          tagIds: [1, 2],
        },
        user,
      ),
    ).resolves.toMatchObject({
      blogId: 100,
      customerAccountId: 40,
      restaurantId: 1,
      title: 'Một bữa tối ở Hà Nội',
      content: 'Nội dung blog',
      tasteRating: 5,
      hygieneRating: 4,
      serviceRating: 5,
      status: 'Published',
      media: [
        {
          mediaId: 1,
          mediaUrl: 'https://example.com/blogs/100/photo.jpg',
          mediaType: 'Photo',
          sortOrder: 0,
        },
      ],
      tags: [
        {
          tagId: 1,
          name: 'hanoidining',
        },
        {
          tagId: 2,
          name: 'clean',
        },
      ],
    });

    expect(manager.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO BLOG_POST'),
      [40, 1, 'Một bữa tối ở Hà Nội', 'Nội dung blog', 5, 4, 5],
    );
    expect(manager.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO BLOG_MEDIA'),
      [
        100,
        JSON.stringify([
          {
            mediaUrl: 'https://example.com/blogs/100/photo.jpg',
            mediaType: 'Photo',
            sortOrder: 0,
          },
        ]),
      ],
    );
    expect(manager.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('FROM HASHTAG'),
      [[1, 2]],
    );
    expect(manager.query).toHaveBeenNthCalledWith(
      4,
      expect.stringContaining('INSERT INTO BLOG_TAG'),
      [100, [1, 2]],
    );
  });

  it('rejects non-user blog creation', async () => {
    await expect(
      service.createBlog(
        1,
        {
          content: 'Nội dung blog',
          tasteRating: 5,
          hygieneRating: 4,
          serviceRating: 5,
        },
        owner,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('rejects blank blog content', async () => {
    await expect(
      service.createBlog(
        1,
        {
          content: ' ',
          tasteRating: 5,
          hygieneRating: 4,
          serviceRating: 5,
        },
        user,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects unknown tag IDs', async () => {
    const manager = {
      query: jest
        .fn()
        .mockResolvedValueOnce([
          {
            blogId: '100',
            customerAccountId: '40',
            restaurantId: '1',
            title: null,
            content: 'Nội dung blog',
            tasteRating: '5',
            hygieneRating: '4',
            serviceRating: '5',
            status: 'Published',
            createdAt: '2026-05-15T00:00:00.000Z',
            updatedAt: '2026-05-15T00:00:00.000Z',
          },
        ])
        .mockResolvedValueOnce([
          {
            tagId: '1',
            name: 'hanoidining',
          },
        ]),
    };
    dataSource.transaction.mockImplementation((callback) => callback(manager));

    await expect(
      service.createBlog(
        1,
        {
          content: 'Nội dung blog',
          tasteRating: 5,
          hygieneRating: 4,
          serviceRating: 5,
          tagIds: [1, 2],
        },
        user,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws not found when restaurant or customer is missing', async () => {
    const manager = {
      query: jest.fn().mockResolvedValueOnce([]),
    };
    dataSource.transaction.mockImplementation((callback) => callback(manager));

    await expect(
      service.createBlog(
        1,
        {
          content: 'Nội dung blog',
          tasteRating: 5,
          hygieneRating: 4,
          serviceRating: 5,
        },
        user,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
