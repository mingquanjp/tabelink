export type UserBlogItem = {
  blogId: number;
  title: string;
  thumbnailUrl: string | null;
  content: string;
  restaurantName: string;
  location: string;
  tasteRating: number;
  hygieneRating: number;
  serviceRating: number;
  createdAt: string;
};

export type UserProfileResponse = {
  accountId: number;
  fullName: string;
  displayName: string | null;
  handle: string;
  avatarUrl: string | null;
  gender: string | null;
  nationality: string | null;
  purpose: string | null;
  followerCount: number;
  followingCount: number;
  blogCount: number;
  isMyProfile: boolean;
  isFollowing: boolean;
  blogs: UserBlogItem[];
};

export type UpdateProfileTextRequest = {
  fullName: string;
  displayName?: string;
  gender?: string;
  nationality?: string;
  purpose?: string;
};
export type UploadAvatarResponse = {
  message: string;
  avatarUrl: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
