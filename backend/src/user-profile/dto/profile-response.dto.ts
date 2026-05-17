export class UserProfileResponseDto {
  accountId!: number;
  fullName!: string;
  displayName!: string | null;
  handle!: string;
  avatarUrl!: string | null;
  gender!: string | null;
  nationality!: string | null;
  purpose!: string | null; // Intro/Bio
  followingCount!: number;
  followerCount!: number;
  blogCount!: number;
  isMyProfile!: boolean; // Để FE biết có hiện nút Edit hay không
}

export class UserBlogItemDto {
  blogId!: number;
  title!: string;
  thumbnailUrl!: string | null;
  restaurantName!: string;
  location!: string;
  rating!: number; // Trung bình cộng Taste, Hygiene, Service hoặc lấy Taste làm chính
  createdAt!: Date;
}
