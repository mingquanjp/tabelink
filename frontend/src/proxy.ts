import { NextResponse, type NextRequest } from "next/server";

function isPublicAuthPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/register");
}

export function proxy(request: NextRequest) {
  if (!isPublicAuthPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");

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
