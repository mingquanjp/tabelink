"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  canAccessPathForRole,
  canAccessOwnerRoutes,
  canAccessUserRoutes,
  getAuthenticatedRedirectPath,
  isGuestAccessiblePath,
} from "@/lib/api/auth/routes";
import { getAuthSession } from "@/lib/api/auth/session";

type ClientRouteGuardProps = {
  children: ReactNode;
};

function isPublicAuthPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/register");
}

function isOwnerPath(pathname: string) {
  return pathname.startsWith("/owner");
}

function isAdminPath(pathname: string) {
  return pathname.startsWith("/admin");
}

function isUserPath(pathname: string) {
  return pathname.startsWith("/user");
}

function hasSessionMarker() {
  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith("hasSession="));
}

export function ClientRouteGuard({ children }: ClientRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const verifyCurrentRoute = useCallback(async () => {
    if (
      !isPublicAuthPath(pathname) &&
      !isAdminPath(pathname) &&
      !isOwnerPath(pathname) &&
      !isUserPath(pathname)
    ) {
      return;
    }

    if (isPublicAuthPath(pathname)) {
      if (!hasSessionMarker()) {
        return;
      }

      const session = await getAuthSession();

      if (session && session.account.role !== "Guest") {
        router.replace(getAuthenticatedRedirectPath(session.account.role));
      }

      return;
    }

    if (isUserPath(pathname) && isGuestAccessiblePath(pathname) && !hasSessionMarker()) {
      return;
    }

    const session = await getAuthSession();

    if (!session) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isAdminPath(pathname) && session.account.role !== "Admin") {
      router.replace(getAuthenticatedRedirectPath(session.account.role));
      return;
    }

    if (isOwnerPath(pathname) && (!canAccessOwnerRoutes(session.account.role) || !session.restaurant)) {
      router.replace(getAuthenticatedRedirectPath(session.account.role));
      return;
    }

    if (isUserPath(pathname) && !canAccessUserRoutes(session.account.role)) {
      router.replace(getAuthenticatedRedirectPath(session.account.role));
      return;
    }

    if (!canAccessPathForRole(pathname, session.account.role)) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  useEffect(() => {
    verifyCurrentRoute();
  }, [verifyCurrentRoute]);

  useEffect(() => {
    function handlePageShow() {
      verifyCurrentRoute();
    }

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [verifyCurrentRoute]);

  return children;
}
