"use client";

import Link from "next/link";
import { useState } from "react";

const imgJapaneseCuisine = "/register/register-hero.png";
const imgStepCheck = "/register/step-check.png";
const imgStepAccount = "/register/step-account.png";
const imgSelectArrow = "/register/select-arrow.png";
const imgButtonArrow = "/register/button-arrow.png";

export default function RegisterPage() {
  const [role, setRole] = useState("diner");

  return (
    <>
      <div className="space-y-2">
        <h2 className="text-[36px] font-medium tracking-[-0.9px] text-[#af111c] [font-family:'Noto_Sans_JP',sans-serif]">
          新規登録
        </h2>
        <p className="text-[16px] font-medium text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
          美食のコミュニティへようこそ。あなたのアカウントを作成 しましょう。
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

      <form className="mt-10 space-y-6">
        <label className="block">
          <span className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
            お名前（フルネーム）
          </span>
          <input
            className="mt-2 w-full rounded bg-[#f4f4f1] px-4 py-4 text-[16px] font-medium text-[#1a1c1b] placeholder:text-[rgba(90,96,83,0.5)] focus:outline-none focus:ring-2 focus:ring-[#af111c]/30 [font-family:'Noto_Sans_JP',sans-serif]"
            placeholder="例：佐藤 拓海"
            type="text"
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
              onChange={(e) => setRole(e.target.value)}
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
            type="email"
          />
        </label>

        <Link
          className="relative mt-2 flex w-full items-center justify-center gap-3 rounded bg-[linear-gradient(171.87deg,#af111c_0%,#d32f31_100%)] py-5 text-[16px] font-medium text-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] [font-family:'Noto_Sans_JP',sans-serif]"
          href={role === "diner" ? "/register/customer" : "/register/restaurant"}
        >
          次に進む
          <img alt="" aria-hidden="true" className="size-4" src={imgButtonArrow} />
        </Link>

        <div className="pt-4 text-center text-[14px] font-medium [font-family:'Noto_Sans_JP',sans-serif]">
          <span className="text-[#5a6053]">すでにアカウントをお持ちですか？ </span>
          <a className="text-[#af111c]" href="/login">
            ログイン
          </a>
        </div>
      </form>
    </>
  );
}
