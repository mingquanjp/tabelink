export type AdminPromotionStatus = "Pending" | "Active" | "Rejected" | "Ended";

export type AdminPromotionDisplayStatus =
  | "審査待ち"
  | "配信中"
  | "開始前"
  | "却下済み"
  | "終了済み";

export type AdminPromotionSummary = {
  pendingCount: number;
  activeCount: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
};

export type AdminPromotion = {
  promotionId: number;
  promotionType: "Advertisement" | "Campaign";
  restaurantId: number;
  restaurantNameVN: string;
  restaurantNameJP: string;
  displayTitle: string | null;
  displayContent: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  periodLabel: string;
  status: AdminPromotionStatus;
  displayStatus: AdminPromotionDisplayStatus;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
};

export type AdminPromotionsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type AdminPromotionsResponse = {
  items: AdminPromotion[];
  pagination: AdminPromotionsPagination;
};

export type AdminPromotionsQuery = {
  search?: string;
  status?: AdminPromotionStatus;
  page?: number;
  limit?: number;
};
