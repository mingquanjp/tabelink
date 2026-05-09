import { Body, Controller, Get, Param, ParseIntPipe, Patch, Req, UseGuards } from '@nestjs/common';
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
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantsService } from './restaurants.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('restaurants')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({ description: 'Only restaurant owners can manage restaurant information.' })
@UseGuards(JwtAuthGuard)
@Controller('owner')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get('restaurant-options')
  @ApiOperation({
    summary: 'List restaurant service options',
    description:
      'Returns FEATURE_MASTER and PAYMENT_METHOD master data for Feature ID 13 / screen ID11 restaurant information management.',
  })
  @ApiOkResponse({
    description: 'Restaurant service and payment method options.',
  })
  getOptions() {
    return this.restaurantsService.getOptions();
  }

  @Get('restaurants')
  @ApiOperation({
    summary: 'List owner restaurants',
    description: 'Returns restaurants owned by the authenticated owner.',
  })
  @ApiOkResponse({ description: 'Owner restaurant list.' })
  listOwnerRestaurants(@Req() request: AuthenticatedRequest) {
    return this.restaurantsService.listOwnerRestaurants(request.user);
  }

  @Get('restaurants/:restaurantId')
  @ApiOperation({
    summary: 'Get owner restaurant information',
    description:
      'Returns restaurant profile, selected service features, payment methods, VAT support, and media for Feature ID 13 / screen ID11.',
  })
  @ApiOkResponse({ description: 'Restaurant detail for owner management.' })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  findOne(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.restaurantsService.findOwnerRestaurant(restaurantId, request.user);
  }

  @Get('restaurants/:restaurantId/home')
  @ApiOperation({
    summary: 'Get owner home screen data',
    description:
      'Returns restaurant profile, menu preview, active/recent campaigns, and latest reviews for Backend Feature ID 6 / screen ID5 owner home.',
  })
  @ApiOkResponse({
    description: 'Owner home screen aggregate data.',
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
        menu: {
          count: 12,
          activeCount: 10,
          recommendedForJpCount: 4,
          items: [],
        },
        promotions: {
          count: 2,
          items: [],
        },
        reviews: {
          summary: {
            visibleCount: 8,
            averageRating: 4.5,
          },
          items: [],
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  getHome(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.restaurantsService.getOwnerHome(restaurantId, request.user);
  }

  @Patch('restaurants/:restaurantId')
  @ApiOperation({
    summary: 'Update owner restaurant information and services',
    description:
      'Updates basic restaurant information and replaces selected featureIds, paymentMethodIds, or media when those arrays are provided.',
  })
  @ApiOkResponse({ description: 'Restaurant information updated.' })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  update(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: UpdateRestaurantDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.restaurantsService.update(restaurantId, dto, request.user);
  }
}
