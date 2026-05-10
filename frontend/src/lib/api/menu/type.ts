export type MenuCriterion = {
  criterionId: number;
  criterionName: string;
  ratingLevel: number;
  sortOrder: number;
};

export type OwnerMenuItem = {
  itemId: number;
  restaurantId: number;
  categoryId: number | null;
  nameVn: string;
  nameJp: string;
  price: number;
  descriptionVn: string | null;
  descriptionJp: string | null;
  ingredients: string | null;
  isRecommendedForJp: boolean;
  criteria: MenuCriterion[];
  imageUrl: string | null;
  imagePublicId: string | null;
  isActive: boolean;
  deletedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type OwnerMenuListResponse = {
  restaurantId: number;
  count: number;
  items: OwnerMenuItem[];
};

export type OwnerMenuPayload = {
  categoryId?: number | null;
  nameVn?: string;
  nameJp?: string;
  price?: number;
  descriptionVn?: string;
  descriptionJp?: string;
  ingredients?: string;
  isRecommendedForJp?: boolean;
  criteria?: Array<{
    criterionName: string;
    ratingLevel: number;
  }>;
  imageUrl?: string;
  imagePublicId?: string;
  isActive?: boolean;
};

export type UploadOwnerMenuImageResponse = {
  imageUrl: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  originalName: string;
};
