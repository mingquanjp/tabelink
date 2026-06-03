import { NextResponse, type NextRequest } from "next/server";

type AuthRole = "Admin" | "Owner" | "User" | "Guest";

function isPublicAuthPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/register");
}

function isBackendApiPath(pathname: string) {
  return (
    pathname === "/health" ||
    pathname === "/db-health" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/maps/") ||
    pathname.startsWith("/restaurants/") ||
    pathname === "/campaigns" ||
    pathname.startsWith("/ads/") ||
    pathname.startsWith("/blogs/") ||
    pathname.startsWith("/menu-items/") ||
    pathname.startsWith("/user-profile/") ||
    pathname === "/user/feed" ||
    pathname.startsWith("/user/posts/") ||
    pathname.startsWith("/user/home/") ||
    pathname === "/user/notifications" ||
    pathname.startsWith("/user/reviewers/") ||
    pathname === "/owner/restaurant" ||
    pathname.startsWith("/owner/restaurant/") ||
    pathname.startsWith("/owner/restaurants/") ||
    pathname === "/owner/promotions" ||
    pathname.startsWith("/owner/promotions/") ||
    pathname === "/owner/campaigns" ||
    pathname.startsWith("/owner/ads/") ||
    pathname.startsWith("/owner/verification/") ||
    pathname === "/admin/users" ||
    pathname.startsWith("/admin/users/") ||
    pathname === "/admin/promotions" ||
    pathname.startsWith("/admin/promotions/") ||
    pathname.startsWith("/admin/verification/") ||
    /^\/admin\/restaurants\/[^/]+\/detail$/.test(pathname)
  );
}

function isAdminPath(pathname: string) {
  return pathname.startsWith("/admin");
}

function isOwnerPath(pathname: string) {
  return pathname.startsWith("/owner");
}

function isUserPath(pathname: string) {
  return pathname.startsWith("/user");
}

function isRestaurantDetailPath(pathname: string) {
  return /^\/user\/restaurants\/[^/]+$/.test(pathname);
}

function isGuestAccessiblePath(pathname: string) {
  return (
    pathname === "/user/home" ||
    pathname === "/user/map" ||
    isRestaurantDetailPath(pathname)
  );
}

function getAuthenticatedRedirectPath(role: AuthRole) {
  if (role === "Admin") {
    return "/admin/accounts";
  }

  if (role === "Owner") {
    return "/owner/home";
  }

  return "/user/home";
}

function canAccessPathForRole(pathname: string, role: AuthRole) {
  if (isAdminPath(pathname)) {
    return role === "Admin";
  }

  if (isOwnerPath(pathname)) {
    return role === "Owner";
  }

  if (isUserPath(pathname)) {
    if (role === "Guest") {
      return isGuestAccessiblePath(pathname);
    }

    return role === "User";
  }

  return true;
}

function decodeJwtPayload(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    );

    return JSON.parse(atob(paddedPayload)) as { role?: AuthRole };
  } catch {
    return null;
  }
}

function getSessionRole(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  const role = decodeJwtPayload(accessToken)?.role;

  if (
    role === "Admin" ||
    role === "Owner" ||
    role === "User" ||
    role === "Guest"
  ) {
    return role;
  }

  return null;
}

function redirect(request: NextRequest, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url));
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isBackendApiPath(pathname)) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.get("hasSession")?.value === "true";
  const role = getSessionRole(request);

  const response = NextResponse.next();

  if (isPublicAuthPath(pathname)) {
    response.headers.set("Cache-Control", "no-store");

    if (hasSession && role && role !== "Guest") {
      return redirect(request, getAuthenticatedRedirectPath(role));
    }

    return response;
  }

  if (isUserPath(pathname) && isGuestAccessiblePath(pathname) && !hasSession) {
    return response;
  }

  if (!hasSession) {
    return redirectToLogin(request);
  }

  if (role && !canAccessPathForRole(pathname, role)) {
    return redirect(request, getAuthenticatedRedirectPath(role));
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/register/:path*",
    "/admin/:path*",
    "/owner/:path*",
    "/user/:path*",
  ],
};
