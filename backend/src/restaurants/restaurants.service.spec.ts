import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { FeatureMaster } from './entities/feature-master.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';

describe('RestaurantsService', () => {
  let service: RestaurantsService;
  let restaurantRepo: { findOne: jest.Mock; find: jest.Mock };
  let featureRepo: { find: jest.Mock };
  let paymentMethodRepo: { find: jest.Mock };
  let dataSource: { query: jest.Mock; transaction: jest.Mock };

  const owner = {
    sub: 5,
    email: 'owner@example.com',
    role: AuthRole.Owner,
  };

  const restaurant = {
    restaurantId: 1,
    ownerAccountId: 5,
    nameVn: 'Bun Cha Sakura',
    nameJp: 'Bun Cha Sakura JP',
    address: '24 Hang Manh, Hoan Kiem, Hanoi',
    latitude: '21.03378100',
    longitude: '105.84813800',
    descriptionVn: 'Vietnamese food',
    descriptionJp: 'Vietnamese food JP',
    phone: '+84 90 123 4567',
    openingHours: '10:00-22:00',
    issuesVat: true,
    status: 'Active',
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
    updatedAt: new Date('2026-05-02T00:00:00.000Z'),
    media: [
      {
        mediaId: 1,
        mediaUrl: 'https://example.com/photo.jpg',
        mediaType: 'Photo',
        sortOrder: 1,
        status: 'Approved',
      },
      {
        mediaId: 2,
        mediaUrl: 'https://example.com/cover.jpg',
        mediaType: 'Cover',
        sortOrder: 0,
        status: 'Approved',
      },
    ],
    featureLinks: [],
    paymentMethodLinks: [],
    socialLinks: [
      {
        socialLinkId: 1,
        restaurantId: 1,
        provider: 'Facebook',
        url: 'https://facebook.com/seed',
        displayLabel: 'Facebook',
        sortOrder: 0,
        isActive: true,
      },
    ],
  } as unknown as Restaurant;

  beforeEach(async () => {
    restaurantRepo = {
      findOne: jest.fn().mockResolvedValue(restaurant),
      find: jest.fn(),
    };
    featureRepo = {
      find: jest.fn(),
    };
    paymentMethodRepo = {
      find: jest.fn(),
    };
    dataSource = {
      query: jest.fn(),
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: restaurantRepo,
        },
        {
          provide: getRepositoryToken(FeatureMaster),
          useValue: featureRepo,
        },
        {
          provide: getRepositoryToken(PaymentMethod),
          useValue: paymentMethodRepo,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
  });

  it('returns restaurant, menu, campaign, and review data for owner home', async () => {
    dataSource.query
      .mockResolvedValueOnce([
        {
          totalCount: '3',
          activeCount: '2',
          recommendedForJpCount: '1',
        },
      ])
      .mockResolvedValueOnce([
        {
          categoryId: 100,
          restaurantId: 1,
          categoryCode: 'starter',
          categoryNameVn: 'Khai vi',
          categoryNameJp: 'スターター',
          sortOrder: 1,
          itemCount: '1',
        },
      ])
      .mockResolvedValueOnce([
        {
          itemId: 10,
          restaurantId: 1,
          categoryId: 100,
          categoryCode: 'starter',
          categoryNameVn: 'Khai vi',
          categoryNameJp: 'スターター',
          categorySortOrder: 1,
          nameVn: 'Pho bo',
          nameJp: 'Pho bo JP',
          price: '85000.00',
          descriptionVn: null,
          descriptionJp: null,
          imageUrl: 'https://example.com/pho.jpg',
          isRecommendedForJp: true,
          isActive: true,
          criteria: [
            {
              criterionId: 1,
              criterionName: '辛さ',
              ratingLevel: 2,
              sortOrder: 0,
            },
          ],
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-02T00:00:00.000Z',
        },
      ])
      .mockResolvedValueOnce([
        {
          promotionId: 20,
          restaurantId: 1,
          promotionType: 'Campaign',
          targetAudience: 'Japanese customers',
          titleVn: 'Giam 10%',
          titleJp: '10% off',
          contentVn: null,
          contentJp: null,
          mediaUrl: null,
          termsVn: null,
          termsJp: null,
          startDate: '2026-05-01T00:00:00.000Z',
          endDate: '2026-06-01T00:00:00.000Z',
          status: 'Active',
          impressions: '100',
          clicks: '5',
          totalCost: '250000.00',
        },
      ])
      .mockResolvedValueOnce([
        {
          visibleCount: '4',
          averageRating: '4.50',
          japaneseReviewCount: '2',
          positiveCount: '3',
          neutralCount: '1',
          negativeCount: '0',
        },
      ])
      .mockResolvedValueOnce([
        {
          reviewId: 30,
          restaurantId: 1,
          customerAccountId: 40,
          customerName: 'Taro',
          customerAvatarUrl: null,
          rating: '5',
          toiletCleanliness: '4',
          dishCleanliness: '5',
          spaceCleanliness: null,
          content: 'Good',
          isJapaneseTag: true,
          createdAt: '2026-05-03T00:00:00.000Z',
        },
      ])
      .mockResolvedValueOnce([
        {
          badgeId: 1,
          badgeCode: 'VERIFIED',
          badgeNameVn: 'Da xac thuc',
          badgeNameJp: '認証済み',
          descriptionVn: null,
          descriptionJp: null,
          grantedAt: '2026-05-01T00:00:00.000Z',
          expiresAt: null,
        },
      ]);

    await expect(service.getOwnerHome(owner)).resolves.toMatchObject({
      restaurantId: 1,
      restaurant: {
        restaurantId: 1,
        nameVn: 'Bun Cha Sakura',
        coverImageUrl: 'https://example.com/cover.jpg',
        socialLinks: [
          {
            provider: 'Facebook',
            url: 'https://facebook.com/seed',
          },
        ],
      },
      menu: {
        count: 3,
        activeCount: 2,
        recommendedForJpCount: 1,
        categories: [
          {
            categoryId: 100,
            categoryCode: 'starter',
          },
        ],
        items: [
          {
            itemId: 10,
            categoryId: 100,
            price: 85000,
            isRecommendedForJp: true,
            criteria: [
              {
                criterionId: 1,
                criterionName: '辛さ',
                ratingLevel: 2,
                sortOrder: 0,
              },
            ],
          },
        ],
      },
      promotions: {
        count: 1,
        items: [
          {
            promotionId: 20,
            promotionType: 'Campaign',
            ctr: 0.05,
          },
        ],
      },
      reviews: {
        summary: {
          visibleCount: 4,
          averageRating: 4.5,
          japaneseReviewCount: 2,
        },
        items: [
          {
            reviewId: 30,
            rating: 5,
            isJapaneseTag: true,
          },
        ],
      },
      badges: {
        count: 1,
        isVerified: true,
      },
      reviewSubmission: {
        enabled: true,
      },
    });

    expect(restaurantRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerAccountId: 5 },
      }),
    );
    expect(dataSource.query).toHaveBeenCalledTimes(7);
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM PROMOTION'),
      [1],
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM REVIEW r'),
      [1],
    );
  });

  it('rejects non-owner users for owner home', async () => {
    await expect(
      service.getOwnerHome({
        sub: 9,
        email: 'user@example.com',
        role: AuthRole.User,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(dataSource.query).not.toHaveBeenCalled();
  });

  it('rejects owners who do not own the restaurant for owner home', async () => {
    restaurantRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.getOwnerHome(owner)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(dataSource.query).not.toHaveBeenCalled();
  });

  it('returns active restaurant detail and active offers for customer screen', async () => {
    dataSource.query
      .mockResolvedValueOnce([
        {
          totalCount: '3',
          activeCount: '2',
          recommendedForJpCount: '1',
        },
      ])
      .mockResolvedValueOnce([
        {
          categoryId: 100,
          restaurantId: 1,
          categoryCode: 'starter',
          categoryNameVn: 'Khai vi',
          categoryNameJp: 'スターター',
          sortOrder: 1,
          itemCount: '1',
        },
      ])
      .mockResolvedValueOnce([
        {
          itemId: 10,
          restaurantId: 1,
          categoryId: 100,
          categoryCode: 'starter',
          categoryNameVn: 'Khai vi',
          categoryNameJp: 'スターター',
          categorySortOrder: 1,
          nameVn: 'Pho bo',
          nameJp: 'Pho bo JP',
          price: '85000.00',
          descriptionVn: null,
          descriptionJp: null,
          imageUrl: 'https://example.com/pho.jpg',
          isRecommendedForJp: true,
          isActive: true,
          criteria: [
            {
              criterionId: 1,
              criterionName: '辛さ',
              ratingLevel: 2,
              sortOrder: 0,
            },
          ],
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-02T00:00:00.000Z',
        },
      ])
      .mockResolvedValueOnce([
        {
          promotionId: 20,
          restaurantId: 1,
          promotionType: 'Campaign',
          targetAudience: 'Japanese customers',
          titleVn: 'Giam 10%',
          titleJp: '10% off',
          contentVn: 'Khuyen mai cho khach moi',
          contentJp: null,
          mediaUrl: 'https://example.com/promo.jpg',
          termsVn: 'Dung trong thang 5',
          termsJp: null,
          startDate: '2026-05-01T00:00:00.000Z',
          endDate: '2026-06-01T00:00:00.000Z',
          status: 'Active',
        },
      ])
      .mockResolvedValueOnce([
        {
          visibleCount: '4',
          averageRating: '4.50',
          japaneseReviewCount: '2',
          positiveCount: '3',
          neutralCount: '1',
          negativeCount: '0',
        },
      ])
      .mockResolvedValueOnce([
        {
          reviewId: 30,
          restaurantId: 1,
          customerAccountId: 40,
          customerName: 'Taro',
          customerAvatarUrl: null,
          rating: '5',
          toiletCleanliness: '4',
          dishCleanliness: '5',
          spaceCleanliness: null,
          content: 'Good',
          isJapaneseTag: true,
          createdAt: '2026-05-03T00:00:00.000Z',
        },
      ])
      .mockResolvedValueOnce([
        {
          badgeId: 1,
          badgeCode: 'VERIFIED',
          badgeNameVn: 'Da xac thuc',
          badgeNameJp: 'èªè¨¼æ¸ˆã¿',
          descriptionVn: null,
          descriptionJp: null,
          grantedAt: '2026-05-01T00:00:00.000Z',
          expiresAt: null,
        },
      ]);

    await expect(
      service.getPublicRestaurantDetail(1, {
        sub: 9,
        email: 'user@example.com',
        role: AuthRole.User,
      }),
    ).resolves.toMatchObject({
      restaurantId: 1,
      restaurant: {
        restaurantId: 1,
        nameVn: 'Bun Cha Sakura',
        coverImageUrl: 'https://example.com/cover.jpg',
      },
      menu: {
        count: 3,
        activeCount: 2,
        recommendedForJpCount: 1,
        categories: [
          {
            categoryId: 100,
            categoryCode: 'starter',
          },
        ],
        items: [
          {
            itemId: 10,
            categoryId: 100,
            price: 85000,
            isRecommendedForJp: true,
            criteria: [
              {
                criterionId: 1,
                criterionName: '辛さ',
                ratingLevel: 2,
                sortOrder: 0,
              },
            ],
          },
        ],
      },
      promotions: {
        count: 1,
        items: [
          {
            promotionId: 20,
            promotionType: 'Campaign',
            titleVn: 'Giam 10%',
            status: 'Active',
          },
        ],
      },
      reviews: {
        summary: {
          visibleCount: 4,
          averageRating: 4.5,
        },
      },
      badges: {
        count: 1,
        isVerified: true,
      },
      reviewSubmission: {
        enabled: true,
        endpoint: '/restaurants/1/reviews',
      },
    });

    expect(restaurantRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { restaurantId: 1, status: 'Active' },
      }),
    );
    expect(dataSource.query).toHaveBeenCalledTimes(7);
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining("Status = 'Active'"),
      [1],
    );
  });

  it('allows guest users to view restaurant detail but disables review submission', async () => {
    dataSource.query
      .mockResolvedValueOnce([
        {
          totalCount: '0',
          activeCount: '0',
          recommendedForJpCount: '0',
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          visibleCount: '0',
          averageRating: null,
          japaneseReviewCount: '0',
          positiveCount: '0',
          neutralCount: '0',
          negativeCount: '0',
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await expect(
      service.getPublicRestaurantDetail(1, {
        sub: 0,
        email: 'guest',
        role: AuthRole.Guest,
      }),
    ).resolves.toMatchObject({
      reviewSubmission: {
        enabled: false,
      },
    });
  });

  it('rejects owner users for customer restaurant detail', async () => {
    await expect(
      service.getPublicRestaurantDetail(1, owner),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(restaurantRepo.findOne).not.toHaveBeenCalled();
    expect(dataSource.query).not.toHaveBeenCalled();
  });

  it('rejects inactive or missing restaurants for customer restaurant detail', async () => {
    restaurantRepo.findOne.mockResolvedValueOnce(null);

    await expect(
      service.getPublicRestaurantDetail(1, {
        sub: 9,
        email: 'user@example.com',
        role: AuthRole.User,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(dataSource.query).not.toHaveBeenCalled();
  });
});
