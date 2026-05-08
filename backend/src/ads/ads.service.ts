import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface PromotionCounterRow {
  promotionid: number | string;
  impressions: number | string;
  clicks: number | string;
}

@Injectable()
export class AdsService {
  constructor(private readonly dataSource: DataSource) {}

  async recordImpression(adId: number) {
    const row = await this.updateActiveAdCounters(
      adId,
      `
        Impressions = Impressions + 1
      `,
    );

    return this.toCounterResponse(row);
  }

  async recordClick(adId: number) {
    const row = await this.updateActiveAdCounters(
      adId,
      `
        Clicks = Clicks + 1,
        Impressions = GREATEST(Impressions, Clicks + 1)
      `,
    );

    return this.toCounterResponse(row);
  }

  private async updateActiveAdCounters(adId: number, setClause: string) {
    const rows = await this.dataSource.query<PromotionCounterRow[]>(
      `
        UPDATE PROMOTION
        SET ${setClause}
        WHERE PromotionID = $1
          AND PromotionType = 'Advertisement'
          AND Status = 'Active'
          AND StartDate <= CURRENT_TIMESTAMP
          AND EndDate >= CURRENT_TIMESTAMP
        RETURNING PromotionID, Impressions, Clicks
      `,
      [adId],
    );

    const row = rows[0];
    if (!row) {
      throw new NotFoundException('Active ad not found.');
    }

    return row;
  }

  private toCounterResponse(row: PromotionCounterRow) {
    const impressions = Number(row.impressions);
    const clicks = Number(row.clicks);

    return {
      adId: Number(row.promotionid),
      impressions,
      clicks,
      ctr: impressions > 0 ? Number((clicks / impressions).toFixed(4)) : 0,
    };
  }
}
