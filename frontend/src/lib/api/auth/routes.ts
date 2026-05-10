import type { AuthAccountRole } from "@/lib/api/auth/type";

export function getAuthenticatedRedirectPath(role: AuthAccountRole) {
  if (role === "Owner") {
    return "/owner/home";
  }

  return "/";
}

export function canAccessOwnerRoutes(role: AuthAccountRole) {
  return role === "Owner";
}
