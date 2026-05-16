import { Test, TestingModule } from '@nestjs/testing';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import {
  AdvertisementType,
  CampaignTargetAudience,
  PromotionType,
} from './dto/create-promotion.dto';

describe('AdsController', () => {
  let controller: AdsController;
  let service: {
    listOwnerPromotions: jest.Mock;
    listPromotions: jest.Mock;
    createOwnerPromotion: jest.Mock;
    createPromotion: jest.Mock;
    getOwnerPromotion: jest.Mock;
    getPromotion: jest.Mock;
    updateOwnerPromotion: jest.Mock;
    updatePromotion: jest.Mock;
    recordImpression: jest.Mock;
    recordClick: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      listOwnerPromotions: jest.fn().mockResolvedValue({
        restaurantId: 1,
        count: 1,
        items: [],
      }),
      listPromotions: jest.fn().mockResolvedValue({
        restaurantId: 1,
        count: 1,
        items: [],
      }),
      createOwnerPromotion: jest.fn().mockResolvedValue({
        promotionId: 12,
        restaurantId: 1,
        promotionType: 'Campaign',
        status: 'Pending',
      }),
      createPromotion: jest.fn().mockResolvedValue({
        promotionId: 12,
        restaurantId: 1,
        promotionType: 'Campaign',
        status: 'Pending',
      }),
      getOwnerPromotion: jest.fn().mockResolvedValue({
        promotionId: 12,
        restaurantId: 1,
      }),
      getPromotion: jest.fn().mockResolvedValue({
        promotionId: 12,
        restaurantId: 1,
      }),
      updateOwnerPromotion: jest.fn().mockResolvedValue({
        promotionId: 12,
        restaurantId: 1,
        status: 'Pending',
      }),
      updatePromotion: jest.fn().mockResolvedValue({
        promotionId: 12,
        restaurantId: 1,
        status: 'Pending',
      }),
      recordImpression: jest.fn().mockResolvedValue({
        adId: 12,
        impressions: 101,
        clicks: 8,
        ctr: 0.0792,
      }),
      recordClick: jest.fn().mockResolvedValue({
        adId: 12,
        impressions: 101,
        clicks: 9,
        ctr: 0.0891,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdsController],
      providers: [
        {
          provide: AdsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<AdsController>(AdsController);
  });

  it('delegates owner-context promotion list to the service', async () => {
    const user = {
      sub: 7,
      email: 'owner@example.com',
      role: 'Owner' as const,
    };

    await expect(
      controller.listOwnerPromotions({ user } as never),
    ).resolves.toEqual({
      restaurantId: 1,
      count: 1,
      items: [],
    });
    expect(service.listOwnerPromotions).toHaveBeenCalledWith(user);
  });

  it('delegates owner promotion list to the service', async () => {
    const user = {
      sub: 7,
      email: 'owner@example.com',
      role: 'Owner' as const,
    };

    await expect(
      controller.listPromotions(1, { user } as never),
    ).resolves.toEqual({
      restaurantId: 1,
      count: 1,
      items: [],
    });
    expect(service.listPromotions).toHaveBeenCalledWith(1, user);
  });

  it('delegates owner promotion creation to the service', async () => {
    const dto = {
      promotionType: PromotionType.Campaign,
      titleVn: 'Autumn offer',
      contentVn: '10% off.',
      targetAudience: CampaignTargetAudience.All,
      discountType: 'total-10',
      startDate: '2026-05-20T00:00:00.000Z',
      endDate: '2026-05-31T23:59:59.000Z',
    };
    const user = {
      sub: 7,
      email: 'owner@example.com',
      role: 'Owner' as const,
    };

    await expect(
      controller.createPromotion(1, dto, { user } as never),
    ).resolves.toEqual({
      promotionId: 12,
      restaurantId: 1,
      promotionType: 'Campaign',
      status: 'Pending',
    });
    expect(service.createPromotion).toHaveBeenCalledWith(1, dto, user);
  });

  it('delegates owner-context promotion creation to the service', async () => {
    const dto = {
      promotionType: PromotionType.Campaign,
      titleVn: 'Autumn offer',
      contentVn: '10% off.',
      targetAudience: CampaignTargetAudience.All,
      discountType: 'total-10',
      startDate: '2026-05-20T00:00:00.000Z',
      endDate: '2026-05-31T23:59:59.000Z',
    };
    const user = {
      sub: 7,
      email: 'owner@example.com',
      role: 'Owner' as const,
    };

    await controller.createOwnerPromotion(dto, { user } as never);

    expect(service.createOwnerPromotion).toHaveBeenCalledWith(dto, user);
  });

  it('creates campaigns through the campaign popup endpoint', async () => {
    const dto = {
      campaignName: 'Autumn offer',
      campaignDescription: '10% off.',
      targetAudience: CampaignTargetAudience.All,
      discountType: '10' as const,
      note: 'Cannot be combined with other coupons.',
      startDate: '2026-05-20T00:00:00.000Z',
      endDate: '2026-05-31T23:59:59.000Z',
    };
    const user = {
      sub: 7,
      email: 'owner@example.com',
      role: 'Owner' as const,
    };

    await controller.createCampaign(1, dto, { user } as never);

    expect(service.createPromotion).toHaveBeenCalledWith(
      1,
      {
        promotionType: PromotionType.Campaign,
        titleVn: 'Autumn offer',
        titleJp: 'Autumn offer',
        contentVn: '10% off.',
        contentJp: '10% off.',
        targetAudience: 'all',
        discountType: '10',
        discountValue: '10%OFF',
        termsVn: 'Cannot be combined with other coupons.',
        termsJp: 'Cannot be combined with other coupons.',
        startDate: '2026-05-20T00:00:00.000Z',
        endDate: '2026-05-31T23:59:59.000Z',
      },
      user,
    );
  });

  it('creates campaigns through the owner-context campaign popup endpoint', async () => {
    const dto = {
      campaignName: 'Autumn offer',
      campaignDescription: '10% off.',
      targetAudience: CampaignTargetAudience.All,
      discountType: '10' as const,
      note: 'Cannot be combined with other coupons.',
      startDate: '2026-05-20T00:00:00.000Z',
      endDate: '2026-05-31T23:59:59.000Z',
    };
    const user = {
      sub: 7,
      email: 'owner@example.com',
      role: 'Owner' as const,
    };

    await controller.createOwnerCampaign(dto, { user } as never);

    expect(service.createOwnerPromotion).toHaveBeenCalledWith(
      {
        promotionType: PromotionType.Campaign,
        titleVn: 'Autumn offer',
        titleJp: 'Autumn offer',
        contentVn: '10% off.',
        contentJp: '10% off.',
        targetAudience: 'all',
        discountType: '10',
        discountValue: '10%OFF',
        termsVn: 'Cannot be combined with other coupons.',
        termsJp: 'Cannot be combined with other coupons.',
        startDate: '2026-05-20T00:00:00.000Z',
        endDate: '2026-05-31T23:59:59.000Z',
      },
      user,
    );
  });

  it('creates ad requests through the ad popup endpoint', async () => {
    const dto = {
      titleVn: 'Weekend banner',
      contentVn: 'Banner message.',
      targetAudience: 'Japanese customers within 5km',
      advertisementType: AdvertisementType.Banner,
      targetRadiusKm: 5,
      discountType: 'total-10',
      startDate: '2026-05-20T00:00:00.000Z',
      endDate: '2026-05-31T23:59:59.000Z',
      totalCost: 50000,
    };
    const user = {
      sub: 7,
      email: 'owner@example.com',
      role: 'Owner' as const,
    };

    await controller.createAdRequest(1, dto, { user } as never);

    expect(service.createPromotion).toHaveBeenCalledWith(
      1,
      {
        ...dto,
        promotionType: PromotionType.Advertisement,
      },
      user,
    );
  });

  it('creates ad requests through the owner-context ad popup endpoint', async () => {
    const dto = {
      titleVn: 'Weekend banner',
      contentVn: 'Banner message.',
      targetAudience: 'Japanese customers within 5km',
      advertisementType: AdvertisementType.Banner,
      targetRadiusKm: 5,
      discountType: 'total-10',
      startDate: '2026-05-20T00:00:00.000Z',
      endDate: '2026-05-31T23:59:59.000Z',
      totalCost: 50000,
    };
    const user = {
      sub: 7,
      email: 'owner@example.com',
      role: 'Owner' as const,
    };

    await controller.createOwnerAdRequest(dto, { user } as never);

    expect(service.createOwnerPromotion).toHaveBeenCalledWith(
      {
        ...dto,
        promotionType: PromotionType.Advertisement,
      },
      user,
    );
  });

  it('delegates owner-context edit popup detail loading to the service', async () => {
    const user = {
      sub: 7,
      email: 'owner@example.com',
      role: 'Owner' as const,
    };

    await expect(
      controller.getOwnerPromotion(12, { user } as never),
    ).resolves.toEqual({
      promotionId: 12,
      restaurantId: 1,
    });
    expect(service.getOwnerPromotion).toHaveBeenCalledWith(12, user);
  });

  it('delegates edit popup detail loading to the service', async () => {
    const user = {
      sub: 7,
      email: 'owner@example.com',
      role: 'Owner' as const,
    };

    await expect(
      controller.getPromotion(1, 12, { user } as never),
    ).resolves.toEqual({
      promotionId: 12,
      restaurantId: 1,
    });
    expect(service.getPromotion).toHaveBeenCalledWith(1, 12, user);
  });

  it('delegates edit popup updates to the service', async () => {
    const dto = {
      titleVn: 'Updated offer',
    };
    const user = {
      sub: 7,
      email: 'owner@example.com',
      role: 'Owner' as const,
    };

    await expect(
      controller.updatePromotion(1, 12, dto, { user } as never),
    ).resolves.toEqual({
      promotionId: 12,
      restaurantId: 1,
      status: 'Pending',
    });
    expect(service.updatePromotion).toHaveBeenCalledWith(1, 12, dto, user);
  });

  it('delegates owner-context edit popup updates to the service', async () => {
    const dto = {
      titleVn: 'Updated offer',
    };
    const user = {
      sub: 7,
      email: 'owner@example.com',
      role: 'Owner' as const,
    };

    await expect(
      controller.updateOwnerPromotion(12, dto, { user } as never),
    ).resolves.toEqual({
      promotionId: 12,
      restaurantId: 1,
      status: 'Pending',
    });
    expect(service.updateOwnerPromotion).toHaveBeenCalledWith(12, dto, user);
  });

  it('delegates impression tracking to the service', async () => {
    await expect(controller.recordImpression(12)).resolves.toEqual({
      adId: 12,
      impressions: 101,
      clicks: 8,
      ctr: 0.0792,
    });
    expect(service.recordImpression).toHaveBeenCalledWith(12);
  });

  it('delegates click tracking to the service', async () => {
    await expect(controller.recordClick(12)).resolves.toEqual({
      adId: 12,
      impressions: 101,
      clicks: 9,
      ctr: 0.0891,
    });
    expect(service.recordClick).toHaveBeenCalledWith(12);
  });
});
