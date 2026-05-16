import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { AdsService } from './ads.service';
import { AdvertisementType, PromotionType } from './dto/create-promotion.dto';

describe('AdsService', () => {
  let service: AdsService;
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    dataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdsService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<AdsService>(AdsService);
  });

  const ownerUser = {
    sub: 7,
    email: 'owner@example.com',
    role: AuthRole.Owner,
  };

  const promotionRow = {
    promotionId: 12,
    restaurantId: 1,
    createdByOwnerAccountId: 7,
    promotionType: 'Campaign',
    targetAudience: 'all',
    titleVn: 'Autumn offer',
    titleJp: 'Autumn offer',
    contentVn: '10% off for TABELINK bookings.',
    contentJp: null,
    mediaUrl: null,
    termsVn: null,
    termsJp: null,
    discountType: 'total-10',
    discountValue: '10%OFF',
    advertisementType: null,
    targetRadiusKm: null,
    startDate: '2026-05-20T00:00:00.000Z',
    endDate: '2026-05-31T23:59:59.000Z',
    status: 'Pending',
    impressions: '100',
    clicks: '10',
    totalCost: '0',
  };

  it('lists owner promotions for screen ID10', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ restaurantId: 1 }])
      .mockResolvedValueOnce([
        promotionRow,
        {
          ...promotionRow,
          promotionId: 13,
          promotionType: 'Advertisement',
          discountType: null,
          discountValue: null,
          advertisementType: 'SNS',
          targetRadiusKm: '5',
          impressions: '50',
          clicks: '5',
          totalCost: '50000',
        },
      ]);

    await expect(service.listPromotions(1, ownerUser)).resolves.toEqual({
      restaurantId: 1,
      count: 2,
      summary: {
        activeCount: 0,
        pendingCount: 2,
        advertisementCount: 1,
        campaignCount: 1,
        totalImpressions: 150,
        totalClicks: 15,
      },
      items: [
        {
          promotionId: 12,
          restaurantId: 1,
          createdByOwnerAccountId: 7,
          promotionType: 'Campaign',
          campaignName: 'Autumn offer',
          campaignDescription: '10% off for TABELINK bookings.',
          targetAudience: 'all',
          discountType: 'total-10',
          discountValue: '10%OFF',
          note: null,
          startDate: '2026-05-20T00:00:00.000Z',
          endDate: '2026-05-31T23:59:59.000Z',
          status: 'Pending',
          impressions: 100,
          clicks: 10,
          totalCost: 0,
        },
        {
          promotionId: 13,
          restaurantId: 1,
          createdByOwnerAccountId: 7,
          promotionType: 'Advertisement',
          targetAudience: 'all',
          titleVn: 'Autumn offer',
          titleJp: 'Autumn offer',
          contentVn: '10% off for TABELINK bookings.',
          contentJp: null,
          mediaUrl: null,
          termsVn: null,
          termsJp: null,
          advertisementType: 'SNS',
          targetRadiusKm: 5,
          startDate: '2026-05-20T00:00:00.000Z',
          endDate: '2026-05-31T23:59:59.000Z',
          status: 'Pending',
          impressions: 50,
          clicks: 5,
          totalCost: 50000,
        },
      ],
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('FROM PROMOTION'),
      [1, 7],
    );
  });

  it('resolves the owner restaurant when listing screen ID10 promotions', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ restaurantId: 1 }])
      .mockResolvedValueOnce([{ restaurantId: 1 }])
      .mockResolvedValueOnce([promotionRow]);

    await expect(service.listOwnerPromotions(ownerUser)).resolves.toMatchObject(
      {
        restaurantId: 1,
        count: 1,
      },
    );

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('WHERE OwnerAccountID = $1'),
      [7],
    );
  });

  it('resolves the owner restaurant when creating from screen ID10 popups', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ restaurantId: 1 }])
      .mockResolvedValueOnce([{ restaurantId: 1 }])
      .mockResolvedValueOnce([promotionRow]);

    await expect(
      service.createOwnerPromotion(
        {
          promotionType: PromotionType.Campaign,
          titleVn: 'Autumn offer',
          contentVn: '10% off.',
          targetAudience: 'all',
          discountType: 'total-10',
          startDate: '2026-05-20T00:00:00.000Z',
          endDate: '2026-05-31T23:59:59.000Z',
        },
        ownerUser,
      ),
    ).resolves.toMatchObject({
      restaurantId: 1,
      promotionType: 'Campaign',
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('WHERE OwnerAccountID = $1'),
      [7],
    );
    expect(dataSource.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('INSERT INTO PROMOTION'),
      expect.arrayContaining([1, 7, 'Campaign']),
    );
  });

  it('resolves the owner restaurant when updating from the edit popup', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ restaurantId: 1 }])
      .mockResolvedValueOnce([{ restaurantId: 1 }])
      .mockResolvedValueOnce([promotionRow])
      .mockResolvedValueOnce([
        {
          ...promotionRow,
          titleVn: 'Updated offer',
          titleJp: 'Updated offer',
        },
      ]);

    await expect(
      service.updateOwnerPromotion(
        12,
        {
          titleVn: 'Updated offer',
        },
        ownerUser,
      ),
    ).resolves.toMatchObject({
      promotionId: 12,
      restaurantId: 1,
      campaignName: 'Updated offer',
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('WHERE OwnerAccountID = $1'),
      [7],
    );
  });

  it('loads one owned promotion for the edit popup', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ restaurantId: 1 }])
      .mockResolvedValueOnce([promotionRow]);

    await expect(service.getPromotion(1, 12, ownerUser)).resolves.toMatchObject(
      {
        promotionId: 12,
        restaurantId: 1,
        targetAudience: 'all',
        impressions: 100,
        clicks: 10,
      },
    );
  });

  it('updates an owned promotion and resets it to pending review', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ restaurantId: 1 }])
      .mockResolvedValueOnce([
        {
          ...promotionRow,
          status: 'Active',
        },
      ])
      .mockResolvedValueOnce([
        {
          ...promotionRow,
          titleVn: 'Updated autumn offer',
          titleJp: 'Updated autumn offer',
          targetAudience: 'new',
          endDate: '2026-06-05T23:59:59.000Z',
          status: 'Pending',
        },
      ]);

    await expect(
      service.updatePromotion(
        1,
        12,
        {
          titleVn: 'Updated autumn offer',
          targetAudience: 'new',
          endDate: '2026-06-05T23:59:59.000Z',
        },
        ownerUser,
      ),
    ).resolves.toMatchObject({
      promotionId: 12,
      campaignName: 'Updated autumn offer',
      targetAudience: 'new',
      status: 'Pending',
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("Status = 'Pending'"),
      expect.arrayContaining([12, 1, 7, 'new', 'Updated autumn offer']),
    );
    expect(dataSource.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('ApprovedByAdminID = NULL'),
      expect.any(Array),
    );
  });

  it('clears advertisement-only fields when updating a campaign', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ restaurantId: 1 }])
      .mockResolvedValueOnce([promotionRow])
      .mockResolvedValueOnce([
        {
          ...promotionRow,
          advertisementType: null,
          targetRadiusKm: null,
          totalCost: '0',
        },
      ]);

    await expect(
      service.updatePromotion(
        1,
        12,
        {
          advertisementType: AdvertisementType.Notification,
          targetRadiusKm: 10,
          totalCost: 50000,
        },
        ownerUser,
      ),
    ).resolves.toMatchObject({
      promotionId: 12,
      promotionType: 'Campaign',
      campaignName: 'Autumn offer',
      totalCost: 0,
    });

    const updateParams = dataSource.query.mock.calls[2][1];
    expect(updateParams[13]).toBeNull();
    expect(updateParams[14]).toBeNull();
    expect(updateParams[17]).toBe(0);
  });

  it('updates an advertisement from SNS to Notification', async () => {
    const advertisementRow = {
      ...promotionRow,
      promotionId: 13,
      promotionType: 'Advertisement',
      discountType: null,
      discountValue: null,
      advertisementType: 'SNS',
      targetRadiusKm: '5',
      totalCost: '50000',
    };

    dataSource.query
      .mockResolvedValueOnce([{ restaurantId: 1 }])
      .mockResolvedValueOnce([advertisementRow])
      .mockResolvedValueOnce([
        {
          ...advertisementRow,
          advertisementType: 'Notification',
          targetRadiusKm: '10',
          status: 'Pending',
        },
      ]);

    const result = await service.updatePromotion(
      1,
      13,
      {
        advertisementType: AdvertisementType.Notification,
        targetRadiusKm: 10,
      },
      ownerUser,
    );

    expect(result).toMatchObject({
      promotionId: 13,
      promotionType: 'Advertisement',
      advertisementType: 'Notification',
      targetRadiusKm: 10,
      status: 'Pending',
    });
    expect(result).not.toHaveProperty('discountType');
    expect(result).not.toHaveProperty('discountValue');

    const updateParams = dataSource.query.mock.calls[2][1];
    expect(updateParams[11]).toBeNull();
    expect(updateParams[12]).toBeNull();
    expect(updateParams[13]).toBe(AdvertisementType.Notification);
    expect(updateParams[14]).toBe(10);
  });

  it('creates a pending campaign for an owned restaurant', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ restaurantId: 1 }])
      .mockResolvedValueOnce([
        {
          promotionId: 12,
          restaurantId: 1,
          createdByOwnerAccountId: 7,
          promotionType: 'Campaign',
          targetAudience: 'all',
          titleVn: 'Autumn offer',
          titleJp: 'Autumn offer',
          contentVn: '10% off for TABELINK bookings.',
          contentJp: null,
          mediaUrl: null,
          termsVn: null,
          termsJp: null,
          discountType: 'total-10',
          discountValue: '10%OFF',
          advertisementType: null,
          targetRadiusKm: null,
          startDate: '2026-05-20T00:00:00.000Z',
          endDate: '2026-05-31T23:59:59.000Z',
          status: 'Pending',
          impressions: '0',
          clicks: '0',
          totalCost: '0',
        },
      ]);

    await expect(
      service.createPromotion(
        1,
        {
          promotionType: PromotionType.Campaign,
          titleVn: 'Autumn offer',
          contentVn: '10% off for TABELINK bookings.',
          targetAudience: 'all',
          discountType: 'total-10',
          startDate: '2026-05-20T00:00:00.000Z',
          endDate: '2026-05-31T23:59:59.000Z',
        },
        {
          sub: 7,
          email: 'owner@example.com',
          role: AuthRole.Owner,
        },
      ),
    ).resolves.toEqual({
      promotionId: 12,
      restaurantId: 1,
      createdByOwnerAccountId: 7,
      promotionType: 'Campaign',
      campaignName: 'Autumn offer',
      campaignDescription: '10% off for TABELINK bookings.',
      targetAudience: 'all',
      discountType: 'total-10',
      discountValue: '10%OFF',
      note: null,
      startDate: '2026-05-20T00:00:00.000Z',
      endDate: '2026-05-31T23:59:59.000Z',
      status: 'Pending',
      impressions: 0,
      clicks: 0,
      totalCost: 0,
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('FROM RESTAURANT'),
      [1, 7],
    );
    expect(dataSource.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO PROMOTION'),
      expect.arrayContaining([1, 7, 'Campaign', 'all']),
    );
    expect(dataSource.query.mock.calls[1][1][17]).toBe(0);
  });

  it('creates a pending advertisement with a budget', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ restaurantId: 1 }])
      .mockResolvedValueOnce([
        {
          promotionId: 13,
          restaurantId: 1,
          createdByOwnerAccountId: 7,
          promotionType: 'Advertisement',
          targetAudience: 'Japanese customers within 5km',
          titleVn: 'Weekend banner',
          titleJp: '週末限定バナー広告',
          contentVn: null,
          contentJp: '近隣ユーザーに告知します。',
          mediaUrl: null,
          termsVn: null,
          termsJp: null,
          discountType: null,
          discountValue: null,
          advertisementType: 'SNS',
          targetRadiusKm: '5',
          startDate: '2026-05-20T00:00:00.000Z',
          endDate: '2026-05-27T23:59:59.000Z',
          status: 'Pending',
          impressions: '0',
          clicks: '0',
          totalCost: '50000',
        },
      ]);

    const result = await service.createPromotion(
      1,
      {
        promotionType: PromotionType.Advertisement,
        titleVn: 'Weekend banner',
        titleJp: '週末限定バナー広告',
        contentJp: '近隣ユーザーに告知します。',
        targetAudience: 'Japanese customers within 5km',
        advertisementType: AdvertisementType.SNS,
        targetRadiusKm: 5,
        startDate: '2026-05-20T00:00:00.000Z',
        endDate: '2026-05-27T23:59:59.000Z',
        totalCost: 50000,
      },
      {
        sub: 7,
        email: 'owner@example.com',
        role: AuthRole.Owner,
      },
    );

    expect(result.status).toBe('Pending');
    expect(result.promotionType).toBe('Advertisement');
    expect(result.totalCost).toBe(50000);
    expect(dataSource.query.mock.calls[1][1][11]).toBeNull();
    expect(dataSource.query.mock.calls[1][1][12]).toBeNull();
  });

  it('rejects invalid promotion date ranges', async () => {
    dataSource.query.mockResolvedValueOnce([{ restaurantId: 1 }]);

    await expect(
      service.createPromotion(
        1,
        {
          promotionType: PromotionType.Campaign,
          titleVn: 'Autumn offer',
          contentVn: '10% off.',
          targetAudience: 'all',
          discountType: 'total-10',
          startDate: '2026-05-31T00:00:00.000Z',
          endDate: '2026-05-20T00:00:00.000Z',
        },
        {
          sub: 7,
          email: 'owner@example.com',
          role: AuthRole.Owner,
        },
      ),
    ).rejects.toThrow('endDate must be after startDate.');
  });

  it('throws when the owner does not own the restaurant', async () => {
    dataSource.query.mockResolvedValueOnce([]);

    await expect(
      service.createPromotion(
        99,
        {
          promotionType: PromotionType.Campaign,
          titleVn: 'Autumn offer',
          contentVn: '10% off.',
          targetAudience: 'all',
          discountType: 'total-10',
          startDate: '2026-05-20T00:00:00.000Z',
          endDate: '2026-05-31T23:59:59.000Z',
        },
        {
          sub: 7,
          email: 'owner@example.com',
          role: AuthRole.Owner,
        },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('increments impressions for an active advertisement', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        promotionId: 12,
        impressions: '101',
        clicks: '8',
      },
    ]);

    await expect(service.recordImpression(12)).resolves.toEqual({
      adId: 12,
      impressions: 101,
      clicks: 8,
      ctr: 0.0792,
    });

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('Impressions = Impressions + 1'),
      [12],
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining("PromotionType = 'Advertisement'"),
      [12],
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining("Status = 'Active'"),
      [12],
    );
  });

  it('increments clicks while preserving clicks <= impressions', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        promotionId: 12,
        impressions: '101',
        clicks: '9',
      },
    ]);

    await expect(service.recordClick(12)).resolves.toEqual({
      adId: 12,
      impressions: 101,
      clicks: 9,
      ctr: 0.0891,
    });

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('Clicks = Clicks + 1'),
      [12],
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining(
        'Impressions = GREATEST(Impressions, Clicks + 1)',
      ),
      [12],
    );
  });

  it('throws when the ad is not active or does not exist', async () => {
    dataSource.query.mockResolvedValueOnce([]);

    await expect(service.recordImpression(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('unwraps TypeORM update returning tuple responses', async () => {
    dataSource.query.mockResolvedValueOnce([
      [
        {
          promotionId: 12,
          impressions: '101',
          clicks: '8',
        },
      ],
      1,
    ]);

    await expect(service.recordImpression(12)).resolves.toEqual({
      adId: 12,
      impressions: 101,
      clicks: 8,
      ctr: 0.0792,
    });
  });
});
