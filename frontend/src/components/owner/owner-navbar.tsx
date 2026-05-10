"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";

type NavItem = {
    label: string;
    href: string;
};

const navItems: NavItem[] = [
    { label: "ホーム", href: "/" },
    { label: "ダッシュボード", href: "/owner/dashboard" },
    { label: "メニュー管理", href: "/owner/menu" },
    { label: "予約管理", href: "/owner/reservations" },
    { label: "キャンペーン/広告", href: "/owner/campaigns" },
];


export function OwnerNavbar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-20 border-b border-[#e7e5e426] bg-[#f9f9f6cc] backdrop-blur-[6px]">
            <div className="mx-auto flex h-20 w-full max-w-screen-2xl items-center justify-between px-8">
                <div className="flex items-center">
                    <span className="font-brand text-2xl font-bold leading-8 tracking-[-1.20px] text-[#af111c]">
                        TABELINK
                    </span>
                </div>

                <nav aria-label="Primary" className="flex items-center gap-8">
                    {navItems.map((item) => {
                        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.label}
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

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        aria-label="Notifications"
                        className="inline-flex items-center justify-center rounded-md text-stone-700 transition-colors hover:text-stone-900"
                    >
                        <Bell size={20} />
                    </button>
                    <button
                        type="button"
                        aria-label="Settings"
                        className="inline-flex items-center justify-center rounded-full border p-0 text-stone-700 transition-colors hover:text-stone-900 border-accent-foreground"
                    >
                        <User size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
