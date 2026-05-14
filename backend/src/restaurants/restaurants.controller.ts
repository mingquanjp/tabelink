import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UploadedRestaurantImageFile } from './restaurant-image-upload.types';
import { RestaurantImagesService } from './restaurant-images.service';
import { RestaurantsService } from './restaurants.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('restaurants')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({
  description: 'Only restaurant owners can manage restaurant information.',
})
@UseGuards(JwtAuthGuard)
@Controller('owner')
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly restaurantImagesService: RestaurantImagesService,
  ) {}

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

  @Get('restaurant')
  @ApiOperation({
    summary: 'Get owner restaurant information',
    description:
      'Returns restaurant profile, selected service features, payment methods, VAT support, and media for Feature ID 13 / screen ID11.',
  })
  @ApiOkResponse({ description: 'Restaurant detail for owner management.' })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  findOne(@Req() request: AuthenticatedRequest) {
    return this.restaurantsService.findOwnerRestaurant(request.user);
  }

  @Get('restaurant/home')
  @ApiOperation({
    summary: 'Get owner home screen data',
    description:
      'Returns restaurant profile, menu preview, active/recent campaigns, and visible reviews for Backend Feature ID 6 / screen ID5 owner home.',
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
  getHome(@Req() request: AuthenticatedRequest) {
    return this.restaurantsService.getOwnerHome(request.user);
  }

  @Patch('restaurant')
  @ApiOperation({
    summary: 'Update owner restaurant information and services',
    description:
      'Updates basic restaurant information and replaces selected featureIds, paymentMethodIds, or media when those arrays are provided.',
  })
  @ApiOkResponse({ description: 'Restaurant information updated.' })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  update(
    @Body() dto: UpdateRestaurantDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.restaurantsService.update(dto, request.user);
  }

  @Post('restaurant/images')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload owner restaurant image',
    description:
      'Uploads one restaurant profile image to Cloudinary. Use the returned imageUrl in the restaurant media array when updating restaurant information.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'JPG, PNG, or WEBP image. Max 10MB.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Restaurant image uploaded to Cloudinary.',
    schema: {
      example: {
        imageUrl:
          'https://res.cloudinary.com/demo/image/upload/v123/tabelink/restaurants/1/profile/cover.jpg',
        publicId: 'tabelink/restaurants/1/profile/cover',
        width: 1200,
        height: 800,
        bytes: 245678,
        format: 'jpg',
        originalName: 'cover.jpg',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  uploadRestaurantImage(
    @UploadedFile() file: UploadedRestaurantImageFile | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.restaurantImagesService.upload(file, request.user);
  }
}
