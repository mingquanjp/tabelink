export type RatingKey = "taste" | "hygiene" | "service";

export type RatingItem = {
  key: RatingKey;
  label: string;
};

export const ratingItems: RatingItem[] = [
  { key: "taste", label: "味" },
  { key: "hygiene", label: "衛生面・トイレ" },
  { key: "service", label: "サービス" },
];

export const defaultRatings: Record<RatingKey, number> = {
  taste: 4,
  hygiene: 3,
  service: 4,
};

export const defaultTags = ["#ハノイダイニング", "#接待", "#家族連れ"];
