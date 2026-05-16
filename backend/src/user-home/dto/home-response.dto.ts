export class HomeProfileResponseDto {
  accountId!: number;
  fullName!: string;
  displayName!: string | null;
  handle!: string;
  avatarUrl!: string | null;
  followingCount!: number;
  followerCount!: number;
}

export class HotRestaurantResponseDto {
  restaurantId!: number;
  nameVN!: string;
  nameJP!: string;
  heroImageUrl!: string | null;
  averageRating!: number;
  reviewCount!: number;
  positiveReviewCount!: number;
}

export class SuggestedReviewerResponseDto {
  accountId!: number;
  fullName!: string;
  displayName!: string | null;
  handle!: string;
  avatarUrl!: string | null;
  nationality!: string | null;
  followerCount!: number;
  isFollowing!: boolean;
}

export class TrendingTopicResponseDto {
  tagId!: number;
  name!: string;
  usedCount!: number;
}

export class AdvertisedRestaurantResponseDto {
  promotionId!: number;
  restaurantId!: number;
  restaurantNameVN!: string;
  restaurantNameJP!: string;
  heroImageUrl!: string | null;
  contentVN!: string | null;
  contentJP!: string | null;
  averageRating!: number;
  reviewCount!: number;
}
