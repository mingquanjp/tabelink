import type { ReactNode } from "react";
import { OwnerNavbar } from "../../components/owner/owner-navbar";

type OwnerLayoutProps = {
    children: ReactNode;
};

export default function OwnerLayout({ children }: OwnerLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-[#f9f9f6]">
            <OwnerNavbar />
            {children}
        </div>
    );
}
