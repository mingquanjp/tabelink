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
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { UploadedBlogMediaFile } from './blog-media-upload.types';

const ALLOWED_BLOG_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_BLOG_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_BLOG_IMAGE_BYTES = 20 * 1024 * 1024;

@Injectable()
export class BlogMediaService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    private readonly configService: ConfigService,
  ) {}

  async upload(
    restaurantId: number,
    file: UploadedBlogMediaFile | undefined,
    user: JwtPayload,
  ) {
    await this.assertCustomerCanUpload(restaurantId, user);

    if (!file) {
      throw new BadRequestException('Blog media file is required.');
    }

    const mediaType = this.getMediaType(file.mimetype);
    this.assertMediaSize(file, mediaType);
    this.configureCloudinary();
    const result = await this.uploadBuffer(file, restaurantId, mediaType);

    return {
      mediaUrl: result.secure_url,
      publicId: result.public_id,
      mediaType,
      resourceType: result.resource_type,
      width: result.width ?? null,
      height: result.height ?? null,
      bytes: result.bytes,
      format: result.format,
      originalName: file.originalname,
    };
  }

  private getMediaType(mimetype: string): 'Photo' | 'Video' {
    if (ALLOWED_BLOG_IMAGE_TYPES.includes(mimetype)) {
      return 'Photo';
    }

    if (ALLOWED_BLOG_VIDEO_TYPES.includes(mimetype)) {
      return 'Video';
    }

    throw new BadRequestException(
      'Only JPG, PNG, WEBP, MP4, MOV, and WEBM blog media are allowed.',
    );
  }

  private assertMediaSize(
    file: UploadedBlogMediaFile,
    mediaType: 'Photo' | 'Video',
  ) {
    if (mediaType === 'Photo' && file.size > MAX_BLOG_IMAGE_BYTES) {
      throw new BadRequestException('Blog images must be 20MB or smaller.');
    }
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
    file: UploadedBlogMediaFile,
    restaurantId: number,
    mediaType: 'Photo' | 'Video',
  ) {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `tabelink/restaurants/${restaurantId}/blogs`,
          resource_type: mediaType === 'Video' ? 'video' : 'image',
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

  private async assertCustomerCanUpload(
    restaurantId: number,
    user: JwtPayload,
  ) {
    if (user.role !== AuthRole.User) {
      throw new ForbiddenException(
        'Only customer users can upload blog media.',
      );
    }

    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId, status: 'Active' },
    });

    if (!restaurant) {
      throw new NotFoundException('Active restaurant not found.');
    }
  }
}
