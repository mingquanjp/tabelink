"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const navItems = [
  { label: "アカウント管理", href: "/admin/accounts" },
  { label: "広告・クーポン管理", href: "/admin/campaigns" },
  { label: "バッジ審査", href: "/admin/badge" },
];

export function AdminHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[#e8e8e5]/70 bg-[#f9f9f6cc] shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-[6px]">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-8">
        <Link
          href="/admin/badge"
          className="font-brand text-2xl font-bold leading-8 tracking-[-1.2px] text-[#d32f2f]"
        >
          TABELINK
        </Link>

        <nav aria-label="Admin" className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex h-12 items-center border-b-2 font-jp text-sm font-medium leading-5 tracking-[0.35px] transition-colors ${
                  isActive
                    ? "border-[#d32f2f] text-[#d32f2f]"
                    : "border-transparent text-[#5a6053] hover:text-[#1a1c1b]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label="Notifications"
          className="inline-flex size-9 items-center justify-center rounded-md text-[#5a6053] transition-colors hover:bg-[#f4f4f1] hover:text-[#1a1c1b]"
        >
          <Bell className="size-5" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
