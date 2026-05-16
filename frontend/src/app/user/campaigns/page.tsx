import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Campaign = {
  badge: string;
  badgeClassName: string;
  category: string;
  name: string;
  description: string;
  target: string;
  period: string;
  condition: string;
};

const filters = [
  {
    label: "カテゴリー",
    options: ["すべて", "寿司", "カフェ", "ラーメン", "焼肉"],
  },
  {
    label: "特典内容",
    options: ["すべて", "割引", "ドリンク無料", "2杯目無料"],
  },
  {
    label: "対象ユーザー",
    options: ["すべて", "全ユーザー", "新規メンバー限定", "エリート会員限定"],
  },
];

const campaigns: Campaign[] = [
  {
    badge: "10% OFF",
    badgeClassName: "bg-[#af111c]",
    category: "寿司",
    name: "匠（たくみ）",
    description:
      "本格的なおまかせ寿司体験。ディナータイムの合計金額から割引いたします。",
    target: "全ユーザー",
    period: "2024年12月31日まで",
    condition: "ディナータイム限定・要事前予約",
  },
  {
    badge: "ドリンク無料",
    badgeClassName: "bg-[#5a6053]",
    category: "カフェ",
    name: "海の花",
    description:
      "メインディッシュをご注文の方に、季節の特製ゆずソーダを1杯無料でご提供します。",
    target: "新規メンバー限定",
    period: "2024年11月15日まで",
    condition: "500,000 VND以上のご注文",
  },
  {
    badge: "2杯目無料",
    badgeClassName: "bg-[#5a6053]",
    category: "ラーメン",
    name: "一（かず）",
    description:
      "平日ランチタイム限定。ラーメンを2杯ご注文いただくと、1杯分が無料になります。",
    target: "全ユーザー",
    period: "2024年10月30日まで",
    condition: "平日 11:00〜14:00 限定",
  },
  {
    badge: "15% OFF",
    badgeClassName: "bg-[#af111c]",
    category: "焼肉",
    name: "炭火焼肉 宴",
    description:
      "平日限定のスペシャルオファー。全てのコース料理を15%割引でご提供いたします。",
    target: "エリート会員限定",
    period: "2024年11月20日まで",
    condition: "日本語コミュニティへのレビュー投稿",
  },
];

function FilterSelect({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-jp text-xs font-medium uppercase leading-4 tracking-wide text-[#5a6053]">
        {label}
      </span>
      <Select defaultValue={options[0]}>
        <SelectTrigger className="h-9 w-full rounded-sm border-[#e2e3e0] bg-white px-3 font-jp text-sm font-medium leading-5 text-[#1a1c1b] shadow-none focus-visible:border-[#af111c] focus-visible:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-sm border-[#e2e3e0] bg-white font-jp text-sm text-[#1a1c1b]">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DetailItem({
  label,
  value,
  isNumeric = false,
}: {
  label: string;
  value: string;
  isNumeric?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="pb-1 font-jp text-[10px] font-medium uppercase leading-4 tracking-wide text-[#5a6053]">
        {label}
      </p>
      <p
        className={
          isNumeric
            ? "truncate font-manrope text-sm font-bold leading-5 text-[#1a1c1b]"
            : "truncate font-jp text-sm font-medium leading-5 text-[#1a1c1b]"
        }
      >
        {value}
      </p>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Card className="gap-0 overflow-hidden rounded-lg border border-[#e8e8e5] bg-white py-0 shadow-none ring-0 md:flex md:flex-row">
      <div
        className="relative h-56 shrink-0 overflow-hidden bg-[#f4f4f1] bg-cover bg-center md:h-auto md:w-80"
        style={{ backgroundImage: "url(https://placehold.co/320x236)" }}
      >
        <Badge
          className={`absolute left-4 top-4 h-auto rounded-xl border-0 px-3 py-1.5 font-jp text-[10px] font-medium uppercase leading-4 tracking-wide text-white shadow-lg ${campaign.badgeClassName}`}
        >
          {campaign.badge}
        </Badge>
      </div>

      <CardContent className="flex min-w-0 flex-1 flex-col p-6 md:p-8">
        <div className="flex flex-col gap-5 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="font-jp text-xs font-medium leading-4 text-[#af111c]">
              {campaign.category}
            </p>
            <h2 className="pt-1 font-jp text-2xl font-medium leading-8 text-[#1a1c1b]">
              {campaign.name}
            </h2>
            <p className="max-w-[640px] pt-2 font-jp text-base font-medium leading-6 text-[#5b403d]">
              {campaign.description}
            </p>
          </div>

          <Button className="h-11 shrink-0 rounded-md bg-[#af111c] px-8 font-jp text-sm font-medium leading-5 text-white hover:bg-[#981018]">
            キャンペーンを利用
          </Button>
        </div>

        <div className="grid gap-4 border-t border-[#e8e8e5] pt-6 sm:grid-cols-3">
          <DetailItem label="対象" value={campaign.target} />
          <DetailItem label="期間" value={campaign.period} isNumeric />
          <DetailItem label="条件" value={campaign.condition} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserCampaignPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f9f6]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-6 py-20 lg:py-32">
        <header className="space-y-2">
          <h1 className="font-jp text-4xl font-medium leading-10 text-[#1a1c1b]">
            おすすめキャンペーン
          </h1>
          <p className="font-jp text-lg font-medium leading-7 text-[#5a6053]">
            ハノイの人気レストランでお得に食事を楽しみましょう
          </p>
        </header>

        <form>
          <Card className="gap-0 rounded-2xl border-0 bg-[#f4f4f1] py-0 shadow-none ring-0">
            <CardContent className="grid gap-5 p-6 lg:grid-cols-[repeat(3,minmax(0,1fr))_160px] lg:items-end">
              {filters.map((filter) => (
                <FilterSelect
                  key={filter.label}
                  label={filter.label}
                  options={filter.options}
                />
              ))}
              <div className="flex h-16 items-end lg:h-auto">
                <Button
                  type="submit"
                  className="h-10 w-full rounded-sm bg-[#1a1c1b] px-5 font-jp text-sm font-medium leading-5 text-[#f9f9f6] hover:bg-[#303331]"
                >
                  <Search className="size-3.5" strokeWidth={2} />
                  検索する
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <section className="flex flex-col gap-6 pt-2">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.name} campaign={campaign} />
          ))}
        </section>
      </div>
    </main>
  );
}
