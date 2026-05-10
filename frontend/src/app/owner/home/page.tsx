"use client";

import {
  BadgeCheck,
  Camera,
  Clock3,
  CreditCard,
  ExternalLink,
  MapPin,
  PencilLine,
  Phone,
  ReceiptText,
  Share2,
  Utensils,
  UsersRound,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

const photos = {
  dish:
    "https://www.figma.com/api/mcp/asset/3d6ca905-7308-4b84-8c12-7d033a31a036",
  staff:
    "https://www.figma.com/api/mcp/asset/2c16c86f-c883-466c-9d16-eb36b61d3241",
  foodDisplay:
    "https://www.figma.com/api/mcp/asset/17838e0d-44fe-43e9-85d7-699649f6cca3",
  interior:
    "https://www.figma.com/api/mcp/asset/d50c2de6-dcb9-4689-83b9-08022b8dc5c3",
  map:
    "https://www.figma.com/api/mcp/asset/29e79a41-9a52-4eb2-88aa-d2adfdea9931",
  editHero:
    "https://www.figma.com/api/mcp/asset/8a5d54ff-7f26-45ea-9725-874ddacaed60",
  editGallery:
    "https://www.figma.com/api/mcp/asset/aaf2da13-3a6c-4366-86ba-e54cfa1c063d",
};

const infoItems = [
  {
    label: "住所 / Address",
    value: "7-9 Ngô Đức Kế, Bến Nghé, Quận 1, TP. HCM",
    icon: MapPin,
    action: ExternalLink,
  },
  {
    label: "営業時間 / Hours",
    value: "10:00 - 22:00",
    icon: Clock3,
    badge: "Open Now",
  },
  {
    label: "電話番号 / Contact",
    value: "+84 28 3823 1101",
    icon: Phone,
  },
  {
    label: "SNS",
    value: "Facebook    Instagram",
    icon: Share2,
  },
];

const features = [
  {
    eyebrow: "お支払い・領収書",
    title: "VAT対応 / レッドインボイス可",
    icon: ReceiptText,
  },
  {
    eyebrow: "カード利用",
    title: "JCBカード対応",
    icon: CreditCard,
  },
  {
    eyebrow: "サービス",
    title: "日本人スタッフ在籍",
    icon: UsersRound,
  },
];

const formFields = {
  name: "TSUBOMI - 蕾",
  descriptionVn:
    "Đây là một nhà hàng vô cùng nổi tiếng với khách du lịch Nhật Bản tại Hà Nội...",
  descriptionJp:
    "ハノイの中心で四季折々の本格的な日本料理を楽しめる聖域。懐石の技と現地の優雅さを融合させました。",
  address: "15 Hoàn Kiếm District, Hanoi, Vietnam",
  phone: "+84 24 1234 5678",
  hours: "11:30 - 22:30",
  instagram: "instagram.com/tsubomi_hanoi",
  facebook: "fb.com/tsubomijapanese",
};

function PhotoTile({
  src,
  alt,
  className,
  imagePosition = "center",
}: {
  src: string;
  alt: string;
  className: string;
  imagePosition?: string;
}) {
  return (
    <div
      aria-label={alt}
      className={`overflow-hidden rounded bg-cover ${className}`}
      role="img"
      style={{ backgroundImage: `url(${src})`, backgroundPosition: imagePosition }}
    />
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase leading-[15px] tracking-[1.5px] text-[#5a6053] font-jp">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded bg-[#f4f4f1] px-4 py-3 text-sm leading-5 text-[#1a1c1b] outline-none transition-shadow focus:ring-1 focus:ring-[#af111c] font-manrope";

function EditRestaurantModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1a1c1b]/40 px-4 py-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-restaurant-title"
    >
      <div className="relative flex max-h-[calc(100dvh-48px)] w-full max-w-[896px] flex-col overflow-hidden rounded-lg bg-[#f9f9f6] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <div className="z-10 flex shrink-0 items-center justify-between bg-[#f9f9f6]/90 px-8 py-5 backdrop-blur-md">
          <h2
            id="edit-restaurant-title"
            className="text-2xl font-bold uppercase leading-8 tracking-[-0.6px] text-[#af111c] font-jp"
          >
            レストラン情報の編集
          </h2>
          <button
            type="button"
            aria-label="Close restaurant edit dialog"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl bg-[#e8e8e5] text-[#5a6053] transition-colors hover:bg-[#dededb] hover:text-[#1a1c1b]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-10 overflow-y-auto px-8 pb-6 pt-5">
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="h-0.5 w-8 bg-[#af111c]" />
              <h3 className="text-xs font-bold uppercase leading-4 tracking-[2.4px] text-[#af111c] font-jp">
                写真管理
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
              <div
                aria-label="Current hero photo"
                className="relative col-span-2 h-[309px] overflow-hidden rounded-lg bg-cover bg-center max-md:col-span-1"
                role="img"
                style={{ backgroundImage: `url(${photos.editHero})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c1b]/60 to-[#1a1c1b]/0" />
                <button
                  type="button"
                  className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded border border-white/30 bg-[#f9f9f6]/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-md font-manrope"
                >
                  <Camera className="size-3.5" />
                  Change Hero Photo
                </button>
              </div>

              <div className="grid gap-4">
                <button
                  type="button"
                  className="flex h-[146px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e4beba4d] bg-[#eeeeeb] text-[#5a6053] transition-colors hover:bg-[#e8e8e5]"
                >
                  <Camera className="size-6" />
                  <span className="text-[10px] font-bold uppercase tracking-[1px] font-manrope">
                    Add Gallery
                  </span>
                </button>
                <div
                  aria-label="Gallery food photo"
                  className="h-[146px] rounded-lg bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url(${photos.editGallery})` }}
                />
              </div>
            </div>
          </section>

          <section className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-8">
              <Field label="店名">
                <input
                  className={`${inputClass} text-lg font-bold leading-7 font-brand`}
                  defaultValue={formFields.name}
                />
              </Field>
              <Field label="説明 (ベトナム語)">
                <textarea
                  className={`${inputClass} min-h-[80px] resize-none leading-[22px]`}
                  defaultValue={formFields.descriptionVn}
                />
              </Field>
              <Field label="説明 (日本語)">
                <textarea
                  className={`${inputClass} min-h-[102px] resize-none leading-[22px] font-jp`}
                  defaultValue={formFields.descriptionJp}
                />
              </Field>
            </div>

            <div className="flex flex-col gap-8">
              <Field label="住所">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-[#af111c]" />
                  <input
                    className={`${inputClass} pl-11`}
                    defaultValue={formFields.address}
                  />
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="電話番号">
                  <input className={inputClass} defaultValue={formFields.phone} />
                </Field>
                <Field label="Operating Hours / 営業時間">
                  <input className={inputClass} defaultValue={formFields.hours} />
                </Field>
              </div>

              <Field label="SNSリンク">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 rounded bg-[#f4f4f1] p-2">
                    <span className="flex h-8 w-7 items-center justify-center rounded-md bg-white text-[#af111c]">
                      <span className="text-[11px] font-bold leading-none font-brand">
                        IG
                      </span>
                    </span>
                    <input
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs leading-4 text-[#1a1c1b] outline-none font-manrope"
                      defaultValue={formFields.instagram}
                    />
                  </div>
                  <div className="flex items-center gap-3 rounded bg-[#f4f4f1] p-2">
                    <span className="flex h-8 w-7 items-center justify-center rounded-md bg-white text-[#af111c]">
                      <span className="text-sm font-bold leading-none font-brand">
                        f
                      </span>
                    </span>
                    <input
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs leading-4 text-[#1a1c1b] outline-none font-manrope"
                      defaultValue={formFields.facebook}
                    />
                  </div>
                </div>
              </Field>
            </div>
          </section>

          <div className="sticky bottom-0 -mx-8 flex justify-end gap-3 border-t border-[#e2e3e0] bg-[#f9f9f6]/95 px-8 py-5 backdrop-blur-md max-sm:flex-col">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[120px] rounded border border-[#af111c] px-6 py-2.5 text-sm font-bold leading-5 tracking-[0.4px] text-[#5a6053] transition-colors hover:bg-[#af111c]/5 font-jp"
            >
              キャンセル
            </button>
            <button
              type="button"
              className="min-w-[140px] rounded bg-[linear-gradient(169deg,#af111c_0%,#d32f31_100%)] px-7 py-2.5 text-sm font-bold leading-5 tracking-[0.4px] text-white shadow-[0_10px_15px_-3px_rgba(175,17,28,0.2),0_4px_6px_-4px_rgba(175,17,28,0.2)] transition-opacity hover:opacity-90 font-jp"
            >
              保存する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerHomePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#f9f9f6] pb-12">
      <section className="bg-[#eeeeeb]">
        <div className="grid h-[614px] grid-cols-4 grid-rows-2 gap-2 p-2 max-lg:h-[520px] max-md:h-auto max-md:grid-cols-1 max-md:grid-rows-none">
          <div
            aria-label="Hoang Yen Cuisine restaurant interior"
            className="relative col-span-2 row-span-2 overflow-hidden rounded bg-cover bg-center max-md:col-span-1 max-md:h-[360px]"
            role="img"
            style={{ backgroundImage: `url(${photos.interior})` }}
          >
            <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-xl bg-[#3d5f46] px-4 py-2 text-xs font-medium uppercase tracking-[1.2px] text-white shadow-lg font-jp">
              <BadgeCheck className="size-3.5" />
              認証済みレストラン
            </div>
          </div>
          <PhotoTile
            src={photos.dish}
            alt="Vietnamese dish"
            className="max-md:h-56"
          />
          <PhotoTile
            src={photos.staff}
            alt="Restaurant staff"
            className="max-md:h-56"
          />
          <PhotoTile
            src={photos.foodDisplay}
            alt="Food display"
            className="col-span-2 max-md:col-span-1 max-md:h-56"
          />
        </div>
      </section>

      <section className="relative z-10 mx-8 -mt-16 rounded-lg border border-[#e4beba1a] bg-white p-10 shadow-[0_20px_25px_-5px_rgba(26,28,27,0.05),0_8px_10px_-6px_rgba(26,28,27,0.05)] max-md:mx-4 max-md:p-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium uppercase tracking-[1.4px] text-[#3d5f46] font-jp">
                伝統的なベトナム料理
              </p>
              <h1 className="text-5xl font-extrabold leading-none tracking-[-2.4px] text-[#1a1c1b] font-brand max-md:text-4xl">
                Hoang Yen Cuisine
              </h1>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-md border-2 border-[#d32f2f] px-[18px] py-2.5 text-sm font-bold text-[#d32f2f] transition-colors hover:bg-[#d32f2f]/5 font-jp"
              >
                <PencilLine className="size-3.5" />
                店舗情報を編集
              </button>
              <p className="pt-2 text-lg font-medium leading-7 text-[#5a6053] font-jp">
                ホアン・イェン・キュイジーヌ
              </p>
            </div>

            <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
              {infoItems.map((item) => {
                const Icon = item.icon;
                const Action = item.action;

                return (
                  <div key={item.label} className="flex items-start">
                    <Icon className="mt-0.5 size-5 shrink-0 text-[#d32f2f]" />
                    <div className="min-w-0 pl-3">
                      <p className="text-sm font-bold leading-5 text-[#1a1c1b] font-jp">
                        {item.label}
                      </p>
                      <div className="mt-1 flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm leading-5 text-[#5a6053] font-manrope">
                          {item.value}
                        </p>
                        {item.badge ? (
                          <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold leading-[15px] text-[#15803d]">
                            {item.badge}
                          </span>
                        ) : null}
                        {Action ? (
                          <button
                            type="button"
                            aria-label="Open address externally"
                            className="rounded-md p-1 text-[#5a6053] hover:bg-[#eeeeeb]"
                          >
                            <Action className="size-3" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden rounded-lg border border-[#e4beba33] bg-[#e8e8e5] shadow-inner max-lg:min-h-[260px]">
            <div
              aria-label="Map near Hoang Yen Cuisine"
              className="absolute inset-0 bg-cover bg-center opacity-90 saturate-50"
              role="img"
              style={{ backgroundImage: `url(${photos.map})` }}
            />
            <div className="absolute inset-0 bg-black/5" />
            <div className="absolute left-1/2 top-[62px] flex -translate-x-1/2 flex-col items-center">
              <div className="rounded border-2 border-white bg-[#d32f2f] px-4 py-2 text-[11px] font-bold leading-none text-white shadow-[0_0_0_4px_rgba(211,47,47,0.2),0_20px_25px_-5px_rgba(0,0,0,0.1)]">
                Takumi Japanese Restaurant
              </div>
              <div className="mt-3 flex size-14 items-center justify-center rounded-xl border-4 border-white bg-[#d32f2f] text-white shadow-2xl">
                <Utensils className="size-7" />
              </div>
              <div className="h-4 w-1.5 bg-[#d32f2f] shadow-md" />
            </div>
            <button
              type="button"
              className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-md border border-[#e4beba4d] bg-white px-2.5 py-2 text-xs font-bold text-[#5b403d] shadow-md font-jp"
            >
              <ExternalLink className="size-3" />
              Google Mapで開く
            </button>
          </div>
        </div>

        <div className="mt-12 border-t border-[#e4beba1a] pt-10">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="flex items-center">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#dfe5d4] text-[#3d5f46]">
                    <Icon className="size-5" />
                  </div>
                  <div className="pl-4">
                    <p className="text-xs font-medium uppercase leading-4 tracking-[1.2px] text-[#5a6053] font-jp">
                      {feature.eyebrow}
                    </p>
                    <p className="mt-1 text-base font-medium leading-6 text-[#1a1c1b] font-jp">
                      {feature.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {isEditModalOpen ? (
        <EditRestaurantModal onClose={() => setIsEditModalOpen(false)} />
      ) : null}
    </main>
  );
}
