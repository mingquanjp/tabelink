import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsTrackingController } from './analytics-tracking.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsTrackingController', () => {
  let controller: AnalyticsTrackingController;
  let service: {
    recordRestaurantView: jest.Mock;
    recordMenuItemView: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      recordRestaurantView: jest.fn().mockResolvedValue({
        restaurantId: 1,
        statDate: '2026-05-08',
        visitCount: 42,
        japaneseVisitCount: 30,
      }),
      recordMenuItemView: jest.fn().mockResolvedValue({
        itemId: 10,
        statDate: '2026-05-08',
        viewCount: 18,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsTrackingController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsTrackingController>(
      AnalyticsTrackingController,
    );
  });

  it('delegates restaurant view tracking to the service', async () => {
    await expect(
      controller.recordRestaurantView(1, { isJapaneseVisitor: true }),
    ).resolves.toEqual({
      restaurantId: 1,
      statDate: '2026-05-08',
      visitCount: 42,
      japaneseVisitCount: 30,
    });
    expect(service.recordRestaurantView).toHaveBeenCalledWith(1, true);
  });

  it('defaults restaurant view tracking to non-Japanese visitor', async () => {
    await controller.recordRestaurantView(1);

    expect(service.recordRestaurantView).toHaveBeenCalledWith(1, false);
  });

  it('delegates menu item view tracking to the service', async () => {
    await expect(controller.recordMenuItemView(10)).resolves.toEqual({
      itemId: 10,
      statDate: '2026-05-08',
      viewCount: 18,
    });
    expect(service.recordMenuItemView).toHaveBeenCalledWith(10);
  });
});
