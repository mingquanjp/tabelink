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

const API_ERROR_MESSAGE_MAP: Record<string, string> = {
  "Invalid credentials.": "メールアドレスまたはパスワードが正しくありません。",
  "Account not found.": "アカウントが見つかりません。",
  "Account is not active.": "このアカウントは現在利用できません。",
  "Refresh token is invalid.": "ログイン情報の有効期限が切れました。再度ログインしてください。",
  "Authentication is required.": "ログインが必要です。",
  "Missing or invalid access token.": "ログイン情報が確認できません。再度ログインしてください。",
  "Only users can view notifications.": "通知を確認できるのはユーザーのみです。",
  "Admin session is required. Please log in with an Admin account.":
    "管理者アカウントでログインしてください。",
  "This account does not have Admin permission.":
    "このアカウントには管理者権限がありません。",
<<<<<<< HEAD
  "Document file is required.": "書類ファイルを選択してください。",
  "Only PDF, JPG, and PNG files are allowed.":
    "PDF、JPG、PNGファイルのみアップロードできます。",
  "Restaurant not found for this owner.":
    "店舗情報が見つかりません。再度ログインしてください。",
  "Verification badge master is not configured.":
    "認証バッジの設定がありません。管理者に確認してください。",
=======
  "A pending verification application already exists.":
    "すでに申請済みです。審査中の申請があります。",
  "Only PDF, JPG, and PNG files are allowed.":
    "PDF、JPG、PNGファイルのみアップロードできます。",
  "Document file is required.": "書類ファイルが必要です。",
  "Badge not found.": "認証バッジが見つかりません。",
  "Restaurant not found for this owner.": "店舗情報が見つかりません。",
>>>>>>> 18361ab8fce407e23947d0fcb78a413c264ed6ac
};

function translateInactiveAccountMessage(message: string) {
  const match = message.match(/^Account is (Banned|Disabled)\.(?: Reason: (.+))?$/);

  if (!match) {
    return null;
  }

  const statusMessage =
    match[1] === "Banned"
      ? "このアカウントは停止されています。"
      : "このアカウントは無効化されています。";
  const reason = match[2]?.trim();

  return reason ? `${statusMessage} 理由: ${reason}` : statusMessage;
}

function containsJapaneseText(message: string) {
  return /[\u3040-\u30ff\u3400-\u9fff]/.test(message);
}

export function normalizeErrorToastMessage(message?: string) {
  const trimmedMessage = message?.trim();

  if (!trimmedMessage) {
    return OWNER_TOAST_MESSAGES.error;
  }

  const inactiveAccountMessage = translateInactiveAccountMessage(trimmedMessage);

  if (inactiveAccountMessage) {
    return inactiveAccountMessage;
  }

  if (API_ERROR_MESSAGE_MAP[trimmedMessage]) {
    return API_ERROR_MESSAGE_MAP[trimmedMessage];
  }

  return containsJapaneseText(trimmedMessage)
    ? trimmedMessage
    : OWNER_TOAST_MESSAGES.error;
}

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
  showAppToast("error", normalizeErrorToastMessage(message));
}
