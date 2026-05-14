import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { MenuItem } from '../menus/entities/menu-item.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let restaurantRepo: { findOne: jest.Mock };
  let menuItemRepo: { findOne: jest.Mock };
  let dataSource: { query: jest.Mock };

  const owner = {
    sub: 5,
    email: 'owner@example.com',
    role: AuthRole.Owner,
  };

  beforeEach(async () => {
    restaurantRepo = {
      findOne: jest.fn().mockResolvedValue({
        restaurantId: 1,
        ownerAccountId: 5,
      }),
    };
    menuItemRepo = {
      findOne: jest.fn().mockResolvedValue({
        itemId: 10,
        restaurantId: 1,
      }),
    };
    dataSource = {
      query: jest.fn().mockResolvedValue([
        {
          itemid: 10,
          restaurantid: 1,
          namevn: 'Pho bo',
          namejp: 'Pho bo JP',
          imageurl: 'https://example.com/pho.jpg',
          ordercount: '24',
          revenue: '3600000.00',
        },
        {
          itemid: 11,
          restaurantid: 1,
          namevn: 'Bun cha',
          namejp: 'Bun cha JP',
          imageurl: null,
          ordercount: '12',
          revenue: '1800000.00',
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: restaurantRepo,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useValue: menuItemRepo,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('returns Top 3 menu items ranked by completed reservation quantity', async () => {
    await expect(service.getTopMenu(1, owner)).resolves.toEqual({
      restaurantId: 1,
      count: 2,
      items: [
        {
          rank: 1,
          itemId: 10,
          restaurantId: 1,
          nameVn: 'Pho bo',
          nameJp: 'Pho bo JP',
          imageUrl: 'https://example.com/pho.jpg',
          orderCount: 24,
          revenue: 3600000,
        },
        {
          rank: 2,
          itemId: 11,
          restaurantId: 1,
          nameVn: 'Bun cha',
          nameJp: 'Bun cha JP',
          imageUrl: null,
          orderCount: 12,
          revenue: 1800000,
        },
      ],
    });

    expect(restaurantRepo.findOne).toHaveBeenCalledWith({
      where: {
        restaurantId: 1,
        ownerAccountId: 5,
      },
    });
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining("r.status = 'Completed'"),
      [1],
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY SUM(ri.quantity) DESC, mi.itemid ASC'),
      [1],
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('LIMIT 3'),
      [1],
    );
  });

  it('returns aggregated owner dashboard analytics', async () => {
    dataSource.query
      .mockResolvedValueOnce([
        {
          currentmonthviews: '120',
          previousmonthviews: '100',
        },
      ])
      .mockResolvedValueOnce([
        {
          averagerating: '4.56',
          reviewcount: '9',
          publishedreviewcount: '40',
          positive: '7',
          neutral: '2',
          negative: '1',
        },
      ])
      .mockResolvedValueOnce([
        {
          activecampaigncount: '2',
          weeklyordercount: '6',
        },
      ])
      .mockResolvedValueOnce([
        {
          statdate: '2026-05-01',
          japanese: '20',
          others: '5',
        },
      ])
      .mockResolvedValueOnce([
        {
          date: '2026-05-01',
          revenue: '1250000.00',
          ordercount: '12',
        },
      ])
      .mockResolvedValueOnce([
        {
          label: 'Japanese',
          count: '3',
        },
        {
          label: 'Others',
          count: '1',
        },
      ])
      .mockResolvedValueOnce([
        {
          itemid: 10,
          restaurantid: 1,
          namevn: 'Pho bo',
          namejp: 'Pho bo JP',
          imageurl: 'https://example.com/pho.jpg',
          ordercount: '24',
          revenue: '3600000.00',
        },
      ])
      .mockResolvedValueOnce([
        {
          hour: '18',
          reservationcount: '1',
        },
        {
          hour: '19',
          reservationcount: '2',
        },
        {
          hour: '20',
          reservationcount: '1',
        },
      ])
      .mockResolvedValueOnce([]);

    await expect(service.getDashboard(1, owner)).resolves.toMatchObject({
      restaurantId: 1,
      period: {
        month: expect.stringMatching(/^\d{4}-\d{2}$/),
      },
      summary: {
        monthlyViews: {
          value: 120,
          previousMonthValue: 100,
          changeRate: 20,
        },
        japaneseAverageRating: {
          value: 4.6,
          reviewCount: 9,
        },
        campaignWeeklyOrders: {
          value: 6,
          activeCampaignCount: 2,
          isTracked: true,
        },
        publishedReviews: {
          value: 40,
          target: 100,
          progressRate: 40,
        },
      },
      visitorTrend: [
        {
          date: '2026-05-01',
          japanese: 20,
          others: 5,
        },
      ],
      revenueTrend: [
        {
          date: '2026-05-01',
          revenue: 1250000,
          orderCount: 12,
        },
      ],
      userAttributes: [
        {
          label: 'Japanese',
          count: 3,
          percentage: 75,
        },
        {
          label: 'Others',
          count: 1,
          percentage: 25,
        },
      ],
      reviewSentiment: {
        positive: 70,
        neutral: 20,
        negative: 10,
      },
      topMenus: [
        {
          rank: 1,
          itemId: 10,
          restaurantId: 1,
          nameVn: 'Pho bo',
          nameJp: 'Pho bo JP',
          imageUrl: 'https://example.com/pho.jpg',
          orderCount: 24,
          revenue: 3600000,
        },
      ],
      busyHoursToday: {
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        peakHour: 19,
        items: [
          {
            hour: 18,
            reservationCount: 1,
          },
          {
            hour: 19,
            reservationCount: 2,
          },
          {
            hour: 20,
            reservationCount: 1,
          },
        ],
      },
      verification: {
        status: 'NotSubmitted',
        application: null,
      },
    });

    expect(restaurantRepo.findOne).toHaveBeenCalledWith({
      where: {
        restaurantId: 1,
        ownerAccountId: 5,
      },
    });
    expect(dataSource.query).toHaveBeenCalledTimes(9);
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('PROMOTION_REDEMPTION'),
      [1],
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('PublishedReviewCount'),
      [1],
    );
    const busyHoursQuery = dataSource.query.mock.calls.find(([sql]) =>
      String(sql).includes('GENERATE_SERIES'),
    )?.[0];
    expect(busyHoursQuery).toContain('COALESCE(r.DurationMinutes, 120)');
    expect(busyHoursQuery).toContain("'Confirmed'");
    expect(busyHoursQuery).not.toContain("'Approved'");
  });

  it('rejects non-owner users', async () => {
    await expect(
      service.getTopMenu(1, {
        sub: 9,
        email: 'user@example.com',
        role: AuthRole.User,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(dataSource.query).not.toHaveBeenCalled();
  });

  it('rejects owners who do not own the restaurant', async () => {
    restaurantRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.getTopMenu(1, owner)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(dataSource.query).not.toHaveBeenCalled();
  });

  it('records a restaurant view in daily restaurant analytics', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        restaurantid: 1,
        statdate: '2026-05-08',
        visitcount: '42',
        japanesevisitcount: '30',
      },
    ]);

    await expect(service.recordRestaurantView(1, true)).resolves.toEqual({
      restaurantId: 1,
      statDate: '2026-05-08',
      visitCount: 42,
      japaneseVisitCount: 30,
    });

    expect(restaurantRepo.findOne).toHaveBeenCalledWith({
      where: {
        restaurantId: 1,
      },
    });
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO RESTAURANT_ANALYTICS_DAILY'),
      [1, 1],
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT (RestaurantID, StatDate)'),
      [1, 1],
    );
  });

  it('rejects restaurant view tracking when the restaurant does not exist', async () => {
    restaurantRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.recordRestaurantView(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(dataSource.query).not.toHaveBeenCalled();
  });

  it('records a menu item view in daily menu item analytics', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        itemid: 10,
        statdate: '2026-05-08',
        viewcount: '18',
      },
    ]);

    await expect(service.recordMenuItemView(10)).resolves.toEqual({
      itemId: 10,
      statDate: '2026-05-08',
      viewCount: 18,
    });

    expect(menuItemRepo.findOne).toHaveBeenCalledWith({
      where: {
        itemId: 10,
        isActive: true,
        deletedAt: expect.any(Object),
      },
    });
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO MENU_ITEM_ANALYTICS_DAILY'),
      [10],
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT (ItemID, StatDate)'),
      [10],
    );
  });

  it('rejects menu item view tracking when the menu item is inactive or missing', async () => {
    menuItemRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.recordMenuItemView(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(dataSource.query).not.toHaveBeenCalled();
  });
});
