"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readRegisterDraft, saveRegisterDraft } from "@/lib/api/auth/register";
import type { RegisterRole } from "@/lib/api/auth/type";
import { showErrorToast } from "@/lib/app-toast";

const imgStepCheck = "/register/step-check.png";
const imgStepAccount = "/register/step-account.png";
const imgSelectArrow = "/register/select-arrow.png";
const imgButtonArrow = "/register/button-arrow.png";

export default function RegisterPage() {
  const router = useRouter();
  const [savedDraft] = useState(() =>
    typeof window === "undefined" ? null : readRegisterDraft()
  );
  const [role, setRole] = useState(
    savedDraft?.role === "Owner" ? "store" : "diner"
  );
  const [fullName, setFullName] = useState(savedDraft?.fullName ?? "");
  const [email, setEmail] = useState(savedDraft?.email ?? "");
  const [password, setPassword] = useState(savedDraft?.password ?? "");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      showErrorToast("パスワードは8文字以上で入力してください");
      return;
    }

    const apiRole: RegisterRole = role === "diner" ? "User" : "Owner";
    saveRegisterDraft({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      role: apiRole,
    });

    router.push(apiRole === "User" ? "/register/customer" : "/register/restaurant");
  }

  return (
    <>
      <div className="space-y-2">
        <h2 className="text-[36px] font-medium tracking-[-0.9px] text-[#af111c] [font-family:'Noto_Sans_JP',sans-serif]">
          新規登録
        </h2>
        <p className="text-[16px] font-medium text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
          美食のコミュニティへようこそ。あなたのアカウントを作成しましょう。
        </p>
      </div>

      <div className="mt-10 flex items-center">
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex size-10 items-center justify-center rounded-xl border-2 border-[#af111c] bg-[#af111c]">
            <div className="absolute inset-0 rounded-xl shadow-[0px_10px_15px_-3px_rgba(175,17,28,0.2),0px_4px_6px_-4px_rgba(175,17,28,0.2)]" />
            <img alt="" aria-hidden="true" className="h-[10px]" src={imgStepCheck} />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[1px] text-[#af111c] [font-family:'Noto_Sans_JP',sans-serif]">
            登録
          </span>
        </div>

        <div className="mx-4 h-px flex-1 bg-[#e4beba]">
          <div className="h-px w-full bg-[#af111c]" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="relative flex size-10 items-center justify-center rounded-xl border-[#af111c] bg-[#af111c]">
            <div className="absolute inset-0 rounded-xl bg-white shadow-[0px_10px_15px_-3px_rgba(175,17,28,0.2),0px_4px_6px_-4px_rgba(175,17,28,0.2)]" />
            <img alt="" aria-hidden="true" className="relative z-10 h-5" src={imgStepAccount} />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[1px] text-[#af111c] [font-family:'Noto_Sans_JP',sans-serif]">
            アカウント
          </span>
        </div>
      </div>

      <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
            お名前（フルネーム）
          </span>
          <input
            className="mt-2 w-full rounded bg-[#f4f4f1] px-4 py-4 text-[16px] font-medium text-[#1a1c1b] placeholder:text-[rgba(90,96,83,0.5)] focus:outline-none focus:ring-2 focus:ring-[#af111c]/30 [font-family:'Noto_Sans_JP',sans-serif]"
            placeholder="例：佐藤 拓海"
            required
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
            ご利用目的
          </span>
          <div className="relative mt-2">
            <select
              className="w-full appearance-none rounded bg-[#f4f4f1] px-4 py-4 pr-12 text-[16px] font-medium text-[#1a1c1b] focus:outline-none focus:ring-2 focus:ring-[#af111c]/30 [font-family:'Noto_Sans_JP',sans-serif]"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="diner">一般利用者（ダイナー）</option>
              <option value="store">加盟店</option>
            </select>
            <img
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 h-[7px] w-[12px] -translate-y-1/2"
              src={imgSelectArrow}
            />
          </div>
        </label>

        <label className="block">
          <span className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
            メールアドレス
          </span>
          <input
            className="mt-2 w-full rounded bg-[#f4f4f1] px-4 py-4 text-[16px] font-medium text-[#1a1c1b] placeholder:text-[rgba(90,96,83,0.5)] focus:outline-none focus:ring-2 focus:ring-[#af111c]/30 [font-family:'Manrope',sans-serif]"
            placeholder="name@example.com"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
            パスワード
          </span>
          <input
            className="mt-2 w-full rounded bg-[#f4f4f1] px-4 py-4 text-[16px] font-medium text-[#1a1c1b] placeholder:text-[rgba(90,96,83,0.5)] focus:outline-none focus:ring-2 focus:ring-[#af111c]/30 [font-family:'Manrope',sans-serif]"
            minLength={8}
            placeholder="Password123"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button
          className="relative mt-2 flex w-full items-center justify-center gap-3 rounded bg-[linear-gradient(171.87deg,#af111c_0%,#d32f31_100%)] py-5 text-[16px] font-medium text-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] [font-family:'Noto_Sans_JP',sans-serif]"
          type="submit"
        >
          次に進む
          <img alt="" aria-hidden="true" className="size-4" src={imgButtonArrow} />
        </button>

        <div className="pt-4 text-center text-[14px] font-medium [font-family:'Noto_Sans_JP',sans-serif]">
          <span className="text-[#5a6053]">すでにアカウントをお持ちですか？ </span>
          <Link className="text-[#af111c]" href="/login">
            ログイン
          </Link>
        </div>
      </form>
    </>
  );
}
