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
import type { AdminPromotion } from "@/lib/api/admin-promotions/type";

type ApproveAdvertisementDialogProps = {
  request: AdminPromotion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (request: AdminPromotion) => void | Promise<void>;
};

function getRestaurantName(request: AdminPromotion) {
  return request.restaurantNameJP || request.restaurantNameVN;
}

export function ApproveAdvertisementDialog({
  request,
  open,
  onOpenChange,
  onConfirm,
}: ApproveAdvertisementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-lg bg-white p-6">
        <div className="flex flex-col gap-3">
          <DialogTitle className="font-jp text-xl font-medium text-[#1a1c1b]">
            広告を承認しますか？
          </DialogTitle>
          <DialogDescription className="font-jp text-sm font-medium leading-6 text-[#5a6053]">
            {request
              ? `${getRestaurantName(request)} の広告掲載リクエストを配信中に更新します。`
              : "広告掲載リクエストを承認します。"}
          </DialogDescription>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-auto rounded px-5 py-2 font-jp text-sm font-medium"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            disabled={!request}
            className="h-auto rounded bg-[#af111c] px-6 py-2 font-jp text-sm font-medium text-white hover:bg-[#960e18]"
            onClick={async () => {
              if (request) {
                await onConfirm(request);
              }
            }}
          >
            承認
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type RejectAdvertisementDialogProps = {
  request: AdminPromotion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (request: AdminPromotion, reason: string) => void | Promise<void>;
};

export function RejectAdvertisementDialog({
  request,
  open,
  onOpenChange,
  onConfirm,
}: RejectAdvertisementDialogProps) {
  const [reason, setReason] = useState("");
  const [showError, setShowError] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReason("");
      setShowError(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[480px] rounded-lg bg-white p-6">
        <div className="flex flex-col gap-3">
          <DialogTitle className="font-jp text-xl font-medium text-[#1a1c1b]">
            却下理由を入力
          </DialogTitle>
          <DialogDescription className="font-jp text-sm font-medium leading-6 text-[#5a6053]">
            {request
              ? `${getRestaurantName(request)} の広告掲載リクエストを却下します。理由を入力してください。`
              : "広告掲載リクエストの却下理由を入力してください。"}
          </DialogDescription>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <Textarea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setShowError(false);
            }}
            placeholder="ポリシー違反、画像品質、掲載内容の不備など"
            className="min-h-[112px] rounded border-[#e2e3e0] bg-[#f9f9f6] font-jp text-sm"
          />
          {showError ? (
            <p className="font-jp text-xs font-medium text-[#af111c]">
              却下理由を入力してください。
            </p>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-auto rounded px-5 py-2 font-jp text-sm font-medium"
            onClick={() => handleOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            disabled={!request}
            className="h-auto rounded bg-[#af111c] px-6 py-2 font-jp text-sm font-medium text-white hover:bg-[#960e18]"
            onClick={async () => {
              const trimmedReason = reason.trim();
              if (!request) {
                return;
              }
              if (!trimmedReason) {
                setShowError(true);
                return;
              }
              try {
                await onConfirm(request, trimmedReason);
                handleOpenChange(false);
              } catch {
                return;
              }
            }}
          >
            却下
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
