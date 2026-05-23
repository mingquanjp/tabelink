import type { ReactNode } from "react";
import { AdminNavbar } from "@/components/admin/admin-navbar";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#f9f9f6]">
      <AdminNavbar />
      {children}
    </div>
  );
}
