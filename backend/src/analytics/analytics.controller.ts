import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({
  description: 'Only restaurant owners can view analytics.',
})
@UseGuards(JwtAuthGuard)
@Controller('owner/restaurants/:restaurantId')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get owner dashboard analytics',
    description:
      'Returns the aggregated data needed by screen ID13: KPI cards, visitor charts, sentiment, top menu, busy hours, and verification status.',
  })
  @ApiOkResponse({
    description: 'Dashboard analytics for an owner restaurant.',
    schema: {
      example: {
        restaurantId: 1,
        period: {
          month: '2026-05',
        },
        summary: {
          monthlyViews: {
            value: 1234,
            previousMonthValue: 1097,
            changeRate: 12.49,
          },
          japaneseAverageRating: {
            value: 4.6,
            reviewCount: 32,
          },
          campaignWeeklyOrders: {
            value: 18,
            activeCampaignCount: 2,
            isTracked: true,
          },
          publishedReviews: {
            value: 86,
            target: 100,
            progressRate: 86,
          },
        },
        visitorTrend: [
          {
            date: '2026-05-01',
            japanese: 20,
            others: 8,
          },
        ],
        revenueTrend: [
          {
            date: '2026-05-01',
            revenue: 1250000,
            orderCount: 12,
          },
        ],
        userAttributes: [
          {
            label: 'Japanese',
            count: 45,
            percentage: 65,
          },
        ],
        reviewSentiment: {
          positive: 70,
          neutral: 20,
          negative: 10,
        },
        topMenus: [
          {
            rank: 1,
            itemId: 10,
            nameVn: 'Pho bo',
            nameJp: 'ç‰›è‚‰ãƒ•ã‚©ãƒ¼',
            imageUrl: 'https://example.com/menu/pho-bo.jpg',
            orderCount: 24,
            revenue: 3600000,
          },
        ],
        busyHoursToday: {
          date: '2026-05-09',
          peakHour: 19,
          items: [
            {
              hour: 19,
              reservationCount: 5,
            },
          ],
          insight:
            '19:00頃が混雑ピークです。スタッフ配置を増やすことをおすすめします。',
        },
        verification: {
          status: 'NotSubmitted',
          application: null,
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  getDashboard(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.analyticsService.getDashboard(restaurantId, request.user);
  }

  @Get('analytics/top-menu')
  @ApiOperation({
    summary: 'Get Top 3 popular menu items',
    description:
      'Returns the Top 3 menu items ranked by successful all-time order quantity. Only Completed reservations are counted.',
  })
  @ApiOkResponse({
    description: 'Top 3 menu items for an owner restaurant.',
    schema: {
      example: {
        restaurantId: 1,
        count: 3,
        items: [
          {
            rank: 1,
            itemId: 10,
            restaurantId: 1,
            nameVn: 'Pho bo',
            nameJp: '牛肉フォー',
            imageUrl: 'https://example.com/menu/pho-bo.jpg',
            orderCount: 24,
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  getTopMenu(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.analyticsService.getTopMenu(restaurantId, request.user);
  }
}
