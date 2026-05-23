"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { AdminBadgeApplication } from "@/lib/api/admin-badges/type";
import type { BadgeActionDialogType } from "./types";

type BadgeActionDialogProps = {
  action: BadgeActionDialogType | null;
  application: AdminBadgeApplication | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (action: BadgeActionDialogType, reason?: string) => Promise<void>;
};

const actionCopy: Record<
  BadgeActionDialogType,
  {
    title: string;
    description: string;
    placeholder: string;
    confirmLabel: string;
    requiresReason: boolean;
    danger?: boolean;
  }
> = {
  approve: {
    title: "バッジを付与しますか？",
    description:
      "チェック済みの申請内容を承認し、店舗プロフィールに認証バッジを発行します。",
    placeholder: "任意メモ",
    confirmLabel: "付与",
    requiresReason: false,
  },
  "request-info": {
    title: "不足情報を再請求",
    description:
      "店舗オーナーへ追加提出が必要な情報を伝えるためのメッセージを入力してください。",
    placeholder: "不足している資料や再提出してほしい内容",
    confirmLabel: "再請求",
    requiresReason: true,
  },
  reject: {
    title: "申請を却下",
    description: "却下理由を入力してください。理由は審査メモとして保存されます。",
    placeholder: "却下理由",
    confirmLabel: "却下",
    requiresReason: true,
    danger: true,
  },
  revoke: {
    title: "バッジを取消",
    description:
      "発行済みバッジを取り消します。現在のDBには取消専用ステータスがないため、申請は却下扱いとして保存されます。",
    placeholder: "取消理由",
    confirmLabel: "取消",
    requiresReason: true,
    danger: true,
  },
};

function getRestaurantName(application: AdminBadgeApplication | null) {
  return application?.restaurant.nameJp || application?.restaurant.nameVn || "";
}

export function BadgeActionDialog({
  action,
  application,
  isSaving,
  onOpenChange,
  onConfirm,
}: BadgeActionDialogProps) {
  const [reason, setReason] = useState("");
  const [showError, setShowError] = useState(false);
  const open = Boolean(action);
  const copy = action ? actionCopy[action] : null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReason("");
      setShowError(false);
    }
    onOpenChange(nextOpen);
  };

  if (!copy || !action) {
    return null;
  }

  const restaurantName = getRestaurantName(application);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[480px] rounded-lg bg-white p-6">
        <div className="flex flex-col gap-3">
          <DialogTitle className="font-jp text-xl font-medium text-[#1a1c1b]">
            {copy.title}
          </DialogTitle>
          <DialogDescription className="font-jp text-sm font-medium leading-6 text-[#5a6053]">
            {restaurantName ? `${restaurantName} - ` : ""}
            {copy.description}
          </DialogDescription>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Textarea
            value={reason}
            placeholder={copy.placeholder}
            className="min-h-[112px] rounded border-[#e2e3e0] bg-[#f9f9f6] font-jp text-sm"
            onChange={(event) => {
              setReason(event.target.value);
              setShowError(false);
            }}
          />
          {showError ? (
            <p className="font-jp text-xs font-medium text-[#af111c]">
              入力してください。
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-auto rounded px-5 py-2 font-jp text-sm font-medium"
            disabled={isSaving}
            onClick={() => handleOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            disabled={!application || isSaving}
            className={`h-auto rounded px-6 py-2 font-jp text-sm font-medium text-white ${
              copy.danger
                ? "bg-[#ba1a1a] hover:bg-[#9f1414]"
                : "bg-[#af111c] hover:bg-[#960e18]"
            }`}
            onClick={async () => {
              const trimmedReason = reason.trim();

              if (copy.requiresReason && !trimmedReason) {
                setShowError(true);
                return;
              }

              await onConfirm(action, trimmedReason || undefined);
              setReason("");
              setShowError(false);
            }}
          >
            {copy.confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
