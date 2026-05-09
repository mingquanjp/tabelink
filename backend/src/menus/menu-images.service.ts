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
import { Restaurant } from '../entities/restaurant.entity';
import { DeleteMenuImageDto } from './dto/delete-menu-image.dto';
import { UploadedMenuImageFile } from './menu-image-upload.types';

interface CloudinaryDestroyResult {
  result?: string;
}

@Injectable()
export class MenuImagesService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    private readonly configService: ConfigService,
  ) {}

  async upload(restaurantId: number, file: UploadedMenuImageFile | undefined, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);

    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, and WEBP images are allowed.');
    }

    this.configureCloudinary();
    const result = await this.uploadBuffer(file, restaurantId);

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

  async deleteUploaded(restaurantId: number, dto: DeleteMenuImageDto, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const publicId = dto.publicId.trim();
    const restaurantMenuFolder = `tabelink/restaurants/${restaurantId}/menus/`;

    if (!publicId.startsWith(restaurantMenuFolder)) {
      throw new BadRequestException('Image publicId does not belong to this restaurant menu folder.');
    }

    this.configureCloudinary();

    try {
      const result = (await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      })) as CloudinaryDestroyResult;

      return {
        deleted: result.result === 'ok' || result.result === 'not found',
        cloudinaryDeleted: result.result === 'ok',
        publicId,
        restaurantId,
      };
    } catch {
      throw new InternalServerErrorException('Failed to delete Cloudinary image.');
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

  private uploadBuffer(file: UploadedMenuImageFile, restaurantId: number) {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `tabelink/restaurants/${restaurantId}/menus`,
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

  private async assertOwnerRestaurant(restaurantId: number, user: JwtPayload) {
    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException('Only restaurant owners can upload menu images.');
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
}
