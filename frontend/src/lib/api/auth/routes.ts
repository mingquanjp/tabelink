import type { AuthAccountRole } from "@/lib/api/auth/type";

function isRestaurantDetailPath(pathname: string) {
  return /^\/user\/restaurants\/[^/]+$/.test(pathname);
}

export function isGuestAccessiblePath(pathname: string) {
  return (
    pathname === "/user/home" ||
    pathname === "/user/map" ||
    isRestaurantDetailPath(pathname)
  );
}

export function getAuthenticatedRedirectPath(role: AuthAccountRole) {
  if (role === "Admin") {
    return "/admin/accounts";
  }

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

export function canAccessAdminRoutes(role: AuthAccountRole) {
  return role === "Admin";
}

export function canAccessUserRoutes(role: AuthAccountRole) {
  return role === "User" || role === "Guest";
}

export function canAccessPathForRole(pathname: string, role: AuthAccountRole) {
  if (pathname.startsWith("/admin")) {
    return role === "Admin";
  }

  if (pathname.startsWith("/owner")) {
    return role === "Owner";
  }

  if (pathname.startsWith("/user")) {
    if (role === "Guest") {
      return isGuestAccessiblePath(pathname);
    }

    return role === "User";
  }

  return true;
}

export function getPostLoginRedirectPath(
  requestedPath: string | null,
  role: AuthAccountRole,
) {
  if (
    requestedPath?.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    canAccessPathForRole(requestedPath, role)
  ) {
    return requestedPath;
  }

  return getAuthenticatedRedirectPath(role);
}
