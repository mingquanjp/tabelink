"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserCampaign } from "@/lib/api/campaigns/type";

const ALL_VALUE = "__all__";
const FALLBACK_IMAGE_URL = "https://placehold.co/320x236";
const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  Percentage: "パーセント割引",
  FixedAmount: "定額割引",
};
const TARGET_AUDIENCE_LABELS: Record<string, string> = {
  all: "全ユーザー対象",
  new: "新規ユーザー対象",
};
const TARGET_FILTER_OPTIONS = [
  { label: TARGET_AUDIENCE_LABELS.all, value: "all" },
  { label: TARGET_AUDIENCE_LABELS.new, value: "new" },
];

type FilterKey = "category" | "benefit" | "target";

type CampaignFilters = Record<FilterKey, string>;

type FilterConfig = {
  key: FilterKey;
  label: string;
  options: FilterOption[];
};

type FilterOption = {
  label: string;
  value: string;
};

type CampaignViewModel = {
  promotionId: number;
  restaurantId: number;
  badge: string;
  badgeClassName: string;
  category: string;
  name: string;
  description: string;
  target: string;
  targetValue: string;
  period: string;
  condition: string;
  imageUrl: string;
};

const emptyFilters: CampaignFilters = {
  category: ALL_VALUE,
  benefit: ALL_VALUE,
  target: ALL_VALUE,
};

function pickText(primary: string | null | undefined, fallback: string | null | undefined) {
  return primary?.trim() || fallback?.trim() || "";
}

function uniqueOptions(
  values: string[],
  compare: (a: string, b: string) => number = (a, b) =>
    a.localeCompare(b, "ja"),
) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    compare(a, b),
  );
}

function compareBenefitOptions(a: string, b: string) {
  const parseBenefit = (value: string) => {
    const numericValue = Number(value.replace(/[^\d.]/g, ""));

    if (value.includes("%")) {
      return { group: 0, numericValue };
    }

    if (/vnd/i.test(value)) {
      return { group: 1, numericValue };
    }

    return { group: 2, numericValue: Number.POSITIVE_INFINITY };
  };
  const first = parseBenefit(a);
  const second = parseBenefit(b);

  if (first.group !== second.group) {
    return first.group - second.group;
  }

  if (first.numericValue !== second.numericValue) {
    return first.numericValue - second.numericValue;
  }

  return a.localeCompare(b, "ja");
}

function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(
    new Date(endDate),
  )}`;
}

function formatDiscountType(discountType: string | null) {
  if (!discountType) {
    return "未分類";
  }

  return DISCOUNT_TYPE_LABELS[discountType] ?? discountType;
}

function formatTargetAudience(targetAudience: string | null) {
  const normalizedTargetAudience = normalizeTargetAudience(targetAudience);

  return TARGET_AUDIENCE_LABELS[normalizedTargetAudience] ?? targetAudience ?? "ALL";
}

function normalizeTargetAudience(targetAudience: string | null) {
  const normalized = targetAudience?.trim().toLowerCase();

  return normalized === "new" ? "new" : "all";
}

function toCampaignViewModel(campaign: UserCampaign): CampaignViewModel {
  const discountValue = pickText(campaign.discountValue, campaign.discountType);

  return {
    promotionId: campaign.promotionId,
    restaurantId: campaign.restaurantId,
    badge: discountValue || "キャンペーン",
    badgeClassName: discountValue.includes("%") ? "bg-[#af111c]" : "bg-[#5a6053]",
    category: formatDiscountType(campaign.discountType),
    name: pickText(campaign.restaurantNameJP, campaign.restaurantNameVN),
    description: pickText(
      campaign.campaignDescriptionJP,
      campaign.campaignDescriptionVN,
    ),
    target: formatTargetAudience(campaign.targetAudience),
    targetValue: normalizeTargetAudience(campaign.targetAudience),
    period: formatDateRange(campaign.startDate, campaign.endDate),
    condition: pickText(campaign.noteJP, campaign.noteVN) || "条件なし",
    imageUrl: campaign.imageUrl || FALLBACK_IMAGE_URL,
  };
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedLabel =
    value === ALL_VALUE
      ? "すべて"
      : (options.find((option) => option.value === value)?.label ?? value);

  return (
    <div className="flex flex-col gap-2">
      <span className="font-jp text-xs font-medium uppercase leading-4 tracking-wide text-[#5a6053]">
        {label}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-full items-center justify-between rounded-sm border border-[#e2e3e0] bg-white px-3 font-jp text-sm font-medium leading-5 text-[#1a1c1b] shadow-none outline-none transition-colors hover:border-[#d5b0ad] focus-visible:border-[#af111c] focus-visible:ring-2 focus-visible:ring-[#af111c]/15"
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronDown className="size-4 shrink-0 text-[#5a6053]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-sm border-[#e2e3e0] bg-white font-jp text-sm text-[#1a1c1b]">
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            <DropdownMenuRadioItem value={ALL_VALUE}>
              すべて
            </DropdownMenuRadioItem>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
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

function CampaignCard({ campaign }: { campaign: CampaignViewModel }) {
  return (
    <Card className="gap-0 overflow-hidden rounded-lg border border-[#e8e8e5] bg-white py-0 shadow-none ring-0 md:flex md:flex-row">
      <div
        className="relative h-56 shrink-0 overflow-hidden bg-[#f4f4f1] bg-cover bg-center md:h-auto md:w-80"
        style={{ backgroundImage: `url(${campaign.imageUrl})` }}
      >
        <Badge
          className={`absolute left-4 top-4 h-auto max-w-[calc(100%-32px)] rounded-xl border-0 px-3 py-1.5 font-jp text-[10px] font-medium uppercase leading-4 tracking-wide text-white shadow-lg ${campaign.badgeClassName}`}
        >
          <span className="truncate">{campaign.badge}</span>
        </Badge>
      </div>

      <CardContent className="flex min-w-0 flex-1 flex-col p-6 md:p-8">
        <div className="flex flex-col gap-5 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="pt-1 font-jp text-2xl font-medium leading-8 text-[#1a1c1b]">
              {campaign.name}
            </h2>
            <p className="max-w-[640px] pt-2 font-jp text-base font-medium leading-6 text-[#5b403d]">
              {campaign.description}
            </p>
          </div>

          <Button
            asChild
            className="h-11 shrink-0 rounded-md bg-[#af111c] px-8 font-jp text-sm font-medium leading-5 text-white hover:bg-[#981018]"
          >
            <Link href={`/user/restaurants/${campaign.restaurantId}`}>
              詳細を見る
            </Link>
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

function matchesFilter(value: string, filter: string) {
  return filter === ALL_VALUE || value === filter;
}

function matchesTargetFilter(targetValue: string, filter: string) {
  if (filter === ALL_VALUE) {
    return true;
  }

  if (filter === "new") {
    return targetValue === "new" || targetValue === "all";
  }

  return targetValue === filter;
}

export function CampaignList({
  campaigns,
}: {
  campaigns: UserCampaign[];
}) {
  const [draftFilters, setDraftFilters] =
    useState<CampaignFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<CampaignFilters>(emptyFilters);
  const campaignCards = useMemo(
    () => campaigns.map(toCampaignViewModel),
    [campaigns],
  );
  const benefitOptions = useMemo(() => {
    const sourceCampaigns =
      draftFilters.category === ALL_VALUE
        ? campaignCards
        : campaignCards.filter(
            (campaign) => campaign.category === draftFilters.category,
          );

    return uniqueOptions(
      sourceCampaigns.map((campaign) => campaign.badge),
      compareBenefitOptions,
    );
  }, [campaignCards, draftFilters.category]);
  const filterConfigs = useMemo<FilterConfig[]>(
    () => [
      {
        key: "category",
        label: "カテゴリー",
        options: uniqueOptions(
          campaignCards.map((campaign) => campaign.category),
        ).map((value) => ({ label: value, value })),
      },
      {
        key: "benefit",
        label: "特典内容",
        options: benefitOptions.map((value) => ({ label: value, value })),
      },
      {
        key: "target",
        label: "対象ユーザー",
        options: TARGET_FILTER_OPTIONS,
      },
    ],
    [benefitOptions, campaignCards],
  );
  const filteredCampaigns = useMemo(
    () =>
      campaignCards.filter(
        (campaign) =>
          matchesFilter(campaign.category, appliedFilters.category) &&
          matchesFilter(campaign.badge, appliedFilters.benefit) &&
          matchesTargetFilter(campaign.targetValue, appliedFilters.target),
      ),
    [appliedFilters, campaignCards],
  );

  function updateDraftFilter(key: FilterKey, value: string) {
    setDraftFilters((current) => {
      if (key !== "category") {
        return {
          ...current,
          [key]: value,
        };
      }

      const shouldResetBenefit =
        current.benefit !== ALL_VALUE &&
        !campaignCards.some(
          (campaign) =>
            campaign.badge === current.benefit &&
            (value === ALL_VALUE || campaign.category === value),
        );

      return {
        ...current,
        category: value,
        benefit: shouldResetBenefit ? ALL_VALUE : current.benefit,
      };
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
  }

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

        <form onSubmit={handleSubmit}>
          <Card className="gap-0 rounded-2xl border-0 bg-[#f4f4f1] py-0 shadow-none ring-0">
            <CardContent className="grid gap-5 p-6 lg:grid-cols-[repeat(3,minmax(0,1fr))_160px] lg:items-end">
              {filterConfigs.map((filter) => (
                <FilterSelect
                  key={filter.key}
                  label={filter.label}
                  options={filter.options}
                  value={draftFilters[filter.key]}
                  onChange={(value) => updateDraftFilter(filter.key, value)}
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
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.promotionId}
                campaign={campaign}
              />
            ))
          ) : (
            <Card className="rounded-lg border border-dashed border-[#d8d9d4] bg-white py-0 shadow-none">
              <CardContent className="px-6 py-12 text-center font-jp text-sm font-medium leading-6 text-[#5a6053]">
                条件に一致するキャンペーンはありません。
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
