import {
  BadRequestException,
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
import { Restaurant } from './entities/restaurant.entity';
import { UploadedRestaurantImageFile } from './restaurant-image-upload.types';

@Injectable()
export class RestaurantImagesService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    private readonly configService: ConfigService,
  ) {}

  async upload(
    file: UploadedRestaurantImageFile | undefined,
    user: JwtPayload,
  ) {
    const restaurant = await this.assertOwnerRestaurant(user);

    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG, and WEBP images are allowed.',
      );
    }

    this.configureCloudinary();
    const result = await this.uploadBuffer(file, restaurant.restaurantId);

    return {
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
      originalName: file.originalname,
    };
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

  private uploadBuffer(
    file: UploadedRestaurantImageFile,
    restaurantId: number,
  ) {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `tabelink/restaurants/${restaurantId}/profile`,
          resource_type: 'image',
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

  private async assertOwnerRestaurant(user: JwtPayload) {
    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException(
        'Only restaurant owners can upload restaurant images.',
      );
    }

    const restaurant = await this.restaurantRepo.findOne({
      where: {
        ownerAccountId: user.sub,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found for this owner.');
    }

    return restaurant;
  }
}
