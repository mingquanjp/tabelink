import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { MenuItem } from '../entities/menu-item.entity';
import { Restaurant } from '../entities/restaurant.entity';
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
        },
        {
          itemid: 11,
          restaurantid: 1,
          namevn: 'Bun cha',
          namejp: 'Bun cha JP',
          imageurl: null,
          ordercount: '12',
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
        },
        {
          rank: 2,
          itemId: 11,
          restaurantId: 1,
          nameVn: 'Bun cha',
          nameJp: 'Bun cha JP',
          imageUrl: null,
          orderCount: 12,
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
