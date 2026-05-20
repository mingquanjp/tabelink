import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { AuthRole } from '../auth/auth.constants';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { BlogMediaService } from './blog-media.service';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

describe('BlogMediaService', () => {
  let service: BlogMediaService;
  let restaurantRepo: { findOne: jest.Mock };
  let configService: { get: jest.Mock };

  const user = {
    sub: 40,
    email: 'user@example.com',
    role: AuthRole.User,
  };

  const file = {
    buffer: Buffer.from('image'),
    mimetype: 'image/jpeg',
    originalname: 'pho.jpg',
    size: 1024,
  };

  beforeEach(async () => {
    restaurantRepo = {
      findOne: jest.fn().mockResolvedValue({ restaurantId: 1 }),
    };
    configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          CLOUDINARY_CLOUD_NAME: 'demo',
          CLOUDINARY_API_KEY: 'key',
          CLOUDINARY_API_SECRET: 'secret',
        };

        return values[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogMediaService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: restaurantRepo,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<BlogMediaService>(BlogMediaService);
    jest.clearAllMocks();
  });

  it('uploads blog photo media for customer users', async () => {
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (options, callback) => {
        callback(null, {
          secure_url: 'https://example.com/blogs/pho.jpg',
          public_id: 'tabelink/restaurants/1/blogs/pho',
          resource_type: options.resource_type,
          width: 1200,
          height: 800,
          bytes: 1024,
          format: 'jpg',
        });

        return {
          end: jest.fn(),
        };
      },
    );

    await expect(service.upload(1, file, user)).resolves.toEqual({
      mediaUrl: 'https://example.com/blogs/pho.jpg',
      publicId: 'tabelink/restaurants/1/blogs/pho',
      mediaType: 'Photo',
      resourceType: 'image',
      width: 1200,
      height: 800,
      bytes: 1024,
      format: 'jpg',
      originalName: 'pho.jpg',
    });

    expect(restaurantRepo.findOne).toHaveBeenCalledWith({
      where: { restaurantId: 1, status: 'Active' },
    });
  });

  it('uploads large blog videos without app-level size rejection', async () => {
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (options, callback) => {
        callback(null, {
          secure_url: 'https://example.com/blogs/video.mp4',
          public_id: 'tabelink/restaurants/1/blogs/video',
          resource_type: options.resource_type,
          bytes: 200 * 1024 * 1024,
          format: 'mp4',
        });

        return {
          end: jest.fn(),
        };
      },
    );

    await expect(
      service.upload(
        1,
        {
          ...file,
          mimetype: 'video/mp4',
          originalname: 'video.mp4',
          size: 200 * 1024 * 1024,
        },
        user,
      ),
    ).resolves.toMatchObject({
      mediaType: 'Video',
      resourceType: 'video',
    });
  });

  it('rejects images larger than 20MB', async () => {
    await expect(
      service.upload(
        1,
        {
          ...file,
          size: 20 * 1024 * 1024 + 1,
        },
        user,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  it('rejects unsupported media types', async () => {
    await expect(
      service.upload(
        1,
        {
          ...file,
          mimetype: 'application/pdf',
          originalname: 'menu.pdf',
        },
        user,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects non-customer users', async () => {
    await expect(
      service.upload(1, file, {
        sub: 5,
        email: 'owner@example.com',
        role: AuthRole.Owner,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects missing restaurants', async () => {
    restaurantRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.upload(404, file, user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
