import { apiRequest } from "@/lib/api/client";
import {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserProfileResponse,
} from "./type";

// Lấy thông tin đầy đủ cho trang Profile
export function getUserFullProfile(accountId?: number) {
  const url = accountId ? `/user-profile/${accountId}` : "/user-profile/me";
  return apiRequest<UserProfileResponse>(url, { auth: true });
}

// Cập nhật thông tin cá nhân
export function updateUserProfile(data: UpdateProfileRequest) {
  return apiRequest<{ message: string }>("/user-profile/me", {
    auth: true,
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
export function getBlogDetail(blogId: number) {
  return apiRequest<any>(`/user/posts/${blogId}`, { auth: true });
}

// Đổi mật khẩu
export function changeUserPassword(data: ChangePasswordRequest) {
  return apiRequest<{ message: string }>("/user-profile/me/password", {
    auth: true,
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
