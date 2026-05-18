"use client";

import { useCallback, useEffect, useState } from "react";
import { CampaignHero } from "@/components/owner/campaign/CampaignHero";
import { CampaignPromoCta } from "@/components/owner/campaign/CampaignPromoCta";
import { CampaignsSection } from "@/components/owner/campaign/CampaignsSection";
import { CampaignStatsGrid } from "@/components/owner/campaign/CampaignStatsGrid";
import { getCampaignErrorMessage } from "@/components/owner/campaign/campaign-toast";
import { getOwnerPromotions } from "@/lib/api/campaigns/API";
import type { OwnerPromotionsResponse } from "@/lib/api/campaigns/type";

const ElementCampaignAd = () => {
  const [promotions, setPromotions] = useState<OwnerPromotionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPromotions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getOwnerPromotions();
      setPromotions(data);
    } catch (error) {
      setErrorMessage(getCampaignErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadPromotions);
  }, [loadPromotions]);

  return (
    <main className="min-h-screen bg-(--surface-cream)">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-12 px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <CampaignHero onPromotionCreated={loadPromotions} />
        <CampaignStatsGrid summary={promotions?.summary} />
        <CampaignsSection
          errorMessage={errorMessage}
          isLoading={isLoading}
          items={promotions?.items ?? []}
          onRetry={loadPromotions}
        />
        <CampaignPromoCta onPromotionCreated={loadPromotions} />
      </div>
    </main>
  );
};

export default ElementCampaignAd;
