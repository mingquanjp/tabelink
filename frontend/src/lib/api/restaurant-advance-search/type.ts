// Cần thiết để hiển thị Card và Map
export interface RestaurantSearchItem {
  restaurantId: number;
  nameVn: string;
  nameJp: string;
  address: string;
  latitude: number;
  longitude: number;
  coverImageUrl: string | null;
  distance?: number;
  issuesVat: boolean;

  // featureIds hoặc features dùng để hiện các Badge chuẩn Nhật (Verified, Staff, etc.)
  features: {
    featureId: number;
    featureCode: string;
  }[];

  averageRating?: number;
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
  items: RestaurantSearchItem[]; // Map đúng type bạn đã định nghĩa
  totalCount: number;
  page: number;
  limit: number;
}
