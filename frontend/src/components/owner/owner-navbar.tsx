"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bell, LogOut, User } from "lucide-react";
import { logoutAccount } from "@/lib/api/auth/API";
import {
    clearAuthSessionCache,
    getAuthSession,
    readCachedAuthSession,
} from "@/lib/api/auth/session";
import type { AuthRestaurantContext } from "@/lib/api/auth/type";
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
    { label: "ホーム", href: "/owner/home" },
    { label: "ダッシュボード", href: "/owner/dashboard" },
    { label: "メニュー管理", href: "/owner/menu" },
    { label: "予約管理", href: "/owner/reservations" },
    { label: "キャンペーン/広告", href: "/owner/campaigns" },
];


export function OwnerNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<AuthRestaurantContext | null>(
        () => readCachedAuthSession()?.restaurant ?? null
    );

    useEffect(() => {
        let cancelled = false;

        async function loadRestaurantContext() {
            const session = await getAuthSession();

            if (!cancelled) {
                setRestaurant(session?.restaurant ?? null);
            }
        }

        loadRestaurantContext();

        return () => {
            cancelled = true;
        };
    }, []);

    const restaurantName = restaurant?.nameVn || restaurant?.nameJp || "Restaurant";
    const restaurantHandle = useMemo(() => {
        const normalized = restaurantName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");

        return normalized ? `@${normalized}` : "@restaurant";
    }, [restaurantName]);

    async function handleLogout() {
        try {
            await logoutAccount();
        } catch {
            // Logout still navigates to the login page even if the local session is already cleared.
        } finally {
            clearAuthSessionCache();
            removeSessionCacheByPrefix("tabelink:owner:");
            router.replace("/login");
            router.refresh();
        }
    }

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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="Account menu"
                                className="inline-flex items-center justify-center rounded-full border p-0 text-stone-700 transition-colors hover:text-stone-900 border-accent-foreground"
                            >
                                <User size={20} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-56 rounded-none border border-[#e2e3e0] bg-white p-3 shadow-[0_12px_24px_rgba(26,28,27,0.12)]"
                        >
                            <div className="px-1 pb-2">
                                <p className="truncate text-sm font-semibold leading-5 text-[#1a1c1b]">
                                    {restaurantName}
                                </p>
                                <p className="truncate text-[11px] leading-4 text-[#5a6053]">
                                    {restaurantHandle}
                                </p>
                            </div>
                            <DropdownMenuItem
                                className="mb-1 flex cursor-pointer items-center gap-2 rounded-none px-3 py-2 text-sm text-[#1a1c1b] focus:bg-[#af111c0d] focus:text-[#1a1c1b]"
                                onSelect={() => router.push("/owner/home")}
                            >
                                <User className="size-4" />
                                レストラン詳細を表示
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex cursor-pointer items-center gap-2 rounded-none px-3 py-2 text-sm  text-[#af111c] focus:bg-[#af111c0d] focus:text-[#af111c]"
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
