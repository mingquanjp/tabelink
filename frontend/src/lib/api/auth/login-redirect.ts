import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { MeResponse } from "@/lib/api/auth/type";

export function isRealCustomerSession(session: MeResponse | null) {
  return session?.account.role === "User";
}

export function redirectToLogin(router: AppRouterInstance, redirectPath?: string) {
  const nextPath =
    redirectPath ??
    (typeof window === "undefined"
      ? "/user/home"
      : `${window.location.pathname}${window.location.search}`);

  router.push(`/login?redirect=${encodeURIComponent(nextPath)}`);
}
