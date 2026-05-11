import { NextResponse, type NextRequest } from "next/server";

type JwtPayload = {
  exp?: number;
  role?: string;
};

function decodeJwtPayload(token?: string): JwtPayload | null {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );

    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

function isExpired(payload: JwtPayload | null) {
  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}

function getAuthenticatedRedirectPath(role?: string) {
  if (role === "Owner") {
    return "/owner/home";
  }

  return "/";
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  const redirectPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("redirect", redirectPath);

  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const payload = decodeJwtPayload(accessToken);
  const hasUsableAccessToken = Boolean(accessToken && !isExpired(payload));
  const hasSessionCookie = Boolean(hasUsableAccessToken || refreshToken);

  if (pathname === "/login" || pathname.startsWith("/register")) {
    if (hasUsableAccessToken && payload?.role === "Owner") {
      const url = request.nextUrl.clone();
      url.pathname = getAuthenticatedRedirectPath(payload?.role);
      url.search = "";

      return NextResponse.redirect(url);
    }

    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store");

    return response;
  }

  if (pathname.startsWith("/owner")) {
    if (!hasSessionCookie) {
      return redirectToLogin(request);
    }

    if (payload?.role && payload.role !== "Owner") {
      const url = request.nextUrl.clone();
      url.pathname = getAuthenticatedRedirectPath(payload.role);
      url.search = "";

      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register/:path*", "/owner/:path*"],
};
