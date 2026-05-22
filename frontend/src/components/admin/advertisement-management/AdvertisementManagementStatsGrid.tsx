import { TrendingUp } from "lucide-react";
import type { AdminPromotionSummary } from "@/lib/api/admin-promotions/type";

type StatItem = {
  label: string;
  value: string;
  highlighted?: boolean;
  showUnit?: boolean;
};

type AdvertisementManagementStatsGridProps = {
  summary: AdminPromotionSummary | null;
};

const numberFormatter = new Intl.NumberFormat("en");
const compactNumberFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function buildStats(summary: AdminPromotionSummary | null): StatItem[] {
  return [
    {
      label: "審査待ち",
      value: numberFormatter.format(summary?.pendingCount ?? 0),
      highlighted: true,
      showUnit: true,
    },
    {
      label: "配信中",
      value: numberFormatter.format(summary?.activeCount ?? 0),
      showUnit: true,
    },
    {
      label: "総インプレッション",
      value: compactNumberFormatter.format(summary?.totalImpressions ?? 0),
    },
    {
      label: "平均 CTR",
      value: `${(summary?.averageCtr ?? 0).toFixed(1)}%`,
    },
  ];
}

export function AdvertisementManagementStatsGrid({
  summary,
}: AdvertisementManagementStatsGridProps) {
  const stats = buildStats(summary);

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`flex min-h-[104px] flex-col gap-1 rounded-lg bg-white px-6 py-6 ${
            stat.highlighted ? "border-l-4 border-l-[#af111c] pl-7" : ""
          }`}
        >
          <p className="font-jp text-xs font-medium uppercase leading-4 tracking-[1.2px] text-[#5a6053]">
            {stat.label}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="font-jp text-[30px] font-medium leading-9 text-[#1a1c1b]">
              {stat.value}
            </span>
            {stat.showUnit ? (
              <span className="font-jp text-sm font-medium text-[#5a6053]">件</span>
            ) : null}
            {stat.showUnit ? <TrendingUp className="ml-1 size-3.5 text-[#af111c]" /> : null}
          </div>
        </div>
      ))}
    </section>
  );
}
