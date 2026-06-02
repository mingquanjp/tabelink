import { apiRequest } from "@/lib/api/client";
import {
  ChangePasswordRequest,
  UpdateProfileTextRequest,
  UploadAvatarResponse,
  UserProfileResponse,
} from "./type";
import type { UserFeedPostDetail } from "@/lib/api/user-feed/type";

// Lấy thông tin đầy đủ cho trang Profile
export function getUserFullProfile(accountId?: number) {
  const url = accountId ? `/user-profile/${accountId}` : "/user-profile/me";
  return apiRequest<UserProfileResponse>(url, { auth: true });
}

// Cập nhật thông tin cá nhân
export function updateProfileText(data: UpdateProfileTextRequest) {
  return apiRequest<{ message: string }>("/user-profile/me", {
    auth: true,
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
export function uploadUserAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  return apiRequest<UploadAvatarResponse>("/user-profile/me/avatar", {
    auth: true,
    method: "POST",
    body: formData,
  });
}
export function getBlogDetail(blogId: number) {
  return apiRequest<UserFeedPostDetail>(`/user/posts/${blogId}`, { auth: true });
}

// Đổi mật khẩu
export function changeUserPassword(data: ChangePasswordRequest) {
  return apiRequest<{ message: string }>("/user-profile/me/password", {
    auth: true,
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
