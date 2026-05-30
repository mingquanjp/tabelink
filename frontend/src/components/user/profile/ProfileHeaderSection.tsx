"use client";

/* eslint-disable @next/next/no-img-element */
import { followUserHomeReviewer, unfollowUserHomeReviewer } from "@/lib/api/user-home/API";
import { UserProfileResponse } from "@/lib/api/user-profile/type";
import { normalizeErrorToastMessage } from "@/lib/app-toast";
import { useState } from "react";
import { ProfileEditModal } from "./ProfileEditModal";
import type { UserProfileBadge } from "./profile-data";

type ProfileHeaderSectionProps = {
  profile: UserProfileResponse;
  setProfile: React.Dispatch<React.SetStateAction<UserProfileResponse | null>>;
};


const badgeToneClasses: Record<UserProfileBadge["tone"], string> = {
  green: "bg-[#55785e] text-[#d7ffde]",
  red: "bg-[#ffdad6] text-[#930011]",
  sage: "bg-[#dfe5d4] text-[#606659]",
};


export function ProfileHeaderSection({ profile, setProfile }: ProfileHeaderSectionProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  if (!profile) return null;

  const handleFollowToggle = async () => {
    if (isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await unfollowUserHomeReviewer(profile.accountId);
      } else {
        await followUserHomeReviewer(profile.accountId);
      }

      setProfile((prev) => {
        if (!prev) return prev;
        const isNowFollowing = !prev.isFollowing;
        return {
          ...prev,
          isFollowing: isNowFollowing,
          followerCount: isNowFollowing ? prev.followerCount + 1 : Math.max(0, prev.followerCount - 1),
        };
      });
    } catch (err: unknown) {
      alert(
        normalizeErrorToastMessage(err instanceof Error ? err.message : undefined),
      );
    } finally {
      setIsFollowLoading(false);
    }
  };

  const stats = [
    { label: "レポート数", value: profile.blogCount },
    { label: "フォロワー", value: profile.followerCount },
    // { label: "保存済み", value: 56 }, Nếu BE chưa trả về savedCount thì để tạm hardcode
  ];
  const badges = [
    { label: "プロ・クリティック", tone: "green" as const },
    { label: "ハノイ居住者", tone: "sage" as const },
  ];

  return (
    <>
      <section
        className="flex items-start gap-8 pt-12 max-md:flex-col max-md:gap-6"
        aria-labelledby="profile-name"
      >
        <div className="size-40 shrink-0 rounded-xl bg-[linear-gradient(45deg,#af111c_0%,#d32f31_100%)] p-1 max-sm:size-32">
          <div className="size-full overflow-hidden rounded-xl border-4 border-[#f9f9f6] p-1">
            <img
              src={profile.avatarUrl ?? "/default-avatar.png"}
              alt={profile.fullName}
              className="size-full rounded-lg object-cover"
              draggable={false}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex w-full items-center gap-4 max-lg:flex-wrap">
            <h1
              id="profile-name"
              className="font-jp text-[30px] font-bold leading-9 tracking-[-0.75px] text-[#1a1c1b] max-sm:text-2xl"
            >
              {profile.fullName}
              <span className="ml-2 text-sm font-normal text-gray-400">{profile.handle}</span>
            </h1>

            {/* <div className="flex flex-wrap items-center gap-2">
              {badges.map((badge) => (
                <span
                  key={badge.label}
                  className={`rounded-xl px-3 py-1 font-jp text-[10px] font-bold uppercase leading-[15px] tracking-[1px] ${badgeToneClasses[badge.tone]}`}
                >
                  {badge.label}
                </span>
              ))}   không có badge nào từ BE/ DB nên tạm ẩn phần này đi
            </div> */}

            {/* <div className="ml-auto flex items-center gap-3 max-lg:ml-0 max-lg:w-full"> */}
            {/* <button
                type="button"
                className="rounded-xl border-2 border-[rgba(228,190,186,0.3)] px-[18px] py-2.5 font-jp text-xs font-bold uppercase leading-[18px] tracking-[1.2px] text-[#1a1c1b] transition-colors hover:bg-white"
                onClick={() => setIsEditModalOpen(true)}
              >
                プロフィールを編集
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#d32f2f] px-6 py-2.5 font-jp text-xs font-bold uppercase leading-[18px] tracking-[1.2px] text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] transition-colors hover:bg-[#af111c]"
              >
                フォローする
              </button>
            </div> */}
            <div className="ml-auto flex items-center gap-3">
              {profile.isMyProfile ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="rounded-xl border-2 border-[rgba(228,190,186,0.3)] px-[18px] py-2.5 font-bold"
                >
                  プロフィールを編集
                </button>
              ) : (
                <button className="rounded-xl bg-[#d32f2f] px-6 py-2.5 text-white"
                  onClick={handleFollowToggle}>
                  {profile.isFollowing ? "フォロー中" : "フォローする"}
                </button>
              )}
            </div>
          </div>

          <p className="max-w-[576px] font-jp text-base font-normal leading-6 text-[#5a6053]">
            {profile.purpose ?? "自己紹介がありません。"}
          </p>

          <div className="flex items-start gap-0 pt-2">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col ${index === 1 ? "mx-8 border-x border-[rgba(228,190,186,0.3)] px-8 max-sm:mx-4 max-sm:px-4" : ""}`}
              >
                <span className="font-brand text-xl font-extrabold leading-7 text-[#af111c]">
                  {stat.value}
                </span>
                <span className="font-jp text-[10px] font-medium uppercase leading-[15px] tracking-[1px] text-[#5a6053]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProfileEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        profile={profile}
        setProfile={setProfile}
      />
    </>
  );
}
