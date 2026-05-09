import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AdsService } from './ads.service';

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
