"use client";

import Link from "next/link";
import { Bell, User, Plus, Search, Utensils, Info, Camera, Trash2, Save, ChevronRight, Circle } from "lucide-react";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "ホーム", href: "/owner/home", label: "HOME" },
  { name: "ダッシュボード", href: "/owner/dashboard", label: "DASHBOARD" },
  { name: "メニュー管理", href: "/owner/menu", label: "MENU" },
  { name: "予約管理", href: "/owner/reservations", label: "RESERVATIONS" },
  { name: "キャンペーン/広告", href: "/owner/campaigns", label: "CAMPAIGNS" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f9f9f6]/80 backdrop-blur-md border-b border-[#e7e5e4]/15 shadow-sm">
      <div className="max-w-[1536px] mx-auto px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-[#af111c] tracking-[-1.2px] font-brand">
            TABELINK
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-[14px] font-medium tracking-[0.35px] uppercase transition-colors ${
                  isActive ? "text-[#af111c]" : "text-[#57534e] hover:text-[#1a1c1b]"
                }`}
              >
                {link.name}
                {isActive && (
                  <div className="absolute -bottom-[28px] left-0 right-0 h-0.5 bg-[#af111c]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-[#57534e] hover:bg-[#af111c]/5 rounded-lg transition-colors">
            <Bell className="size-5" />
          </button>
          <button className="p-2 text-[#57534e] hover:bg-[#af111c]/5 rounded-lg transition-colors">
            <User className="size-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
