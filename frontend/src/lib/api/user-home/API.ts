import { apiRequest } from "@/lib/api/client";
import type {
  UserHomeAdvertisedRestaurantsResponse,
  UserHomeHotRestaurantsResponse,
  UserHomeProfile,
  UserHomeReviewerFollowResponse,
  UserHomeSuggestedReviewersResponse,
  UserHomeTrendingTopicsResponse,
} from "@/lib/api/user-home/type";

export function getUserHomeProfile() {
  return apiRequest<UserHomeProfile>("/user/home/profile", { auth: true });
}

export function getUserHomeHotRestaurants() {
  return apiRequest<UserHomeHotRestaurantsResponse>(
    "/user/home/hot-restaurants",
  );
}

export function getUserHomeSuggestedReviewers() {
  return apiRequest<UserHomeSuggestedReviewersResponse>(
    "/user/home/suggested-reviewers",
    { auth: true },
  );
}

export function getUserHomeTrendingTopics() {
  return apiRequest<UserHomeTrendingTopicsResponse>(
    "/user/home/trending-topics",
  );
}

export function getUserHomeAdvertisedRestaurants() {
  return apiRequest<UserHomeAdvertisedRestaurantsResponse>(
    "/user/home/advertised-restaurants",
  );
}

export function followUserHomeReviewer(accountId: number) {
  return apiRequest<UserHomeReviewerFollowResponse>(
    `/user/reviewers/${accountId}/follow`,
    {
      auth: true,
      method: "POST",
    },
  );
}

export function unfollowUserHomeReviewer(accountId: number) {
  return apiRequest<UserHomeReviewerFollowResponse>(
    `/user/reviewers/${accountId}/follow`,
    {
      auth: true,
      method: "DELETE",
    },
  );
}
