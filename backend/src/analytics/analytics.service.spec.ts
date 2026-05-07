import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { Restaurant } from '../entities/restaurant.entity';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let restaurantRepo: { findOne: jest.Mock };
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
    dataSource = {
      query: jest.fn().mockResolvedValue([
        {
          itemid: 10,
          restaurantid: 1,
          namevn: 'Pho bo',
          namejp: '牛肉フォー',
          imageurl: 'https://example.com/pho.jpg',
          ordercount: '24',
        },
        {
          itemid: 11,
          restaurantid: 1,
          namevn: 'Bun cha',
          namejp: 'ブンチャー',
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
          nameJp: '牛肉フォー',
          imageUrl: 'https://example.com/pho.jpg',
          orderCount: 24,
        },
        {
          rank: 2,
          itemId: 11,
          restaurantId: 1,
          nameVn: 'Bun cha',
          nameJp: 'ブンチャー',
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
    expect(dataSource.query).toHaveBeenCalledWith(expect.stringContaining("r.status = 'Completed'"), [1]);
    expect(dataSource.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY SUM(ri.quantity) DESC, mi.itemid ASC'), [1]);
    expect(dataSource.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT 3'), [1]);
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

    await expect(service.getTopMenu(1, owner)).rejects.toBeInstanceOf(NotFoundException);
    expect(dataSource.query).not.toHaveBeenCalled();
  });
});
