import {
  Body,
  Controller,
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
  user: JwtPayload;
}

@ApiTags('restaurants')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@UseGuards(JwtAuthGuard)
@Controller('restaurants')
export class PublicRestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post(':restaurantId/reviews')
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
        sentiment: 'Positive',
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
      request.user,
    );
  }
}
