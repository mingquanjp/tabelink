import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { RecordRestaurantViewDto } from './dto/record-restaurant-view.dto';

@ApiTags('analytics')
@Controller()
export class AnalyticsTrackingController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('restaurants/:restaurantId/views')
  @ApiOperation({
    summary: 'Record a restaurant page view',
    description:
      'Increments RESTAURANT_ANALYTICS_DAILY.VisitCount for the current day. This feeds the ID13 monthly restaurant views card.',
  })
  @ApiOkResponse({
    description: 'Updated daily restaurant analytics counters.',
    schema: {
      example: {
        restaurantId: 1,
        statDate: '2026-05-08',
        visitCount: 42,
        japaneseVisitCount: 30,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found.' })
  recordRestaurantView(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto?: RecordRestaurantViewDto,
  ) {
    return this.analyticsService.recordRestaurantView(
      restaurantId,
      dto?.isJapaneseVisitor ?? false,
    );
  }

  @Post('menu-items/:itemId/views')
  @ApiOperation({
    summary: 'Record a menu item view',
    description:
      'Increments MENU_ITEM_ANALYTICS_DAILY.ViewCount for the current day.',
  })
  @ApiOkResponse({
    description: 'Updated daily menu item analytics counters.',
    schema: {
      example: {
        itemId: 10,
        statDate: '2026-05-08',
        viewCount: 18,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Active menu item not found.' })
  recordMenuItemView(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.analyticsService.recordMenuItemView(itemId);
  }
}
