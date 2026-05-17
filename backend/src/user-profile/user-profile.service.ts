import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserProfileService {
  constructor(private readonly dataSource: DataSource) {}
  async getProfile(targetAccountId: number, currentUserId: number) {
    const rows = await this.dataSource.query(
      `
      SELECT 
        cp.AccountID AS "accountId",
        cp.FullName AS "fullName",
        cp.DisplayName AS "displayName",
        cp.AvatarURL AS "avatarUrl",
        cp.Gender AS "gender",
        cp.Nationality AS "nationality",
        cp.Purpose AS "purpose",
        (SELECT COUNT(*) FROM USER_FOLLOW WHERE FollowedAccountID = cp.AccountID) AS "followerCount",
        (SELECT COUNT(*) FROM USER_FOLLOW WHERE FollowerAccountID = cp.AccountID) AS "followingCount",
        (SELECT COUNT(*) FROM BLOG_POST WHERE CustomerAccountID = cp.AccountID AND Status = 'Published') AS "blogCount",
        EXISTS (
          SELECT 1 FROM USER_FOLLOW 
          WHERE FollowerAccountID = $2 AND FollowedAccountID = cp.AccountID
        ) AS "isFollowing"
      FROM CUSTOMER_PROFILE cp
      WHERE cp.AccountID = $1
      `,
      [targetAccountId, currentUserId],
    );
    if (rows.rowCount === 0) {
      throw new NotFoundException('ユーザーが存在しません。');
    }
    const row = rows[0];
    if (!row) {
      throw new NotFoundException('プロフィールが見つかりません。');
    }

    return {
      ...row,
      accountId: Number(row.accountId),
      followerCount: Number(row.followerCount),
      followingCount: Number(row.followingCount),
      blogCount: Number(row.blogCount),
      handle: row.displayName ? `@${row.displayName}` : `@user${row.accountId}`,
      isMyProfile: targetAccountId === currentUserId,
    };
  }
  //  Lấy danh sách Blog của User
  async getUserBlogs(accountId: number) {
    return this.dataSource.query(
      `
      SELECT 
        bp.BlogID AS "blogId",
        bp.Title AS "title",
        bp.TasteRating AS "tasteRating",
        bp.HygieneRating AS "hygieneRating",
        bp.ServiceRating AS "serviceRating",
        bp.CreatedAt AS "createdAt",
        r.NameVN AS "restaurantName",
        r.Address AS "location",
        bm.MediaURL AS "thumbnailUrl"
      FROM BLOG_POST bp
      LEFT JOIN RESTAURANT r ON bp.RestaurantID = r.RestaurantID
      LEFT JOIN LATERAL (
        SELECT MediaURL FROM BLOG_MEDIA 
        WHERE BlogID = bp.BlogID 
        ORDER BY SortOrder ASC LIMIT 1
      ) bm ON TRUE
      WHERE bp.CustomerAccountID = $1 AND bp.Status = 'Published'
      ORDER BY bp.CreatedAt DESC
      `,
      [accountId],
    );
  }

  //   Cập nhật thông tin cá nhân
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const { fullName, displayName, gender, nationality, purpose, avatarUrl } =
      dto;
    await this.dataSource.query(
      `
      UPDATE CUSTOMER_PROFILE
      SET 
        FullName = COALESCE($1, FullName),
        DisplayName = COALESCE($2, DisplayName),
        Gender = COALESCE($3, Gender),
        Nationality = COALESCE($4, Nationality),
        Purpose = COALESCE($5, Purpose),
        AvatarURL = COALESCE($6, AvatarURL)
      WHERE AccountID = $7
      `,
      [fullName, displayName, gender, nationality, purpose, avatarUrl, userId],
    );

    return { message: 'プロフィールを更新しました。' };
  }

  //  Thay đổi mật khẩu
  async changePassword(userId: number, dto: ChangePasswordDto) {
    if (dto.newPassword.length < 8) {
      throw new BadRequestException(
        'パスワードは8文字以上で入力してください。',
      );
    }
    // console.log('DTO Password:', dto.currentPassword);
    // console.log('DB Row:', userId[0]);
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('確認用パスワードが一致しません。');
    }
    const users = await this.dataSource.query(
      'SELECT passwordhash FROM USER_ACCOUNT WHERE AccountID = $1',
      [userId],
    );
    if (!users[0]) throw new NotFoundException('ユーザーが存在しません。');
    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      users[0].passwordhash,
    );
    if (!isMatch) {
      throw new BadRequestException('現在のパスワードが正しくありません。');
    }
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(dto.newPassword, salt);

    await this.dataSource.query(
      'UPDATE USER_ACCOUNT SET passwordhash = $1, UpdatedAt = CURRENT_TIMESTAMP WHERE AccountID = $2',
      [newHash, userId],
    );
    return { message: 'パスワードを変更しました。' };
  }
}
