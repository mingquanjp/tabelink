import Image from "next/image";
import {
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  FileText,
  ReceiptText,
  ShieldCheck,
  Star,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

type Application = {
  id: number;
  name: string;
  submittedAt: string;
  district: string;
  image: string;
  active?: boolean;
};

const applications: Application[] = [
  {
    id: 1,
    name: "寿司 絆 - KIZUNA",
    submittedAt: "2023.10.24 14:30",
    district: "ハノイ・タイホー区",
    image: "/admin/badge/kizuna-thumb.jpg",
    active: true,
  },
  {
    id: 2,
    name: "居酒屋 夢想曲",
    submittedAt: "2023.10.24 11:15",
    district: "ハノイ・バーディン区",
    image: "/admin/badge/musou-thumb.jpg",
  },
];

const documents = [
  { label: "営業許可証", icon: FileText },
  { label: "食品安全証明書", icon: ShieldCheck },
];

const details = [
  { label: "日本人常駐スタッフ", value: "確認済み", icon: UsersRound },
  { label: "VATインボイス発行", value: "対応可能", icon: ReceiptText },
];

const checklist = [
  {
    title: "調理場の衛生状態は適切か",
    description: "シンク、排水口、食材保管状況が基準を満たしていること。",
  },
  {
    title: "日本人スタッフの雇用証明を確認",
    description: "労働許可証または履歴書との照合が完了していること。",
  },
  {
    title: "ユーザー評価に重大な違反はないか",
    description: "過去3ヶ月以内に衛生面での低評価コメントがないか。",
  },
];

function StatusFilterBar() {
  return (
    <div className="grid w-full grid-cols-3 gap-1 rounded-lg bg-[#f4f4f1] p-1.5">
      {["すべて", "審査待ち", "発行済み"].map((label, index) => (
        <button
          key={label}
          type="button"
          className={`h-8 rounded px-3 text-center font-jp text-xs font-medium leading-4 ${
            index === 0
              ? "bg-white text-[#d32f2f] shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
              : "text-[#5a6053]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  return (
    <button
      type="button"
      className={`flex w-full items-start gap-4 rounded-lg text-left transition-colors ${
        application.active
          ? "border-l-4 border-[#d32f2f] bg-white py-4 pl-5 pr-4 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
          : "bg-[#f4f4f1] p-4 hover:bg-[#eeeeeb]"
      }`}
    >
      <Image
        src={application.image}
        alt={application.name}
        width={64}
        height={64}
        className={`size-16 shrink-0 rounded object-cover ${application.active ? "" : "saturate-50"}`}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-jp text-sm font-bold leading-5 text-[#1a1c1b]">
          {application.name}
        </span>
        <span className="flex items-center gap-2 font-manrope text-[10px] font-normal leading-[15px] text-[#5a6053]">
          <CalendarDays className="size-3" strokeWidth={1.7} />
          {application.submittedAt}
        </span>
        <span className="mt-1 w-fit rounded bg-[#e8e8e5] px-2 py-0.5 font-jp text-[10px] font-medium leading-[15px] text-[#5a6053]">
          {application.district}
        </span>
      </span>
    </button>
  );
}

function SubmittedDocument({
  label,
  Icon,
}: {
  label: string;
  Icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      className="flex h-12 w-full items-center justify-between rounded bg-[#f4f4f1] p-3 text-left transition-colors hover:bg-[#eeeeeb]"
    >
      <span className="flex items-center gap-3">
        <Icon className="size-5 text-[#d32f2f]" strokeWidth={1.8} />
        <span className="font-jp text-sm font-medium leading-5 text-[#1a1c1b]">
          {label}
        </span>
      </span>
      <ExternalLink className="size-[18px] text-[#5a6053]" strokeWidth={2} />
    </button>
  );
}

function DetailRow({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: LucideIcon;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-[#5a6053]" strokeWidth={1.8} />
        <span className="truncate font-jp text-sm font-medium leading-5 text-[#1a1c1b]">
          {label}
        </span>
      </div>
      <span className="shrink-0 font-jp text-sm font-medium leading-5 text-[#3d5f46]">
        {value}
      </span>
    </div>
  );
}

function ChecklistPanel() {
  return (
    <section className="rounded-2xl border border-[#e4beba]/20 bg-[#f9f9f6] p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <h2 className="border-b border-[#e8e8e5] pb-4 font-jp text-xs font-medium uppercase leading-4 tracking-[2.4px] text-[#1a1c1b]">
        管理者審査チェックリスト
      </h2>
      <div className="mt-6 flex flex-col gap-5">
        {checklist.map((item) => (
          <label key={item.title} className="flex cursor-pointer items-start gap-4">
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0 appearance-none rounded-sm border border-[#e4beba] bg-white checked:border-[#d32f2f] checked:bg-[#d32f2f]"
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-jp text-sm font-medium leading-5 text-[#1a1c1b]">
                {item.title}
              </span>
              <span className="max-w-[270px] font-jp text-xs font-medium leading-4 text-[#5a6053]">
                {item.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}

export function BadgeReviewPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-8 pb-12 pt-8">
      <section className="flex flex-col gap-2">
        <h1 className="font-jp text-4xl font-medium leading-10 tracking-[-0.9px] text-[#1a1c1b]">
          店舗認証バッジ審査
        </h1>
        <p className="font-jp text-xs font-medium uppercase leading-4 tracking-[1.2px] text-[#5a6053]">
          日本食レストラン信頼認証 申請キュー
        </p>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="flex flex-col gap-4 lg:col-span-4">
          <StatusFilterBar />

          <div className="flex items-center justify-between px-1">
            <h2 className="font-jp text-lg font-medium leading-7 text-[#1a1c1b]">
              申請中リスト (24)
            </h2>
            <span className="rounded-sm bg-[#d32f2f] px-2 py-0.5 font-jp text-[10px] font-medium leading-[15px] text-white">
              優先審査
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-[#e8e8e5] bg-white p-8 shadow-[0_1px_1px_rgba(0,0,0,0.05)] lg:col-span-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col justify-between gap-6 border-b border-[#e8e8e5] pb-8 md:flex-row md:items-start">
              <div className="flex items-center gap-6">
                <Image
                  src="/admin/badge/kizuna-main.jpg"
                  alt="寿司 絆 メイン写真"
                  width={96}
                  height={96}
                  className="size-24 shrink-0 rounded-2xl object-cover shadow-sm"
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-brand text-2xl font-bold leading-8 text-[#1a1c1b]">
                      寿司 絆 - KIZUNA
                    </h2>
                    <span className="rounded-xl bg-[#c5eccc] px-2 py-1 font-jp text-[10px] font-medium uppercase leading-[15px] tracking-[0.5px] text-[#00210e]">
                      プレミアム
                    </span>
                  </div>
                  <p className="font-jp text-sm font-medium leading-5 text-[#5a6053]">
                    ハノイ市タイホー区スアンジエウ通り 123番地
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <span className="flex items-center gap-1 font-manrope text-sm font-bold leading-5 text-[#1a1c1b]">
                      <Star className="size-3.5 fill-[#d32f2f] text-[#d32f2f]" />
                      4.8
                      <span className="font-jp text-xs font-normal leading-4 text-[#5a6053]">
                        (214 評価)
                      </span>
                    </span>
                    <span className="h-3 w-px bg-[#e8e8e5]" />
                    <span className="font-jp text-xs font-bold uppercase leading-4 tracking-[1.2px] text-[#5a6053]">
                      VAT 対応可
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="h-10 shrink-0 rounded border border-[#e4beba] px-4 font-jp text-sm font-medium leading-5 text-[#1a1c1b] transition-colors hover:bg-[#fff6f5]"
              >
                店舗ページを表示
              </button>
            </div>

            <div className="grid grid-cols-1 gap-10 xl:grid-cols-2">
              <div className="flex flex-col gap-8">
                <section className="flex flex-col gap-4">
                  <h3 className="font-jp text-xs font-medium uppercase leading-4 tracking-[2.4px] text-[#1a1c1b]">
                    衛生管理証明写真
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Image
                      src="/admin/badge/kitchen.jpg"
                      alt="調理場"
                      width={320}
                      height={250}
                      className="aspect-[1.28/1] w-full rounded object-cover"
                    />
                    <Image
                      src="/admin/badge/sanitation.jpg"
                      alt="衛生設備"
                      width={320}
                      height={250}
                      className="aspect-[1.28/1] w-full rounded object-cover"
                    />
                  </div>
                </section>

                <section className="flex flex-col gap-4">
                  <h3 className="font-jp text-xs font-medium uppercase leading-4 tracking-[2.4px] text-[#1a1c1b]">
                    提出書類の確認
                  </h3>
                  <div className="grid gap-3">
                    {documents.map((document) => (
                      <SubmittedDocument
                        key={document.label}
                        label={document.label}
                        Icon={document.icon}
                      />
                    ))}
                  </div>
                </section>

                <section className="flex flex-col gap-4">
                  <h3 className="font-jp text-xs font-medium uppercase leading-4 tracking-[2.4px] text-[#1a1c1b]">
                    店舗詳細情報
                  </h3>
                  <div className="flex flex-col gap-4 rounded-lg bg-[#f4f4f1] p-4">
                    {details.map((detail) => (
                      <DetailRow
                        key={detail.label}
                        label={detail.label}
                        value={detail.value}
                        Icon={detail.icon}
                      />
                    ))}
                  </div>
                </section>
              </div>

              <div className="flex flex-col gap-8">
                <ChecklistPanel />

                <section className="flex flex-col gap-4">
                  <h3 className="font-jp text-xs font-medium uppercase leading-4 tracking-[2.4px] text-[#1a1c1b]">
                    審査アクション
                  </h3>
                  <div className="grid gap-3">
                    <button
                      type="button"
                      className="flex h-14 items-center justify-center gap-2 rounded-lg bg-[#d32f2f] font-jp text-base font-medium leading-6 text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] transition-colors hover:bg-[#ba1a1a]"
                    >
                      <BadgeCheck className="size-[22px] fill-white text-white" strokeWidth={2} />
                      バッジを付与する
                    </button>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        className="h-[46px] rounded bg-[#e8e8e5] px-4 font-jp text-sm font-medium leading-5 text-[#1a1c1b] transition-colors hover:bg-[#deded9]"
                      >
                        不足情報の再請求
                      </button>
                      <button
                        type="button"
                        className="h-[46px] rounded border border-[#ba1a1a]/30 px-4 font-jp text-sm font-medium leading-5 text-[#ba1a1a] transition-colors hover:bg-[#fff6f5]"
                      >
                        申請を却下
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
