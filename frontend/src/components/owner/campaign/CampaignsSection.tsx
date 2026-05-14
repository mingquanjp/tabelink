import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CampaignAction = {
  label: string;
  variant: "secondary" | "outline";
  className: string;
};

type CampaignMetric = {
  label: string;
  value: string;
};

type CampaignItem = {
  status: string;
  statusVariant: "active" | "ended";
  schedule: string;
  title: string;
  description: string;
  usageLabel: string;
  usageValue: string;
  usageValueClassName: string;
  cardClassName: string;
  actionButtons: CampaignAction[];
  metrics: CampaignMetric[];
};

const campaignItems: CampaignItem[] = [
  {
    status: "実施中",
    statusVariant: "active",
    schedule: "終了まであと 5日",
    title: "春の桜お任せキャンペーン",
    description: "ランチタイム限定、ドリンク1杯無料。春の味覚を楽しむ特別メニュー。",
    usageLabel: "利用率",
    usageValue: "84%",
    usageValueClassName: "text-[var(--primary)]",
    cardClassName: "border border-transparent bg-card shadow-[0px_1px_2px_#0000000d]",
    actionButtons: [
      {
        label: "編集",
        variant: "secondary",
        className:
          "bg-[var(--surface-mist)] text-[var(--ink-900)] hover:bg-[color-mix(in_oklab,var(--surface-mist),black_4%)]",
      },
      {
        label: "分析データ",
        variant: "outline",
        className:
          "border-[color-mix(in_oklab,var(--primary),transparent_80%)] text-[var(--primary)] hover:bg-[color-mix(in_oklab,var(--primary),transparent_95%)]",
      },
    ],
    metrics: [
      { label: "リーチ数", value: "12,400" },
      { label: "利用数", value: "452" },
      { label: "コンバージョン", value: "3.6%" },
      { label: "獲得利益", value: "¥452,000" },
    ],
  },
  {
    status: "実施中",
    statusVariant: "active",
    schedule: "終了まであと 14日",
    title: "ディナー限定日本酒ペアリング",
    description: "ハノイ厳選の銘酒と創作和食の絶妙なハーモニーを特別価格で。",
    usageLabel: "利用率",
    usageValue: "62%",
    usageValueClassName: "text-[var(--primary)]",
    cardClassName: "border border-transparent bg-card shadow-[0px_1px_2px_#0000000d]",
    actionButtons: [
      {
        label: "編集",
        variant: "secondary",
        className:
          "bg-[var(--surface-mist)] text-[var(--ink-900)] hover:bg-[color-mix(in_oklab,var(--surface-mist),black_4%)]",
      },
      {
        label: "分析データ",
        variant: "outline",
        className:
          "border-[color-mix(in_oklab,var(--primary),transparent_80%)] text-[var(--primary)] hover:bg-[color-mix(in_oklab,var(--primary),transparent_95%)]",
      },
    ],
    metrics: [
      { label: "リーチ数", value: "8,920" },
      { label: "利用数", value: "214" },
      { label: "コンバージョン", value: "2.4%" },
      { label: "獲得利益", value: "¥321,000" },
    ],
  },
  {
    status: "終了済み",
    statusVariant: "ended",
    schedule: "2024/03/15 終了",
    title: "週末ファミリーバーベキュー",
    description: "お子様連れのお客様に特製デザートをプレゼント。",
    usageLabel: "最終利用率",
    usageValue: "98%",
    usageValueClassName: "text-[var(--ink-600)]",
    cardClassName:
      "border border-dashed border-[color-mix(in_oklab,var(--primary),transparent_85%)] bg-[linear-gradient(0deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.5)_100%),linear-gradient(0deg,var(--surface-mist)_0%,var(--surface-mist)_100%)]",
    actionButtons: [
      {
        label: "詳細表示",
        variant: "secondary",
        className:
          "bg-[color-mix(in_oklab,var(--surface-mist),black_4%)] text-[var(--ink-900)] hover:bg-[color-mix(in_oklab,var(--surface-mist),black_8%)]",
      },
      {
        label: "再開する",
        variant: "outline",
        className:
          "border-[color-mix(in_oklab,var(--primary),transparent_85%)] text-[var(--ink-600)] hover:bg-white/70",
      },
    ],
    metrics: [
      { label: "リーチ数", value: "15,300" },
      { label: "利用数", value: "892" },
      { label: "コンバージョン", value: "5.8%" },
      { label: "獲得利益", value: "¥1,120,000" },
    ],
  },
];

function BurgerIllustration() {
  return (
    <div className="flex h-32 w-48 items-center justify-center rounded bg-[#162635]">
      <div className="relative h-20 w-28">
        <div className="absolute left-3 top-0 h-6 w-20 rounded-[999px] bg-[#f0a53d]" />
        <div className="absolute left-5 top-2 flex gap-1">
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index} className="h-1 w-1 rounded-full bg-[#ffd57e]" />
          ))}
        </div>
        <div className="absolute left-2 top-5 h-2 w-24 rounded-full bg-[#5a3b1c]" />
        <div className="absolute left-1 top-6 h-3 w-[104px] rounded-full bg-[#56a94c]" />
        <div className="absolute left-3 top-8 h-3 w-24 rounded-full bg-[#db4c3f]" />
        <div className="absolute left-2 top-10 h-2 w-24 rounded-full bg-[#f6d15f]" />
        <div className="absolute left-1 top-[46px] h-4 w-[104px] rounded-full bg-[#7f4a21]" />
        <div className="absolute left-0 top-[58px] h-5 w-28 rounded-[999px] bg-[#4eb4a6]" />
        <div className="absolute left-3 top-[55px] h-3 w-20 rounded-[999px] bg-[#2e8a7f]" />
      </div>
    </div>
  );
}

export function CampaignsSection() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-jp text-xl font-medium leading-7 text-(--ink-900)">
          有効なキャンペーン
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        {campaignItems.map((campaign) => (
          <Card key={campaign.title} className={`rounded-lg ${campaign.cardClassName}`}>
            <CardContent className="p-6">
              <article className="flex flex-col gap-6 lg:flex-row lg:items-center">
                <div className="shrink-0">
                  <BurgerIllustration />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={`rounded-sm px-2 py-0.5 font-jp text-[10px] font-medium leading-[15px] shadow-none hover:bg-current ${
                            campaign.statusVariant === "active"
                              ? "bg-[color-mix(in_oklab,var(--ink-600),transparent_90%)] text-(--ink-600)"
                              : "bg-[color-mix(in_oklab,var(--ink-600),transparent_80%)] text-(--ink-600)"
                          }`}
                        >
                          {campaign.status}
                        </Badge>
                        <span className="font-jp text-xs font-medium leading-4 text-(--ink-600)">
                          {campaign.schedule}
                        </span>
                      </div>
                      <h3 className="pt-1 font-jp text-xl font-medium leading-7 text-(--ink-900)">
                        {campaign.title}
                      </h3>
                      <p className="font-jp text-sm font-medium leading-5 text-(--ink-600)">
                        {campaign.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-left lg:text-right">
                      <p className="font-jp text-xs font-medium leading-4 text-(--ink-600)">
                        {campaign.usageLabel}
                      </p>
                      <p className={`font-manrope text-lg font-bold leading-7 ${campaign.usageValueClassName}`}>
                        {campaign.usageValue}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-2 md:grid-cols-4">
                    {campaign.metrics.map((metric) => (
                      <div key={metric.label} className="flex flex-col gap-[0.5px]">
                        <span className="font-jp text-[10px] font-medium leading-[15px] tracking-[0.5px] text-(--ink-600)">
                          {metric.label}
                        </span>
                        <span className="font-manrope text-sm font-bold leading-5 text-(--ink-900)">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {campaign.actionButtons.map((action) => (
                    <Button
                      key={action.label}
                      variant={action.variant}
                      className={`h-auto w-32 rounded-sm px-0 py-2 font-jp text-xs font-medium leading-4 ${action.className}`}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </article>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
