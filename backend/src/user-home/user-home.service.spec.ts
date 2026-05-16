import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { UserHomeService } from './user-home.service';

describe('UserHomeService', () => {
  let service: UserHomeService;
  let dataSource: { query: jest.Mock };

  const user = {
    sub: 12,
    email: 'user@example.com',
    role: AuthRole.User,
  };

  beforeEach(async () => {
    dataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserHomeService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get(UserHomeService);
  });

  it('returns profile summary with generated handle', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        accountId: '12',
        fullName: 'Nguyen Van A',
        displayName: 'A Nguyen',
        avatarUrl: 'https://example.com/avatar.jpg',
        followingCount: '20',
        followerCount: '35',
      },
    ]);

    await expect(service.getProfile(user)).resolves.toEqual({
      accountId: 12,
      fullName: 'Nguyen Van A',
      displayName: 'A Nguyen',
      handle: '@user12',
      avatarUrl: 'https://example.com/avatar.jpg',
      followingCount: 20,
      followerCount: 35,
    });
  });

  it('throws when customer profile is missing', async () => {
    dataSource.query.mockResolvedValueOnce([]);

    await expect(service.getProfile(user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns suggested reviewers with follow state', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        accountId: '5',
        fullName: 'Chef Sato',
        displayName: null,
        avatarUrl: null,
        nationality: 'Japan',
        followerCount: '1200',
        isFollowing: false,
      },
    ]);

    await expect(service.getSuggestedReviewers(user)).resolves.toEqual({
      items: [
        {
          accountId: 5,
          fullName: 'Chef Sato',
          displayName: null,
          handle: '@user5',
          avatarUrl: null,
          nationality: 'Japan',
          followerCount: 1200,
          isFollowing: false,
        },
      ],
    });
  });

  it('returns only SNS advertised restaurants with promotion content', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        promotionId: '10',
        restaurantId: '1',
        restaurantNameVN: 'Phở Hà Nội',
        restaurantNameJP: 'ハノイフォー',
        heroImageUrl: 'https://example.com/hero.jpg',
        contentVN: 'Nội dung quảng cáo',
        contentJP: '広告内容',
        averageRating: '4.7',
        reviewCount: '86',
      },
    ]);

    await expect(service.getAdvertisedRestaurants()).resolves.toEqual({
      items: [
        {
          promotionId: 10,
          restaurantId: 1,
          restaurantNameVN: 'Phở Hà Nội',
          restaurantNameJP: 'ハノイフォー',
          heroImageUrl: 'https://example.com/hero.jpg',
          contentVN: 'Nội dung quảng cáo',
          contentJP: '広告内容',
          averageRating: 4.7,
          reviewCount: 86,
        },
      ],
    });

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining("p.AdvertisementType = 'SNS'"),
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('p.ContentVN AS "contentVN"'),
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('p.ContentJP AS "contentJP"'),
    );
  });

  it('upserts reviewer follow relationship', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([]);

    await expect(service.followReviewer(5, user)).resolves.toEqual({
      accountId: 5,
      isFollowing: true,
    });

    expect(dataSource.query).toHaveBeenLastCalledWith(
      expect.stringContaining('INSERT INTO USER_FOLLOW'),
      [12, 5],
    );
  });

  it('rejects non-customer users', async () => {
    await expect(
      service.getProfile({
        sub: 1,
        email: 'owner@example.com',
        role: AuthRole.Owner,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
