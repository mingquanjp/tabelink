import { Test, TestingModule } from '@nestjs/testing';
import { AuthRole } from '../auth/auth.constants';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: { getDashboard: jest.Mock; getTopMenu: jest.Mock };

  beforeEach(async () => {
    service = {
      getDashboard: jest.fn().mockResolvedValue({
        restaurantId: 1,
        period: {
          month: '2026-05',
        },
        summary: {},
        visitorTrend: [],
        revenueTrend: [],
        userAttributes: [],
        reviewSentiment: {},
        topMenus: [],
        busyHoursToday: {},
        verification: {
          status: 'NotSubmitted',
          application: null,
        },
      }),
      getTopMenu: jest.fn().mockResolvedValue({
        restaurantId: 1,
        count: 0,
        items: [],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('delegates dashboard lookup to the service', async () => {
    const request = {
      user: {
        sub: 5,
        email: 'owner@example.com',
        role: AuthRole.Owner,
      },
    } as any;

    await expect(controller.getDashboard(1, request)).resolves.toEqual({
      restaurantId: 1,
      period: {
        month: '2026-05',
      },
      summary: {},
      visitorTrend: [],
      revenueTrend: [],
      userAttributes: [],
      reviewSentiment: {},
      topMenus: [],
      busyHoursToday: {},
      verification: {
        status: 'NotSubmitted',
        application: null,
      },
    });
    expect(service.getDashboard).toHaveBeenCalledWith(1, request.user);
  });

  it('delegates top menu lookup to the service', async () => {
    const request = {
      user: {
        sub: 5,
        email: 'owner@example.com',
        role: AuthRole.Owner,
      },
    } as any;

    await expect(controller.getTopMenu(1, request)).resolves.toEqual({
      restaurantId: 1,
      count: 0,
      items: [],
    });
    expect(service.getTopMenu).toHaveBeenCalledWith(1, request.user);
  });
});
