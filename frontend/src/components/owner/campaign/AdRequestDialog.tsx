"use client";

import { BellRing, CalendarDays, ImagePlus, Megaphone, Send, Wallet, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  createOwnerAdRequest,
  updateOwnerPromotion,
  uploadOwnerAdImage,
} from "@/lib/api/campaigns/API";
import type { OwnerAdPromotion } from "@/lib/api/campaigns/type";
import {
  OWNER_TOAST_MESSAGES,
  showErrorToast,
  showSuccessToast,
} from "@/lib/app-toast";
import { getCampaignErrorMessage } from "@/components/owner/campaign/campaign-toast";

type AdRequestDialogProps = {
  trigger: ReactNode;
  onCreated?: () => void | Promise<void>;
  mode?: "create" | "edit";
  promotion?: OwnerAdPromotion;
};

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
const toApiStartDate = (value: string) => `${value}T00:00:00.000Z`;
const toApiEndDate = (value: string) => `${value}T23:59:59.000Z`;

const parseInputDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

function AdTypeCard({
  title,
  description,
  active,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  active?: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-lg border-2 p-[18px] text-left ${
        active
          ? "border-primary bg-[color-mix(in_oklab,var(--primary),transparent_95%)]"
          : "border-transparent bg-(--surface-mist)"
      }`}
    >
      {icon}
      <p className="font-manrope text-base font-bold leading-6 text-(--ink-900)">{title}</p>
      <p className="font-jp text-xs font-medium leading-[15px] text-(--ink-600)">{description}</p>
    </button>
  );
}

const toInputDateValue = (value?: string | null) =>
  value ? value.slice(0, 10) : "";

export function AdRequestDialog({
  trigger,
  onCreated,
  mode = "create",
  promotion,
}: AdRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [adType, setAdType] = useState<"banner" | "push">(
    promotion?.advertisementType === "Notification" ? "push" : "banner"
  );
  const [startDate, setStartDate] = useState(toInputDateValue(promotion?.startDate));
  const [endDate, setEndDate] = useState(toInputDateValue(promotion?.endDate));
  const [budget, setBudget] = useState(String(promotion?.totalCost ?? 50000));
  const [message, setMessage] = useState(
    promotion?.contentJp || promotion?.contentVn || ""
  );
  const [creativeFile, setCreativeFile] = useState<File | null>(null);
  const [creativePreviewUrl, setCreativePreviewUrl] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedBudget = useMemo(() => Number(budget || 0), [budget]);
  const canSubmit = message.trim().length > 0 && parsedBudget > 0 && startDate && endDate;

  useEffect(() => {
    return () => {
      if (creativePreviewUrl) {
        URL.revokeObjectURL(creativePreviewUrl);
      }
    };
  }, [creativePreviewUrl]);

  const updateCreativeFile = (file: File | null) => {
    setCreativeFile(file);
    setCreativePreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const resetForm = () => {
    setAdType(promotion?.advertisementType === "Notification" ? "push" : "banner");
    setStartDate(toInputDateValue(promotion?.startDate));
    setEndDate(toInputDateValue(promotion?.endDate));
    setBudget(String(promotion?.totalCost ?? 50000));
    setMessage(promotion?.contentJp || promotion?.contentVn || "");
    updateCreativeFile(null);
  };

  const handleCancel = () => {
    resetForm();
    setOpen(false);
  };

  const handleCreativeFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;

    if (file && file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      updateCreativeFile(null);
      showErrorToast(OWNER_TOAST_MESSAGES.uploadError);
      return;
    }

    updateCreativeFile(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const uploadResult = creativeFile
        ? await uploadOwnerAdImage(creativeFile)
        : null;
      const advertisementType: "SNS" | "Notification" =
        adType === "banner" ? "SNS" : "Notification";
      const payload = {
        titleJp:
          promotion?.titleJp ||
          (adType === "banner"
            ? "Banner広告リクエスト"
            : "Push通知リクエスト"),
        contentJp: message.trim(),
        advertisementType,
        mediaUrl: uploadResult?.mediaUrl ?? promotion?.mediaUrl ?? undefined,
        totalCost: parsedBudget,
        startDate: toApiStartDate(startDate),
        endDate: toApiEndDate(endDate),
      };

      if (mode === "edit" && promotion) {
        await updateOwnerPromotion(promotion.promotionId, payload);
      } else {
        await createOwnerAdRequest(payload);
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
        <div className="flex items-center justify-between border-b border-[color-mix(in_oklab,var(--primary),transparent_90%)] px-8 pb-[25px] pt-6">
          <div className="space-y-1">
            <DialogTitle className="font-jp text-3xl font-medium tracking-[-0.6px] text-primary">
              {mode === "edit" ? "広告リクエストを編集" : "広告リクエスト"}
            </DialogTitle>
            <DialogDescription className="font-jp text-sm font-medium text-(--ink-600)">
              集客を最大化するための特別なプロモーションプラン
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Close dialog"
            className="rounded-xl p-2 text-(--ink-600) transition-colors hover:bg-(--surface-mist)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-8 px-8 py-7" onSubmit={handleSubmit}>
          <section className="space-y-4">
            <p className="font-jp text-xs font-medium tracking-[0.6px] text-(--ink-600)">広告タイプを選択</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AdTypeCard
                title="Banner"
                description="トップページ掲載"
                active={adType === "banner"}
                icon={<Megaphone className="h-[14px] w-5 text-primary" />}
                onClick={() => setAdType("banner")}
              />
              <AdTypeCard
                title="Push"
                description="近隣ユーザーへ通知"
                active={adType === "push"}
                icon={<BellRing className="h-5 w-5 text-primary" />}
                onClick={() => setAdType("push")}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-8">
            <div className="space-y-3">
              <p className="font-jp text-xs font-medium tracking-[0.6px] text-(--ink-600)">予算と期間</p>
              <div className="flex items-center gap-2 rounded-lg bg-[color-mix(in_oklab,var(--ink-600),transparent_94%)] p-2">
                <div className="relative flex-1">
                  <Input
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    placeholder="yyyy-mm-dd"
                    className="h-auto rounded border-none bg-transparent py-2 pl-3 pr-10 font-jp text-sm font-medium text-[#8f6f6c]"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="開始日を選択"
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-(--ink-600)"
                      >
                        <CalendarDays className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={parseInputDate(startDate)}
                        onSelect={(date) => setStartDate(date ? toInputDate(date) : "")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <span className="text-(--ink-600)">〜</span>
                <div className="relative flex-1">
                  <Input
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    placeholder="yyyy-mm-dd"
                    className="h-auto rounded border-none bg-transparent py-2 pl-3 pr-10 font-jp text-sm font-medium text-[#8f6f6c]"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="終了日を選択"
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-(--ink-600)"
                      >
                        <CalendarDays className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={parseInputDate(endDate)}
                        onSelect={(date) => setEndDate(date ? toInputDate(date) : "")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-[color-mix(in_oklab,var(--ink-600),transparent_94%)] p-3">
                <Wallet className="h-4 w-[22px] text-(--ink-600)" />
                <Label htmlFor="ad-budget" className="font-jp text-sm font-medium text-[#8f6f6c]">
                  予算:
                </Label>
                <input
                  id="ad-budget"
                  type="number"
                  min={1000}
                  step={1000}
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  className="w-36 border-none bg-transparent font-jp text-sm font-medium text-[#8f6f6c] outline-none"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <p className="font-jp text-xs font-medium tracking-[0.6px] text-(--ink-600)">
              メッセージ / クリエイティブ
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="広告のキャッチコピーや詳細情報を入力してください..."
                className="h-32 resize-none rounded-lg border-none bg-[color-mix(in_oklab,var(--ink-600),transparent_94%)] px-4 py-3 font-jp text-sm font-medium leading-5 text-[#8f6f6c] placeholder:text-[#8f6f6c]"
              />
              <label className="relative flex h-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[#e4beba] bg-(--surface-mist)">
                {creativePreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={creativePreviewUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
                <div className="relative z-10 flex flex-col items-center rounded bg-white/80 px-3 py-2">
                  <ImagePlus className="h-[26px] w-[18px] text-[#8f6f6c]" />
                  <p className="mt-1 max-w-52 truncate font-jp text-xs font-medium text-[#5b403d]">
                    {creativeFile ? creativeFile.name : "画像をドラッグ＆ドロップ"}
                  </p>
                  <p className="mt-1 font-manrope text-[10px] leading-[15px] text-[#8f6f6c]">
                    最大 5MB (JPG, PNG)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleCreativeFileChange}
                />
              </label>
            </div>
          </section>

          <footer className="flex items-center justify-end gap-4 pb-4 pt-6">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="h-auto rounded-md border-primary px-6 py-2.5 font-jp text-sm font-medium text-(--ink-600)"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="h-auto gap-2 rounded-md bg-[linear-gradient(168deg,var(--primary)_0%,var(--primary-bright)_100%)] px-8 py-2.5 font-jp text-sm font-medium text-white shadow-[0px_10px_15px_-3px_rgba(175,17,28,0.2),0px_4px_6px_-4px_rgba(175,17,28,0.2)]"
            >
              <Send className="h-4 w-4" />
              {mode === "edit" ? "保存" : "リクエストを送信"}
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
