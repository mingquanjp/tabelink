import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/admin-header";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f7f5f1] text-[#1a1c1b]">
      <AdminHeader />
      {children}
    </div>
  );
}
