"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, User } from "lucide-react";
import { logoutAccount } from "@/lib/api/auth/API";
import { clearAuthSessionCache } from "@/lib/api/auth/session";
import { removeSessionCacheByPrefix } from "@/lib/api/cache";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "アカウント管理", href: "/admin/accounts" },
  { label: "広告管理", href: "/admin/ads" },
  { label: "バッジ審査", href: "/admin/verifications" },
];

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutAccount();
    } catch {
      // Local cleanup and navigation should still happen if the server session is gone.
    } finally {
      clearAuthSessionCache();
      removeSessionCacheByPrefix("tabelink:admin:");
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#e4beba1a] bg-[#fbfaf7]/95 backdrop-blur-[6px]">
      <div className="mx-auto flex h-20 w-full max-w-screen-2xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/admin/accounts"
          className="flex shrink-0 items-center"
          aria-label="TABELINK admin home"
        >
          <span className="font-brand text-[24px] font-bold leading-8 tracking-normal text-[#af111c]">
            TABELINK
          </span>
        </Link>

        <nav
          aria-label="Admin navigation"
          className="hidden items-center gap-8 lg:flex"
        >
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex h-20 items-center border-b-2 font-jp text-[14px] font-medium leading-5 tracking-[0.35px] transition-colors ${
                  isActive
                    ? "border-[#af111c] text-[#af111c]"
                    : "border-transparent text-[#5a6053] hover:text-[#1a1c1b]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="inline-flex size-9 items-center justify-center rounded-[4px] text-[#5a6053] transition-colors hover:bg-[#f4f4f1] hover:text-[#1a1c1b]"
          >
            <Bell className="size-5" strokeWidth={2} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Admin account menu"
                className="inline-flex size-9 items-center justify-center rounded-full border border-[#d8d1ca] bg-white text-[#5a6053] transition-colors hover:border-[#af111c] hover:text-[#af111c]"
              >
                <User className="size-5" strokeWidth={2} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-[6px] border border-[#e2e3e0] bg-white p-3 shadow-[0_12px_24px_rgba(26,28,27,0.12)]"
            >
              <div className="px-1 pb-2">
                <p className="truncate font-jp text-[14px] font-semibold leading-5 text-[#1a1c1b]">
                  System Admin
                </p>
                <p className="truncate font-manrope text-[11px] leading-4 text-[#5a6053]">
                  @tabelink_admin
                </p>
              </div>
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 rounded-[4px] px-3 py-2 font-jp text-[14px] text-[#af111c] focus:bg-[#af111c0d] focus:text-[#af111c]"
                onSelect={handleLogout}
              >
                <LogOut className="size-4" />
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
