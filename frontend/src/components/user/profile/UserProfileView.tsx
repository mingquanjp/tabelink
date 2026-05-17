"use client";
import { getUserFullProfile } from "@/lib/api/user-profile/API";
import { UserProfileResponse } from "@/lib/api/user-profile/type";
import { useEffect, useState } from "react";
import { FoodReportGrid } from "./FoodReportGrid";
import { ProfileHeaderSection } from "./ProfileHeaderSection";
import { ProfileTabs } from "./ProfileTabs";

export function UserProfileView({ accountId }: { accountId: number }) {
  const [data, setData] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getUserFullProfile(accountId)
      .then((res) => setData(res))
      .catch((err) => console.error("Lỗi:", err))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (loading) return <div>Đang tải...</div>;
  if (!data) return <div>Không tìm thấy người dùng</div>;
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f9f6] text-[#1a1c1b]">
      <div className="mx-auto w-full max-w-[1024px] px-6 pb-24">
        <ProfileHeaderSection
          profile={data}
        />
        <ProfileTabs />
        <FoodReportGrid
          blogs={data.blogs} />
      </div>
    </main>
  );
}
