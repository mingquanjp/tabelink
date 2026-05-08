"use client";

import Link from "next/link";
import { useState } from "react";

const imgStepCheck = "/register/step-check.png";
const imgStepAccount = "/register/step-account-after-select.png";

export default function ProfileRegisterPage() {
  const [selectedGender, setSelectedGender] = useState("男性");
  const [selectedNationality, setSelectedNationality] = useState("日本");

  return (
    <>
      <div className="space-y-2">
        <h2 className="text-[36px] font-bold tracking-[-0.9px] text-[#af111c] [font-family:'Noto_Sans_JP',sans-serif]">
          プロフィール設定
        </h2>
        <p className="text-[16px] font-medium text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
          最高のダイニング体験を提供するために、詳細をお知らせください。
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-10 flex items-center justify-between">
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
          <div className="relative flex size-10 items-center justify-center rounded-xl border-2 border-[#af111c] bg-[#af111c]">
            <div className="absolute inset-0 rounded-xl shadow-[0px_10px_15px_-3px_rgba(175,17,28,0.2),0px_4px_6px_-4px_rgba(175,17,28,0.2)]" />
            <img alt="" aria-hidden="true" className="relative z-10 h-5" src={imgStepAccount} />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[1px] text-[#af111c] [font-family:'Noto_Sans_JP',sans-serif]">
            アカウント
          </span>
        </div>
      </div>

      {/* Form */}
      <form className="mt-10 space-y-8">
        {/* User Name */}
        <div className="space-y-3">
          <label className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
            ユーザー名
          </label>
          <input
            className="w-full rounded-lg bg-[#f4f4f1] px-4 py-4 text-[16px] font-medium text-[#1a1c1b] placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#af111c]/30 [font-family:'Noto_Sans_JP',sans-serif]"
            placeholder="お名前を入力してください"
            type="text"
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-3">
          <label className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
            生年月日
          </label>
          <div className="relative">
            <input
              className="w-full rounded-lg bg-[#f4f4f1] px-4 py-4 text-[16px] font-medium text-[#1a1c1b] focus:outline-none focus:ring-2 focus:ring-[#af111c]/30 [font-family:'Manrope',sans-serif]"
              placeholder="mm / dd / yyyy"
              type="text"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg
                className="size-5 text-[#5a6053]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <label className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
            性別
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["男性", "女性", "その他"].map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => setSelectedGender(gender)}
                className={`rounded-lg py-3 text-[16px] font-medium transition-all [font-family:'Noto_Sans_JP',sans-serif] border ${
                  selectedGender === gender
                    ? "bg-[#dfe5d4] border-[#5a6053] text-[#1a1c1b]"
                    : "bg-[#f4f4f1] border-transparent text-[#5a6053] hover:border-[#e4beba]"
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Nationality */}
        <div className="space-y-3">
          <label className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
            国籍
          </label>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {["日本", "その他"].map((nat) => (
                <button
                  key={nat}
                  type="button"
                  onClick={() => setSelectedNationality(nat)}
                  className={`rounded-lg py-3 text-[16px] font-medium transition-all [font-family:'Noto_Sans_JP',sans-serif] border ${
                    selectedNationality === nat
                      ? "bg-[#dfe5d4] border-[#5a6053] text-[#1a1c1b]"
                      : "bg-[#f4f4f1] border-transparent text-[#5a6053] hover:border-[#e4beba]"
                  }`}
                >
                  {nat}
                </button>
              ))}
            </div>
            <input
              className="w-full rounded-lg bg-[#f4f4f1] px-4 py-4 text-[16px] font-medium text-[#1a1c1b] opacity-50 placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#af111c]/30 [font-family:'Noto_Sans_JP',sans-serif]"
              placeholder="国籍を入力してください"
              type="text"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="relative mt-8 flex w-full items-center justify-center rounded-lg bg-[linear-gradient(135deg,#af111c_0%,#d32f31_100%)] py-5 text-[18px] font-medium text-white shadow-[0px_20px_25px_-5px_rgba(175,17,28,0.2),0px_8px_10px_-6px_rgba(175,17,28,0.2)] transition-transform active:scale-[0.98] [font-family:'Noto_Sans_JP',sans-serif]"
          type="submit"
        >
          登録を完了する
        </button>
      </form>

      {/* Back Button */}
      <div className="mt-8 flex justify-center">
        <Link
          className="flex items-center gap-2 text-[14px] font-medium text-[#5a6053] hover:text-[#af111c] transition-colors [font-family:'Noto_Sans_JP',sans-serif]"
          href="/register"
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          前のステップに戻る
        </Link>
      </div>
    </>
  );
}
