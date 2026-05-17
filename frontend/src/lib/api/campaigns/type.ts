export type UserCampaign = {
  promotionId: number;
  restaurantId: number;
  restaurantNameVN: string;
  restaurantNameJP: string;
  imageUrl: string | null;
  promotionType: "Campaign";
  campaignNameVN: string;
  campaignNameJP: string;
  campaignDescriptionVN: string | null;
  campaignDescriptionJP: string | null;
  targetAudience: string | null;
  discountType: string | null;
  discountValue: string | null;
  noteVN: string | null;
  noteJP: string | null;
  startDate: string;
  endDate: string;
  status: "Active";
};

export type UserCampaignsResponse = {
  items: UserCampaign[];
};

export type OwnerPromotionStatus = "Active" | "Pending" | "Rejected" | "Ended";

export type OwnerPromotionBase = {
  promotionId: number;
  restaurantId: number;
  createdByOwnerAccountId: number;
  promotionType: "Campaign" | "Advertisement";
  targetAudience: string | null;
  startDate: string;
  endDate: string;
  status: OwnerPromotionStatus;
  impressions: number;
  clicks: number;
  totalCost: number;
};

export type OwnerCampaignPromotion = OwnerPromotionBase & {
  promotionType: "Campaign";
  campaignName: string;
  campaignDescription: string | null;
  discountType: "Percentage" | "FixedAmount" | string | null;
  discountValue: string | null;
  note: string | null;
};

export type OwnerAdPromotion = OwnerPromotionBase & {
  promotionType: "Advertisement";
  titleVn: string | null;
  titleJp: string | null;
  contentVn: string | null;
  contentJp: string | null;
  mediaUrl: string | null;
  termsVn: string | null;
  termsJp: string | null;
  advertisementType: "SNS" | "Notification" | string | null;
  targetRadiusKm: number | null;
};

export type OwnerPromotion = OwnerCampaignPromotion | OwnerAdPromotion;

export type OwnerPromotionsSummary = {
  activeCount: number;
  pendingCount: number;
  advertisementCount: number;
  campaignCount: number;
  totalImpressions: number;
  totalClicks: number;
  monthOverMonth?: {
    currentMonth: {
      activeCount: number;
      totalImpressions: number;
      campaignClicks: number;
      ctr: number;
    };
    previousMonth: {
      activeCount: number;
      totalImpressions: number;
      campaignClicks: number;
      ctr: number;
    };
    change: {
      activeCount: number;
      totalImpressions: number;
      campaignClicks: number;
      ctr: number;
    };
    percentChange?: {
      activeCount: number;
      totalImpressions: number;
      campaignClicks: number;
    };
  };
};

export type OwnerPromotionsResponse = {
  restaurantId: number;
  count: number;
  summary: OwnerPromotionsSummary;
  items: OwnerPromotion[];
};

export type CreateOwnerCampaignRequest = {
  campaignName: string;
  campaignDescription: string;
  targetAudience: "all" | "new";
  discountType: "Percentage" | "FixedAmount";
  discountValue: "10%" | "20%" | "50%" | "100%" | "50000VND" | "100000VND" | "200000VND";
  note?: string;
  startDate: string;
  endDate: string;
};

export type CreateOwnerAdRequest = {
  titleVn?: string;
  titleJp?: string;
  contentVn?: string;
  contentJp?: string;
  advertisementType: "SNS" | "Notification";
  targetRadiusKm?: number;
  totalCost?: number;
  mediaUrl?: string;
  startDate: string;
  endDate: string;
};

export type UpdateOwnerPromotionRequest = {
  titleVn?: string;
  titleJp?: string;
  contentVn?: string;
  contentJp?: string;
  targetAudience?: "all" | "new" | string;
  discountType?: "Percentage" | "FixedAmount" | string;
  discountValue?: string;
  termsVn?: string;
  termsJp?: string;
  advertisementType?: "SNS" | "Notification" | string;
  totalCost?: number;
  mediaUrl?: string;
  startDate?: string;
  endDate?: string;
};

export type UploadOwnerAdImageResponse = {
  mediaUrl: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  originalName: string;
};
