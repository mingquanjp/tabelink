"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from "recharts";
import { 
  ChevronsUp,
  Users, 
  Star, 
  Ticket, 
  MessageSquare, 
  BadgeCheck, 
  Zap,
  Smile,
  Meh,
  Frown,
  Trophy,
  type LucideIcon
} from "lucide-react";

import { useSyncExternalStore, useState } from "react";
import { toast } from "sonner";
import { CertificationBadgeModal } from "@/components/owner/dashboard/CertificationBadgeModal";

// --- Mock Data ---

const visitorTrends = [
  { name: "Week 1", japanese: 1200, others: 800 },
  { name: "Week 2", japanese: 1800, others: 900 },
  { name: "Week 3", japanese: 1500, others: 1100 },
  { name: "Week 4", japanese: 2100, others: 1300 },
  { name: "Week 5", japanese: 1900, others: 1000 },
];

const demographicsData = [
  { name: "日本人居住者", value: 3434, color: "#af111c" },
  { name: "その他", value: 1850, color: "#8f6f6c66" },
];

const sentimentData = [
  { label: "ポジティブ", value: 82, color: "#3d5f46", icon: Smile },
  { label: "中立", value: 12, color: "#5a6053", icon: Meh },
  { label: "ネガティブ", value: 6, color: "#af111c", icon: Frown },
];

const popularMenu = [
  { id: 1, name: "極上炭火焼き牛タン", orders: 482, progress: 95 },
  { id: 2, name: "特製濃厚鶏白湯ラーメン", orders: 356, progress: 70 },
  { id: 3, name: "旬の刺身5点盛り", orders: 291, progress: 55 },
];

const popularTimes = [
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

function PopularTimeBar({ x, y, width, height, fill, payload }: PopularTimeBarProps) {
  if (typeof x !== "number" || typeof y !== "number" || typeof width !== "number" || typeof height !== "number") {
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

// --- Sub-components ---

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

const kpiData: KPIData[] = [
  { label: "今月の訪問者数", value: "5,284", sub: "+12.5%", trend: "up", unit:"名", icon: Users, progress: 75 },
  { label: "日本人顧客の平均評価", value: "4.0", sub: "/ 5.0", trend: "neutral", icon: Star, rating: 4.8 },
  { label: "キャンペーン適用注文数", value: "842", sub: "+18%", trend: "up", icon: Ticket, unit: "件", coupons: true },
  { label: "レビュー増加数", value: "156", sub: "+24%", trend: "up", icon: MessageSquare, unit: "件", target: "200", showTrendIcon: false },
];

function KPICard({ data }: { data: KPIData }) {
  const rating = data.rating;

  return (
    <div className="bg-white p-6 rounded-xl border border-[#e4beba1a] shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <span className="text-[12px] font-medium text-[#5a6053] tracking-[0.6px] uppercase">
          {data.label}
        </span>
        <div className="flex items-center gap-1">
          {data.trend === "up" && data.showTrendIcon !== false && <ChevronsUp className="size-4 text-[#3d5f46]" />}
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
      {data.progress && (
        <div className="h-1 w-full bg-[#eeeeeb] rounded-full overflow-hidden">
          <div className="h-full bg-[#af111c]" style={{ width: `${data.progress}%` }} />
        </div>
      )}
      {rating !== undefined && (
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`size-3.5 ${s <= Math.floor(rating) ? "fill-[#af111c] text-[#af111c]" : "text-[#eeeeeb]"}`} />
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

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const handleApplySuccess = () => {
    toast.success("申請が完了しました！", {
      description: "運営チームによる審査完了まで、数日かかる場合があります。",
    });
  };

  if (!isClient) {
    return <div className="min-h-screen bg-[#f9f9f6]" />;
  }

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-10 flex flex-col gap-12">
      {/* Header */}
      <section className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#1a1c1b] tracking-tight">
          データ分析・インサイト
        </h1>
        <p className="text-base font-medium text-[#5a6053]">
          店舗パフォーマンスの可視化と日本人顧客の動向分析
        </p>
      </section>

      {/* KPI Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((data, i) => (
          <KPICard key={i} data={data} />
        ))}
      </section>

      {/* Certification CTA */}
      <section className="bg-[#d32f311a] border border-[#af111c33] rounded-2xl p-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="size-16 bg-[#af111c1a] rounded-xl flex items-center justify-center">
            <BadgeCheck className="size-8 text-[#af111c]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-medium text-[#1a1c1b]">
              TABELINK 公式認証バッジを取得しませんか？
            </h2>
            <p className="text-[14px] text-[#5a6053] font-medium max-w-[670px] leading-relaxed">
              認証バッジを取得することで、日本人顧客からの信頼度が大幅に向上します。公式認定店舗として検索結果で優先表示され、より多くの集客が期待できます。
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#af111c] text-white px-8 py-4 rounded-lg font-medium shadow-lg shadow-[#af111c20] hover:bg-[#960e18] transition-all flex items-center gap-2"
        >
          <Zap className="size-5" />
          認証バッジを申請する
        </button>
      </section>

      {/* Certification Modal */}
      <CertificationBadgeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleApplySuccess}
      />

      {/* Analytics Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Trends & Demographics */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          {/* Visitor Trends */}
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
                    cursor={{ fill: '#af111c08' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                  <Bar dataKey="japanese" stackId="visitors" fill="#af111c" barSize={120} />
                  <Bar dataKey="others" stackId="visitors" fill="#f0d8daff" radius={[2, 2, 0, 0]} barSize={120} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Demographics */}
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
                      {demographicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[#1a1c1b]">65%</span>
                    <span className="text-[8px] font-medium text-[#5a6053] uppercase tracking-tighter">Japanese</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                {demographicsData.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-[12px] font-medium text-[#1a1c1b]">{entry.name}</span>
                    </div>
                    <span className="text-[12px] font-medium text-[#5a6053]">
                      {entry.value.toLocaleString()} ({i === 0 ? "65%" : "35%"})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-white p-8 rounded-2xl border border-[#e4beba1a] shadow-sm flex flex-col gap-6">
              <h3 className="text-lg font-medium text-[#1a1c1b]">レビュー感情分析</h3>
              <div className="flex flex-col gap-6">
                {sentimentData.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="flex flex-col gap-2">
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
                    )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Menu & Times */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          {/* Popular Menu */}
          <div className="bg-[#af111c] p-8 rounded-2xl shadow-xl shadow-[#af111c20] flex flex-col gap-6 relative overflow-hidden">
            <h2 className="text-xl font-medium text-white relative z-10">人気メニュー TOP3</h2>
            <div className="flex flex-col gap-6 relative z-10">
              {popularMenu.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="size-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xl font-medium text-white">{item.id}</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-[14px] font-medium truncate max-w-[160px]">{item.name}</span>
                      <span className="text-[10px] opacity-80">{item.orders} 注文</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Decoration */}
            <div className="absolute top-0 right-0 size-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full" />
            <Trophy className="absolute bottom-4 right-4 size-16 text-white/5" />
          </div>

          {/* Popular Times */}
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
                      cursor={{ fill: '#af111c08' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={42} shape={<PopularTimeBar />}>
                      {popularTimes.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
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
                  19時前後のピークに向けて、18:30から日本人スタッフを増員することをお勧めします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
