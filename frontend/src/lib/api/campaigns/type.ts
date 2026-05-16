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
