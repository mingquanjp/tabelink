import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { JwtPayload } from '../auth/auth.types';
import { UploadedAdMediaFile } from './ads-media-upload.types';

interface OwnerRestaurantRow {
  restaurantId: number | string;
}

@Injectable()
export class AdsMediaService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async upload(file: UploadedAdMediaFile | undefined, user: JwtPayload) {
    const restaurantId = await this.resolveOwnerRestaurantId(user);

    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG, and WEBP images are allowed.',
      );
    }

    this.configureCloudinary();
    const result = await this.uploadBuffer(file, restaurantId);

    return {
      mediaUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
      originalName: file.originalname,
    };
  }

  private async resolveOwnerRestaurantId(user: JwtPayload) {
    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException(
        'Only restaurant owners can upload advertisement images.',
      );
    }

    const rows = await this.dataSource.query<OwnerRestaurantRow[]>(
      `
        SELECT RestaurantID AS "restaurantId"
        FROM RESTAURANT
        WHERE OwnerAccountID = $1
        ORDER BY RestaurantID ASC
        LIMIT 1
      `,
      [user.sub],
    );
    const firstResult = rows[0];
    const restaurant = Array.isArray(firstResult)
      ? (firstResult[0] as OwnerRestaurantRow | undefined)
      : firstResult;

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found for this owner.');
    }

    return Number(restaurant.restaurantId);
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

  private uploadBuffer(file: UploadedAdMediaFile, restaurantId: number) {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `tabelink/restaurants/${restaurantId}/ads`,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            const uploadError: Error =
              error instanceof Error
                ? error
                : new Error('Cloudinary upload failed.');
            reject(uploadError);
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
}
