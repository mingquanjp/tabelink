import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
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
import { CreateRestaurantReviewDto } from './dto/create-restaurant-review.dto';
import { RestaurantsService } from './restaurants.service';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@ApiTags('restaurants')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@Controller('restaurants')
export class PublicRestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get(':restaurantId')
  @ApiOperation({
    summary: 'Get customer restaurant detail',
    description:
      'Returns public restaurant profile and active offers for Backend Feature ID 6 / screen ID5 restaurant detail. Booking and review submission are handled by separate APIs.',
  })
  @ApiOkResponse({
    description: 'Restaurant detail for customer screen ID5.',
    schema: {
      example: {
        restaurantId: 1,
        restaurant: {
          restaurantId: 1,
          nameVn: 'Bun Cha Sakura',
          nameJp: 'ブンチャーさくら',
          address: '24 Hang Manh, Hoan Kiem, Hanoi',
          coverImageUrl: 'https://example.com/cover.jpg',
        },
        promotions: {
          count: 1,
          items: [
            {
              promotionId: 20,
              titleVn: 'Giam 10%',
              titleJp: '10% off',
              startDate: '2026-05-01T00:00:00.000Z',
              endDate: '2026-06-01T00:00:00.000Z',
              status: 'Active',
            },
          ],
        },
        reviews: {
          summary: {
            visibleCount: 8,
            averageRating: 4.5,
          },
          items: [],
        },
        badges: {
          count: 1,
          isVerified: true,
          items: [],
        },
        reviewSubmission: {
          enabled: true,
          method: 'POST',
          endpoint: '/restaurants/1/reviews',
        },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Only customer or guest users can view restaurant detail.',
  })
  @ApiNotFoundResponse({
    description: 'Active restaurant was not found.',
  })
  findPublicDetail(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.restaurantsService.getPublicRestaurantDetail(
      restaurantId,
      request.user,
    );
  }

  @Post(':restaurantId/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Submit a restaurant review',
    description:
      'Creates a visible customer review for the restaurant. Used by screen ID5 inline review submission.',
  })
  @ApiCreatedResponse({
    description: 'Review created.',
    schema: {
      example: {
        reviewId: 100,
        customerAccountId: 9010,
        restaurantId: 1,
        reservationId: null,
        rating: 5,
        toiletCleanliness: 5,
        dishCleanliness: 5,
        spaceCleanliness: 4,
        content: 'Clean and easy to reserve.',
        isJapaneseTag: true,
        status: 'Visible',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Only customer users can submit restaurant reviews.',
  })
  @ApiNotFoundResponse({
    description:
      'Restaurant, customer profile, or completed reservation was not found.',
  })
  createReview(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: CreateRestaurantReviewDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.restaurantsService.createReview(
      restaurantId,
      dto,
      request.user!,
    );
  }
}
