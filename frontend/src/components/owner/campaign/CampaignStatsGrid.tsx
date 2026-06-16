import { Card, CardContent } from "@/components/ui/card";
import type { OwnerPromotionsSummary } from "@/lib/api/campaigns/type";

type CampaignStat = {
  title: string;
  value: string;
  subtext: string;
  subtextClassName: string;
  active: boolean;
};

const defaultSummary: OwnerPromotionsSummary = {
  activeCount: 0,
  pendingCount: 0,
  advertisementCount: 0,
  campaignCount: 0,
  totalImpressions: 0,
  totalClicks: 0,
};

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatCountChange(diff: number, withPrefix = false) {
  const sign = diff > 0 ? "+" : "";
  const value = `${sign}${compactNumber.format(diff)}`;

  return withPrefix ? `前月比 ${value}` : value;
}

function formatRateChange(diff: number, withPrefix = false) {
  const sign = diff > 0 ? "+" : "";
  const value = `${sign}${diff.toFixed(1)}%`;

  return withPrefix ? `前月比 ${value}` : value;
}

function changeClassName(diff: number) {
  if (diff > 0) {
    return "text-[#15803d]";
  }

  if (diff < 0) {
    return "text-[#d32f2f]";
  }

  return "text-[var(--ink-600)]";
}

function buildCampaignStats(summary: OwnerPromotionsSummary): CampaignStat[] {
  const ctr =
    summary.totalImpressions > 0
      ? `${((summary.totalClicks / summary.totalImpressions) * 100).toFixed(1)}%`
      : "0%";
  const monthChange = summary.monthOverMonth?.change ?? {
    activeCount: 0,
    totalImpressions: 0,
    campaignClicks: 0,
    ctr: 0,
  };
  const percentChange = summary.monthOverMonth?.percentChange ?? {
    activeCount: 0,
    totalImpressions: 0,
    campaignClicks: 0,
  };

  return [
    {
      title: "有効なキャンペーン",
      value: String(summary.activeCount),
      subtext: formatCountChange(monthChange.activeCount),
      subtextClassName: changeClassName(monthChange.activeCount),
      active: true,
    },
    {
      title: "総リーチ数",
      value: compactNumber.format(summary.totalImpressions),
      subtext: formatRateChange(percentChange.totalImpressions),
      subtextClassName: changeClassName(percentChange.totalImpressions),
      active: false,
    },
    {
      title: "キャンペーン利用数",
      value: compactNumber.format(summary.totalClicks),
      subtext: formatCountChange(monthChange.campaignClicks, true),
      subtextClassName: changeClassName(monthChange.campaignClicks),
      active: false,
    },
    {
      title: "広告クリック率",
      value: ctr,
      subtext: formatRateChange(monthChange.ctr),
      subtextClassName: changeClassName(monthChange.ctr),
      active: false,
    },
  ];
}

type CampaignStatsGridProps = {
  summary?: OwnerPromotionsSummary;
};

export function CampaignStatsGrid({
  summary = defaultSummary,
}: CampaignStatsGridProps) {
  const campaignStats = buildCampaignStats(summary);

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {campaignStats.map((stat) => (
        <Card
          key={stat.title}
          className={`rounded-lg border-0 bg-card shadow-[0px_1px_2px_#0000000d] ${
            stat.active ? "border-l-4 border-l-primary" : ""
          }`}
        >
          <CardContent className="flex flex-col gap-[8.5px] p-6">
            <p className="font-jp text-xs font-medium leading-4 tracking-[0.6px] text-(--ink-600)">
              {stat.title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-brand text-3xl font-extrabold leading-9 text-(--ink-900)">
                {stat.value}
              </span>
              <span
                className={`font-manrope text-sm font-bold leading-5 ${stat.subtextClassName}`}
              >
                {stat.subtext}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
