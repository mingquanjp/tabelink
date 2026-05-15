"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { toast } from "sonner";

export const OWNER_TOAST_MESSAGES = {
  success: "操作が正常に完了しました",
  error: "エラーが発生しました",
  validationError: "入力形式が正しくありません。再度入力してください",
  uploadError: "ファイルのアップロードに失敗しました",
  deleteTableError: "テーブルを削除できませんでした",
} as const;

export const AUTH_TOAST_MESSAGES = {
  validationError: "入力形式が正しくありません。再度入力してください",
  loginSuccess: "ログインに成功しました",
  passwordResetSuccess: "パスワードリセット完了",
  registerSuccess: "新規登録に成功しました",
} as const;

type AppToastVariant = "success" | "error";

const toastStyle = {
  success: {
    iconWrap: "bg-[#d1fae5]",
    icon: "text-[#10b981]",
    Icon: CheckCircle2,
  },
  error: {
    iconWrap: "bg-[#ffd7d9]",
    icon: "text-[#d32f2f]",
    Icon: CircleAlert,
  },
} satisfies Record<
  AppToastVariant,
  {
    iconWrap: string;
    icon: string;
    Icon: typeof CheckCircle2;
  }
>;

export function showAppToast(variant: AppToastVariant, message: string) {
  toast.custom((toastId) => {
    const style = toastStyle[variant];
    const Icon = style.Icon;

    return (
      <div className="flex min-w-[300px] max-w-[380px] items-center gap-4 rounded-[6px] border border-[#e2e3e0] bg-white px-5 py-4 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.10),0_8px_10px_-6px_rgba(0,0,0,0.10)]">
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
        >
          <Icon className={`size-4 ${style.icon}`} />
        </div>
        <p className="min-w-0 flex-1 text-sm font-medium leading-5 text-[#1a1c1b]">
          {message}
        </p>
        <button
          type="button"
          aria-label="Close notification"
          onClick={() => toast.dismiss(toastId)}
          className="shrink-0 rounded p-1 text-[#4b2f2e] transition-colors hover:bg-[#eeeeeb] hover:text-[#1a1c1b]"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  });
}

export function showSuccessToast(message: string = OWNER_TOAST_MESSAGES.success) {
  showAppToast("success", message);
}

export function showErrorToast(message: string = OWNER_TOAST_MESSAGES.error) {
  showAppToast("error", message);
}
