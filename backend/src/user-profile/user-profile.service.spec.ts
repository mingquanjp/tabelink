import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { beforeEach, describe, it } from 'node:test';
import { DataSource } from 'typeorm';
import { UserProfileService } from './user-profile.service';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    dataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
  });

  describe('getProfile', () => {
    it('nên trả về thông tin hồ sơ nếu tìm thấy', async () => {
      const mockRow = {
        accountId: '1',
        fullName: 'Sato Kenji',
        followerCount: '10',
        followingCount: '5',
      };
      dataSource.query.mockResolvedValue([mockRow]);

      const result = await service.getProfile(1, 1);
      expect(result.fullName).toBe('Sato Kenji');
      expect(result.isMyProfile).toBe(true);
      expect(result.accountId).toBe(1);
    });

    it('nên ném lỗi NotFoundException nếu không thấy user', async () => {
      dataSource.query.mockResolvedValue([]);
      await expect(service.getProfile(99, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changePassword', () => {
    it('nên ném lỗi nếu mật khẩu xác nhận không khớp', async () => {
      const dto = {
        currentPassword: 'old',
        newPassword: 'new123456',
        confirmPassword: 'wrong',
      };
      await expect(service.changePassword(1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('nên ném lỗi nếu mật khẩu hiện tại sai', async () => {
      dataSource.query.mockResolvedValue([{ PasswordHash: 'hashed_old' }]);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      const dto = {
        currentPassword: 'wrong_old',
        newPassword: 'new123456',
        confirmPassword: 'new123456',
      };
      await expect(service.changePassword(1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
