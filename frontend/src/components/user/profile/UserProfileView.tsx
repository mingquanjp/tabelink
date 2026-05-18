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

  if (loading) return <div>読み込み中......</div>;
  if (!data) return <div>ユーザーが見つかりません</div>;
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f9f6] text-[#1a1c1b]">
      <div className="mx-auto w-full max-w-[1024px] px-6 pb-24">
        <ProfileHeaderSection
          profile={data}
          setProfile={setData}
        />
        <ProfileTabs />
        <FoodReportGrid
          blogs={data.blogs}
          isFollowingAuthor={data.isFollowing}
          isMyProfile={data.isMyProfile}
          onFollowToggle={() => setData((prev) => prev ? {
            ...prev, isFollowing: !prev.isFollowing,
            followerCount: prev.isFollowing ? prev.followerCount - 1 : prev.followerCount + 1
          } : prev)}
        />
      </div>
    </main>
  );
}
