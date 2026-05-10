"use client";

import { CloudUpload, Plus, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createOwnerMenuItem,
  listOwnerMenuItems,
  updateOwnerMenuItem,
  uploadOwnerMenuImage,
} from "@/lib/api/menu/API";
import type { OwnerMenuItem, OwnerMenuPayload } from "@/lib/api/menu/type";
import { getAuthSession, requireOwnerRestaurant } from "@/lib/api/auth/session";

type MenuFormState = {
  nameJp: string;
  nameVn: string;
  descriptionJp: string;
  descriptionVn: string;
  ingredients: string;
  price: string;
  imageUrl: string;
  imagePublicId: string;
  isRecommendedForJp: boolean;
};

const emptyForm: MenuFormState = {
  nameJp: "",
  nameVn: "",
  descriptionJp: "",
  descriptionVn: "",
  ingredients: "",
  price: "",
  imageUrl: "",
  imagePublicId: "",
  isRecommendedForJp: false,
};

const fallbackImage = "/menu/nemran.png";

function toPriceInput(value: number) {
  return value.toLocaleString("vi-VN");
}

function parsePrice(value: string) {
  const numeric = Number(value.replace(/[^\d.]/g, ""));

  return Number.isFinite(numeric) ? numeric : 0;
}

function toFormState(item: OwnerMenuItem | null): MenuFormState {
  if (!item) {
    return emptyForm;
  }

  return {
    nameJp: item.nameJp,
    nameVn: item.nameVn,
    descriptionJp: item.descriptionJp ?? "",
    descriptionVn: item.descriptionVn ?? "",
    ingredients: item.ingredients ?? "",
    price: toPriceInput(item.price),
    imageUrl: item.imageUrl ?? "",
    imagePublicId: item.imagePublicId ?? "",
    isRecommendedForJp: item.isRecommendedForJp,
  };
}

function toPayload(form: MenuFormState): OwnerMenuPayload {
  return {
    nameJp: form.nameJp.trim(),
    nameVn: form.nameVn.trim(),
    descriptionJp: form.descriptionJp.trim(),
    descriptionVn: form.descriptionVn.trim(),
    ingredients: form.ingredients.trim(),
    price: parsePrice(form.price),
    imageUrl: form.imageUrl.trim() || undefined,
    imagePublicId: form.imagePublicId.trim() || undefined,
    isRecommendedForJp: form.isRecommendedForJp,
  };
}

export default function OwnerMenuPage() {
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<OwnerMenuItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | "new" | null>(
    null
  );
  const [form, setForm] = useState<MenuFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const selectedItem = useMemo(
    () =>
      typeof selectedItemId === "number"
        ? menuItems.find((item) => item.itemId === selectedItemId) ?? null
        : null,
    [menuItems, selectedItemId]
  );

  const isCreating = selectedItemId === "new";

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      setIsLoading(true);

      try {
        const session = await getAuthSession();
        const restaurant = requireOwnerRestaurant(session);
        const response = await listOwnerMenuItems(restaurant.restaurantId);

        if (cancelled) {
          return;
        }

        setRestaurantId(restaurant.restaurantId);
        setMenuItems(response.items);

        const firstItem = response.items[0] ?? null;
        setSelectedItemId(firstItem?.itemId ?? "new");
        setForm(toFormState(firstItem));
      } catch {
        if (!cancelled) {
          toast.error("エラーが発生しました");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadMenu();

    return () => {
      cancelled = true;
    };
  }, []);

  function selectItem(item: OwnerMenuItem) {
    setSelectedItemId(item.itemId);
    setForm(toFormState(item));
  }

  function startCreate() {
    setSelectedItemId("new");
    setForm(emptyForm);
  }

  function updateForm<K extends keyof MenuFormState>(
    key: K,
    value: MenuFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function uploadMainImage(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!restaurantId) {
      toast.error("エラーが発生しました");
      return;
    }

    setIsUploadingImage(true);

    try {
      const uploaded = await uploadOwnerMenuImage(restaurantId, file);
      setForm((current) => ({
        ...current,
        imageUrl: uploaded.imageUrl,
        imagePublicId: uploaded.publicId,
      }));
      toast.success("設定を保存しました");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function saveMenuItem() {
    if (!restaurantId) {
      toast.error("エラーが発生しました");
      return;
    }

    const payload = toPayload(form);

    if (!payload.nameJp || !payload.nameVn || !payload.price) {
      toast.error("エラーが発生しました");
      return;
    }

    setIsSaving(true);

    try {
      const saved =
        isCreating || !selectedItem
          ? await createOwnerMenuItem(restaurantId, {
              ...payload,
              isActive: true,
            })
          : await updateOwnerMenuItem(restaurantId, selectedItem.itemId, payload);

      setMenuItems((current) => {
        const exists = current.some((item) => item.itemId === saved.itemId);
        return exists
          ? current.map((item) => (item.itemId === saved.itemId ? saved : item))
          : [saved, ...current];
      });
      setSelectedItemId(saved.itemId);
      setForm(toFormState(saved));
      toast.success("設定を保存しました");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleSoldOut(item: OwnerMenuItem) {
    if (!restaurantId) {
      return;
    }

    try {
      const updated = await updateOwnerMenuItem(restaurantId, item.itemId, {
        isActive: !item.isActive,
      });

      setMenuItems((current) =>
        current.map((entry) =>
          entry.itemId === updated.itemId ? updated : entry
        )
      );

      if (selectedItemId === updated.itemId) {
        setForm(toFormState(updated));
      }

      toast.success("設定を保存しました");
    } catch {
      toast.error("エラーが発生しました");
    }
  }

  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-12 px-6 py-10">
      <section className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1c1b]">
            メニュー管理
          </h1>
          {isLoading ? (
            <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-[#5a6053] shadow-sm">
              Loading API data
            </span>
          ) : null}
        </div>
        <p className="text-base font-medium text-[#5a6053]">
          料理の登録・編集とバイリンガル設定
        </p>
      </section>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="size-[18px] text-[#af111c]" />
              <h2 className="text-[20px] font-medium">現在のメニュー</h2>
            </div>
            <span className="rounded-[12px] bg-[#e8e8e5] px-3 py-1 text-[12px] font-bold uppercase tracking-[-0.6px] text-[#5a6053]">
              {menuItems.length} ITEMS
            </span>
          </div>

          <div className="max-h-[800px] space-y-4 overflow-y-auto pr-2">
            {menuItems.map((item) => {
              const isSelected = item.itemId === selectedItemId;
              const isSoldOut = !item.isActive;

              return (
                <button
                  key={item.itemId}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={`relative flex w-full cursor-pointer gap-4 rounded-lg bg-white p-4 text-left transition-all ${
                    isSelected ? "ring-2 ring-[#af111c]" : "hover:bg-white/50"
                  } ${isSoldOut ? "opacity-70" : ""}`}
                >
                  {isSoldOut ? (
                    <div className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-white/40 mix-blend-saturation" />
                  ) : null}

                  <div
                    className="relative size-24 shrink-0 overflow-hidden rounded bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${item.imageUrl || fallbackImage})`,
                    }}
                  >
                    {isSoldOut ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded-[2px] bg-black/80 px-2 py-1 text-[10px] text-white">
                          品切れ
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col justify-between py-0.5">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[18px] font-medium leading-tight">
                          {item.nameJp}
                        </h3>
                        {item.isRecommendedForJp ? (
                          <span className="rounded-[2px] bg-[#af111c] px-2 py-0.5 text-[10px] font-medium tracking-[0.5px] text-[#fff2f0]">
                            おすすめ
                          </span>
                        ) : null}
                        {isSoldOut && !item.isRecommendedForJp ? (
                          <span className="rounded-[2px] bg-[#a1a1aa] px-2 py-0.5 text-[10px] font-medium tracking-[0.5px] text-white">
                            品切れ
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[14px] text-[#5a6053]">{item.nameVn}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[12px] font-bold text-[#af111c]">
                          VND
                        </span>
                        <span className="text-[18px] font-bold tracking-tight">
                          {toPriceInput(item.price)}
                        </span>
                      </div>
                      <span
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSoldOut(item);
                        }}
                        className={`rounded border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[-0.5px] transition-colors ${
                          isSoldOut
                            ? "border-[#af111c] bg-[#af111c] text-white hover:bg-[#910e17]"
                            : "border-[#af111c] text-[#af111c] hover:bg-[#af111c]/5"
                        }`}
                      >
                        {isSoldOut ? "販売再開する" : "品切れにする"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

            {!isLoading && menuItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#e4beba] bg-white p-8 text-center text-sm text-[#5a6053]">
                No menu items yet.
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#af111c] py-4 text-white shadow-md transition-all hover:bg-[#910e17]"
          >
            <Plus className="size-5" />
            <span className="text-[16px]">新規メニュー追加</span>
          </button>
        </div>

        <div className="space-y-8 rounded-[16px] border border-[#e4beba]/10 bg-white p-8 shadow-sm lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[24px] font-medium">
              {isCreating ? "新規メニュー追加" : "詳細を編集"}
            </h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(toFormState(selectedItem))}
                className="rounded-[8px] bg-[#f4f4f5] px-6 py-2 text-[14px] font-medium text-[#5a6053] transition-colors hover:bg-[#e4e4e7]"
              >
                破棄
              </button>
              <button
                type="button"
                onClick={saveMenuItem}
                disabled={isSaving}
                className="rounded-[8px] bg-[#af111c] px-8 py-2 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-[#910e17] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "保存中..." : "変更を保存"}
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053]">
                メイン写真
              </label>
              <div
                className="relative flex min-h-[180px] flex-col items-center justify-center gap-2 overflow-hidden rounded-[16px] border-2 border-dashed border-[#e4beba] bg-cover bg-center p-10 transition-colors hover:bg-[#f9f9f6]"
                style={{
                  backgroundImage: form.imageUrl ? `url(${form.imageUrl})` : undefined,
                }}
              >
                {isUploadingImage ? (
                  <div className="absolute inset-0 bg-white/65 backdrop-blur-[1px]" />
                ) : null}
                <label
                  className={`z-10 flex cursor-pointer items-center justify-center text-center text-[#5a6053] shadow-sm backdrop-blur-[1px] ${
                    form.imageUrl
                      ? "absolute right-3 top-3 size-10 rounded-full bg-white/90 transition-colors hover:bg-white"
                      : "relative flex-col gap-2 rounded-[8px] bg-white/85 px-5 py-3"
                  }`}
                >
                  <CloudUpload className="size-6" />
                  {form.imageUrl ? (
                    <span className="sr-only">
                      {isUploadingImage ? "アップロード中..." : "写真を変更"}
                    </span>
                  ) : (
                    <>
                      <span className="text-[14px] font-medium">
                        {isUploadingImage ? "アップロード中..." : "写真を変更"}
                      </span>
                      <span className="text-[10px]">PNG, JPG (Max. 10MB)</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={isUploadingImage}
                    onChange={(event) => uploadMainImage(event.target.files?.[0])}
                  />
                </label>
              </div>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(event) => updateForm("imageUrl", event.target.value)}
                placeholder="https://example.com/menu.jpg"
                className="w-full rounded-[8px] bg-[#e2e3e0]/30 px-4 py-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#af111c]"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053]">
                  日本語名
                </label>
                <input
                  type="text"
                  value={form.nameJp}
                  onChange={(event) => updateForm("nameJp", event.target.value)}
                  className="w-full rounded-[8px] bg-[#e2e3e0]/30 px-4 py-3 text-[16px] font-medium focus:outline-none focus:ring-1 focus:ring-[#af111c]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053]">
                  ベトナム語名
                </label>
                <input
                  type="text"
                  value={form.nameVn}
                  onChange={(event) => updateForm("nameVn", event.target.value)}
                  className="w-full rounded-[8px] bg-[#e2e3e0]/30 px-4 py-3 text-[16px] font-bold focus:outline-none focus:ring-1 focus:ring-[#af111c]"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053]">
                  日本語説明
                </label>
                <textarea
                  rows={3}
                  value={form.descriptionJp}
                  onChange={(event) =>
                    updateForm("descriptionJp", event.target.value)
                  }
                  className="w-full resize-none rounded-[8px] bg-[#e2e3e0]/30 px-4 py-3 text-[16px] font-medium focus:outline-none focus:ring-1 focus:ring-[#af111c]"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053]">
                  ベトナム語説明
                </label>
                <textarea
                  rows={3}
                  value={form.descriptionVn}
                  onChange={(event) =>
                    updateForm("descriptionVn", event.target.value)
                  }
                  className="w-full resize-none rounded-[8px] bg-[#e2e3e0]/30 px-4 py-3 text-[16px] font-medium focus:outline-none focus:ring-1 focus:ring-[#af111c]"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053]">
                  材料
                </label>
                <textarea
                  rows={2}
                  value={form.ingredients}
                  onChange={(event) =>
                    updateForm("ingredients", event.target.value)
                  }
                  className="w-full resize-none rounded-[8px] bg-[#e2e3e0]/30 px-4 py-3 text-[16px] font-medium focus:outline-none focus:ring-1 focus:ring-[#af111c]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053]">
                  価格 (VND)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#5a6053]">
                    ₫
                  </span>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(event) => updateForm("price", event.target.value)}
                    className="w-full rounded-[8px] bg-[#e2e3e0]/30 py-3 pl-8 pr-4 text-[16px] font-bold focus:outline-none focus:ring-1 focus:ring-[#af111c]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-[16px] border border-[#e4beba]/10 bg-[#f9f9f6] p-4">
              <span className="text-[14px] font-medium">おすすめ設定</span>
              <button
                type="button"
                onClick={() =>
                  updateForm("isRecommendedForJp", !form.isRecommendedForJp)
                }
                className={`relative h-5 w-10 rounded-full transition-colors ${
                  form.isRecommendedForJp ? "bg-[#af111c]" : "bg-[#c9c9c5]"
                }`}
                aria-pressed={form.isRecommendedForJp}
              >
                <span
                  className={`absolute top-1 size-3 rounded-full bg-white transition-all ${
                    form.isRecommendedForJp ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
