// Cần thiết để hiển thị Card và Map
export interface RestaurantSearchItem {
  id?: number;
  restaurantId?: number;
  name?: string;
  mapName?: string;
  nameVn?: string;
  nameJp?: string;
  address: string;
  position?: {
    lat: number;
    lng: number;
  };
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  coverImageUrl: string | null;
  distance?: number;
  distanceValue?: string;
  issuesVat: boolean;
  rating?: number | string;

  // featureIds hoặc features dùng để hiện các Badge chuẩn Nhật (Verified, Staff, etc.)
  features: {
    featureId?: number;
    featureCode: string;
  }[];

  averageRating?: number;
  isVerified?: boolean;
  hasJapaneseStaff?: boolean;
  hasJapaneseMenu?: boolean;
  cuisine?: string;
  amenities?: string[];
  badges?: string[];
}

export interface AdvancedSearchParams {
  keyword?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  japaneseStandards?: number[];
  dishTypes?: number[];
  services?: number[];
  issuesVAT?: boolean;
  page?: number;
  limit?: number;
}

export interface AdvancedSearchResponse {
  items: RestaurantSearchItem[];
  totalCount: number;
  page: number;
  limit: number;
}
