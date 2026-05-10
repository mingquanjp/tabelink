"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeCheck,
  ChevronsUp,
  Frown,
  Meh,
  MessageSquare,
  Smile,
  Star,
  Ticket,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { CertificationBadgeModal } from "@/components/owner/dashboard/CertificationBadgeModal";
import {
  findOwnerDashboard,
  getTopMenu,
  recordAdClick,
  recordAdImpression,
  recordMenuItemView,
  recordRestaurantView,
} from "@/lib/api/dashboard/API";
import type {
  AdCounterResponse,
  OwnerDashboardResponse,
  TopMenuItem,
} from "@/lib/api/dashboard/type";

type VisitorTrendItem = {
  name: string;
  japanese: number;
  others: number;
};

type DemographicItem = {
  name: string;
  value: number;
  color: string;
};

type SentimentItem = {
  label: string;
  value: number;
  color: string;
  icon: LucideIcon;
};

type PopularMenuItem = {
  id: number;
  itemId?: number;
  name: string;
  orders: number;
  progress: number;
};

type PopularTimeItem = {
  time: string;
  value: number;
  isPeak?: boolean;
};

type KPIData = {
  label: string;
  value: string;
  sub?: string;
  trend: "up" | "neutral";
  icon: LucideIcon;
  unit?: string;
  progress?: number;
  rating?: number;
  coupons?: boolean;
  target?: string;
  showTrendIcon?: boolean;
};

const fallbackVisitorTrends: VisitorTrendItem[] = [
  { name: "Week 1", japanese: 1200, others: 800 },
  { name: "Week 2", japanese: 1800, others: 900 },
  { name: "Week 3", japanese: 1500, others: 1100 },
  { name: "Week 4", japanese: 2100, others: 1300 },
  { name: "Week 5", japanese: 1900, others: 1000 },
];

const fallbackDemographics: DemographicItem[] = [
  { name: "Japanese", value: 3434, color: "#af111c" },
  { name: "Others", value: 1850, color: "#8f6f6c66" },
];

const fallbackSentiment: SentimentItem[] = [
  { label: "Positive", value: 82, color: "#3d5f46", icon: Smile },
  { label: "Neutral", value: 12, color: "#5a6053", icon: Meh },
  { label: "Negative", value: 6, color: "#af111c", icon: Frown },
];

const fallbackPopularMenu: PopularMenuItem[] = [
  { id: 1, name: "Top menu item", orders: 482, progress: 95 },
  { id: 2, name: "Second menu item", orders: 356, progress: 70 },
  { id: 3, name: "Third menu item", orders: 291, progress: 55 },
];

const fallbackPopularTimes: PopularTimeItem[] = [
  { time: "11:00", value: 20 },
  { time: "12:00", value: 35 },
  { time: "13:00", value: 70 },
  { time: "14:00", value: 100, isPeak: true },
  { time: "15:00", value: 60 },
  { time: "16:00", value: 30 },
  { time: "17:00", value: 45 },
  { time: "18:00", value: 55 },
  { time: "19:00", value: 25 },
  { time: "20:00", value: 40 },
  { time: "21:00", value: 50 },
];

function formatNumber(value: number | null | undefined) {
  return (value ?? 0).toLocaleString();
}

function formatSignedPercent(value: number | null | undefined) {
  const safeValue = value ?? 0;
  return `${safeValue >= 0 ? "+" : ""}${safeValue}%`;
}

function formatDateLabel(date: string) {
  const [, month, day] = date.split("-");
  return month && day ? `${month}/${day}` : date;
}

function toPopularMenuItems(items: TopMenuItem[]): PopularMenuItem[] {
  const maxOrders = Math.max(...items.map((item) => item.orderCount), 1);

  return items.map((item) => ({
    id: item.rank,
    itemId: item.itemId,
    name: item.nameJp || item.nameVn,
    orders: item.orderCount,
    progress: Math.max(8, Math.round((item.orderCount / maxOrders) * 100)),
  }));
}

function buildPopularTimes(
  dashboard: OwnerDashboardResponse | null
): PopularTimeItem[] {
  const apiItems = dashboard?.busyHoursToday.items ?? [];

  if (apiItems.length === 0) {
    return fallbackPopularTimes;
  }

  const maxValue = Math.max(...apiItems.map((item) => item.reservationCount), 1);
  const byHour = new Map(
    apiItems.map((item) => [item.hour, item.reservationCount])
  );

  return Array.from({ length: 11 }, (_, index) => {
    const hour = index + 11;
    const reservationCount = byHour.get(hour) ?? 0;

    return {
      time: `${String(hour).padStart(2, "0")}:00`,
      value: Math.round((reservationCount / maxValue) * 100),
      isPeak: dashboard?.busyHoursToday.peakHour === hour,
    };
  });
}

type PopularTimeBarProps = {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  fill?: string;
  payload?: {
    isPeak?: boolean;
  };
};

function PopularTimeBar({
  x,
  y,
  width,
  height,
  fill,
  payload,
}: PopularTimeBarProps) {
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof width !== "number" ||
    typeof height !== "number"
  ) {
    return null;
  }

  const labelX = x + width / 2;
  const labelY = y - 34;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={2} ry={2} fill={fill} />
      {payload?.isPeak && (
        <g>
          <rect x={labelX - 11} y={labelY} width={22} height={40} rx={2} fill="#1a1c1b" />
          <text x={labelX} y={labelY + 11} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight={500}>
            <tspan x={labelX} dy="0">P</tspan>
            <tspan x={labelX} dy="11">E</tspan>
            <tspan x={labelX} dy="11">AK</tspan>
          </text>
        </g>
      )}
    </g>
  );
}

function KPICard({ data }: { data: KPIData }) {
  const rating = data.rating;

  return (
    <div className="bg-white p-6 rounded-xl border border-[#e4beba1a] shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <span className="text-[12px] font-medium text-[#5a6053] tracking-[0.6px] uppercase">
          {data.label}
        </span>
        <div className="flex items-center gap-1">
          {data.trend === "up" && data.showTrendIcon !== false && (
            <ChevronsUp className="size-4 text-[#3d5f46]" />
          )}
          {rating !== undefined ? (
            <Star className="size-3.5 text-[#af111c]" />
          ) : (
            <span className={`text-[12px] font-medium ${data.trend === "up" ? "text-[#3d5f46]" : "text-[#5a6053]"}`}>
              {data.sub}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-[#1a1c1b] tracking-tight font-brand">
          {data.value}
        </span>
        {rating !== undefined && (
          <span className="text-sm font-medium text-[#5a6053] leading-5">
            {data.sub}
          </span>
        )}
        {data.unit && (
          <span className="text-xl font-medium text-[#5a6053] leading-7">
            {data.unit}
          </span>
        )}
      </div>
      {data.coupons && (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="size-8 rounded-full border-2 border-white bg-[#ffdad6]" />
            <div className="size-8 rounded-full border-2 border-white bg-[#dfe5d4]" />
            <div className="size-8 rounded-full border-2 border-white bg-[#c7efcf]" />
          </div>
          <span className="whitespace-nowrap text-[12px] font-semibold text-[#5a6053] tracking-[1px] uppercase">
            Coupons Active
          </span>
        </div>
      )}
      {data.progress !== undefined && (
        <div className="h-1 w-full bg-[#eeeeeb] rounded-full overflow-hidden">
          <div className="h-full bg-[#af111c]" style={{ width: `${data.progress}%` }} />
        </div>
      )}
      {rating !== undefined && (
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((score) => (
            <Star
              key={score}
              className={`size-3.5 ${score <= Math.floor(rating) ? "fill-[#af111c] text-[#af111c]" : "text-[#eeeeeb]"}`}
            />
          ))}
        </div>
      )}
      {data.target && (
        <span className="text-[12px] text-[#5a6053] font-semibold uppercase tracking-[1px]">
          Target: {data.target} Reviews/Mo
        </span>
      )}
    </div>
  );
}

export default function OwnerDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboard, setDashboard] = useState<OwnerDashboardResponse | null>(null);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [popularMenuItems, setPopularMenuItems] =
    useState<PopularMenuItem[]>(fallbackPopularMenu);
  const [adCounters, setAdCounters] = useState<AdCounterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isClient) {
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);

      try {
        const { restaurantId: currentRestaurantId, dashboard: dashboardResponse } =
          await findOwnerDashboard();

        if (!cancelled) {
          setRestaurantId(currentRestaurantId);
        }

        recordRestaurantView(currentRestaurantId, true).catch(() => {
          // Tracking must not block analytics rendering.
        });

        const topMenuResponse = await getTopMenu(currentRestaurantId);

        if (cancelled) {
          return;
        }

        setDashboard(dashboardResponse);
        setPopularMenuItems(
          topMenuResponse.items.length > 0
            ? toPopularMenuItems(topMenuResponse.items)
            : fallbackPopularMenu
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard analytics."
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    async function recordDashboardImpression() {
      const adId = Number(process.env.NEXT_PUBLIC_DASHBOARD_AD_ID);

      if (!Number.isFinite(adId) || adId <= 0) {
        return;
      }

      try {
        const counters = await recordAdImpression(adId);
        if (!cancelled) {
          setAdCounters(counters);
        }
      } catch {
        // Local demo data may not have an active advertisement seeded.
      }
    }

    loadDashboard();
    recordDashboardImpression();

    return () => {
      cancelled = true;
    };
  }, [isClient]);

  const kpiData: KPIData[] = useMemo(() => {
    const summary = dashboard?.summary;
    const rating = summary?.japaneseAverageRating.value ?? null;

    return [
      {
        label: "Monthly views",
        value: formatNumber(summary?.monthlyViews.value),
        sub: formatSignedPercent(summary?.monthlyViews.changeRate),
        trend: "up",
        unit: "views",
        icon: Users,
        progress: 75,
      },
      {
        label: "Japanese avg rating",
        value: rating === null ? "0.0" : rating.toFixed(1),
        sub: "/ 5.0",
        trend: "neutral",
        icon: Star,
        rating: rating ?? 0,
      },
      {
        label: "Campaign orders",
        value: formatNumber(summary?.campaignWeeklyOrders.value),
        sub: `${summary?.campaignWeeklyOrders.activeCampaignCount ?? 0} active`,
        trend: "up",
        icon: Ticket,
        unit: "orders",
        coupons: true,
      },
      {
        label: "Published reviews",
        value: formatNumber(summary?.publishedReviews.value),
        sub: "",
        trend: "up",
        icon: MessageSquare,
        unit: "reviews",
        target: String(summary?.publishedReviews.target ?? 100),
        progress: summary?.publishedReviews.progressRate ?? 0,
        showTrendIcon: false,
      },
    ];
  }, [dashboard]);

  const visitorTrends = useMemo<VisitorTrendItem[]>(() => {
    if (!dashboard?.visitorTrend.length) {
      return fallbackVisitorTrends;
    }

    return dashboard.visitorTrend.map((item) => ({
      name: formatDateLabel(item.date),
      japanese: item.japanese,
      others: item.others,
    }));
  }, [dashboard]);

  const demographicsData = useMemo<DemographicItem[]>(() => {
    if (!dashboard?.userAttributes.length) {
      return fallbackDemographics;
    }

    return dashboard.userAttributes.map((item, index) => ({
      name: item.label,
      value: item.count,
      color: index === 0 ? "#af111c" : "#8f6f6c66",
    }));
  }, [dashboard]);

  const sentimentData = useMemo<SentimentItem[]>(() => {
    if (!dashboard) {
      return fallbackSentiment;
    }

    return [
      {
        label: "Positive",
        value: dashboard.reviewSentiment.positive,
        color: "#3d5f46",
        icon: Smile,
      },
      {
        label: "Neutral",
        value: dashboard.reviewSentiment.neutral,
        color: "#5a6053",
        icon: Meh,
      },
      {
        label: "Negative",
        value: dashboard.reviewSentiment.negative,
        color: "#af111c",
        icon: Frown,
      },
    ];
  }, [dashboard]);

  const popularTimes = useMemo(() => buildPopularTimes(dashboard), [dashboard]);

  const handleApplySuccess = () => {
    toast.success("申請が完了しました！", {
      description:
        "運営チームによる審査完了まで、数日かかる場合があります。",
    });
  };

  const handleCertificationClick = async () => {
    setIsModalOpen(true);

    const adId = Number(process.env.NEXT_PUBLIC_DASHBOARD_AD_ID);
    if (!Number.isFinite(adId) || adId <= 0) {
      return;
    }

    try {
      const counters = await recordAdClick(adId);
      setAdCounters(counters);
    } catch {
      // Keep the CTA responsive even if ad tracking is not seeded locally.
    }
  };

  const handlePopularMenuClick = async (item: PopularMenuItem) => {
    if (!item.itemId) {
      return;
    }

    try {
      await recordMenuItemView(item.itemId);
      toast.success("Menu item view recorded.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to record menu view."
      );
    }
  };

  if (!isClient) {
    return <div className="min-h-screen bg-[#f9f9f6]" />;
  }

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-10 flex flex-col gap-12">
      <section className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-[#1a1c1b] tracking-tight">
            データ分析・インサイト
          </h1>
          {restaurantId && (
            <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-[#5a6053] shadow-sm">
              Restaurant #{restaurantId}
            </span>
          )}
        </div>
        <p className="text-base font-medium text-[#5a6053]">
          店舗パフォーマンスの可視化と日本人顧客の動向分析
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((data) => (
          <KPICard key={data.label} data={data} />
        ))}
      </section>

      <section className="bg-[#d32f311a] border border-[#af111c33] rounded-2xl p-8 flex items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="size-16 bg-[#af111c1a] rounded-xl flex items-center justify-center">
            <BadgeCheck className="size-8 text-[#af111c]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-medium text-[#1a1c1b]">
              TABELINK 公式認証バッジを取得しませんか？
            </h2>
            <p className="text-[14px] text-[#5a6053] font-medium max-w-[670px] leading-relaxed">
              認証バッジを取得することで、日本人顧客からの信頼度が向上します。
            </p>
            {adCounters && (
              <p className="text-[11px] font-semibold text-[#5a6053]">
                {adCounters.impressions} impressions / {adCounters.clicks} clicks / CTR {(adCounters.ctr * 100).toFixed(2)}%
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleCertificationClick}
          className="bg-[#af111c] text-white px-8 py-4 rounded-lg font-medium shadow-lg shadow-[#af111c20] hover:bg-[#960e18] transition-all flex items-center gap-2"
        >
          <Zap className="size-5" />
          認証バッジを申請する
        </button>
      </section>

      <CertificationBadgeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleApplySuccess}
      />

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          <div className="bg-white p-8 rounded-2xl border border-[#e4beba1a] shadow-sm flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-[#1a1c1b]">訪問者トレンド</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-[#af111c]" />
                  <span className="text-[10px] font-medium text-[#5a6053] uppercase tracking-widest">Japanese</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-[#8f6f6c]" />
                  <span className="text-[10px] font-medium text-[#5a6053] uppercase tracking-widest">Others</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitorTrends} margin={{ top: 24, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} horizontal={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={{ stroke: "#eeeeeb" }}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#5a6053" }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "#af111c08" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="japanese" stackId="visitors" fill="#af111c" barSize={120} />
                  <Bar dataKey="others" stackId="visitors" fill="#f0d8daff" radius={[2, 2, 0, 0]} barSize={120} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#e4beba1a] shadow-sm flex flex-col gap-4">
              <h3 className="text-lg font-medium text-[#1a1c1b]">ユーザー属性</h3>
              <div className="relative h-40 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {demographicsData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#1a1c1b]">
                    {demographicsData[0]?.value ?? 0}
                  </span>
                  <span className="text-[8px] font-medium text-[#5a6053] uppercase tracking-tighter">
                    Users
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                {demographicsData.map((entry) => {
                  const total = demographicsData.reduce((sum, item) => sum + item.value, 0);
                  const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;

                  return (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-[12px] font-medium text-[#1a1c1b]">{entry.name}</span>
                      </div>
                      <span className="text-[12px] font-medium text-[#5a6053]">
                        {entry.value.toLocaleString()} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#e4beba1a] shadow-sm flex flex-col gap-6">
              <h3 className="text-lg font-medium text-[#1a1c1b]">レビュー感情分析</h3>
              <div className="flex flex-col gap-6">
                {sentimentData.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[12px] font-medium">
                        <div className="flex items-center gap-2" style={{ color: item.color }}>
                          <Icon className="size-3.5" />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-[#1a1c1b]">{item.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-[#eeeeeb] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div className="bg-[#af111c] p-8 rounded-2xl shadow-xl shadow-[#af111c20] flex flex-col gap-6 relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between gap-4">
              <h2 className="text-xl font-medium text-white">人気メニュー TOP3</h2>
              {isLoading && (
                <span className="text-[11px] font-semibold text-white/70">Loading</span>
              )}
            </div>
            <div className="flex flex-col gap-6 relative z-10">
              {popularMenuItems.map((item) => (
                <button
                  key={item.id}
                  className="flex gap-4 items-center text-left"
                  type="button"
                  onClick={() => handlePopularMenuClick(item)}
                >
                  <div className="size-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xl font-medium text-white">{item.id}</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-[14px] font-medium truncate max-w-[160px]">{item.name}</span>
                      <span className="text-[10px] opacity-80">{item.orders} orders</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="absolute top-0 right-0 size-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full" />
            <Trophy className="absolute bottom-4 right-4 size-16 text-white/5" />
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#e4beba1a] shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-[#1a1c1b]">混雑時間帯 (今日)</h3>
              <span className="text-[12px] font-bold text-[#5a6053]">LIVE</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularTimes} margin={{ top: 38, right: 0, left: 0, bottom: 0 }}>
                    <Tooltip
                      cursor={{ fill: "#af111c08" }}
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "10px" }}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={42} shape={<PopularTimeBar />}>
                      {popularTimes.map((entry) => (
                        <Cell
                          key={entry.time}
                          fill={entry.isPeak ? "#af111c" : entry.value >= 55 ? "#dfa0a7" : "#eeeeeb"}
                          className="hover:fill-[#af111c4d] transition-all cursor-pointer"
                        />
                      ))}
                    </Bar>
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "#5a6053" }}
                      ticks={["11:00", "14:00", "18:00", "21:00"]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="pt-4 border-t border-[#eeeeeb]">
                <p className="text-[12px] font-medium text-[#1a1c1b] mb-1">スタッフ配置のヒント:</p>
                <p className="text-[12px] text-[#5a6053] leading-relaxed">
                  {dashboard?.busyHoursToday.insight ??
                    "予約データが入ると混雑時間帯の分析が表示されます。"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
