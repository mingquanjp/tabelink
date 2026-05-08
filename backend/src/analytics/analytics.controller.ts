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
@Controller('owner/restaurants/:restaurantId/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('top-menu')
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
