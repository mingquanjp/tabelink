"use client";

import { CalendarDays, Tag, X } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createOwnerCampaign,
  updateOwnerPromotion,
} from "@/lib/api/campaigns/API";
import type { OwnerCampaignPromotion } from "@/lib/api/campaigns/type";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { getCampaignErrorMessage } from "@/components/owner/campaign/campaign-toast";

type CampaignRequestDialogProps = {
  trigger: ReactNode;
  onCreated?: () => void | Promise<void>;
  mode?: "create" | "edit";
  promotion?: OwnerCampaignPromotion;
};

const audienceOptions = [
  { value: "all", label: "すべてのお客様" },
  { value: "new", label: "新規のお客様" },
] as const;

const discountOptions = [
  { value: "percentage-10", label: "合計金額から10%割引", discountType: "Percentage", discountValue: "10%" },
  { value: "percentage-20", label: "合計金額から20%割引", discountType: "Percentage", discountValue: "20%" },
  { value: "percentage-50", label: "合計金額から50%割引", discountType: "Percentage", discountValue: "50%" },
  { value: "percentage-100", label: "合計金額から100%割引", discountType: "Percentage", discountValue: "100%" },
  { value: "fixed-50000", label: "合計金額から50,000ドン割引", discountType: "FixedAmount", discountValue: "50000VND" },
  { value: "fixed-100000", label: "合計金額から100,000ドン割引", discountType: "FixedAmount", discountValue: "100000VND" },
  { value: "fixed-200000", label: "合計金額から200,000ドン割引", discountType: "FixedAmount", discountValue: "200000VND" },
] as const;

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
const toInputDateValue = (value?: string | null) =>
  value ? value.slice(0, 10) : "";
const toApiStartDate = (value: string) => `${value}T00:00:00.000Z`;
const toApiEndDate = (value: string) => `${value}T23:59:59.000Z`;

const parseInputDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export function CampaignRequestDialog({
  trigger,
  onCreated,
  mode = "create",
  promotion,
}: CampaignRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(promotion?.campaignName ?? "");
  const [description, setDescription] = useState(
    promotion?.campaignDescription ?? ""
  );
  const [audience, setAudience] = useState<(typeof audienceOptions)[number]["value"]>(
    promotion?.targetAudience === "new" ? "new" : "all"
  );
  const [discountType, setDiscountType] = useState<string>(
    discountOptions.find(
      (option) =>
        option.discountType === promotion?.discountType &&
        option.discountValue === promotion?.discountValue
    )?.value ?? discountOptions[0].value
  );
  const [startDate, setStartDate] = useState(toInputDateValue(promotion?.startDate));
  const [endDate, setEndDate] = useState(toInputDateValue(promotion?.endDate));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogTitle =
    mode === "edit" ? "キャンペーンを編集" : "新しいキャンペーンを作成";
  const submitLabel = mode === "edit" ? "保存" : "作成";
  const submittingLabel = mode === "edit" ? "保存中..." : "作成中...";

  const canSubmit =
    name.trim().length > 0 && description.trim().length > 0 && startDate && endDate;

  const resetForm = () => {
    setName(promotion?.campaignName ?? "");
    setDescription(promotion?.campaignDescription ?? "");
    setAudience(promotion?.targetAudience === "new" ? "new" : "all");
    setDiscountType(
      discountOptions.find(
        (option) =>
          option.discountType === promotion?.discountType &&
          option.discountValue === promotion?.discountValue
      )?.value ?? discountOptions[0].value
    );
    setStartDate(toInputDateValue(promotion?.startDate));
    setEndDate(toInputDateValue(promotion?.endDate));
  };

  const handleCancel = () => {
    resetForm();
    setOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    const selectedDiscount =
      discountOptions.find((option) => option.value === discountType) ??
      discountOptions[0];

    try {
      setIsSubmitting(true);
      if (mode === "edit" && promotion) {
        await updateOwnerPromotion(promotion.promotionId, {
          titleVn: name.trim(),
          titleJp: name.trim(),
          contentVn: description.trim(),
          contentJp: description.trim(),
          targetAudience: audience,
          discountType: selectedDiscount.discountType,
          discountValue: selectedDiscount.discountValue,
          termsVn: promotion.note ?? undefined,
          termsJp: promotion.note ?? undefined,
          startDate: toApiStartDate(startDate),
          endDate: toApiEndDate(endDate),
        });
      } else {
        await createOwnerCampaign({
          campaignName: name.trim(),
          campaignDescription: description.trim(),
          targetAudience: audience,
          discountType: selectedDiscount.discountType,
          discountValue: selectedDiscount.discountValue,
          note: "他のクーポンとの併用はできません。",
          startDate: toApiStartDate(startDate),
          endDate: toApiEndDate(endDate),
        });
      }
      showSuccessToast();
      resetForm();
      setOpen(false);
      await onCreated?.();
    } catch (error) {
      showErrorToast(getCampaignErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[672px] overflow-hidden rounded-lg border-none bg-white p-0">
        <header className="flex items-center justify-between bg-(--surface-mist) px-8 py-6">
          <DialogTitle className="font-jp text-3xl font-medium tracking-[-0.6px] text-primary">
            {dialogTitle}
          </DialogTitle>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="ダイアログを閉じる"
            className="rounded-xl p-2 text-(--ink-600) transition-colors hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form className="space-y-8 p-8" onSubmit={handleSubmit}>
          <section className="space-y-3">
            <Label className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">
              キャンペーン名
            </Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例：秋の味覚 季節限定プロモーション"
              className="h-auto rounded bg-[#eeeeeb] px-4 py-4 font-jp text-base font-medium text-(--ink-900) placeholder:text-[color-mix(in_oklab,#8f6f6c,transparent_40%)]"
            />
          </section>

          <section className="space-y-3">
            <Label className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">
              説明
            </Label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="キャンペーンの詳細やユーザーへのメッセージを入力してください..."
              className="h-[104px] resize-none rounded bg-[#eeeeeb] px-4 py-4 font-jp text-base font-medium leading-6 text-(--ink-900) placeholder:text-[color-mix(in_oklab,#8f6f6c,transparent_40%)]"
            />
          </section>

          <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <p className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">
                ターゲット層
              </p>
              <RadioGroup
                value={audience}
                onValueChange={(value) => setAudience(value as typeof audience)}
                className="space-y-2"
              >
                {audienceOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`audience-${option.value}`}
                    className="flex w-full cursor-pointer items-center gap-3 rounded px-3 py-3"
                  >
                    <RadioGroupItem
                      id={`audience-${option.value}`}
                      value={option.value}
                      className="border-[#e4beba] text-primary"
                    />
                    <span className="font-jp text-left text-base font-medium leading-6 text-(--ink-900)">
                      {option.label}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <p className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">
                適用条件
              </p>
              <div className="rounded-lg bg-(--surface-mist) p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Tag className="h-3 w-3 text-[#5b403d]" />
                  <p className="font-jp text-xs font-medium tracking-[-0.6px] text-[#5b403d]">
                    割引タイプ
                  </p>
                </div>
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger className="h-11 w-full rounded-md border border-[#e2e3e0] bg-white px-3 font-jp text-sm font-medium text-(--ink-900) shadow-none hover:border-[color-mix(in_oklab,var(--primary),transparent_55%)] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--primary),transparent_78%)]">
                    <SelectValue placeholder="割引タイプを選択" />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    className="min-w-[var(--radix-select-trigger-width)] rounded-md border border-[#e2e3e0] bg-white p-1 shadow-lg"
                    position="popper"
                  >
                    <SelectGroup>
                      {discountOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="rounded px-3 py-2 font-jp text-sm font-medium text-(--ink-900) focus:bg-(--surface-mist)"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="mt-3 font-jp text-[10px] font-medium leading-4 text-(--ink-600)">
                  ※ 週末および祝日は除外されます。他のクーポンとの併用はできません。
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <p className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">
              開催期間
            </p>
            <div className="flex items-center gap-4">
              <DateInput value={startDate} onChange={setStartDate} label="開始日を選択" />
              <span className="text-(--ink-900)">〜</span>
              <DateInput value={endDate} onChange={setEndDate} label="終了日を選択" />
            </div>
          </section>

          <footer className="flex items-center justify-end gap-4 pb-4 pt-6">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="h-auto rounded px-8 py-3 font-jp text-base font-medium text-(--ink-600)"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="h-auto rounded bg-primary px-12 py-3 font-jp text-base font-medium text-white shadow-[0px_10px_15px_-3px_rgba(175,17,28,0.2),0px_4px_6px_-4px_rgba(175,17,28,0.2)]"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DateInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="relative flex-1">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="年-月-日"
        className="h-auto rounded bg-[#eeeeeb] py-3 pl-4 pr-11 font-manrope text-base font-normal text-(--ink-900)"
      />
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-(--ink-600)"
          >
            <CalendarDays className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={parseInputDate(value)}
            onSelect={(date) => onChange(date ? toInputDate(date) : "")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
