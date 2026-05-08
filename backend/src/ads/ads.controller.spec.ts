import { Test, TestingModule } from '@nestjs/testing';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';

describe('AdsController', () => {
  let controller: AdsController;
  let service: {
    recordImpression: jest.Mock;
    recordClick: jest.Mock;
  };

  beforeEach(async () => {
    service = {
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
