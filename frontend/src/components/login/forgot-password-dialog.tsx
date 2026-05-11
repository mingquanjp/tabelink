"use client";

import { KeyRound, Mail, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/api/auth/API";
import { cn } from "@/lib/utils";
import { AUTH_TOAST_MESSAGES, showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { isValidEmail } from "@/lib/auth-form-validation";

export function ForgotPasswordDialog() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isSubmitting) {
      return;
    }

    toast.dismiss();

    if (!isValidEmail(email)) {
      showErrorToast(AUTH_TOAST_MESSAGES.validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await requestPasswordReset({
        email: email.trim(),
        lang: "ja",
      });
      showSuccessToast(AUTH_TOAST_MESSAGES.passwordResetSuccess);
    } catch {
      showErrorToast();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-primary hover:underline" type="button">
          パスワードをお忘れですか？
        </button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-lg gap-0 overflow-hidden p-0">
        <div className="relative px-12 pb-16 pt-12">
          <DialogClose asChild>
            <button
              aria-label="閉じる"
              className="absolute right-9 top-9 text-(--ink-600) transition hover:text-(--ink-900)"
              type="button"
            >
              <X className="size-6" />
            </button>
          </DialogClose>
          <form className="space-y-10" noValidate onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex size-16 items-center justify-center rounded-xl bg-(--primary)/10">
                <KeyRound className="size-6 text-primary" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-3xl font-medium tracking-[-0.02em] text-(--ink-900)">
                  パスワードの再設定
                </DialogTitle>
                <DialogDescription className="text-base leading-6 text-(--ink-600)">
                  <span className="block">
                    登録したメールアドレスを入力してください。
                  </span>
                  <span className="block">
                    パスワード再設定用のリンクをお送りします。
                  </span>
                </DialogDescription>
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-medium uppercase tracking-[0.12em] text-(--ink-600)">
                  登録メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-(--ink-400)" />
                  <Input
                    className={cn(
                      "h-14 rounded-lg border-transparent bg-(--surface-mist) pl-11 pr-4 text-base text-(--ink-600) placeholder:text-(--ink-400) focus-visible:border-(--primary)/40 focus-visible:ring-(--primary)/20",
                      "font-manrope"
                    )}
                    placeholder="email@example.com"
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-[1fr_2fr] gap-4">
                <DialogClose asChild>
                  <Button
                    className="h-12 w-full rounded-lg text-(--ink-600) hover:underline"
                    type="button"
                    variant="ghost"
                  >
                    キャンセル
                  </Button>
                </DialogClose>
                <Button
                  className="h-12 w-full rounded-lg bg-primary text-white shadow-[0px_20px_25px_-5px_rgba(175,17,28,0.2),0px_8px_10px_-6px_rgba(175,17,28,0.2)] hover:brightness-95"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "送信中..." : "送信する"}
                </Button>
              </div>
            </div>
          </form>
        </div>
        <div className="h-2 w-full bg-linear-to-r from-primary via-(--primary-bright) to-primary" />
      </DialogContent>
    </Dialog>
  );
}
