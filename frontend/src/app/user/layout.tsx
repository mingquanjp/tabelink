import type { ReactNode } from "react";
import { UserHeader } from "@/components/user";

type UserLayoutProps = {
  children: ReactNode;
};

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#f9f9f6]">
      <UserHeader />
      {children}
    </div>
  );
}
