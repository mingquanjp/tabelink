import { Rocket } from "lucide-react";
import { AdRequestDialog } from "@/components/owner/campaign/AdRequestDialog";
import { Button } from "@/components/ui/button";

type CampaignPromoCtaProps = {
  onPromotionCreated?: () => void | Promise<void>;
};

export function CampaignPromoCta({ onPromotionCreated }: CampaignPromoCtaProps) {
  return (
    <section className="rounded-2xl bg-[color-mix(in_oklab,var(--primary),transparent_90%)] px-8 py-12 md:px-12 md:py-16">
      <div className="flex max-w-2xl flex-col gap-4">
        <h2 className="font-jp text-3xl font-medium leading-9 text-(--ink-900)">
          より多くの顧客へリーチを広げましょう
        </h2>
        <p className="font-jp text-lg font-medium leading-[29.2px] text-(--ink-600)">
          「The Culinary Bridge」のプレミアム広告枠を利用して、ハノイの美食家たちに
          ダイレクトにアプローチ。特定の時間帯や客層に合わせたターゲティング広告の運用が可能です。
        </p>
        <div className="pt-4">
          <AdRequestDialog
            onCreated={onPromotionCreated}
            trigger={
              <Button className="h-auto gap-3 bg-primary px-8 py-[17px] font-jp text-base font-medium text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary),black_10%)]">
                <Rocket className="h-5 w-5" strokeWidth={1.8} />
                広告リクエストを送信
              </Button>
            }
          />
        </div>
      </div>
    </section>
  );
}
