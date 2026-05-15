import { FoodReportGrid } from "./FoodReportGrid";
import {
  foodReports,
  profileBadges,
  profileStats,
  profileSummary,
} from "./profile-data";
import { ProfileHeaderSection } from "./ProfileHeaderSection";
import { ProfileTabs } from "./ProfileTabs";

export function UserProfileView() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f9f6] text-[#1a1c1b]">
      <div className="mx-auto w-full max-w-[1024px] px-6 pb-24">
        <ProfileHeaderSection
          avatarUrl={profileSummary.avatarUrl}
          badges={profileBadges}
          description={profileSummary.description}
          name={profileSummary.name}
          stats={profileStats}
        />
        <ProfileTabs />
        <FoodReportGrid reports={foodReports} />
      </div>
    </main>
  );
}
