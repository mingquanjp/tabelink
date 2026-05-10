import { CampaignHero } from "@/components/owner/campaign/CampaignHero";
import { CampaignPromoCta } from "@/components/owner/campaign/CampaignPromoCta";
import { CampaignsSection } from "@/components/owner/campaign/CampaignsSection";
import { CampaignStatsGrid } from "@/components/owner/campaign/CampaignStatsGrid";

const ElementCampaignAd = () => {
  return (
    <main className="min-h-screen bg-(--surface-cream)">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-12 px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <CampaignHero />
        <CampaignStatsGrid />
        <CampaignsSection />
        <CampaignPromoCta />
      </div>
    </main>
  );
};

export default ElementCampaignAd;
