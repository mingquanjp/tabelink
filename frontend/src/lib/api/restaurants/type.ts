import type { OwnerHomeResponse } from "@/lib/api/owner-home/type";

export type PublicRestaurantPromotion = {
  promotionId: number;
  restaurantId: number;
  promotionType: string;
  targetAudience: string | null;
  titleVn: string;
  titleJp: string;
  contentVn: string | null;
  contentJp: string | null;
  mediaUrl: string | null;
  termsVn: string | null;
  termsJp: string | null;
  startDate: string | Date;
  endDate: string | Date;
  status: string;
};

export type PublicRestaurantDetailResponse = Omit<
  OwnerHomeResponse,
  "menu" | "promotions"
> & {
  menu?: OwnerHomeResponse["menu"];
  promotions: {
    count: number;
    items: PublicRestaurantPromotion[];
  };
  reviewSubmission?: {
    enabled: boolean;
    method: "POST";
    endpoint: string;
  };
};

export type UserRestaurantDetailResponse = OwnerHomeResponse & {
  promotions: {
    count: number;
    items: PublicRestaurantPromotion[];
  };
  reviewSubmission?: PublicRestaurantDetailResponse["reviewSubmission"];
};

export type CreateRestaurantReviewPayload = {
  rating: number;
  content?: string;
  toiletCleanliness?: number;
  dishCleanliness?: number;
  spaceCleanliness?: number;
  isJapaneseTag?: boolean;
  reservationId?: number;
};

export type CreateRestaurantReviewResponse = {
  reviewId: number;
  customerAccountId: number;
  restaurantId: number;
  reservationId: number | null;
  rating: number;
  toiletCleanliness: number | null;
  dishCleanliness: number | null;
  spaceCleanliness: number | null;
  content: string | null;
  isJapaneseTag: boolean;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};
