import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { FeedService } from './feed.service';

describe('FeedService', () => {
  let service: FeedService;
  let dataSource: { query: jest.Mock };

  const user = {
    sub: 12,
    email: 'user@example.com',
    role: AuthRole.User,
  };

  const postRow = {
    blogId: '100',
    title: 'Best pho in Hanoi',
    content: 'This restaurant is clean and friendly.',
    tasteRating: '5',
    hygieneRating: '4',
    serviceRating: '5',
    createdAt: '2026-05-15T10:00:00.000Z',
    authorAccountId: '5',
    authorFullName: 'Chef Sato',
    authorDisplayName: null,
    authorAvatarUrl: 'https://example.com/avatar.jpg',
    likeCount: '20',
    commentCount: '5',
    isLiked: true,
  };

  beforeEach(async () => {
    dataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get(FeedService);
  });

  it('returns paginated feed posts with hashtags and media', async () => {
    dataSource.query
      .mockResolvedValueOnce([postRow])
      .mockResolvedValueOnce([{ total: '1' }])
      .mockResolvedValueOnce([
        { blogId: '100', tagId: '1', name: 'HanoiDining' },
      ])
      .mockResolvedValueOnce([
        {
          blogId: '100',
          mediaId: '9',
          mediaUrl: 'https://example.com/photo.jpg',
          mediaType: 'Photo',
          sortOrder: '0',
        },
      ]);

    await expect(
      service.getFeed({ page: 1, limit: 10 }, user),
    ).resolves.toEqual({
      items: [
        {
          blogId: 100,
          author: {
            accountId: 5,
            name: 'Chef Sato',
            handle: '@user5',
            avatarUrl: 'https://example.com/avatar.jpg',
          },
          createdAt: '2026-05-15T10:00:00.000Z',
          hashtags: [{ tagId: 1, name: 'HanoiDining' }],
          title: 'Best pho in Hanoi',
          content: 'This restaurant is clean and friendly.',
          media: [
            {
              mediaId: 9,
              mediaUrl: 'https://example.com/photo.jpg',
              mediaType: 'Photo',
              sortOrder: 0,
            },
          ],
          ratings: { taste: 5, hygiene: 4, service: 5 },
          likeCount: 20,
          commentCount: 5,
          isLiked: true,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        hasNext: false,
      },
    });
  });

  it('returns post detail with initial comments', async () => {
    dataSource.query
      .mockResolvedValueOnce([postRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          commentId: '1',
          content: 'Looks great!',
          createdAt: '2026-05-15T10:10:00.000Z',
          authorAccountId: '9',
          authorFullName: 'Tanaka',
          authorDisplayName: null,
          authorAvatarUrl: null,
        },
      ]);

    await expect(service.getPostDetail(100, user)).resolves.toMatchObject({
      blogId: 100,
      comments: [
        {
          commentId: 1,
          author: {
            accountId: 9,
            name: 'Tanaka',
            handle: '@user9',
            avatarUrl: null,
          },
          content: 'Looks great!',
          createdAt: '2026-05-15T10:10:00.000Z',
        },
      ],
    });

    expect(dataSource.query.mock.calls[0][0]).toContain('AND bp.BlogID = $2');
  });

  it('likes a published post idempotently', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([]);

    await expect(service.likePost(100, user)).resolves.toEqual({
      blogId: 100,
      isLiked: true,
    });
    expect(dataSource.query).toHaveBeenLastCalledWith(
      expect.stringContaining('INSERT INTO BLOG_LIKE'),
      [100, 12],
    );
  });

  it('throws when post is not published', async () => {
    dataSource.query.mockResolvedValueOnce([{ exists: false }]);

    await expect(service.likePost(100, user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects non-customer users', async () => {
    await expect(
      service.getFeed(
        { page: 1, limit: 10 },
        { sub: 1, email: 'owner@example.com', role: AuthRole.Owner },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
