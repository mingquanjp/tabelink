export type UserHomeProfile = {
  accountId: number;
  fullName: string;
  displayName: string | null;
  handle: string;
  avatarUrl: string | null;
  postCount: number;
  followingCount: number;
  followerCount: number;
};

export type UserHomeHotRestaurant = {
  restaurantId: number;
  nameVN: string;
  nameJP: string;
  heroImageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  positiveReviewCount: number;
};

export type UserHomeHotRestaurantsResponse = {
  items: UserHomeHotRestaurant[];
};

export type UserHomeSuggestedReviewer = {
  accountId: number;
  fullName: string;
  displayName: string | null;
  handle: string;
  avatarUrl: string | null;
  nationality: string | null;
  followerCount: number;
  isFollowing: boolean;
};

export type UserHomeSuggestedReviewersResponse = {
  items: UserHomeSuggestedReviewer[];
};

export type UserHomeTrendingTopic = {
  tagId: number;
  name: string;
  usedCount: number;
};

export type UserHomeTrendingTopicsResponse = {
  items: UserHomeTrendingTopic[];
};

export type UserHomeAdvertisedRestaurant = {
  promotionId: number;
  restaurantId: number;
  restaurantNameVN: string;
  restaurantNameJP: string;
  heroImageUrl: string | null;
  contentVN: string | null;
  contentJP: string | null;
  averageRating: number;
  reviewCount: number;
};

export type UserHomeAdvertisedRestaurantsResponse = {
  items: UserHomeAdvertisedRestaurant[];
};

export type UserHomeReviewerFollowResponse = {
  accountId: number;
  isFollowing: boolean;
};
