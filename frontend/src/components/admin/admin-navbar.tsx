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

type AdminNavItem = {
  label: string;
  href: string;
};

const navItems: AdminNavItem[] = [
  { label: "アカウント管理", href: "/admin/accounts" },
  { label: "広告管理", href: "/admin/advertisements" },
  { label: "バッジ審査", href: "/admin/badge" },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutAccount();
    } catch {
      // Logout should still clear the local session and leave the admin area.
    } finally {
      clearAuthSessionCache();
      removeSessionCacheByPrefix("tabelink:admin:");
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <header className="fixed left-0 top-0 z-30 w-full border-b border-[#f1f1ee] bg-[#f9f9f6cc] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-[6px]">
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between px-8">
        <Link
          href="/admin/badge"
          className="font-brand text-2xl font-bold leading-8 tracking-[-1.2px] text-[#af111c]"
        >
          TABELINK
        </Link>

        <nav aria-label="Admin primary" className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex h-10 items-center border-b-2 font-jp text-sm font-medium leading-5 tracking-[0.35px] transition-colors ${
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="inline-flex size-9 items-center justify-center rounded text-[#5a6053] transition-colors hover:bg-[#f1f1ee] hover:text-[#1a1c1b]"
          >
            <Bell className="size-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Admin account menu"
                className="inline-flex size-9 items-center justify-center rounded-full text-[#5a6053] transition-colors hover:bg-[#f1f1ee] hover:text-[#1a1c1b]"
              >
                <User className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded border border-[#e2e3e0] bg-white p-2 shadow-[0_12px_24px_rgba(26,28,27,0.12)]"
            >
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 font-jp text-sm text-[#af111c] focus:bg-[#af111c0d] focus:text-[#af111c]"
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
