export type OwnerHomeRestaurantMedia = {
  mediaId: number;
  mediaUrl: string;
  mediaType: string;
  sortOrder: number;
  status: string;
};

export type OwnerHomeSocialLink = {
  socialLinkId: number;
  restaurantId: number;
  provider: string;
  url: string;
  displayLabel: string | null;
  sortOrder: number;
};

export type OwnerHomeMenuItem = {
  itemId: number;
  restaurantId: number;
  categoryId: number | null;
  category: {
    categoryId: number;
    categoryCode: string | null;
    categoryNameVn: string | null;
    categoryNameJp: string | null;
  } | null;
  nameVn: string;
  nameJp: string;
  price: number;
  descriptionVn: string | null;
  descriptionJp: string | null;
  imageUrl: string | null;
  isRecommendedForJp: boolean;
  isActive: boolean;
  criteria: Array<{
    criterionId: number;
    criterionName: string;
    ratingLevel: number;
    sortOrder: number;
  }>;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type OwnerHomeReviewItem = {
  reviewId: number;
  restaurantId: number;
  customerAccountId: number;
  customerName: string | null;
  customerAvatarUrl: string | null;
  rating: number;
  toiletCleanliness: number | null;
  dishCleanliness: number | null;
  spaceCleanliness: number | null;
  content: string | null;
  sentiment: string | null;
  isJapaneseTag: boolean;
  mediaUrls: string[];
  tags: string[];
  createdAt: string | Date;
};

export type UpdateOwnerRestaurantPayload = {
  nameVn?: string;
  nameJp?: string;
  address?: string;
  descriptionVn?: string;
  descriptionJp?: string;
  phone?: string;
  openingHours?: string;
  media?: Array<{
    mediaUrl: string;
    mediaType: "Cover" | "Photo" | "Other";
    sortOrder?: number;
  }>;
  socialLinks?: Array<{
    provider: "Facebook" | "Instagram" | "Website" | "Line" | "Other";
    url: string;
    displayLabel?: string;
    sortOrder?: number;
    isActive?: boolean;
  }>;
};

export type UploadOwnerRestaurantImageResponse = {
  imageUrl: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  originalName: string;
};

export type OwnerHomeResponse = {
  restaurantId: number;
  restaurant: {
    restaurantId: number;
    ownerAccountId: number;
    nameVn: string;
    nameJp: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    descriptionVn: string | null;
    descriptionJp: string | null;
    phone: string | null;
    openingHours: string | null;
    issuesVat: boolean;
    status: string;
    socialLinks: OwnerHomeSocialLink[];
    sns: {
      facebook: string | null;
      instagram: string | null;
    };
    map: {
      latitude: number | null;
      longitude: number | null;
      embedUrl: string | null;
    };
    coverImageUrl: string | null;
    media: OwnerHomeRestaurantMedia[];
    features: Array<{
      featureId: number;
      featureCode?: string;
      featureNameVn?: string;
      featureNameJp?: string;
    }>;
    paymentMethods: Array<{
      paymentMethodId: number;
      methodCode?: string;
      methodName?: string;
    }>;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
  menu: {
    count: number;
    activeCount: number;
    recommendedForJpCount: number;
    categories: Array<{
      categoryId: number;
      restaurantId: number;
      categoryCode: string;
      categoryNameVn: string;
      categoryNameJp: string;
      sortOrder: number;
      itemCount: number;
    }>;
    items: OwnerHomeMenuItem[];
  };
  promotions: {
    count: number;
    items: unknown[];
  };
  reviews: {
    summary: {
      visibleCount: number;
      averageRating: number | null;
      japaneseReviewCount: number;
      sentiment: {
        positiveCount: number;
        neutralCount: number;
        negativeCount: number;
      };
    };
    items: OwnerHomeReviewItem[];
  };
  badges: {
    count: number;
    isVerified: boolean;
    items: Array<{
      badgeId: number;
      badgeCode: string;
      badgeNameVn: string;
      badgeNameJp: string;
      descriptionVn: string | null;
      descriptionJp: string | null;
      grantedAt: string | Date;
      expiresAt: string | Date | null;
    }>;
  };
};
