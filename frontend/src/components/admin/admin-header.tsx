"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, ShieldCheck, User } from "lucide-react";
import { logoutAccount } from "@/lib/api/auth/API";
import { clearAuthSessionCache } from "@/lib/api/auth/session";
import { removeSessionCacheByPrefix } from "@/lib/api/cache";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "ダッシュボード", href: "/admin" },
  { label: "アカウント管理", href: "/admin/accounts" },
  { label: "審査管理", href: "/admin/verifications" },
  { label: "操作ログ", href: "/admin/action-logs" },
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
    <header className="sticky top-0 z-30 border-b border-[#e6e1dc] bg-[#fbfaf7]/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-screen-2xl items-center justify-between px-5 md:px-8">
        <Link href="/admin/accounts" className="flex items-center gap-3">
          <span className="font-brand text-2xl font-bold leading-8 tracking-normal text-[#af111c]">
            TABELINK
          </span>
          <span className="hidden items-center gap-1 rounded-[4px] border border-[#d8d1ca] px-2 py-1 text-[11px] font-semibold uppercase text-[#5a6053] sm:inline-flex">
            <ShieldCheck className="size-3.5" />
            Admin
          </span>
        </Link>

        <nav
          aria-label="Admin navigation"
          className="hidden items-center gap-7 lg:flex"
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center pb-1 font-jp text-sm font-medium leading-5 tracking-normal transition-colors ${
                  isActive
                    ? "border-b-2 border-[#af111c] text-[#af111c]"
                    : "text-[#5a6053] hover:text-[#1a1c1b]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="inline-flex size-9 items-center justify-center rounded-[6px] text-[#5a6053] transition-colors hover:bg-[#f1efeb] hover:text-[#1a1c1b]"
          >
            <Bell className="size-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Admin account menu"
                className="inline-flex size-9 items-center justify-center rounded-full border border-[#d8d1ca] text-[#5a6053] transition-colors hover:bg-[#f1efeb] hover:text-[#1a1c1b]"
              >
                <User className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-[6px] border border-[#e2e3e0] bg-white p-3 shadow-[0_12px_24px_rgba(26,28,27,0.12)]"
            >
              <div className="px-1 pb-2">
                <p className="text-sm font-semibold text-[#1a1c1b]">
                  System Admin
                </p>
                <p className="text-[11px] text-[#5a6053]">@tabelink_admin</p>
              </div>
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 rounded-[4px] px-3 py-2 text-sm text-[#af111c] focus:bg-[#af111c0d] focus:text-[#af111c]"
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
