import { apiRequest } from "@/lib/api/client";
import type {
  BlogRestaurantSearchResponse,
  BlogTagsResponse,
  CreateBlogTagResponse,
  CreateRestaurantBlogPayload,
  CreatedRestaurantBlog,
  UploadedBlogMedia,
} from "./type";

function withKeyword(path: string, keyword?: string) {
  const trimmed = keyword?.trim();

  if (!trimmed) {
    return path;
  }

  return `${path}?keyword=${encodeURIComponent(trimmed)}`;
}

export function searchBlogRestaurants(keyword?: string) {
  return apiRequest<BlogRestaurantSearchResponse>(
    withKeyword("/blogs/restaurants/search", keyword),
    { auth: true },
  );
}

export function listBlogTags(keyword?: string) {
  return apiRequest<BlogTagsResponse>(withKeyword("/blogs/tags", keyword), {
    auth: true,
  });
}

export function createBlogTag(name: string) {
  return apiRequest<CreateBlogTagResponse>("/blogs/tags", {
    auth: true,
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function uploadBlogMedia(restaurantId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<UploadedBlogMedia>(
    `/restaurants/${restaurantId}/blogs/media`,
    {
      auth: true,
      method: "POST",
      body: formData,
    },
  );
}

export function createRestaurantBlog(
  restaurantId: number,
  payload: CreateRestaurantBlogPayload,
) {
  return apiRequest<CreatedRestaurantBlog>(
    `/restaurants/${restaurantId}/blogs`,
    {
      auth: true,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteBlog(blogId: number) {
  return apiRequest<void>(`/blogs/${blogId}`, {
    auth: true,
    method: "DELETE",
  });
}
