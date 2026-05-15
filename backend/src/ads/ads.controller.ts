import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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
import {
  CreateAdRequestDto,
  CreateCampaignDto,
  CreatePromotionDto,
  PromotionType,
  UpdatePromotionDto,
} from './dto/create-promotion.dto';
import { AdsService } from './ads.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('ads')
@Controller()
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get('owner/promotions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List campaigns and advertisements for the owner restaurant',
    description:
      'Screen ID10 list data. Because each owner account has one restaurant, the restaurant is resolved from the access token.',
  })
  @ApiOkResponse({ description: 'Owner promotion list.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can view promotions.',
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  listOwnerPromotions(@Req() request: AuthenticatedRequest) {
    return this.adsService.listOwnerPromotions(request.user);
  }

  @Get('owner/restaurants/:restaurantId/promotions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List owner campaigns and advertisements',
    description:
      'Screen ID10 list data for owner campaign/ad management, including active, pending, rejected, and ended PROMOTION records.',
  })
  @ApiOkResponse({ description: 'Owner promotion list.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can view promotions.',
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  listPromotions(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.listPromotions(restaurantId, request.user);
  }

  @Post('owner/restaurants/:restaurantId/promotions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create owner campaign or advertisement request',
    description:
      'Backend Feature ID 17 / screen ID10. Creates a Pending PROMOTION record for owner-created offers/campaigns or advertisement requests with content, period, and target audience.',
  })
  @ApiBody({
    type: CreatePromotionDto,
    examples: {
      campaign: {
        summary: 'Campaign/offer request',
        value: {
          promotionType: PromotionType.Campaign,
          titleJp: '秋の限定セット 10% OFF',
          contentJp: 'TABELINKから予約したお客様向けの特別オファーです。',
          targetAudience: 'all',
          termsJp: '他のクーポンとの併用はできません。',
          startDate: '2026-05-20T00:00:00.000Z',
          endDate: '2026-05-31T23:59:59.000Z',
        },
      },
      advertisement: {
        summary: 'Advertisement request',
        value: {
          promotionType: PromotionType.Advertisement,
          titleJp: '週末限定バナー広告',
          contentJp: '近隣の日本人ユーザーに週末限定メニューを告知します。',
          targetAudience: 'Japanese customers within 5km',
          startDate: '2026-05-20T00:00:00.000Z',
          endDate: '2026-05-27T23:59:59.000Z',
          totalCost: 50000,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Pending promotion/ad request created.',
    schema: {
      example: {
        promotionId: 12,
        restaurantId: 1,
        promotionType: 'Advertisement',
        targetAudience: 'Japanese customers within 5km',
        titleVn: 'Weekend banner ad',
        titleJp: '週末限定バナー広告',
        contentVn: null,
        contentJp: '近隣の日本人ユーザーに週末限定メニューを告知します。',
        mediaUrl: null,
        termsVn: null,
        termsJp: null,
        startDate: '2026-05-20T00:00:00.000Z',
        endDate: '2026-05-27T23:59:59.000Z',
        status: 'Pending',
        impressions: 0,
        clicks: 0,
        totalCost: 50000,
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid content or date range.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can create promotions.',
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  createPromotion(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: CreatePromotionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.createPromotion(restaurantId, dto, request.user);
  }

  @Post('owner/promotions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create campaign or advertisement for the owner restaurant',
    description:
      'Owner-context version of Feature ID 17. The restaurant is resolved from the owner token.',
  })
  @ApiBody({ type: CreatePromotionDto })
  @ApiCreatedResponse({ description: 'Pending promotion/ad request created.' })
  @ApiBadRequestResponse({ description: 'Invalid content or date range.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can create promotions.',
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  createOwnerPromotion(
    @Body() dto: CreatePromotionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.createOwnerPromotion(dto, request.user);
  }

  @Post('owner/campaigns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create campaign from the screen ID10 new campaign popup',
    description:
      'Owner-context popup endpoint. Creates a Pending PROMOTION with PromotionType = Campaign for the owner restaurant.',
  })
  @ApiBody({ type: CreateCampaignDto })
  @ApiCreatedResponse({ description: 'Pending campaign created.' })
  @ApiBadRequestResponse({ description: 'Invalid content or date range.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can create campaigns.',
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  createOwnerCampaign(
    @Body() dto: CreateCampaignDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.createOwnerPromotion(
      {
        ...dto,
        promotionType: PromotionType.Campaign,
      },
      request.user,
    );
  }

  @Post('owner/restaurants/:restaurantId/campaigns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create campaign from the screen ID10 new campaign popup',
    description:
      'Convenience endpoint for the new campaign/offer popup. Creates a Pending PROMOTION with PromotionType = Campaign.',
  })
  @ApiBody({ type: CreateCampaignDto })
  @ApiCreatedResponse({ description: 'Pending campaign created.' })
  @ApiBadRequestResponse({ description: 'Invalid content or date range.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can create campaigns.',
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  createCampaign(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: CreateCampaignDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.createPromotion(
      restaurantId,
      {
        ...dto,
        promotionType: PromotionType.Campaign,
      },
      request.user,
    );
  }

  @Post('owner/ads/requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create advertisement request from the screen ID10 ad popup',
    description:
      'Owner-context popup endpoint. Creates a Pending PROMOTION with PromotionType = Advertisement for the owner restaurant.',
  })
  @ApiBody({ type: CreateAdRequestDto })
  @ApiCreatedResponse({ description: 'Pending advertisement request created.' })
  @ApiBadRequestResponse({ description: 'Invalid content or date range.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can request advertisements.',
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  createOwnerAdRequest(
    @Body() dto: CreateAdRequestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.createOwnerPromotion(
      {
        ...dto,
        promotionType: PromotionType.Advertisement,
      },
      request.user,
    );
  }

  @Post('owner/restaurants/:restaurantId/ads/requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create advertisement request from the screen ID10 ad popup',
    description:
      'Convenience endpoint for the advertisement request popup. Creates a Pending PROMOTION with PromotionType = Advertisement.',
  })
  @ApiBody({ type: CreateAdRequestDto })
  @ApiCreatedResponse({ description: 'Pending advertisement request created.' })
  @ApiBadRequestResponse({ description: 'Invalid content or date range.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can request advertisements.',
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  createAdRequest(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: CreateAdRequestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.createPromotion(
      restaurantId,
      {
        ...dto,
        promotionType: PromotionType.Advertisement,
      },
      request.user,
    );
  }

  @Get('owner/promotions/:promotionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get one campaign or advertisement for the edit popup',
    description:
      'Owner-context detail endpoint. The restaurant is resolved from the access token.',
  })
  @ApiOkResponse({ description: 'Owner promotion detail.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can view promotions.',
  })
  @ApiNotFoundResponse({ description: 'Promotion not found for this owner.' })
  getOwnerPromotion(
    @Param('promotionId', ParseIntPipe) promotionId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.getOwnerPromotion(promotionId, request.user);
  }

  @Get('owner/restaurants/:restaurantId/promotions/:promotionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get one campaign or advertisement for the edit popup',
    description:
      'Returns one owned PROMOTION record to prefill the screen ID10 edit/detail popup.',
  })
  @ApiOkResponse({ description: 'Owner promotion detail.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can view promotions.',
  })
  @ApiNotFoundResponse({ description: 'Promotion not found for this owner.' })
  getPromotion(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('promotionId', ParseIntPipe) promotionId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.getPromotion(
      restaurantId,
      promotionId,
      request.user,
    );
  }

  @Patch('owner/promotions/:promotionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update campaign or advertisement from the edit popup',
    description:
      'Owner-context edit endpoint. Owner edits reset the promotion to Pending for admin review.',
  })
  @ApiBody({ type: UpdatePromotionDto })
  @ApiOkResponse({ description: 'Promotion updated.' })
  @ApiBadRequestResponse({ description: 'Invalid content or date range.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can update promotions.',
  })
  @ApiNotFoundResponse({ description: 'Promotion not found for this owner.' })
  updateOwnerPromotion(
    @Param('promotionId', ParseIntPipe) promotionId: number,
    @Body() dto: UpdatePromotionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.updateOwnerPromotion(promotionId, dto, request.user);
  }

  @Patch('owner/restaurants/:restaurantId/promotions/:promotionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update campaign or advertisement from the edit popup',
    description:
      'Updates content, period, media, terms, target audience, or budget for an owned PROMOTION. Owner edits reset the record to Pending for admin review.',
  })
  @ApiBody({ type: UpdatePromotionDto })
  @ApiOkResponse({ description: 'Promotion updated.' })
  @ApiBadRequestResponse({ description: 'Invalid content or date range.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can update promotions.',
  })
  @ApiNotFoundResponse({ description: 'Promotion not found for this owner.' })
  updatePromotion(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('promotionId', ParseIntPipe) promotionId: number,
    @Body() dto: UpdatePromotionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.updatePromotion(
      restaurantId,
      promotionId,
      dto,
      request.user,
    );
  }

  @Post('ads/:adId/impressions')
  @HttpCode(HttpStatus.OK)
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

  @Post('ads/:adId/clicks')
  @HttpCode(HttpStatus.OK)
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
