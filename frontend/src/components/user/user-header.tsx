"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bell, LogOut, Menu, UserRound, X } from "lucide-react";
import { logoutAccount } from "@/lib/api/auth/API";
import { getUserNotifications } from "@/lib/api/notifications/API";
import {
  clearAuthSessionCache,
  getAuthSession,
  readCachedAuthSession,
} from "@/lib/api/auth/session";
import { isRealCustomerSession } from "@/lib/api/auth/login-redirect";
import type { MeResponse } from "@/lib/api/auth/type";
import { removeSessionCacheByPrefix } from "@/lib/api/cache";
import type { UserNotification } from "@/lib/api/notifications/type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type UserHeaderNavItem = {
  label: string;
  href: string;
};

type UserHeaderProps = {
  navItems?: UserHeaderNavItem[];
};

const defaultNavItems: UserHeaderNavItem[] = [
  { label: "ホーム", href: "/user/home" },
  { label: "マップ検索", href: "/user/map" },
  { label: "キャンペーン", href: "/user/campaigns" },
];
const readNotificationsStoragePrefix = "tabelink:user:read-notifications:";

function getDisplayName(session: MeResponse | null) {
  const profile = session?.profile;

  if (profile && typeof profile === "object") {
    const values = profile as {
      displayName?: unknown;
      fullName?: unknown;
      name?: unknown;
    };
    const name = values.displayName ?? values.fullName ?? values.name;

    if (typeof name === "string" && name.trim()) {
      return name.trim();
    }
  }

  return session?.account.email ?? "Guest";
}

function getUserHandle(session: MeResponse | null) {
  const profile = session?.profile;

  if (profile && typeof profile === "object") {
    const values = profile as {
      username?: unknown;
      handle?: unknown;
    };
    const handle = values.username ?? values.handle;

    if (typeof handle === "string" && handle.trim()) {
      return handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`;
    }
  }

  const email = session?.account.email;

  if (!email) {
    return "@guest";
  }

  return `@${email.split("@")[0]}`;
}

function pickText(primary: string | null | undefined, fallback: string | null | undefined) {
  return primary?.trim() || fallback?.trim() || "";
}

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function readStoredNotificationIds(accountId: number) {
  if (typeof window === "undefined") {
    return new Set<number>();
  }

  try {
    const rawValue = window.localStorage.getItem(
      `${readNotificationsStoragePrefix}${accountId}`,
    );
    const ids = rawValue ? (JSON.parse(rawValue) as unknown) : [];

    return new Set(
      Array.isArray(ids)
        ? ids.filter((id): id is number => typeof id === "number")
        : [],
    );
  } catch {
    return new Set<number>();
  }
}

function writeStoredNotificationIds(accountId: number, ids: Set<number>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    `${readNotificationsStoragePrefix}${accountId}`,
    JSON.stringify(Array.from(ids)),
  );
}

export function UserHeader({ navItems = defaultNavItems }: UserHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<MeResponse | null>(
    () => readCachedAuthSession() ?? null,
  );
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const nextSession = await getAuthSession();

      if (!cancelled) {
        setSession(nextSession);
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      if (session?.account.role !== "User") {
        setNotifications([]);
        setReadNotificationIds(new Set());
        return;
      }

      try {
        const data = await getUserNotifications();

        if (!cancelled) {
          setNotifications(data.items);
        }
      } catch {
        if (!cancelled) {
          setNotifications([]);
        }
      }
    }

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [session?.account.role]);

  useEffect(() => {
    let cancelled = false;
    const accountId = session?.account.accountId;

    void Promise.resolve().then(() => {
      if (cancelled) {
        return;
      }

      if (!accountId || session?.account.role !== "User") {
        setReadNotificationIds(new Set());
        return;
      }

      setReadNotificationIds(readStoredNotificationIds(accountId));
    });

    return () => {
      cancelled = true;
    };
  }, [session?.account.accountId, session?.account.role]);

  const displayName = useMemo(() => getDisplayName(session), [session]);
  const userHandle = useMemo(() => getUserHandle(session), [session]);
  const avatarUrl = useMemo(() => {
    const profile = session?.profile;
    if (profile && typeof profile === "object") {
      const p = profile as { avatarUrl?: string | null };
      return typeof p.avatarUrl === "string" ? p.avatarUrl : null;
    }
    return null;
  }, [session]);
  const isCustomer = isRealCustomerSession(session);
  const visibleNavItems = useMemo(
    () =>
      isCustomer
        ? navItems
        : navItems.filter((item) => item.href !== "/user/campaigns"),
    [isCustomer, navItems],
  );
  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !readNotificationIds.has(notification.notificationId),
      ).length,
    [notifications, readNotificationIds],
  );

  if (pathname.startsWith("/user/blog/create")) {
    return null;
  }

  async function handleLogout() {
    try {
      await logoutAccount();
    } catch {
      // Keep logout deterministic even when the API session is already gone.
    } finally {
      clearAuthSessionCache();
      removeSessionCacheByPrefix("tabelink:user:");
      router.replace("/login");
      router.refresh();
    }
  }

  function markNotificationAsRead(notificationId: number) {
    const accountId = session?.account.accountId;

    setReadNotificationIds((current) => {
      if (current.has(notificationId)) {
        return current;
      }

      const next = new Set(current);
      next.add(notificationId);

      if (accountId) {
        writeStoredNotificationIds(accountId, next);
      }

      return next;
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#e2e3e0] bg-[#f9f9f6] shadow-sm">
      <div className="mx-auto flex h-24 w-full max-w-screen-2xl items-center justify-between px-8">
        <div className="flex items-center">
          <Link
            href="/user/home"
            className="font-brand text-3xl font-bold leading-9 tracking-[-1.20px] text-[#af111c]"
          >
            TABELINK
          </Link>
        </div>

        <nav
          aria-label="User navigation"
          className="hidden items-center gap-8 lg:flex"
        >
          {visibleNavItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center pb-1 font-jp text-lg font-medium leading-7 tracking-[0.15px] transition-colors ${
                  isActive
                    ? "border-b-2 border-[#af111c] text-[#af111c]"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {isCustomer ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative inline-flex items-center justify-center rounded-md text-stone-700 transition-colors hover:text-stone-900"
                >
                  <Bell size={20} strokeWidth={2} />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-[#af111c] px-1 text-center font-manrope text-[10px] font-bold leading-4 text-white">
                      {Math.min(unreadCount, 9)}
                    </span>
                  ) : null}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 rounded-none border border-[#e2e3e0] bg-white p-0 shadow-[0_12px_24px_rgba(26,28,27,0.12)]"
              >
              <div className="border-b border-[#eeeeeb] px-4 py-3">
                <p className="font-jp text-sm font-semibold text-[#1a1c1b]">
                  通知
                </p>
              </div>
              {notifications.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => {
                    const isRead = readNotificationIds.has(
                      notification.notificationId,
                    );
                    const title =
                      pickText(notification.titleJp, notification.titleVn) ||
                      "レストランからのお知らせ";
                    const message = pickText(
                      notification.messageJp,
                      notification.messageVn,
                    );
                    const restaurantName =
                      pickText(
                        notification.restaurantNameJP,
                        notification.restaurantNameVN,
                      ) || "Restaurant";

                    return (
                      <DropdownMenuItem
                        key={notification.notificationId}
                        className={`block cursor-pointer rounded-none px-4 py-3 focus:bg-[#af111c0d] ${
                          isRead ? "bg-white opacity-70" : "bg-[#af111c05]"
                        }`}
                        onSelect={() => {
                          markNotificationAsRead(notification.notificationId);
                          router.push(
                            `/user/restaurants/${notification.restaurantId}`,
                          );
                        }}
                      >
                        <div className="flex gap-3">
                          {notification.mediaUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={notification.mediaUrl}
                              alt=""
                              className="h-12 w-12 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-[#f4f4f1] text-[#af111c]">
                              <Bell size={18} strokeWidth={2} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                              {!isRead ? (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-[#af111c]" />
                              ) : null}
                              <p className="truncate font-jp text-sm font-semibold text-[#1a1c1b]">
                                {title}
                              </p>
                            </div>
                            <p className="truncate pt-0.5 font-jp text-xs text-[#5a6053]">
                              {restaurantName}
                            </p>
                            {message ? (
                              <p className="line-clamp-2 pt-1 font-jp text-xs leading-5 text-[#5a6053]">
                                {message}
                              </p>
                            ) : null}
                            <p className="pt-1 font-manrope text-[10px] font-semibold text-[#8f6f6c]">
                              {formatNotificationDate(notification.startDate)}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-8 text-center font-jp text-sm text-[#5a6053]">
                  新しい通知はありません。
                </div>
              )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {isCustomer ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="User menu"
                  className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-[#e2e3e0] bg-[#f4f4f1] text-stone-600 transition-colors hover:border-[#af111c] hover:text-stone-900"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={18} strokeWidth={2} />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-none border border-[#e2e3e0] bg-white p-3 shadow-[0_12px_24px_rgba(26,28,27,0.12)]"
              >
                <div className="px-1 pb-2">
                  <p className="truncate text-sm font-semibold leading-5 text-[#1a1c1b]">
                    {displayName}
                  </p>
                  <p className="truncate text-[11px] leading-4 text-[#5a6053]">
                    {userHandle}
                  </p>
                </div>

                <DropdownMenuItem
                  className="mb-1 flex cursor-pointer items-center gap-2 rounded-none px-3 py-2 text-sm text-[#1a1c1b] focus:bg-[#af111c0d] focus:text-[#1a1c1b]"
                  onSelect={() => router.push("/user/profile")}
                >
                  <UserRound className="size-4" strokeWidth={2} />
                  プロフィールを表示
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-2 rounded-none px-3 py-2 text-sm text-[#af111c] focus:bg-[#af111c0d] focus:text-[#af111c]"
                  onSelect={handleLogout}
                >
                  <LogOut className="size-[18px]" strokeWidth={2} />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/register"
                className="inline-flex h-9 items-center rounded-md border border-[#e2e3e0] px-4 font-jp text-sm font-semibold text-[#1a1c1b] transition-colors hover:bg-white"
              >
                新規登録
              </Link>
              <Link
                href="/login"
                className="inline-flex h-9 items-center rounded-md bg-[#af111c] px-4 font-jp text-sm font-semibold text-white transition-colors hover:bg-[#980f19]"
              >
                ログイン
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="inline-flex size-10 items-center justify-center rounded-md text-stone-700 transition-colors hover:text-stone-900 lg:hidden"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
        >
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isMobileMenuOpen ? (
        <nav
          aria-label="User mobile navigation"
          className="flex w-full flex-col gap-1 border-t border-[rgba(228,190,186,0.1)] bg-[#f9f9f6] px-8 py-4 lg:hidden"
        >
          {visibleNavItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-jp text-[16px] font-medium leading-6 tracking-[-0.4px] ${
                  isActive ? "text-[#af111c]" : "text-[#5a6053]"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
      {isMobileMenuOpen && !isCustomer ? (
        <div className="flex gap-2 border-t border-[rgba(228,190,186,0.1)] bg-[#f9f9f6] px-8 pb-4 lg:hidden">
          <Link
            href="/register"
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-[#e2e3e0] font-jp text-sm font-semibold text-[#1a1c1b]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            新規登録
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#af111c] font-jp text-sm font-semibold text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ログイン
          </Link>
        </div>
      ) : null}
    </header>
  );
}
