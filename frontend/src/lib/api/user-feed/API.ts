import { apiRequest } from "@/lib/api/client";
import type {
  CreateUserFeedCommentPayload,
  CreateUserFeedCommentResponse,
  UserFeedCommentsResponse,
  UserFeedLikeResponse,
  UserFeedPostDetail,
  UserFeedResponse,
} from "@/lib/api/user-feed/type";

export function getUserFeed(params: { page?: number; limit?: number } = {}) {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();

  return apiRequest<UserFeedResponse>(`/user/feed${query ? `?${query}` : ""}`, {
    auth: true,
  });
}

export function getUserFeedPostDetail(blogId: number) {
  return apiRequest<UserFeedPostDetail>(`/user/posts/${blogId}`, {
    auth: true,
  });
}

export function getUserFeedPostComments(
  blogId: number,
  params: { page?: number; limit?: number } = {},
) {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();

  return apiRequest<UserFeedCommentsResponse>(
    `/user/posts/${blogId}/comments${query ? `?${query}` : ""}`,
    { auth: true },
  );
}

export function likeUserFeedPost(blogId: number) {
  return apiRequest<UserFeedLikeResponse>(`/user/posts/${blogId}/like`, {
    auth: true,
    method: "POST",
  });
}

export function unlikeUserFeedPost(blogId: number) {
  return apiRequest<UserFeedLikeResponse>(`/user/posts/${blogId}/like`, {
    auth: true,
    method: "DELETE",
  });
}

export function createUserFeedPostComment(
  blogId: number,
  payload: CreateUserFeedCommentPayload,
) {
  return apiRequest<CreateUserFeedCommentResponse>(
    `/user/posts/${blogId}/comments`,
    {
      auth: true,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
