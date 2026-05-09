"use client";

import { CalendarDays, Tag, X } from "lucide-react";
import type { ReactNode } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CampaignRequestDialogProps = {
  trigger: ReactNode;
};

const audienceOptions = [
  { value: "all", label: "すべてのお客様 (All)" },
  { value: "new", label: "新規のお客様 (New)" },
  { value: "elite", label: "優待会員 (Elite)" },
];

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

const parseInputDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export function CampaignRequestDialog({ trigger }: CampaignRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("all");
  const [discountType, setDiscountType] = useState("total-10");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const canSubmit = name.trim().length > 0 && description.trim().length > 0 && startDate && endDate;

  const resetForm = () => {
    setName("");
    setDescription("");
    setAudience("all");
    setDiscountType("total-10");
    setStartDate("");
    setEndDate("");
  };

  const handleCancel = () => {
    resetForm();
    setOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    // Temporary client-side handling until API integration is available.
    console.log("Campaign request created", {
      name,
      description,
      audience,
      discountType,
      startDate,
      endDate,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[672px] overflow-hidden rounded-lg border-none bg-white p-0">
        <header className="flex items-center justify-between bg-(--surface-mist) px-8 py-6">
          <DialogTitle className="font-jp text-3xl font-medium tracking-[-0.6px] text-primary">
            新しいキャンペーンを作成
          </DialogTitle>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Close dialog"
            className="rounded-xl p-2 text-(--ink-600) transition-colors hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form className="space-y-8 p-8" onSubmit={handleSubmit}>
          <section className="space-y-3">
            <Label className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">キャンペーン名</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例：秋の味覚 季節限定プロモーション"
              className="h-auto rounded bg-[#eeeeeb] px-4 py-4 font-jp text-base font-medium text-(--ink-900) placeholder:text-[color-mix(in_oklab,#8f6f6c,transparent_40%)]"
            />
          </section>

          <section className="space-y-3">
            <Label className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">説明</Label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="キャンペーンの詳細やユーザーへのメッセージを入力してください..."
              className="h-[104px] resize-none rounded bg-[#eeeeeb] px-4 py-4 font-jp text-base font-medium leading-6 text-(--ink-900) placeholder:text-[color-mix(in_oklab,#8f6f6c,transparent_40%)]"
            />
          </section>

          <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <p className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">ターゲット層</p>
              <RadioGroup value={audience} onValueChange={setAudience} className="space-y-2">
                {audienceOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`audience-${option.value}`}
                    onClick={() => setAudience(option.value)}
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
              <p className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">適用条件</p>
              <div className="rounded-lg bg-(--surface-mist) p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Tag className="h-3 w-3 text-[#5b403d]" />
                  <p className="font-jp text-xs font-medium tracking-[-0.6px] text-[#5b403d]">割引タイプ</p>
                </div>
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger className="h-11 w-full rounded border-none bg-white px-3 font-jp text-sm text-(--ink-900)">
                    <SelectValue placeholder="割引タイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total-10">合計金額から 10% OFF</SelectItem>
                    <SelectItem value="total-20">合計金額から 20% OFF</SelectItem>
                    <SelectItem value="free-drink">ドリンク1杯無料</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-3 font-jp text-[10px] font-medium leading-4 text-(--ink-600)">
                  ※ 週末および祝日は除外されます。他のクーポンとの併用はできません。
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <p className="font-jp text-xs font-medium tracking-[1.2px] text-(--ink-600)">開催期間</p>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  placeholder="yyyy-mm-dd"
                  className="h-auto rounded bg-[#eeeeeb] py-3 pl-4 pr-11 font-manrope text-base font-normal text-(--ink-900)"
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
              <span className="text-(--ink-900)">〜</span>
              <div className="relative flex-1">
                <Input
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  placeholder="yyyy-mm-dd"
                  className="h-auto rounded bg-[#eeeeeb] py-3 pl-4 pr-11 font-manrope text-base font-normal text-(--ink-900)"
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
            disabled={!canSubmit}
            className="h-auto rounded bg-primary px-12 py-3 font-jp text-base font-medium text-white shadow-[0px_10px_15px_-3px_rgba(175,17,28,0.2),0px_4px_6px_-4px_rgba(175,17,28,0.2)]"
          >
            作成
          </Button>
        </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
