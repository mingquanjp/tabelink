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

  return (
    <header className="sticky top-0 z-30 border-b border-[#e7e5e426] bg-[#f9f9f6cc] backdrop-blur-[6px]">
      <div className="mx-auto flex h-20 w-full max-w-screen-2xl items-center justify-between px-8">
        <div className="flex items-center">
          <Link
            href="/user/home"
            className="font-brand text-2xl font-bold leading-8 tracking-[-1.20px] text-[#af111c]"
          >
            TABELINK
          </Link>
        </div>

        <nav
          aria-label="User navigation"
          className="hidden items-center gap-8 lg:flex"
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
                className={`inline-flex items-center pb-1 font-jp text-sm font-medium leading-5 tracking-[0.35px] transition-colors ${
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
          <button
            type="button"
            aria-label="Notifications"
            className="inline-flex items-center justify-center rounded-md text-stone-700 transition-colors hover:text-stone-900"
          >
            <Bell size={20} strokeWidth={2} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="User menu"
                className="inline-flex items-center justify-center rounded-full border border-accent-foreground p-0 text-stone-700 transition-colors hover:text-stone-900"
              >
                <UserRound size={20} strokeWidth={2} />
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
                onSelect={() => router.push("/user/home")}
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
