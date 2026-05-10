export type TopMenuItem = {
  rank: number;
  itemId: number;
  restaurantId: number;
  nameVn: string;
  nameJp: string;
  imageUrl: string | null;
  orderCount: number;
  revenue?: number;
};

export type TopMenuResponse = {
  restaurantId: number;
  count: number;
  items: TopMenuItem[];
};

export type OwnerDashboardResponse = {
  restaurantId: number;
  period: {
    month: string;
  };
  summary: {
    monthlyViews: {
      value: number;
      previousMonthValue: number;
      changeRate: number;
    };
    japaneseAverageRating: {
      value: number | null;
      reviewCount: number;
    };
    campaignWeeklyOrders: {
      value: number;
      activeCampaignCount: number;
      isTracked: boolean;
    };
    publishedReviews: {
      value: number;
      target: number;
      progressRate: number;
    };
  };
  visitorTrend: Array<{
    date: string;
    japanese: number;
    others: number;
  }>;
  revenueTrend: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
  userAttributes: Array<{
    label: string;
    count: number;
    percentage: number;
  }>;
  reviewSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topMenus: TopMenuItem[];
  busyHoursToday: {
    date: string;
    peakHour: number | null;
    items: Array<{
      hour: number;
      reservationCount: number;
    }>;
    insight: string;
  };
  verification: {
    status: string;
    application: {
      appId: number;
      restaurantId: number;
      badgeId: number;
      badge: {
        badgeId: number;
        badgeCode: string;
        badgeNameVn: string | null;
        badgeNameJp: string | null;
      } | null;
      submittedByOwnerAccountId: number;
      businessLicenseUrl: string | null;
      businessLicensePublicId: string | null;
      foodSafetyCertUrl: string | null;
      foodSafetyCertPublicId: string | null;
      status: string;
      submittedAt: string | Date;
      reviewedByAdminId: number | null;
      reviewedAt: string | Date | null;
      reviewNote: string | null;
    } | null;
  };
};

export type RestaurantViewResponse = {
  restaurantId: number;
  statDate: string;
  visitCount: number;
  japaneseVisitCount: number;
};

export type MenuItemViewResponse = {
  itemId: number;
  statDate: string;
  viewCount: number;
};

export type AdCounterResponse = {
  adId: number;
  impressions: number;
  clicks: number;
  ctr: number;
};
