import type { ChecklistItem } from "./types";

export const fallbackRestaurantImages = {
  thumbnail: "/admin/badge/kizuna-thumb.jpg",
  main: "/admin/badge/kizuna-main.jpg",
  hygiene: ["/admin/badge/kitchen.jpg", "/admin/badge/sanitation.jpg"],
};

export const reviewChecklist: ChecklistItem[] = [
  {
    id: "hygiene",
    title: "調理場の衛生状態は適切か",
    description: "シンク、排水口、食材保管状況が基準を満たしていること。",
  },
  {
    id: "staff",
    title: "日本人スタッフの雇用証明を確認",
    description: "労働許可証または履歴書との照合が完了していること。",
  },
  {
    id: "reviews",
    title: "ユーザー評価に重大な違反はないか",
    description: "過去3ヶ月以内に衛生面での低評価コメントがないか。",
  },
];
