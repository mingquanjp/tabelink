import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdsService } from './ads.service';

@ApiTags('ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post(':adId/impressions')
  @ApiOperation({
    summary: 'Record an ad impression',
    description:
      'Increments the impression count for an active Advertisement promotion. Used when a public ad card/banner is shown.',
  })
  @ApiOkResponse({
    description: 'Updated ad counters.',
    schema: {
      example: {
        adId: 12,
        impressions: 101,
        clicks: 8,
        ctr: 0.0792,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Active ad not found.' })
  recordImpression(@Param('adId', ParseIntPipe) adId: number) {
    return this.adsService.recordImpression(adId);
  }

  @Post(':adId/clicks')
  @ApiOperation({
    summary: 'Record an ad click',
    description:
      'Increments the click count for an active Advertisement promotion. Click tracking preserves the database invariant clicks <= impressions.',
  })
  @ApiOkResponse({
    description: 'Updated ad counters.',
    schema: {
      example: {
        adId: 12,
        impressions: 101,
        clicks: 9,
        ctr: 0.0891,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Active ad not found.' })
  recordClick(@Param('adId', ParseIntPipe) adId: number) {
    return this.adsService.recordClick(adId);
  }
}
