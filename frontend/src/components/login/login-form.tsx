"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ForgotPasswordDialog } from "@/components/login/forgot-password-dialog";
import { Input } from "@/components/ui/input";
import { loginAccount } from "@/lib/api/auth/API";
import { getAuthenticatedRedirectPath } from "@/lib/api/auth/routes";
import { cn } from "@/lib/utils";
import { AUTH_TOAST_MESSAGES, showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { isValidEmail } from "@/lib/auth-form-validation";
import { clearAuthSessionCache } from "@/lib/api/auth/session";
import { removeSessionCacheByPrefix } from "@/lib/api/cache";

export function LoginForm() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail(email) || !password) {
      showErrorToast(AUTH_TOAST_MESSAGES.validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await loginAccount({
        email: email.trim(),
        password,
        rememberMe,
      });

      showSuccessToast(AUTH_TOAST_MESSAGES.loginSuccess);
      clearAuthSessionCache();
      removeSessionCacheByPrefix("tabelink:owner:");
      router.replace(getAuthenticatedRedirectPath(response.account.role));
    } catch {
      showErrorToast();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-10 space-y-8" noValidate onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.12em] text-(--ink-600)">
            メールアドレス
          </label>
          <Input
            className={cn(
              "h-14 rounded-lg border-transparent bg-(--surface-mist) px-4 text-base text-(--ink-600) placeholder:text-(--ink-600)/50 focus-visible:border-(--primary)/40 focus-visible:ring-(--primary)/20",
              "font-manrope"
            )}
            placeholder="name@example.com"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.12em] text-(--ink-600)">
            パスワード
          </label>
          <div className="relative">
            <Input
              className={cn(
                "h-14 rounded-lg border-transparent bg-(--surface-mist) px-4 pr-10 text-base text-(--ink-600) placeholder:text-(--ink-600)/50 focus-visible:border-(--primary)/40 focus-visible:ring-(--primary)/20",
                "font-manrope"
              )}
              placeholder="••••••••"
              required
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              aria-label={
                isPasswordVisible
                  ? "パスワードを隠す"
                  : "パスワードを表示"
              }
              aria-pressed={isPasswordVisible}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--ink-400)"
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              type="button"
            >
              {isPasswordVisible ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <label className="flex items-center gap-2 text-(--ink-600)">
          <input
            className="size-4 rounded-xs border border-(--border-sage) bg-white text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/30"
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          <span>ログイン情報を保持する</span>
        </label>
        <ForgotPasswordDialog />
      </div>

      <div className="space-y-4 pt-2">
        <Button
          className="h-16 w-full gap-2 rounded-lg bg-[linear-gradient(172deg,var(--primary)_0%,var(--primary-bright)_100%)] text-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:brightness-95"
          disabled={isSubmitting}
          type="submit"
        >
          ログインする
          <LogIn className="size-4" />
        </Button>
        <Button
          className="h-17 w-full gap-2 rounded-lg border-2 border-primary text-primary hover:bg-(--primary)/5"
          type="button"
          variant="outline"
        >
          ゲストとしてログイン
          <ArrowUpRight className="size-4" />
        </Button>
      </div>

      <div className="pt-2 text-center text-sm font-medium">
        <span className="text-(--ink-600)">初めてご利用ですか？</span>
        <Link className="ml-1 text-primary hover:underline" href="/register">
          アカウントを作成
        </Link>
      </div>
    </form>
  );
}
