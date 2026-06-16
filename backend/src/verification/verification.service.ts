import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Repository } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { JwtPayload } from '../auth/auth.types';
import {
  BadgeApplication,
  BadgeApplicationStatus,
} from './entities/badge-application.entity';
import { BadgeMaster } from './entities/badge-master.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { SubmitVerificationApplicationDto } from './dto/submit-verification-application.dto';
import { UploadedVerificationFile } from './verification-upload.types';

export type VerificationDocumentType =
  | 'business-license'
  | 'food-safety-certificate';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(BadgeMaster)
    private readonly badgeRepo: Repository<BadgeMaster>,
    @InjectRepository(BadgeApplication)
    private readonly applicationRepo: Repository<BadgeApplication>,
    private readonly configService: ConfigService,
  ) {}

  async listBadges() {
    const badges = await this.badgeRepo.find({
      order: { badgeId: 'ASC' },
    });

    return {
      count: badges.length,
      badges: badges.map((badge) => ({
        badgeId: badge.badgeId,
        badgeCode: badge.badgeCode,
        badgeNameVn: badge.badgeNameVn,
        badgeNameJp: badge.badgeNameJp,
        descriptionVn: badge.descriptionVn ?? null,
        descriptionJp: badge.descriptionJp ?? null,
        criteria: badge.criteria ?? null,
      })),
    };
  }

  async uploadDocument(
    restaurantId: number,
    documentType: VerificationDocumentType,
    file: UploadedVerificationFile | undefined,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);

    if (!file) {
      throw new BadRequestException('Document file is required.');
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only PDF, JPG, and PNG files are allowed.',
      );
    }

    this.configureCloudinary();
    const result = await this.uploadBuffer(file, restaurantId, documentType);

    return {
      fileUrl: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      originalName: file.originalname,
      documentType,
    };
  }

  async submitApplication(
    restaurantId: number,
    dto: SubmitVerificationApplicationDto,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const badge = await this.badgeRepo.findOne({
      where: { badgeId: dto.badgeId },
    });

    if (!badge) {
      throw new NotFoundException('Badge not found.');
    }

    const existingPending = await this.applicationRepo.findOne({
      where: {
        restaurantId,
        badgeId: dto.badgeId,
        submittedByOwnerAccountId: user.sub,
        status: BadgeApplicationStatus.Pending,
      },
    });

    if (existingPending) {
      throw new ConflictException(
        'A pending verification application already exists.',
      );
    }

    const application = this.applicationRepo.create({
      restaurantId,
      badgeId: dto.badgeId,
      submittedByOwnerAccountId: user.sub,
      businessLicenseUrl: dto.businessLicenseUrl,
      businessLicensePublicId: dto.businessLicensePublicId,
      foodSafetyCertUrl: dto.foodSafetyCertUrl,
      foodSafetyCertPublicId: dto.foodSafetyCertPublicId,
      status: BadgeApplicationStatus.Pending,
      submittedAt: new Date(),
    });

    const saved = await this.applicationRepo.save(application);
    return this.findApplicationResponse(saved.appId);
  }

  async getLatestApplication(restaurantId: number, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const application = await this.applicationRepo.findOne({
      where: {
        restaurantId,
        submittedByOwnerAccountId: user.sub,
      },
      relations: {
        badge: true,
      },
      order: {
        submittedAt: 'DESC',
        appId: 'DESC',
      },
    });

    if (!application) {
      return {
        status: 'NotSubmitted',
        application: null,
      };
    }

    return {
      status: application.status,
      application: this.toResponse(application),
    };
  }

  async getApplication(appId: number, user: JwtPayload) {
    const application = await this.applicationRepo.findOne({
      where: {
        appId,
        submittedByOwnerAccountId: user.sub,
      },
      relations: {
        badge: true,
        restaurant: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Verification application not found.');
    }

    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException(
        'Only restaurant owners can view this application.',
      );
    }

    return this.toResponse(application);
  }

  private async findApplicationResponse(appId: number) {
    const application = await this.applicationRepo.findOneOrFail({
      where: { appId },
      relations: {
        badge: true,
      },
    });

    return this.toResponse(application);
  }

  private uploadBuffer(
    file: UploadedVerificationFile,
    restaurantId: number,
    documentType: VerificationDocumentType,
  ) {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const folderSegment =
        documentType === 'business-license'
          ? 'business-license'
          : 'food-safety';

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `tabelink/restaurants/${restaurantId}/verification/${folderSegment}`,
          resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error('Cloudinary upload returned no result.'));
            return;
          }

          resolve(result);
        },
      );

      stream.end(file.buffer);
    });
  }

  private configureCloudinary() {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException('Cloudinary is not configured.');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  private async assertOwnerRestaurant(restaurantId: number, user: JwtPayload) {
    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException(
        'Only restaurant owners can manage verification applications.',
      );
    }

    const restaurant = await this.restaurantRepo.findOne({
      where: {
        restaurantId,
        ownerAccountId: user.sub,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found for this owner.');
    }
  }

  private toResponse(application: BadgeApplication) {
    return {
      appId: application.appId,
      restaurantId: application.restaurantId,
      badgeId: application.badgeId,
      badge: application.badge
        ? {
            badgeId: application.badge.badgeId,
            badgeCode: application.badge.badgeCode,
            badgeNameVn: application.badge.badgeNameVn,
            badgeNameJp: application.badge.badgeNameJp,
          }
        : null,
      submittedByOwnerAccountId: application.submittedByOwnerAccountId,
      businessLicenseUrl: application.businessLicenseUrl ?? null,
      businessLicensePublicId: application.businessLicensePublicId ?? null,
      foodSafetyCertUrl: application.foodSafetyCertUrl ?? null,
      foodSafetyCertPublicId: application.foodSafetyCertPublicId ?? null,
      status: application.status,
      submittedAt: application.submittedAt,
      reviewedByAdminId: application.reviewedByAdminId ?? null,
      reviewedAt: application.reviewedAt ?? null,
      reviewNote: application.reviewNote ?? null,
    };
  }
}
