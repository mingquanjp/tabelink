export type BlogRestaurantSearchItem = {
  restaurantId: number;
  nameVn: string;
  nameJp: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
};

export type BlogRestaurantSearchResponse = {
  keyword: string;
  items: BlogRestaurantSearchItem[];
};

export type BlogTag = {
  tagId: number;
  name: string;
};

export type BlogTagsResponse = {
  keyword: string;
  items: BlogTag[];
};

export type CreateBlogTagResponse = BlogTag & {
  created: boolean;
};

export type BlogMediaType = "Photo" | "Video";

export type UploadedBlogMedia = {
  mediaUrl: string;
  publicId: string;
  mediaType: BlogMediaType;
  resourceType: string;
  width: number | null;
  height: number | null;
  bytes: number;
  format: string;
  originalName: string;
};

export type BlogMediaPayload = {
  mediaUrl: string;
  mediaType: BlogMediaType;
  sortOrder?: number;
};

export type CreateRestaurantBlogPayload = {
  title?: string;
  content: string;
  tasteRating: number;
  hygieneRating: number;
  serviceRating: number;
  media?: BlogMediaPayload[];
  tagIds?: number[];
};

export type CreatedRestaurantBlog = {
  blogId: number;
  customerAccountId: number;
  restaurantId: number | null;
  title: string | null;
  content: string;
  tasteRating: number;
  hygieneRating: number;
  serviceRating: number;
  status: string;
  media: Array<
    BlogMediaPayload & {
      mediaId: number;
      sortOrder: number;
    }
  >;
  tags: BlogTag[];
  createdAt: string | Date;
  updatedAt: string | Date;
};
