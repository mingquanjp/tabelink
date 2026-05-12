"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeCheck,
  ChevronsUp,
  CircleX,
  ClipboardCheck,
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
import type { ReactNode } from "react";
import { Fragment, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CertificationBadgeModal } from "@/components/owner/dashboard/CertificationBadgeModal";
import {
  findOwnerDashboard,
  getTopMenu,
  recordAdClick,
  recordAdImpression,
  recordMenuItemView,
} from "@/lib/api/dashboard/API";
import type {
  AdCounterResponse,
  OwnerDashboardResponse,
  TopMenuItem,
} from "@/lib/api/dashboard/type";
import type { VerificationApplication } from "@/lib/api/verification/type";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import {
  readSessionCache,
  SESSION_CACHE_TTL,
  writeSessionCache,
} from "@/lib/api/cache";

const ownerDashboardCacheKey = "tabelink:owner:dashboard:v1";

type OwnerDashboardCache = {
  dashboard: OwnerDashboardResponse;
  popularMenuItems: PopularMenuItem[];
};

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

function MeasuredChartFrame({
  children,
  className,
}: {
  children:
    | ((size: { width: number; height: number }) => ReactNode)
    | ReactNode
    | Array<ReactNode | ((size: { width: number; height: number }) => ReactNode)>;
  className: string;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = frameRef.current;

    if (!element) {
      return;
    }

    function updateSize(target: HTMLDivElement) {
      const rect = target.getBoundingClientRect();
      setSize({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      });
    }

    updateSize(element);
    const observer = new ResizeObserver(() => updateSize(element));
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const canRenderChart = size.width > 0 && size.height > 0;
  const renderChild = (
    child: ReactNode | ((size: { width: number; height: number }) => ReactNode),
    index: number
  ) =>
    typeof child === "function" ? (
      <Fragment key={index}>{child(size)}</Fragment>
    ) : (
      child
    );

  return (
    <div ref={frameRef} className={className}>
      {canRenderChart
        ? Array.isArray(children)
          ? children.map(renderChild)
          : renderChild(children, 0)
        : null}
    </div>
  );
}

function formatNumber(value: number | null | undefined) {
  return (value ?? 0).toLocaleString();
}

function formatSignedPercent(value: number | null | undefined) {
  const safeValue = value ?? 0;
  return `${safeValue >= 0 ? "+" : ""}${safeValue}%`;
}

function formatDateLabel(date: string) {
  const [, month, day] = date.split("-");
  return month && day ? `${day}/${month}` : date;
}

function formatVisitorTrendName(name: string | number) {
  const normalizedName = String(name).toLowerCase();

  if (normalizedName === "japanese") {
    return "日本人";
  }

  if (normalizedName === "others") {
    return "その他";
  }

  return String(name);
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
    return Array.from({ length: 11 }, (_, index) => ({
      time: `${String(index + 11).padStart(2, "0")}:00`,
      value: 0,
    }));
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
            <tspan x={labelX} dy="0">ピ</tspan>
            <tspan x={labelX} dy="11">ー</tspan>
            <tspan x={labelX} dy="11">ク</tspan>
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

type VerificationStatus = "NotSubmitted" | "Pending" | "Approved" | "Rejected" | string;

function VerificationStatusBanner({
  status,
  onApply,
}: {
  status: VerificationStatus;
  onApply: (mode?: "apply" | "approved") => void;
}) {
  if (status === "Pending") {
    return (
      <section className="rounded-none border border-[#f4d88b] bg-[#fff3c7] px-8 py-8 text-[#9a4f0b]">
        <div className="flex items-center gap-6">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-white text-[#d97706] shadow-sm">
            <ClipboardCheck className="size-7" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#8b4513] px-3 py-1 text-[11px] font-bold uppercase tracking-[1.2px] text-white">
                STATUS : PENDING
              </span>
              <h2 className="text-2xl font-bold text-[#9a4f0b]">
                TABELINK 認証バッジ申請
              </h2>
            </div>
            <p className="text-sm font-medium">
              認証バッジの申請は現在確認中です。完了まで数日かかる場合があります。
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (status === "Approved") {
    return (
      <section className="rounded-none bg-[#4f7f5e] px-8 py-8 text-[#d9f9df]">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-[#d9f9df]">
              <BadgeCheck className="size-9" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#d9f9df] px-3 py-1 text-[11px] font-bold uppercase tracking-[1.2px] text-[#4f7f5e]">
                  STATUS : APPROVED
                </span>
                <h2 className="text-2xl font-bold text-white">
                  TABELINK 認証バッジ申請
                </h2>
              </div>
              <p className="max-w-[720px] text-sm font-medium leading-6">
                おめでとうございます！TABELINK公式認証バッジが発行されました。検索結果で優先的に表示されます。
              </p>
            </div>
          </div>
          <button
            onClick={() => onApply("approved")}
            className="rounded-md bg-[#d9f9df] px-8 py-3 text-sm font-medium text-[#4f7f5e]"
          >
            了解
          </button>
        </div>
      </section>
    );
  }

  if (status === "Rejected") {
    return (
      <section className="rounded-none bg-[#ffd9d9] px-8 py-8 text-[#af111c]">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-white text-[#d32f2f] shadow-sm">
              <CircleX className="size-7" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#af111c] px-3 py-1 text-[11px] font-bold uppercase tracking-[1.2px] text-white">
                  STATUS : REJECTED
                </span>
                <h2 className="text-2xl font-bold text-[#af111c]">
                  TABELINK 認証バッジ申請
                </h2>
              </div>
              <p className="max-w-[760px] text-sm font-medium leading-6 text-[#7f1d1d]">
                申請却下 - 提出された書類に不備がありました。詳細を確認し、再申請してください。
              </p>
            </div>
          </div>
          <button
            onClick={onApply}
            className="rounded-md bg-[#af111c] px-8 py-3 text-sm font-medium text-white shadow-lg shadow-[#af111c20] hover:bg-[#960e18]"
          >
            了解
          </button>
        </div>
      </section>
    );
  }

  return (
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
        </div>
      </div>
      <button
        onClick={onApply}
        className="bg-[#af111c] text-white px-8 py-4 rounded-lg font-medium shadow-lg shadow-[#af111c20] hover:bg-[#960e18] transition-all flex items-center gap-2"
      >
        <Zap className="size-5" />
        認証バッジを申請する
      </button>
    </section>
  );
}

export default function OwnerDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [certificationModalMode, setCertificationModalMode] = useState<
    "apply" | "approved"
  >("apply");
  const [dashboard, setDashboard] = useState<OwnerDashboardResponse | null>(null);
  const [popularMenuItems, setPopularMenuItems] =
    useState<PopularMenuItem[]>([]);
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
      const cachedDashboard = readSessionCache<OwnerDashboardCache>(
        ownerDashboardCacheKey,
        SESSION_CACHE_TTL.dashboard,
      );

      if (cachedDashboard) {
        setDashboard(cachedDashboard.dashboard);
        setPopularMenuItems(cachedDashboard.popularMenuItems);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      try {
        const { restaurantId: currentRestaurantId, dashboard: dashboardResponse } =
          await findOwnerDashboard();

        if (cancelled) {
          return;
        }

        setDashboard(dashboardResponse);

        if (dashboardResponse.topMenus.length > 0) {
          const nextPopularMenuItems = toPopularMenuItems(dashboardResponse.topMenus);
          setPopularMenuItems(nextPopularMenuItems);
          writeSessionCache(ownerDashboardCacheKey, {
            dashboard: dashboardResponse,
            popularMenuItems: nextPopularMenuItems,
          });
          return;
        }

        try {
          const topMenuResponse = await getTopMenu(currentRestaurantId);
          const nextPopularMenuItems =
            topMenuResponse.items.length > 0
              ? toPopularMenuItems(topMenuResponse.items)
              : [];

          if (!cancelled) {
            setPopularMenuItems(nextPopularMenuItems);
            writeSessionCache(ownerDashboardCacheKey, {
              dashboard: dashboardResponse,
              popularMenuItems: nextPopularMenuItems,
            });
          }
        } catch {
          if (!cancelled) {
            setPopularMenuItems([]);
            writeSessionCache(ownerDashboardCacheKey, {
              dashboard: dashboardResponse,
              popularMenuItems: [],
            });
          }
        }
      } catch {
        if (!cachedDashboard) {
          showErrorToast();
        }
      } finally {
        if (!cancelled && !cachedDashboard) {
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
        label: "今月の訪問者数",
        value: formatNumber(summary?.monthlyViews.value),
        sub: formatSignedPercent(summary?.monthlyViews.changeRate),
        trend: "up",
        unit: "名",
        icon: Users,
        progress: summary?.monthlyViews.progressRate ?? 0,
      },
      {
        label: "日本人顧客の平均評価",
        value: rating === null ? "0.0" : rating.toFixed(1),
        sub: "/ 5.0",
        trend: "neutral",
        icon: Star,
        rating: rating ?? 0,
      },
      {
        label: "キャンペーン適用注文数",
        value: formatNumber(summary?.campaignWeeklyOrders.value),
        sub: `${summary?.campaignWeeklyOrders.activeCampaignCount ?? 0} active`,
        trend: "up",
        icon: Ticket,
        unit: "件",
        coupons: true,
      },
      {
        label: "レビュー増加数",
        value: formatNumber(summary?.publishedReviews.value),
        sub: "",
        trend: "up",
        icon: MessageSquare,
        unit: "件",
        target: String(summary?.publishedReviews.target ?? 100),
        progress: summary?.publishedReviews.progressRate ?? 0,
        showTrendIcon: false,
      },
    ];
  }, [dashboard]);

  const visitorTrends = useMemo<VisitorTrendItem[]>(() => {
    if (!dashboard?.visitorTrend.length) {
      return [];
    }

    return dashboard.visitorTrend.map((item) => ({
      name: formatDateLabel(item.date),
      japanese: item.japanese,
      others: item.others,
    }));
  }, [dashboard]);

  const demographicsData = useMemo<DemographicItem[]>(() => {
    if (!dashboard?.userAttributes.length) {
      return [];
    }

    return dashboard.userAttributes.map((item, index) => ({
      name:
        item.label.toLowerCase() === "japanese"
          ? "日本人"
          : item.label.toLowerCase() === "others"
            ? "その他"
            : item.label,
      value: item.count,
      color: index === 0 ? "#af111c" : "#8f6f6c66",
    }));
  }, [dashboard]);

  const sentimentData = useMemo<SentimentItem[]>(() => {
    return [
      {
        label: "ポジティブ",
        value: dashboard?.reviewSentiment.positive ?? 0,
        color: "#3d5f46",
        icon: Smile,
      },
      {
        label: "中立",
        value: dashboard?.reviewSentiment.neutral ?? 0,
        color: "#5a6053",
        icon: Meh,
      },
      {
        label: "ネガティブ",
        value: dashboard?.reviewSentiment.negative ?? 0,
        color: "#af111c",
        icon: Frown,
      },
    ];
  }, [dashboard]);

  const popularTimes = useMemo(() => buildPopularTimes(dashboard), [dashboard]);

  const handleApplySuccess = (application: VerificationApplication) => {
    setDashboard((current) => {
      if (!current) {
        return current;
      }

      const nextDashboard = {
        ...current,
        verification: {
          status: application.status,
          application,
        },
      };

      writeSessionCache(ownerDashboardCacheKey, {
        dashboard: nextDashboard,
        popularMenuItems,
      });

      return nextDashboard;
    });
    showSuccessToast();
  };

  const handleCertificationClick = async (mode: "apply" | "approved" = "apply") => {
    setCertificationModalMode(mode);
    setIsModalOpen(true);

    if (mode === "approved") {
      return;
    }

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
    } catch {
      // Tracking must not interrupt dashboard usage.
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

      <VerificationStatusBanner
        status={dashboard?.verification.status ?? "NotSubmitted"}
        onApply={handleCertificationClick}
      />
      <section className="hidden">
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
          onClick={() => handleCertificationClick()}
          className="bg-[#af111c] text-white px-8 py-4 rounded-lg font-medium shadow-lg shadow-[#af111c20] hover:bg-[#960e18] transition-all flex items-center gap-2"
        >
          <Zap className="size-5" />
          認証バッジを申請する
        </button>
      </section>

      <CertificationBadgeModal
        isOpen={isModalOpen}
        restaurantId={dashboard?.restaurantId ?? null}
        mode={certificationModalMode}
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
                  <span className="text-[10px] font-medium text-[#5a6053] uppercase tracking-widest">日本人</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-[#8f6f6c]" />
                  <span className="text-[10px] font-medium text-[#5a6053] uppercase tracking-widest">その他</span>
                </div>
              </div>
            </div>
            <MeasuredChartFrame className="relative h-[300px] min-w-0 w-full">
              {({ width, height }) => (
                <BarChart
                  data={visitorTrends}
                  height={height}
                  margin={{ top: 24, right: 0, left: 0, bottom: 0 }}
                  width={width}
                >
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
                    formatter={(value, name) => [
                      value,
                      formatVisitorTrendName(name ?? ""),
                    ]}
                  />
                  <Bar dataKey="japanese" stackId="visitors" fill="#af111c" barSize={120} />
                  <Bar dataKey="others" stackId="visitors" fill="#f0d8daff" radius={[2, 2, 0, 0]} barSize={120} />
                </BarChart>
              )}
              {visitorTrends.length === 0 ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-[#8a8d85]">
                  訪問データはまだありません。
                </div>
              ) : null}
            </MeasuredChartFrame>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#e4beba1a] shadow-sm flex flex-col gap-4">
              <h3 className="text-lg font-medium text-[#1a1c1b]">ユーザー属性</h3>
              <MeasuredChartFrame className="relative flex h-40 min-w-0 w-full items-center justify-center">
                {({ width, height }) =>
                  demographicsData.length > 0 ? (
                    <PieChart height={height} width={width}>
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
                  ) : null
                }
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#1a1c1b]">
                    {demographicsData[0]?.value ?? 0}
                  </span>
                  <span className="text-[8px] font-medium text-[#5a6053] uppercase tracking-tighter">
                    日本人
                  </span>
                </div>
              </MeasuredChartFrame>
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
                {demographicsData.length === 0 ? (
                  <p className="text-[12px] font-medium text-[#8a8d85]">
                    ユーザー属性データはまだありません。
                  </p>
                ) : null}
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
                      <span className="line-clamp-2 max-w-[160px] text-[14px] font-medium leading-5">
                        {item.name}
                      </span>
                      <span className="text-[10px] opacity-80">{item.orders} orders</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                </button>
              ))}
              {popularMenuItems.length === 0 ? (
                <p className="text-sm font-medium leading-6 text-white/80">
                  メニュー閲覧データはまだありません。
                </p>
              ) : null}
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
              <MeasuredChartFrame className="h-44 min-w-0 w-full">
                {({ width, height }) => (
                  <BarChart
                    data={popularTimes}
                    height={height}
                    margin={{ top: 38, right: 0, left: 0, bottom: 0 }}
                    width={width}
                  >
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
                )}
              </MeasuredChartFrame>
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
