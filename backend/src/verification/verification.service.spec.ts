import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthRole } from '../auth/auth.constants';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { BadgeApplication } from './entities/badge-application.entity';
import { BadgeMaster } from './entities/badge-master.entity';
import { getLocalVerificationDocument } from './local-verification-document.store';
import { VerificationService } from './verification.service';

describe('VerificationService', () => {
  let service: VerificationService;
  const restaurantRepo = {
    findOne: jest.fn(),
  };
  const badgeRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const applicationRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOneOrFail: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };
  const ownerUser = {
    sub: 7,
    email: 'owner@example.com',
    role: AuthRole.Owner,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: restaurantRepo,
        },
        {
          provide: getRepositoryToken(BadgeMaster),
          useValue: badgeRepo,
        },
        {
          provide: getRepositoryToken(BadgeApplication),
          useValue: applicationRepo,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
  });

  it('keeps verification uploads working when Cloudinary is not configured', async () => {
    const fileBuffer = Buffer.from('fake image');
    restaurantRepo.findOne.mockResolvedValueOnce({ restaurantId: 1001 });
    configService.get.mockReturnValue(undefined);

    const result = await service.uploadDocument(
      1001,
      'business-license',
      {
        buffer: fileBuffer,
        mimetype: 'image/jpeg',
        originalname: 'license.jpg',
        size: fileBuffer.length,
      },
      ownerUser,
    );

    expect(result).toMatchObject({
      fileUrl: expect.stringContaining('https://tabelink.local/verification-documents/'),
      publicId: expect.stringContaining('local-verification/1001/business-license/'),
      resourceType: 'local',
      format: 'jpg',
      bytes: fileBuffer.length,
      originalName: 'license.jpg',
      documentType: 'business-license',
    });
    expect(getLocalVerificationDocument(result.publicId)?.buffer).toEqual(
      fileBuffer,
    );
  });
});
