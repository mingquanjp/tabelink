"use client";

import { CloudUpload, Plus, Trash2, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createOwnerMenuItem,
  listOwnerMenuItems,
  updateOwnerMenuItem,
  uploadOwnerMenuImage,
} from "@/lib/api/menu/API";
import type { OwnerMenuItem, OwnerMenuPayload } from "@/lib/api/menu/type";
import { getAuthSession, requireOwnerRestaurant } from "@/lib/api/auth/session";
import {
  OWNER_TOAST_MESSAGES,
  showErrorToast,
  showSuccessToast,
} from "@/lib/app-toast";
import {
  readSessionCache,
  SESSION_CACHE_TTL,
  writeSessionCache,
} from "@/lib/api/cache";

type MenuFormState = {
  nameJp: string;
  nameVn: string;
  descriptionJp: string;
  descriptionVn: string;
  ingredients: string;
  price: string;
  criteria: MenuCriterionForm[];
  imageUrl: string;
  imagePublicId: string;
  isRecommendedForJp: boolean;
};

type MenuCriterionForm = {
  criterionName: string;
  ratingLevel: number;
};

const emptyForm: MenuFormState = {
  nameJp: "",
  nameVn: "",
  descriptionJp: "",
  descriptionVn: "",
  ingredients: "",
  price: "",
  criteria: [],
  imageUrl: "",
  imagePublicId: "",
  isRecommendedForJp: false,
};

const fallbackImage = "/menu/nemran.png";

type OwnerMenuCache = {
  restaurantId: number;
  items: OwnerMenuItem[];
};

function getOwnerMenuCacheKey(restaurantId: number) {
  return `tabelink:owner:menu:${restaurantId}:v1`;
}

function toPriceInput(value: number) {
  return value.toLocaleString("vi-VN");
}

function parsePrice(value: string) {
  const numeric = Number(value.replace(/\D/g, ""));

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
    criteria: item.criteria.map((criterion) => ({
      criterionName: criterion.criterionName,
      ratingLevel: criterion.ratingLevel,
    })),
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
    criteria: form.criteria
      .map((criterion) => ({
        criterionName: criterion.criterionName.trim(),
        ratingLevel: criterion.ratingLevel,
      }))
      .filter((criterion) => criterion.criterionName),
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
  const [isAddingCriterion, setIsAddingCriterion] = useState(false);
  const [newCriterionName, setNewCriterionName] = useState("");

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
      let hasCachedMenu = false;

      try {
        const session = await getAuthSession();
        const restaurant = requireOwnerRestaurant(session);
        const cacheKey = getOwnerMenuCacheKey(restaurant.restaurantId);
        const cachedMenu = readSessionCache<OwnerMenuCache>(
          cacheKey,
          SESSION_CACHE_TTL.menu,
        );
        hasCachedMenu = Boolean(cachedMenu);

        if (!cancelled) {
          setRestaurantId(restaurant.restaurantId);

          if (cachedMenu) {
            setMenuItems(cachedMenu.items);

            const firstCachedItem = cachedMenu.items[0] ?? null;
            setSelectedItemId(firstCachedItem?.itemId ?? "new");
            setForm(toFormState(firstCachedItem));
            setIsLoading(false);
          } else {
            setIsLoading(true);
          }
        }

        const response = await listOwnerMenuItems(restaurant.restaurantId);

        if (cancelled) {
          return;
        }

        setRestaurantId(restaurant.restaurantId);
        setMenuItems(response.items);
        writeSessionCache(cacheKey, {
          restaurantId: restaurant.restaurantId,
          items: response.items,
        });

        const firstItem = response.items[0] ?? null;
        setSelectedItemId(firstItem?.itemId ?? "new");
        setForm(toFormState(firstItem));
      } catch {
        if (!cancelled && !hasCachedMenu) {
          showErrorToast();
        }
      } finally {
        if (!cancelled && !hasCachedMenu) {
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

  function addCriterion() {
    setIsAddingCriterion(true);
    setNewCriterionName("");
  }

  function saveNewCriterion() {
    const criterionName = newCriterionName.trim();

    if (!criterionName) {
      showErrorToast(OWNER_TOAST_MESSAGES.validationError);
      return;
    }

    setForm((current) => ({
      ...current,
      criteria: [...current.criteria, { criterionName, ratingLevel: 3 }],
    }));
    setIsAddingCriterion(false);
    setNewCriterionName("");
  }

  function updateCriterion(
    index: number,
    key: keyof MenuCriterionForm,
    value: string | number
  ) {
    setForm((current) => ({
      ...current,
      criteria: current.criteria.map((criterion, criterionIndex) =>
        criterionIndex === index
          ? {
              ...criterion,
              [key]: key === "ratingLevel" ? Number(value) : value,
            }
          : criterion
      ),
    }));
  }

  function removeCriterion(index: number) {
    setForm((current) => ({
      ...current,
      criteria: current.criteria.filter((_, criterionIndex) => criterionIndex !== index),
    }));
  }

  async function uploadMainImage(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!restaurantId) {
      showErrorToast();
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
      showSuccessToast();
    } catch {
      showErrorToast(OWNER_TOAST_MESSAGES.uploadError);
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function saveMenuItem() {
    if (!restaurantId) {
      showErrorToast();
      return;
    }

    const payload = toPayload(form);

    if (!payload.nameJp || !payload.nameVn || !payload.price) {
      showErrorToast(OWNER_TOAST_MESSAGES.validationError);
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
        const nextItems = exists
          ? current.map((item) => (item.itemId === saved.itemId ? saved : item))
          : [saved, ...current];

        writeSessionCache(getOwnerMenuCacheKey(restaurantId), {
          restaurantId,
          items: nextItems,
        });

        return nextItems;
      });
      setSelectedItemId(saved.itemId);
      setForm(toFormState(saved));
      showSuccessToast();
    } catch {
      showErrorToast();
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

      setMenuItems((current) => {
        const nextItems = current.map((entry) =>
          entry.itemId === updated.itemId ? updated : entry
        );

        writeSessionCache(getOwnerMenuCacheKey(restaurantId), {
          restaurantId,
          items: nextItems,
        });

        return nextItems;
      });

      if (selectedItemId === updated.itemId) {
        setForm(toFormState(updated));
      }

      showSuccessToast();
    } catch {
      showErrorToast();
    }
  }

  return (
    <main className="mx-auto max-w-[1280px] px-10 py-6">
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[413px_minmax(0,1fr)]">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="size-[18px] text-[#af111c]" />
              <h2 className="text-[20px] font-medium">現在のメニュー</h2>
            </div>
            <span className="rounded-[12px] bg-[#e8e8e5] px-3 py-1 text-[12px] font-bold uppercase tracking-[-0.6px] text-[#5a6053]">
              {menuItems.length} ITEMS
            </span>
          </div>

          <div className="max-h-[666px] space-y-3 overflow-y-auto pr-2">
            {menuItems.map((item) => {
              const isSelected = item.itemId === selectedItemId;
              const isSoldOut = !item.isActive;

              return (
                <button
                  key={item.itemId}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={`relative flex min-h-[107px] w-full cursor-pointer gap-4 rounded-lg bg-white p-4 text-left transition-all ${
                    isSelected ? "ring-2 ring-[#af111c]" : "hover:bg-white/50"
                  } ${isSoldOut ? "opacity-70" : ""}`}
                >
                  {isSoldOut ? (
                    <div className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-white/40 mix-blend-saturation" />
                  ) : null}

                  <div
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-cover bg-center"
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
                        <h3 className="text-[16px] font-semibold leading-tight">
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
                      <p className="text-[13px] text-[#5a6053]">{item.nameVn}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[12px] font-bold text-[#af111c]">
                          VND
                        </span>
                        <span className="text-[18px] font-bold">
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

        <div className="min-h-[820px] bg-white px-11 py-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[24px] font-medium leading-none">
              {isCreating ? "新規メニュー追加" : "詳細を編集"}
            </h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(toFormState(selectedItem))}
                className="h-8 rounded-[8px] bg-[#f4f4f5] px-5 text-[13px] font-medium text-[#5a6053] transition-colors hover:bg-[#e4e4e7]"
              >
                破棄
              </button>
              <button
                type="button"
                onClick={saveMenuItem}
                disabled={isSaving}
                className="h-8 rounded-[8px] bg-[#af111c] px-8 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-[#910e17] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "保存中..." : "変更を保存"}
              </button>
            </div>
          </div>

          <div className="mt-9 max-w-[600px] space-y-7">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-[#5a6053]">
                メイン写真
              </label>
              <div
                className="relative flex h-[150px] flex-col items-center justify-center gap-2 overflow-hidden rounded-[8px] border border-dashed border-[#6f625c] bg-[#f4f4f3] bg-cover bg-center p-8 transition-colors hover:bg-[#f9f9f6]"
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
                      ? "absolute right-3 top-3 size-9 rounded-full bg-white/90 transition-colors hover:bg-white"
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
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-[#5a6053]">
                  日本語名
                </label>
                <input
                  type="text"
                  value={form.nameJp}
                  onChange={(event) => updateForm("nameJp", event.target.value)}
                  className="h-10 w-full rounded-[8px] bg-[#f4f4f3] px-3 text-[14px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#af111c]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-[#5a6053]">
                  ベトナム語名
                </label>
                <input
                  type="text"
                  value={form.nameVn}
                  onChange={(event) => updateForm("nameVn", event.target.value)}
                  className="h-10 w-full rounded-[8px] bg-[#f4f4f3] px-3 text-[14px] font-bold focus:outline-none focus:ring-1 focus:ring-[#af111c]"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] font-medium text-[#5a6053]">
                  日本語説明
                </label>
                <textarea
                  value={form.descriptionJp}
                  onChange={(event) =>
                    updateForm("descriptionJp", event.target.value)
                  }
                  className="h-[58px] w-full resize-none rounded-[8px] bg-[#f4f4f3] px-3 py-3 text-[13px] font-semibold leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#af111c]"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] font-medium text-[#5a6053]">
                  材料（日本語）
                </label>
                <textarea
                  value={form.ingredients}
                  onChange={(event) =>
                    updateForm("ingredients", event.target.value)
                  }
                  className="h-[58px] w-full resize-none rounded-[8px] bg-[#f4f4f3] px-3 py-3 text-[13px] font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#af111c]"
                />
              </div>
              <div className="hidden">
                <label className="text-[11px] font-medium text-[#5a6053]">
                  ベトナム語説明
                </label>
                <textarea
                  value={form.descriptionVn}
                  onChange={(event) =>
                    updateForm("descriptionVn", event.target.value)
                  }
                  className="h-[62px] w-full resize-none rounded-[8px] bg-[#f4f4f3] px-3 py-3 text-[14px] font-medium focus:outline-none focus:ring-1 focus:ring-[#af111c]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-[#5a6053]">
                  価格 (VND)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-bold text-[#5a6053]">
                    ₫
                  </span>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(event) => updateForm("price", event.target.value)}
                    className="h-10 w-full rounded-[8px] bg-[#f4f4f3] py-2 pl-8 pr-3 text-[14px] font-bold focus:outline-none focus:ring-1 focus:ring-[#af111c]"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#efefec] pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[11px] font-medium text-[#5a6053]">
                    追加評価（カスタム）
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addCriterion}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#af111c]"
                >
                  <Plus className="size-3" />
                  項目を追加
                </button>
              </div>

              {isAddingCriterion ? (
                <div className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={newCriterionName}
                    onChange={(event) => setNewCriterionName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        saveNewCriterion();
                      }
                    }}
                    placeholder="項目名を入力 (例: 香り, 歯ごたえ)"
                    className="h-10 min-w-0 flex-1 rounded-[6px] border border-[#e2e3e0] bg-white px-3 text-[13px] font-medium outline-none focus:ring-1 focus:ring-[#af111c]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={saveNewCriterion}
                    className="h-10 rounded-[6px] bg-[#af111c] px-7 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#910e17]"
                  >
                    保存
                  </button>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {form.criteria.map((criterion, index) => (
                  <div
                    key={index}
                    className="rounded-[8px] bg-[#f7f7f5] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <input
                        type="text"
                        value={criterion.criterionName}
                        onChange={(event) =>
                          updateCriterion(index, "criterionName", event.target.value)
                        }
                        placeholder="項目名を入力"
                        className="min-w-0 flex-1 bg-transparent text-[12px] font-semibold outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeCriterion(index)}
                        className="text-[#9a9a94] transition-colors hover:text-[#af111c]"
                        aria-label="評価項目を削除"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[9px] font-medium text-[#8a8d85]">
                        Lv.{criterion.ratingLevel}/5
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => updateCriterion(index, "ratingLevel", level)}
                            className={`size-2 rounded-full transition-colors ${
                              level <= criterion.ratingLevel
                                ? "bg-[#af111c]"
                                : "bg-[#d8d8d4] hover:bg-[#bdbdb8]"
                            }`}
                            aria-label={`${level} / 5`}
                            aria-pressed={level === criterion.ratingLevel}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {form.criteria.length === 0 ? (
                  <div className="rounded-[8px] bg-[#f7f7f5] p-3 text-[12px] font-medium text-[#8a8d85] sm:col-span-2">
                    追加評価はまだありません。
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-[8px] bg-[#f4f4f3] px-4 py-3">
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
