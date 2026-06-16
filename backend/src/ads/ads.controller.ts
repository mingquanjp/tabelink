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
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
  AdminPromotionsQueryDto,
  CreateAdRequestDto,
  CreateCampaignDto,
  CreatePromotionDto,
  PromotionType,
  RejectPromotionDto,
  UpdatePromotionDto,
} from './dto/create-promotion.dto';
import { AdsMediaService } from './ads-media.service';
import { UploadedAdMediaFile } from './ads-media-upload.types';
import { AdsService } from './ads.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('ads')
@Controller()
export class AdsController {
  constructor(
    private readonly adsService: AdsService,
    private readonly adsMediaService: AdsMediaService,
  ) {}

  @Get('campaigns')
  @ApiOperation({
    summary: 'List active available campaigns for users',
    description:
      'Screen ID9 campaign list. Returns active Campaign promotions that are currently within their valid date range. Restaurant image uses approved restaurant cover media.',
  })
  @ApiOkResponse({
    description: 'Available campaign list for users.',
    schema: {
      example: {
        items: [
          {
            promotionId: 8001,
            restaurantId: 1001,
            restaurantNameVN: 'Sushi Tokyo',
            restaurantNameJP: 'スシ東京',
            imageUrl: 'https://example.com/restaurant-cover.jpg',
            promotionType: 'Campaign',
            campaignNameVN: 'Ưu đãi mùa hè',
            campaignNameJP: 'サマーキャンペーン',
            campaignDescriptionVN: 'Nội dung campaign tiếng Việt.',
            campaignDescriptionJP: 'キャンペーン内容。',
            targetAudience: 'all',
            discountType: 'Percentage',
            discountValue: '10%',
            noteVN: 'Áp dụng trong thời gian campaign.',
            noteJP: 'キャンペーン期間中に適用。',
            startDate: '2026-05-01T00:00:00.000Z',
            endDate: '2026-08-01T00:00:00.000Z',
            status: 'Active',
          },
        ],
      },
    },
  })
  listAvailableCampaigns() {
    return this.adsService.listAvailableCampaigns();
  }

  @Get('user/notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List active push notifications for users',
    description:
      'Returns active Notification advertisement promotions for the user notification bell.',
  })
  @ApiOkResponse({ description: 'Active push notification list.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only users can view notifications.',
  })
  listUserNotifications(@Req() request: AuthenticatedRequest) {
    return this.adsService.listUserNotifications(request.user);
  }

  @Get('admin/promotions/summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get admin promotion moderation KPI summary',
    description:
      'Screen ID14 summary. Counts both Advertisement and Campaign promotions because owner create/edit flows put both into Pending review.',
  })
  @ApiOkResponse({ description: 'Admin promotion moderation KPI summary.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Only admins can review promotions.' })
  getAdminPromotionSummary(@Req() request: AuthenticatedRequest) {
    return this.adsService.getAdminPromotionSummary(request.user);
  }

  @Get('admin/promotions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List promotions for admin moderation',
    description:
      'Screen ID14 list data. Returns Advertisement and Campaign promotions with restaurant context, optional status filtering, and restaurant/title search.',
  })
  @ApiOkResponse({ description: 'Admin promotion moderation list.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Only admins can review promotions.' })
  listAdminPromotions(
    @Query() query: AdminPromotionsQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.listAdminPromotions(query, request.user);
  }

  @Get('admin/promotions/:promotionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get one promotion for admin moderation',
    description:
      'Screen ID14 detail data for either an Advertisement or Campaign promotion.',
  })
  @ApiOkResponse({ description: 'Admin promotion moderation detail.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Only admins can review promotions.' })
  @ApiNotFoundResponse({ description: 'Promotion not found.' })
  getAdminPromotion(
    @Param('promotionId', ParseIntPipe) promotionId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.getAdminPromotion(promotionId, request.user);
  }

  @Patch('admin/promotions/:promotionId/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Approve a pending promotion',
    description:
      'Approves a Pending Advertisement or Campaign and records a moderation log.',
  })
  @ApiOkResponse({ description: 'Promotion approved.' })
  @ApiBadRequestResponse({
    description: 'Only pending promotions can be approved.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Only admins can review promotions.' })
  @ApiNotFoundResponse({ description: 'Promotion not found.' })
  approveAdminPromotion(
    @Param('promotionId', ParseIntPipe) promotionId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.approveAdminPromotion(promotionId, request.user);
  }

  @Patch('admin/promotions/:promotionId/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Reject a pending promotion',
    description:
      'Rejects a Pending Advertisement or Campaign, stores the rejection reason, and records a moderation log.',
  })
  @ApiBody({ type: RejectPromotionDto })
  @ApiOkResponse({ description: 'Promotion rejected.' })
  @ApiBadRequestResponse({
    description: 'Only pending promotions can be rejected.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Only admins can review promotions.' })
  @ApiNotFoundResponse({ description: 'Promotion not found.' })
  rejectAdminPromotion(
    @Param('promotionId', ParseIntPipe) promotionId: number,
    @Body() dto: RejectPromotionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.rejectAdminPromotion(
      promotionId,
      dto.reason,
      request.user,
    );
  }

  @Get('owner/promotions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List campaigns and advertisements for the owner restaurant',
    description:
      'Screen ID10 list data. Each owner account has one restaurant, so the restaurant is resolved from the access token.',
  })
  @ApiOkResponse({ description: 'Owner campaign/advertisement list.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can view promotions.',
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  listOwnerPromotions(@Req() request: AuthenticatedRequest) {
    return this.adsService.listOwnerPromotions(request.user);
  }

  @Post('owner/promotions/campaigns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create campaign from the screen ID10 new campaign popup',
    description:
      'Creates a Pending Campaign for the owner restaurant. Campaign payload follows screen ID10 and does not expose internal bilingual DB columns.',
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
      this.toCampaignPromotionDto(dto),
      request.user,
    );
  }

  @Post('owner/ads/requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create advertisement request from the screen ID10 ad popup',
    description:
      'Creates a Pending Advertisement request for the owner restaurant. Ads target all users and do not use distance or discount fields.',
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
        targetAudience: 'all',
      },
      request.user,
    );
  }

  @Post('owner/ads/uploads')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Upload advertisement creative image',
    description:
      'Uploads one advertisement creative image for screen ID10 ad request popup. Use mediaUrl in POST /owner/ads/requests.',
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
          description: 'JPG, PNG, or WEBP image. Max 5MB.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Advertisement image uploaded.',
    schema: {
      example: {
        mediaUrl:
          'https://res.cloudinary.com/demo/image/upload/v123/tabelink/restaurants/1/ads/banner.jpg',
        publicId: 'tabelink/restaurants/1/ads/banner',
        width: 1200,
        height: 700,
        bytes: 245678,
        format: 'jpg',
        originalName: 'banner.jpg',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid or missing image file.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can upload advertisement images.',
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  uploadOwnerAdImage(
    @UploadedFile() file: UploadedAdMediaFile | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsMediaService.upload(file, request.user);
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

  @Patch('owner/promotions/:promotionId/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'End an active campaign or advertisement',
    description:
      'Owner-context stop action for screen ID10. Active promotions are changed to Ended.',
  })
  @ApiOkResponse({ description: 'Promotion ended.' })
  @ApiBadRequestResponse({
    description: 'Only active promotions can be ended.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can end promotions.',
  })
  @ApiNotFoundResponse({ description: 'Promotion not found for this owner.' })
  endOwnerPromotion(
    @Param('promotionId', ParseIntPipe) promotionId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.endOwnerPromotion(promotionId, request.user);
  }

  @Patch('owner/promotions/:promotionId/resume')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Resume an ended campaign or advertisement',
    description:
      'Owner-context resume action for screen ID10. Ended promotions are changed back to Active.',
  })
  @ApiOkResponse({ description: 'Promotion resumed.' })
  @ApiBadRequestResponse({
    description: 'Only ended promotions can be resumed.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({
    description: 'Only restaurant owners can resume promotions.',
  })
  @ApiNotFoundResponse({ description: 'Promotion not found for this owner.' })
  resumeOwnerPromotion(
    @Param('promotionId', ParseIntPipe) promotionId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adsService.resumeOwnerPromotion(promotionId, request.user);
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

  private toCampaignPromotionDto(dto: CreateCampaignDto): CreatePromotionDto {
    return {
      promotionType: PromotionType.Campaign,
      titleVn: dto.campaignName,
      titleJp: dto.campaignName,
      contentVn: dto.campaignDescription,
      contentJp: dto.campaignDescription,
      targetAudience: dto.targetAudience,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      termsVn: dto.note,
      termsJp: dto.note,
      startDate: dto.startDate,
      endDate: dto.endDate,
    };
  }
}
