import { Card, CardContent } from "@/components/ui/card";

type CampaignStat = {
  title: string;
  value: string;
  subtext: string;
  subtextClassName: string;
  active: boolean;
};

const campaignStats: CampaignStat[] = [
  {
    title: "有効なキャンペーン",
    value: "12",
    subtext: "+2 今月",
    subtextClassName: "text-[var(--ink-600)]",
    active: true,
  },
  {
    title: "総リーチ数",
    value: "45.2K",
    subtext: "↑12%",
    subtextClassName: "text-[var(--ink-600)]",
    active: false,
  },
  {
    title: "キャンペーン利用数",
    value: "1,284",
    subtext: "先月比 +156",
    subtextClassName: "text-[var(--ink-600)]",
    active: false,
  },
  {
    title: "広告ROI",
    value: "4.8x",
    subtext: "良好",
    subtextClassName: "text-[var(--ink-600)]",
    active: false,
  },
];

export function CampaignStatsGrid() {
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
              <span className={`font-manrope text-sm font-bold leading-5 ${stat.subtextClassName}`}>
                {stat.subtext}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
