"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { logoutAccount, registerAccount } from "@/lib/api/auth/API";
import {
  clearRegisterDraft,
  readRegisterDraft,
  type RegisterDraft,
} from "@/lib/api/auth/register";

const imgStepCheck = "/register/step-check.png";
const imgStepAccount = "/register/step-account-after-select.png";
const phonePattern = /^\d{4}-\d{3}-\d{3}$/;

export default function RestaurantRegisterPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<RegisterDraft | null>(null);
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedDraft = readRegisterDraft();

    if (!savedDraft || savedDraft.role !== "Owner") {
      router.replace("/register");
      return;
    }

    queueMicrotask(() => {
      setDraft(savedDraft);
      setRepresentativeName(savedDraft.fullName);
    });
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft) {
      return;
    }

    if (!phonePattern.test(phone.trim())) {
      toast.error("エラーが発生しました");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerAccount({
        email: draft.email,
        password: draft.password,
        fullName: draft.fullName,
        role: "Owner",
        storeName: storeName.trim(),
        address: address.trim(),
        representativeName: representativeName.trim() || draft.fullName,
        phone: phone.trim(),
      });
      await logoutAccount().catch(() => undefined);

      clearRegisterDraft();
      toast.success("設定を保存しました");
      router.push("/login");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/register"
          className="p-2 text-[#af111c] hover:bg-[#af111c]/10 rounded-full transition-colors inline-block"
        >
          <ArrowLeft className="size-6" />
        </Link>
      </div>

      <div className="space-y-[40px]">
        <div className="space-y-[8px]">
          <h2 className="font-bold text-[#af111c] text-[30px] tracking-[-0.75px]">
            店舗プロフィールの設定
          </h2>
          <p className="font-medium text-[#5a6053] text-[14px] leading-[20px]">
            オーナー様と店舗の基本情報を入力してください。
          </p>
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-[8px] items-center">
            <div className="bg-[#af111c] border-2 border-[#af111c] flex items-center justify-center relative rounded-[12px] size-[40px] shadow-[0px_10px_15px_-3px_rgba(175,17,28,0.2),0px_4px_6px_-4px_rgba(175,17,28,0.2)]">
              <img alt="Check" className="h-[10px] w-[13px]" src={imgStepCheck} />
            </div>
            <span className="font-medium text-[#af111c] text-[10px] text-center tracking-[1px] uppercase">
              登録
            </span>
          </div>

          <div className="flex-1 px-[16px]">
            <div className="h-px bg-[#e4beba] relative">
              <div className="absolute bg-[#af111c] inset-0" />
            </div>
          </div>

          <div className="flex flex-col gap-[8px] items-center">
            <div className="bg-[#af111c] border-2 border-[#af111c] flex items-center justify-center relative rounded-[12px] size-[40px] shadow-[0px_10px_15px_-3px_rgba(175,17,28,0.2),0px_4px_6px_-4px_rgba(175,17,28,0.2)]">
              <img alt="Account" className="size-[20px]" src={imgStepAccount} />
            </div>
            <span className="font-medium text-[#af111c] text-[10px] text-center tracking-[1px] uppercase">
              アカウント
            </span>
          </div>
        </div>

        <form className="space-y-[32px] pt-[8px]" onSubmit={handleSubmit}>
          <div className="space-y-[12px]">
            <div className="flex gap-[8px] items-baseline leading-none">
              <label className="font-medium text-[#5a6053] text-[12px] tracking-[1.2px] uppercase">
                店舗名
              </label>
              <span className="font-manrope text-[#af111c] text-[10px] lowercase">
                (Restaurant Name)
              </span>
            </div>
            <input
              type="text"
              placeholder="例：割烹 ハノイ"
              required
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              className="w-full border-b border-[#e2e3e0] py-[14px] text-[18px] font-medium text-[#1a1c1b] placeholder:text-[#e2e3e0] focus:outline-none focus:border-[#af111c] transition-colors bg-transparent"
            />
          </div>

          <div className="space-y-[12px]">
            <div className="flex gap-[8px] items-baseline leading-none">
              <label className="font-medium text-[#5a6053] text-[12px] tracking-[1.2px] uppercase">
                住所
              </label>
              <span className="font-manrope text-[#af111c] text-[10px] lowercase">
                (Address)
              </span>
            </div>
            <input
              type="text"
              placeholder="例：ハノイ市コウザイ区..."
              required
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="w-full border-b border-[#e2e3e0] py-[14px] text-[18px] font-medium text-[#1a1c1b] placeholder:text-[#e2e3e0] focus:outline-none focus:border-[#af111c] transition-colors bg-transparent"
            />
          </div>

          <div className="space-y-[12px]">
            <div className="flex gap-[8px] items-baseline leading-none">
              <label className="font-medium text-[#5a6053] text-[12px] tracking-[1.2px] uppercase">
                代表者名
              </label>
              <span className="font-manrope text-[#af111c] text-[10px] lowercase">
                (Owner Name)
              </span>
            </div>
            <input
              type="text"
              placeholder="例：山田 太郎"
              required
              value={representativeName}
              onChange={(event) => setRepresentativeName(event.target.value)}
              className="w-full border-b border-[#e2e3e0] py-[14px] text-[18px] font-medium text-[#1a1c1b] placeholder:text-[#e2e3e0] focus:outline-none focus:border-[#af111c] transition-colors bg-transparent"
            />
          </div>

          <div className="space-y-[12px]">
            <div className="flex gap-[8px] items-baseline leading-none">
              <label className="font-medium text-[#5a6053] text-[12px] tracking-[1.2px] uppercase">
                電話番号
              </label>
              <span className="font-manrope text-[#af111c] text-[10px] lowercase">
                (Phone Number)
              </span>
            </div>
            <input
              type="tel"
              placeholder="1234-567-890"
              required
              pattern="\d{4}-\d{3}-\d{3}"
              title="xxxx-xxx-xxx"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full border-b border-[#e2e3e0] py-[14px] text-[18px] font-manrope font-medium text-[#1a1c1b] placeholder:text-[#e2e3e0] focus:outline-none focus:border-[#af111c] transition-colors bg-transparent"
            />
          </div>

          <div className="space-y-[24px] pt-[32px]">
            <button
              type="submit"
              disabled={isSubmitting || !draft}
              className="group relative flex w-full items-center justify-center gap-[8px] bg-[#af111c] py-[20px] rounded-[4px] shadow-[0px_10px_15px_-3px_rgba(175,17,28,0.2),0px_4px_6px_-4px_rgba(175,17,28,0.2)] hover:bg-[#910e17] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <div className="flex flex-col font-medium min-h-[20px] justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white tracking-[1.4px] uppercase">
                <p className="leading-[20px]">
                  {isSubmitting ? "登録中..." : "加盟店登録を完了する"}
                </p>
              </div>
              <div className="h-[13.333px] relative shrink-0 w-[7.85px]">
                <img
                  alt=""
                  className="absolute block inset-0 max-w-none size-full"
                  src="/register/button-arrow.png"
                />
              </div>
            </button>
          </div>
        </form>

        <div className="flex justify-center">
          <Link
            className="flex items-center gap-2 text-[14px] font-medium text-[#5a6053] hover:text-[#af111c] transition-colors [font-family:'Noto_Sans_JP',sans-serif]"
            href="/register"
          >
            <ArrowLeft className="size-4" />
            前のステップに戻る
          </Link>
        </div>
      </div>
    </>
  );
}
