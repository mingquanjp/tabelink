"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bell, LogOut, Menu, UserRound, X } from "lucide-react";
import { logoutAccount } from "@/lib/api/auth/API";
import {
  clearAuthSessionCache,
  getAuthSession,
  readCachedAuthSession,
} from "@/lib/api/auth/session";
import type { MeResponse } from "@/lib/api/auth/type";
import { removeSessionCacheByPrefix } from "@/lib/api/cache";
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
  { label: "予約", href: "/user/reservations" },
  { label: "キャンペーン", href: "/user/campaigns" },
];

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

export function UserHeader({ navItems = defaultNavItems }: UserHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<MeResponse | null>(
    () => readCachedAuthSession() ?? null,
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

  const displayName = useMemo(() => getDisplayName(session), [session]);
  const userHandle = useMemo(() => getUserHandle(session), [session]);

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

  return (
    <header className="sticky top-0 z-30 flex w-full flex-col items-start bg-[rgba(249,249,246,0.8)] shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-[6px]">
      <div className="relative mx-auto flex h-20 w-full max-w-[1536px] items-center justify-between px-8">
        <Link
          href="/user/home"
          className="font-brand text-[24px] font-bold leading-8 tracking-[-1.2px] text-[#af111c]"
        >
          TABELINK
        </Link>

        <nav
          aria-label="User navigation"
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 lg:flex"
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-jp text-[16px] font-medium leading-6 tracking-[-0.4px] transition-colors ${
                  isActive
                    ? "border-b-2 border-[#af111c] pb-1.5 text-[#af111c]"
                    : "text-[#5a6053] hover:text-[#1a1c1b]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <button
            type="button"
            aria-label="Notifications"
            className="inline-flex h-5 w-4 items-center justify-center text-[#5a6053] transition-colors hover:text-[#1a1c1b]"
          >
            <Bell className="size-5" strokeWidth={2} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="User menu"
                className="inline-flex size-5 items-center justify-center text-[#5a6053] transition-colors hover:text-[#1a1c1b]"
              >
                <UserRound className="size-5" strokeWidth={2} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={12}
              className="w-56 rounded-lg border border-[rgba(228,190,186,0.1)] bg-white px-px py-[9px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]"
            >
              <div className="border-b border-[rgba(228,190,186,0.1)] px-4 pb-[13px] pt-3">
                <p className="truncate font-manrope text-[14px] font-bold leading-5 text-[#1a1c1b]">
                  {displayName}
                </p>
                <p className="truncate font-manrope text-[10px] font-normal leading-[15px] text-[#5a6053]">
                  {userHandle}
                </p>
              </div>

              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-3 rounded-none px-4 pb-2 pt-3 font-jp text-[14px] font-medium leading-5 text-[#1a1c1b] focus:bg-[#af111c0d] focus:text-[#1a1c1b]"
                onSelect={() => router.push("/user/profile")}
              >
                <UserRound className="size-4" strokeWidth={2} />
                プロフィールを表示
              </DropdownMenuItem>

              <div className="h-px w-full bg-[rgba(228,190,186,0.1)]" />

              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-3 rounded-none px-4 pb-2 pt-3 font-jp text-[14px] font-medium leading-5 text-[#af111c] focus:bg-[#af111c0d] focus:text-[#af111c]"
                onSelect={handleLogout}
              >
                <LogOut className="size-[18px]" strokeWidth={2} />
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="inline-flex size-10 items-center justify-center text-[#5a6053] lg:hidden"
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
          {navItems.map((item) => {
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
    </header>
  );
}
