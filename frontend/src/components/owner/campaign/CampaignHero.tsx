import { Megaphone, PlusCircle } from "lucide-react";
import { AdRequestDialog } from "@/components/owner/campaign/AdRequestDialog";
import { CampaignRequestDialog } from "@/components/owner/campaign/CampaignRequestDialog";
import { Button } from "@/components/ui/button";

type CampaignHeroProps = {
  onPromotionCreated?: () => void | Promise<void>;
};

export function CampaignHero({ onPromotionCreated }: CampaignHeroProps) {
  return (
    <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="font-jp text-4xl font-medium leading-10 tracking-[-0.9px] text-(--ink-900)">
          キャンペーン・広告管理
        </h1>
        <p className="font-jp text-base font-medium leading-6 text-(--ink-600)">
          マーケティングパフォーマンスとプロモーション活動の管理
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <AdRequestDialog
          onCreated={onPromotionCreated}
          trigger={
            <Button
              variant="outline"
              className="h-auto gap-2 border-[color-mix(in_oklab,var(--primary),transparent_60%)] bg-transparent px-6 py-3 font-jp text-base font-medium text-primary hover:bg-[color-mix(in_oklab,var(--primary),transparent_95%)] hover:text-primary"
            >
              <Megaphone className="h-4 w-4" strokeWidth={1.8} />
              広告リクエスト
            </Button>
          }
        />
        <CampaignRequestDialog
          onCreated={onPromotionCreated}
          trigger={
            <Button className="h-auto gap-2 bg-[linear-gradient(175deg,var(--primary)_0%,var(--primary-bright)_100%)] px-8 py-[13px] font-jp text-base font-medium text-primary-foreground shadow-[0px_4px_6px_-4px_#af111c33,0px_10px_15px_-3px_#af111c33] hover:opacity-95">
              <PlusCircle className="h-5 w-5" strokeWidth={1.8} />
              新しいキャンペーンを作成
            </Button>
          }
        />
      </div>
    </section>
  );
}
