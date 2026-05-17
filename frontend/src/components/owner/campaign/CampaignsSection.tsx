"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AdRequestDialog } from "@/components/owner/campaign/AdRequestDialog";
import {
  endOwnerPromotion,
  updateOwnerPromotion,
} from "@/lib/api/campaigns/API";
import type { OwnerPromotion } from "@/lib/api/campaigns/type";
import {
  OWNER_TOAST_MESSAGES,
  showErrorToast,
  showSuccessToast,
} from "@/lib/app-toast";

type CampaignMetric = {
  label: string;
  value: string;
};

type CampaignsSectionProps = {
  items: OwnerPromotion[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void | Promise<void>;
};

const numberFormatter = new Intl.NumberFormat("en");
const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const discountOptions = [
  {
    value: "percentage-10",
    label: "合計金額から 10% OFF",
    discountType: "Percentage",
    discountValue: "10%",
  },
  {
    value: "percentage-20",
    label: "合計金額から 20% OFF",
    discountType: "Percentage",
    discountValue: "20%",
  },
  {
    value: "percentage-50",
    label: "合計金額から 50% OFF",
    discountType: "Percentage",
    discountValue: "50%",
  },
  {
    value: "fixed-50000",
    label: "合計金額から 50,000VND 割引",
    discountType: "FixedAmount",
    discountValue: "50000VND",
  },
  {
    value: "fixed-100000",
    label: "合計金額から 100,000VND 割引",
    discountType: "FixedAmount",
    discountValue: "100000VND",
  },
] as const;

const toInputDate = (value: string) => new Date(value).toISOString().slice(0, 10);
const toApiStartDate = (value: string) => `${value}T00:00:00.000Z`;
const toApiEndDate = (value: string) => `${value}T23:59:59.000Z`;

function getDiscountOptionValue(item: OwnerPromotion) {
  if (item.promotionType !== "Campaign") return discountOptions[0].value;

  return (
    discountOptions.find(
      (option) =>
        option.discountType === item.discountType &&
        option.discountValue === item.discountValue
    )?.value ?? discountOptions[0].value
  );
}

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function getScheduleLabel(item: OwnerPromotion) {
  if (item.status === "Ended") {
    return `${formatDate(item.endDate)} 終了`;
  }

  const endTime = new Date(item.endDate).getTime();
  const now = Date.now();
  const remainingDays = Math.max(
    0,
    Math.ceil((endTime - now) / (1000 * 60 * 60 * 24))
  );

  return `終了まであと ${remainingDays}日`;
}

function getStatusLabel(status: OwnerPromotion["status"]) {
  const labels: Record<OwnerPromotion["status"], string> = {
    Active: "実施中",
    Pending: "承認待ち",
    Rejected: "差戻し",
    Ended: "終了済み",
  };

  return labels[status] ?? status;
}

function getStatusBadgeClassName(status: OwnerPromotion["status"]) {
  const classNames: Record<OwnerPromotion["status"], string> = {
    Active: "bg-[#dcfce7] text-[#15803d] hover:bg-[#dcfce7]",
    Pending:
      "bg-[color-mix(in_oklab,var(--ink-600),transparent_86%)] text-(--ink-600) hover:bg-[color-mix(in_oklab,var(--ink-600),transparent_86%)]",
    Rejected: "bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fee2e2]",
    Ended:
      "bg-[color-mix(in_oklab,var(--ink-600),transparent_80%)] text-(--ink-600) hover:bg-[color-mix(in_oklab,var(--ink-600),transparent_80%)]",
  };

  return classNames[status] ?? classNames.Ended;
}

function getAudienceLabel(value: string | null) {
  const labels: Record<string, string> = {
    all: "すべてのお客様",
    new: "新規のお客様",
  };

  return value ? labels[value] ?? value : "すべてのお客様";
}

function getAdvertisementTypeLabel(value: string | null) {
  const labels: Record<string, string> = {
    SNS: "バナー広告",
    Notification: "プッシュ通知",
  };

  return value ? labels[value] ?? value : "広告";
}

function getDiscountLabel(discountType: string | null, discountValue: string | null) {
  if (!discountType || !discountValue) {
    return "-";
  }

  if (discountType === "Percentage") {
    return `${discountValue}割引`;
  }

  if (discountType === "FixedAmount") {
    return `${discountValue.replace("VND", "")}VND割引`;
  }

  return `${discountType} ${discountValue}`;
}

function getTitle(item: OwnerPromotion) {
  if (item.promotionType === "Campaign") {
    return item.campaignName;
  }

  return item.titleJp || item.titleVn || "広告リクエスト";
}

function getDescription(item: OwnerPromotion) {
  if (item.promotionType === "Campaign") {
    return item.campaignDescription || item.note || "";
  }

  return item.contentJp || item.contentVn || item.termsJp || item.termsVn || "";
}

function getMetrics(item: OwnerPromotion): CampaignMetric[] {
  const ctr =
    item.impressions > 0
      ? `${((item.clicks / item.impressions) * 100).toFixed(1)}%`
      : "0%";

  const typeLabel =
    item.promotionType === "Campaign"
      ? getDiscountLabel(item.discountType, item.discountValue)
      : getAdvertisementTypeLabel(item.advertisementType);

  return [
    { label: "種類", value: typeLabel },
    { label: "リーチ数", value: numberFormatter.format(item.impressions) },
    { label: "利用数", value: numberFormatter.format(item.clicks) },
    { label: "広告費", value: currencyFormatter.format(item.totalCost) },
    { label: "CTR", value: ctr },
  ];
}

export function CampaignsSection({
  items,
  isLoading,
  errorMessage,
  onRetry,
}: CampaignsSectionProps) {
  const [endingPromotionId, setEndingPromotionId] = useState<number | null>(null);
  const [promotionToEnd, setPromotionToEnd] = useState<OwnerPromotion | null>(
    null
  );
  const [editingPromotion, setEditingPromotion] = useState<OwnerPromotion | null>(
    null
  );
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAudience, setEditAudience] = useState("all");
  const [editDiscount, setEditDiscount] = useState<string>(discountOptions[0].value);
  const [editAdType, setEditAdType] = useState("SNS");
  const [editBudget, setEditBudget] = useState("0");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  const openEditDialog = (promotion: OwnerPromotion) => {
    setEditingPromotion(promotion);
    setEditTitle(getTitle(promotion));
    setEditDescription(getDescription(promotion));
    setEditAudience(promotion.targetAudience ?? "all");
    setEditDiscount(getDiscountOptionValue(promotion));
    setEditAdType(
      promotion.promotionType === "Advertisement"
        ? promotion.advertisementType ?? "SNS"
        : "SNS"
    );
    setEditBudget(String(promotion.totalCost ?? 0));
    setEditStartDate(toInputDate(promotion.startDate));
    setEditEndDate(toInputDate(promotion.endDate));
  };

  const handleEndPromotion = async (promotion: OwnerPromotion) => {
    try {
      setEndingPromotionId(promotion.promotionId);
      await endOwnerPromotion(promotion.promotionId);
      showSuccessToast("キャンペーンを停止しました");
      setPromotionToEnd(null);
      await onRetry?.();
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : OWNER_TOAST_MESSAGES.error
      );
    } finally {
      setEndingPromotionId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPromotion || isSavingEdit) return;

    const selectedDiscount =
      discountOptions.find((option) => option.value === editDiscount) ??
      discountOptions[0];

    try {
      setIsSavingEdit(true);
      await updateOwnerPromotion(
        editingPromotion.promotionId,
        editingPromotion.promotionType === "Campaign"
          ? {
              titleVn: editTitle.trim(),
              titleJp: editTitle.trim(),
              contentVn: editDescription.trim(),
              contentJp: editDescription.trim(),
              targetAudience: editAudience,
              discountType: selectedDiscount.discountType,
              discountValue: selectedDiscount.discountValue,
              termsVn: editingPromotion.note ?? undefined,
              termsJp: editingPromotion.note ?? undefined,
              startDate: toApiStartDate(editStartDate),
              endDate: toApiEndDate(editEndDate),
            }
          : {
              titleVn: editTitle.trim(),
              titleJp: editTitle.trim(),
              contentVn: editDescription.trim(),
              contentJp: editDescription.trim(),
              advertisementType: editAdType,
              totalCost: Number(editBudget || 0),
              mediaUrl: editingPromotion.mediaUrl ?? undefined,
              startDate: toApiStartDate(editStartDate),
              endDate: toApiEndDate(editEndDate),
            }
      );
      showSuccessToast("編集内容を保存しました");
      setEditingPromotion(null);
      await onRetry?.();
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : OWNER_TOAST_MESSAGES.error
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleResumePromotion = () => {
    showErrorToast("再開機能は準備中です");
  };

  const renderActionButtons = (promotion: OwnerPromotion) => {
    const editButton = (
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          if (promotion.promotionType === "Campaign") {
            openEditDialog(promotion);
          }
        }}
        className="h-auto w-32 rounded-sm bg-[var(--surface-mist)] px-0 py-2 font-jp text-xs font-medium leading-4 text-[var(--ink-900)] hover:bg-[color-mix(in_oklab,var(--surface-mist),black_4%)]"
      >
        編集
      </Button>
    );
    const editAction =
      promotion.promotionType === "Advertisement" ? (
        <AdRequestDialog
          mode="edit"
          onCreated={onRetry}
          promotion={promotion}
          trigger={editButton}
        />
      ) : (
        editButton
      );

    if (promotion.status === "Active") {
      return (
        <>
          {editAction}
          <Button
            type="button"
            variant="outline"
            disabled={endingPromotionId === promotion.promotionId}
            onClick={() => setPromotionToEnd(promotion)}
            className="h-auto w-32 rounded-sm border-[#e4beba] px-0 py-2 font-jp text-xs font-medium leading-4 text-primary hover:bg-[color-mix(in_oklab,var(--primary),transparent_95%)] hover:text-primary"
          >
            {endingPromotionId === promotion.promotionId ? "停止中..." : "停止する"}
          </Button>
        </>
      );
    }

    if (promotion.status === "Ended") {
      return (
        <Button
          type="button"
          variant="outline"
          onClick={handleResumePromotion}
          className="h-auto w-32 rounded-sm border-[color-mix(in_oklab,var(--primary),transparent_85%)] px-0 py-2 font-jp text-xs font-medium leading-4 text-(--ink-600) hover:bg-white/70"
        >
          再開する
        </Button>
      );
    }

    return (
      editAction
    );
  };

  return (
    <section className="flex flex-col gap-6">
      <Dialog
        open={Boolean(promotionToEnd)}
        onOpenChange={(open) => {
          if (!open && endingPromotionId === null) {
            setPromotionToEnd(null);
          }
        }}
      >
        <DialogContent className="max-w-[420px] rounded-lg bg-white p-6">
          <div className="space-y-3">
            <DialogTitle className="font-jp text-xl font-medium text-(--ink-900)">
              キャンペーンを停止しますか？
            </DialogTitle>
            <DialogDescription className="font-jp text-sm font-medium leading-6 text-(--ink-600)">
              停止すると、このキャンペーンは終了済みとして表示されます。
            </DialogDescription>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={endingPromotionId !== null}
              onClick={() => setPromotionToEnd(null)}
              className="h-auto rounded px-5 py-2 font-jp text-sm font-medium"
            >
              キャンセル
            </Button>
            <Button
              type="button"
              disabled={!promotionToEnd || endingPromotionId !== null}
              onClick={() => {
                if (promotionToEnd) {
                  void handleEndPromotion(promotionToEnd);
                }
              }}
              className="h-auto rounded bg-primary px-6 py-2 font-jp text-sm font-medium text-white hover:bg-[color-mix(in_oklab,var(--primary),black_10%)]"
            >
              {endingPromotionId !== null ? "停止中..." : "停止する"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editingPromotion)}
        onOpenChange={(open) => {
          if (!open && !isSavingEdit) {
            setEditingPromotion(null);
          }
        }}
      >
        <DialogContent className="max-w-[672px] overflow-hidden rounded-lg border-none bg-white p-0">
          <header className="bg-(--surface-mist) px-8 py-6">
            <DialogTitle className="font-jp text-3xl font-medium tracking-[-0.6px] text-primary">
              編集
            </DialogTitle>
            <DialogDescription className="mt-2 font-jp text-sm font-medium text-(--ink-600)">
              保存すると承認待ちに戻ります。
            </DialogDescription>
          </header>
          <div className="space-y-6 p-8">
            <section className="space-y-3">
              <Label className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">
                タイトル
              </Label>
              <Input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                className="h-auto rounded bg-[#eeeeeb] px-4 py-4 font-jp text-base font-medium text-(--ink-900)"
              />
            </section>
            <section className="space-y-3">
              <Label className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">
                説明
              </Label>
              <Textarea
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                className="h-[104px] resize-none rounded bg-[#eeeeeb] px-4 py-4 font-jp text-base font-medium leading-6 text-(--ink-900)"
              />
            </section>
            {editingPromotion?.promotionType === "Campaign" ? (
              <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">
                    対象ユーザー
                  </Label>
                  <Select value={editAudience} onValueChange={setEditAudience}>
                    <SelectTrigger className="h-11 w-full rounded-md border border-[#e2e3e0] bg-white px-3 font-jp text-sm font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべてのお客様</SelectItem>
                      <SelectItem value="new">新規のお客様</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">
                    割引タイプ
                  </Label>
                  <Select value={editDiscount} onValueChange={setEditDiscount}>
                    <SelectTrigger className="h-11 w-full rounded-md border border-[#e2e3e0] bg-white px-3 font-jp text-sm font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {discountOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>
            ) : (
              <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">
                    広告タイプ
                  </Label>
                  <Select value={editAdType} onValueChange={setEditAdType}>
                    <SelectTrigger className="h-11 w-full rounded-md border border-[#e2e3e0] bg-white px-3 font-jp text-sm font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SNS">バナー広告</SelectItem>
                      <SelectItem value="Notification">プッシュ通知</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">
                    予算
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={editBudget}
                    onChange={(event) => setEditBudget(event.target.value)}
                    className="h-11 rounded bg-[#eeeeeb] px-4 font-jp text-base font-medium"
                  />
                </div>
              </section>
            )}
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">
                  開始日
                </Label>
                <Input
                  value={editStartDate}
                  onChange={(event) => setEditStartDate(event.target.value)}
                  placeholder="yyyy-mm-dd"
                  className="h-11 rounded bg-[#eeeeeb] px-4 font-manrope text-base"
                />
              </div>
              <div className="space-y-3">
                <Label className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">
                  終了日
                </Label>
                <Input
                  value={editEndDate}
                  onChange={(event) => setEditEndDate(event.target.value)}
                  placeholder="yyyy-mm-dd"
                  className="h-11 rounded bg-[#eeeeeb] px-4 font-manrope text-base"
                />
              </div>
            </section>
            <footer className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSavingEdit}
                onClick={() => setEditingPromotion(null)}
                className="h-auto rounded px-8 py-3 font-jp text-base font-medium"
              >
                キャンセル
              </Button>
              <Button
                type="button"
                disabled={
                  isSavingEdit ||
                  !editTitle.trim() ||
                  !editDescription.trim() ||
                  !editStartDate ||
                  !editEndDate
                }
                onClick={() => void handleSaveEdit()}
                className="h-auto rounded bg-primary px-12 py-3 font-jp text-base font-medium text-white"
              >
                {isSavingEdit ? "保存中..." : "保存"}
              </Button>
            </footer>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-between">
        <h2 className="font-jp text-xl font-medium leading-7 text-(--ink-900)">
          有効なキャンペーン
        </h2>
      </div>

      {isLoading ? (
        <Card className="rounded-lg border border-transparent bg-card shadow-[0px_1px_2px_#0000000d]">
          <CardContent className="p-6 text-sm font-medium text-(--ink-600)">
            Loading promotions...
          </CardContent>
        </Card>
      ) : errorMessage ? (
        <Card className="rounded-lg border border-destructive/20 bg-card shadow-[0px_1px_2px_#0000000d]">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-destructive">{errorMessage}</p>
            {onRetry ? (
              <Button type="button" variant="outline" onClick={() => void onRetry()}>
                Retry
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="rounded-lg border border-dashed border-[color-mix(in_oklab,var(--primary),transparent_85%)] bg-[linear-gradient(0deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.5)_100%),linear-gradient(0deg,var(--surface-mist)_0%,var(--surface-mist)_100%)]">
          <CardContent className="p-6 text-sm font-medium text-(--ink-600)">
            まだキャンペーンまたは広告リクエストはありません。
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((campaign) => (
            <Card
              key={campaign.promotionId}
              className={`rounded-lg ${
                campaign.status === "Ended"
                  ? "border border-dashed border-[color-mix(in_oklab,var(--primary),transparent_85%)] bg-[linear-gradient(0deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.5)_100%),linear-gradient(0deg,var(--surface-mist)_0%,var(--surface-mist)_100%)]"
                  : "border border-transparent bg-card shadow-[0px_1px_2px_#0000000d]"
              }`}
            >
              <CardContent className="p-6">
                <article className="flex flex-col gap-6 lg:flex-row lg:items-center">
                  <div className="shrink-0">
                    {campaign.promotionType === "Advertisement" && campaign.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={campaign.mediaUrl}
                        alt=""
                        className="h-32 w-48 rounded object-cover"
                      />
                    ) : (
                      <BurgerIllustration />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            className={`rounded-sm px-2 py-0.5 font-jp text-[10px] font-medium leading-[15px] shadow-none ${getStatusBadgeClassName(campaign.status)}`}
                          >
                            {getStatusLabel(campaign.status)}
                          </Badge>
                          <span className="font-jp text-xs font-medium leading-4 text-(--ink-600)">
                            {getScheduleLabel(campaign)}
                          </span>
                        </div>
                        <h3 className="pt-1 font-jp text-xl font-medium leading-7 text-(--ink-900)">
                          {getTitle(campaign)}
                        </h3>
                        <p className="line-clamp-2 font-jp text-sm font-medium leading-5 text-(--ink-600)">
                          {getDescription(campaign)}
                        </p>
                      </div>
                      <div className="shrink-0 text-left lg:text-right">
                        <p className="font-jp text-xs font-medium leading-4 text-(--ink-600)">
                          対象ユーザー
                        </p>
                        <p className="font-manrope text-lg font-bold leading-7 text-[var(--primary)]">
                          {getAudienceLabel(campaign.targetAudience)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-2 md:grid-cols-5">
                      {getMetrics(campaign).map((metric) => (
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
                    {renderActionButtons(campaign)}
                  </div>
                </article>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
