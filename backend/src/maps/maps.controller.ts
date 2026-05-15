import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetRestaurantRouteQueryDto } from './dto/get-restaurant-route-query.dto';
import { MapsService } from './maps.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('maps')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@UseGuards(JwtAuthGuard)
@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('restaurants')
  @ApiOperation({
    summary: 'Get all active restaurants for map',
    description: 'Returns all active restaurants with coordinates, features, and average rating for the map view.',
  })
  @ApiOkResponse({
    description: 'List of restaurants for the map.',
  })
  getMapRestaurants(@Req() request: AuthenticatedRequest) {
    return this.mapsService.getMapRestaurants(request.user);
  }

  @Get('restaurants/:restaurantId/route')
  @ApiOperation({
    summary: 'Get route from current location to a restaurant',
    description:
      'Returns restaurant coordinates, OSRM route geometry, distance, and duration for screen ID4 Search & Map. The backend uses OSRM driving distance and does not calculate straight-line distance. The destination is loaded from the active restaurant record.',
  })
  @ApiOkResponse({
    description: 'Route data for the selected restaurant.',
    schema: {
      example: {
        restaurantId: 1,
        origin: { lat: 21.0166, lng: 105.8412 },
        destination: {
          lat: 21.02686,
          lng: 105.84647,
          nameVn: 'Bun Cha Sakura',
          nameJp: 'ãƒ–ãƒ³ãƒ ãƒ£ãƒ¼ã •ã  ã‚‰',
          address: '24 Hang Manh, Hoan Kiem, Hanoi',
        },
        provider: 'osrm',
        distanceMeters: 1842.3,
        durationSeconds: 412.5,
        geometry: [
          { lat: 21.0166, lng: 105.8412 },
          { lat: 21.02686, lng: 105.84647 },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid coordinates.',
  })
  @ApiForbiddenResponse({
    description: 'Only customer or guest users can request map routes.',
  })
  @ApiNotFoundResponse({
    description: 'Active restaurant or restaurant location was not found.',
  })
  getRestaurantRoute(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Query() query: GetRestaurantRouteQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.mapsService.getRestaurantRoute(
      restaurantId,
      query,
      request.user,
    );
  }
}
