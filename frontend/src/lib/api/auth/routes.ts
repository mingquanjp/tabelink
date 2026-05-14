import type { AuthAccountRole } from "@/lib/api/auth/type";

export function getAuthenticatedRedirectPath(role: AuthAccountRole) {
  if (role === "Owner") {
    return "/owner/home";
  }

  if (role === "User" || role === "Guest") {
    return "/user/home";
  }

  return "/";
}

export function canAccessOwnerRoutes(role: AuthAccountRole) {
  return role === "Owner";
}

export function canAccessUserRoutes(role: AuthAccountRole) {
  return role === "User" || role === "Guest";
}
