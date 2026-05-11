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

export type OwnerMenuCategory = {
  categoryId: number;
  restaurantId: number;
  categoryCode: string;
  categoryNameVn: string;
  categoryNameJp: string;
  sortOrder: number;
  isActive: boolean;
};

export type OwnerMenuListResponse = {
  restaurantId: number;
  count: number;
  categories: OwnerMenuCategory[];
  items: OwnerMenuItem[];
};

export type OwnerMenuCategoryPayload = {
  categoryNameJp: string;
  categoryNameVn?: string;
  categoryCode?: string;
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
