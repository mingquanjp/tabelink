export class FeedAuthorDto {
  accountId!: number;
  name!: string;
  handle!: string;
  avatarUrl!: string | null;
}

export class FeedHashtagDto {
  tagId!: number;
  name!: string;
}

export class FeedMediaDto {
  mediaId!: number;
  mediaUrl!: string;
  mediaType!: 'Photo' | 'Video';
  sortOrder!: number;
}

export class FeedRatingsDto {
  taste!: number | null;
  hygiene!: number | null;
  service!: number | null;
}

export class FeedPostResponseDto {
  blogId!: number;
  author!: FeedAuthorDto;
  createdAt!: string;
  hashtags!: FeedHashtagDto[];
  title!: string | null;
  content!: string;
  media!: FeedMediaDto[];
  ratings!: FeedRatingsDto;
  likeCount!: number;
  commentCount!: number;
  isLiked!: boolean;
}

export class FeedPaginationDto {
  page!: number;
  limit!: number;
  total!: number;
  hasNext!: boolean;
}

export class CommentResponseDto {
  commentId!: number;
  author!: FeedAuthorDto;
  content!: string;
  createdAt!: string;
}
