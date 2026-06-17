export type UserFeedAuthor = {
  accountId: number;
  name: string;
  handle: string;
  avatarUrl: string | null;
};

export type UserFeedHashtag = {
  tagId: number;
  name: string;
};

export type UserFeedMedia = {
  mediaId: number;
  mediaUrl: string;
  mediaType: "Photo" | "Video";
  sortOrder: number;
};

export type UserFeedRatings = {
  taste: number | null;
  hygiene: number | null;
  service: number | null;
};

export type UserFeedPost = {
  blogId: number;
  restaurantId: number | null;
  author: UserFeedAuthor;
  createdAt: string;
  hashtags: UserFeedHashtag[];
  title: string | null;
  content: string;
  media: UserFeedMedia[];
  ratings: UserFeedRatings;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
};

export type UserFeedPagination = {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
};

export type UserFeedResponse = {
  items: UserFeedPost[];
  pagination: UserFeedPagination;
};

export type UserFeedComment = {
  commentId: number;
  author: UserFeedAuthor;
  content: string;
  createdAt: string;
};

export type UserFeedPostDetail = UserFeedPost & {
  comments: UserFeedComment[];
};

export type UserFeedCommentsResponse = {
  items: UserFeedComment[];
  pagination: UserFeedPagination;
};

export type UserFeedLikeResponse = {
  blogId: number;
  isLiked: boolean;
};

export type CreateUserFeedCommentPayload = {
  content: string;
};

export type CreateUserFeedCommentResponse = {
  commentId: number;
  blogId: number;
  content: string;
  createdAt: string;
};
