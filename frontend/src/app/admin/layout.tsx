import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/admin-header";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#f9f9f6]">
      <AdminHeader />
      {children}
    </div>
  );
}
