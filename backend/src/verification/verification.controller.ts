import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
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
import { SubmitVerificationApplicationDto } from './dto/submit-verification-application.dto';
import { UploadedVerificationFile } from './verification-upload.types';
import { VerificationService } from './verification.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

const uploadSwaggerBody = {
  schema: {
    type: 'object',
    required: ['file'],
    properties: {
      file: {
        type: 'string',
        format: 'binary',
        description: 'PDF, JPG, or PNG. Max 10MB.',
      },
    },
  },
};

@ApiTags('verification')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({ description: 'Only restaurant owners can manage verification applications.' })
@UseGuards(JwtAuthGuard)
@Controller()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('owner/verification/badges')
  @ApiOperation({
    summary: 'List available verification badges',
    description: 'Returns BADGE_MASTER rows so ID13 can choose which official badge to apply for.',
  })
  @ApiOkResponse({
    description: 'Available badge master data.',
    schema: {
      example: {
        count: 1,
        badges: [
          {
            badgeId: 1,
            badgeCode: 'JP_TRUSTED',
            badgeNameVn: 'Quán tin cậy cho khách Nhật',
            badgeNameJp: '日本人向け信頼バッジ',
            descriptionVn: 'Đạt tiêu chí vệ sinh, phục vụ, hỗ trợ tiếng Nhật.',
            descriptionJp: '衛生・接客・日本語対応の基準を満たした店舗。',
            criteria: 'Vệ sinh, phục vụ, tiếng Nhật',
          },
        ],
      },
    },
  })
  listBadges() {
    return this.verificationService.listBadges();
  }

  @Post('owner/restaurants/:restaurantId/verification/uploads/business-license')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiOperation({
    summary: 'Upload business license',
    description: 'ID13 upload area 5-5: 営業許可証 / Giấy phép kinh doanh. Uploads PDF/JPG/PNG to Cloudinary.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(uploadSwaggerBody)
  @ApiCreatedResponse({
    description: 'Business license uploaded.',
    schema: {
      example: {
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/v123/license.pdf',
        publicId: 'tabelink/restaurants/1/verification/business-license/license',
        resourceType: 'image',
        format: 'pdf',
        bytes: 245678,
        originalName: 'business-license.pdf',
        documentType: 'business-license',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  uploadBusinessLicense(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @UploadedFile() file: UploadedVerificationFile | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.verificationService.uploadDocument(
      restaurantId,
      'business-license',
      file,
      request.user,
    );
  }

  @Post('owner/restaurants/:restaurantId/verification/uploads/food-safety-certificate')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiOperation({
    summary: 'Upload food safety certificate',
    description: 'ID13 upload area 5-7: 食品安全衛生基準適合証 / Giấy chứng nhận ATVSTP. Uploads PDF/JPG/PNG to Cloudinary.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(uploadSwaggerBody)
  @ApiCreatedResponse({
    description: 'Food safety certificate uploaded.',
    schema: {
      example: {
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/v123/food-safety.pdf',
        publicId: 'tabelink/restaurants/1/verification/food-safety/certificate',
        resourceType: 'image',
        format: 'pdf',
        bytes: 245678,
        originalName: 'food-safety.pdf',
        documentType: 'food-safety-certificate',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  uploadFoodSafetyCertificate(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @UploadedFile() file: UploadedVerificationFile | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.verificationService.uploadDocument(
      restaurantId,
      'food-safety-certificate',
      file,
      request.user,
    );
  }

  @Post('owner/restaurants/:restaurantId/verification/applications')
  @ApiOperation({
    summary: 'Submit official verification badge application',
    description: 'ID13 submit button 5-10. Requires both uploaded document URLs/public IDs and agreedToTerms=true.',
  })
  @ApiCreatedResponse({
    description: 'Verification application submitted as Pending.',
    schema: {
      example: {
        appId: 12,
        restaurantId: 1,
        badgeId: 1,
        badge: {
          badgeId: 1,
          badgeCode: 'JP_TRUSTED',
          badgeNameVn: 'Quán tin cậy cho khách Nhật',
          badgeNameJp: '日本人向け信頼バッジ',
        },
        submittedByOwnerAccountId: 5,
        businessLicenseUrl: 'https://res.cloudinary.com/demo/image/upload/v123/license.pdf',
        businessLicensePublicId: 'tabelink/restaurants/1/verification/business-license/license',
        foodSafetyCertUrl: 'https://res.cloudinary.com/demo/image/upload/v123/food-safety.pdf',
        foodSafetyCertPublicId: 'tabelink/restaurants/1/verification/food-safety/certificate',
        status: 'Pending',
        submittedAt: '2026-05-07T12:00:00.000Z',
        reviewedByAdminId: null,
        reviewedAt: null,
        reviewNote: null,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant or badge not found.' })
  submitApplication(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: SubmitVerificationApplicationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.verificationService.submitApplication(restaurantId, dto, request.user);
  }

  @Get('owner/restaurants/:restaurantId/verification/applications/latest')
  @ApiOperation({
    summary: 'Get latest owner verification application',
    description: 'Returns the latest application status for ID13 dashboard/popup state.',
  })
  @ApiOkResponse({ description: 'Latest verification application, or NotSubmitted.' })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  getLatestApplication(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.verificationService.getLatestApplication(restaurantId, request.user);
  }

  @Get('owner/verification/applications/:appId')
  @ApiOperation({
    summary: 'Get one owner verification application',
    description: 'Returns one verification application owned by the authenticated owner.',
  })
  @ApiOkResponse({ description: 'Verification application detail.' })
  @ApiNotFoundResponse({ description: 'Verification application not found.' })
  getApplication(
    @Param('appId', ParseIntPipe) appId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.verificationService.getApplication(appId, request.user);
  }
}
