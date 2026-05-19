import { RestaurantSearchItem } from "@/lib/api/maps/restaurant-advance-search/type";

export type DistanceOption = "500m" | "1.0km" | "5km";
export type AmenityKey = "vat" | "parking" | "privateRoom";

export type MapRestaurant = {
  id: number;
  name: string;
  mapName: string;
  address: string;
  position: {
    lat: number;
    lng: number;
  };
  distance: string;
  distanceValue: DistanceOption;
  routeDistanceMeters?: number;
  routeDurationSeconds?: number;
  rating: string;
  ratingValue: number;
  imageUrl: string;
  isVerified?: boolean;
  hasJapaneseStaff?: boolean;
  hasJapaneseMenu?: boolean;
  cuisine: string;
  amenities: AmenityKey[];
  badges: string[];
  features: string[];
};

function parseDistanceMeters(value: string | undefined) {
  if (!value || value === "---") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  const amount = Number.parseFloat(normalized);

  if (!Number.isFinite(amount)) {
    return undefined;
  }

  return normalized.includes("km") ? amount * 1000 : amount;
}

export const mapApiToMapRestaurant = (
  item: RestaurantSearchItem | MapRestaurant,
): MapRestaurant => {
  if ("id" in item) {
    const distanceMeters =
      item.routeDistanceMeters ?? parseDistanceMeters(item.distance);
    const ratingValue =
      typeof item.ratingValue === "number"
        ? item.ratingValue
        : Number(item.rating) || 0;

    return {
      ...item,
      rating: String(item.rating ?? ratingValue),
      ratingValue,
      routeDistanceMeters: distanceMeters,
      routeDurationSeconds: item.routeDurationSeconds,
      badges: item.badges ?? [],
      amenities: item.amenities ?? [],
      features: item.features ?? [],
    };
  }

  const distanceMeters = item.distance;
  const distKm = distanceMeters ? distanceMeters / 1000 : 0;
  let distOption: DistanceOption = "5km";
  if (distKm <= 0.5) distOption = "500m";
  else if (distKm <= 1.0) distOption = "1.0km";
  return {
    id: item.restaurantId,
    name: item.nameJp || item.nameVn,
    mapName: item.nameJp || item.nameVn,
    address: item.address,
    position: {
      lat: item.latitude,
      lng: item.longitude,
    },
    distance: distanceMeters ? `${distKm.toFixed(1)}km` : "---",
    distanceValue: distOption,

    rating: (item.averageRating || 4.5).toString(),
    ratingValue: item.averageRating || 4.5,

    imageUrl: item.coverImageUrl || "",
    isVerified: item.features.some((f) => f.featureId === 1), // Giả sử featureId 1 là "Verified"

    features: item.features?.map((f) => f.featureCode) || [],

    // Xử lý các trường Mock mà BE chưa có hoặc UI yêu cầu đặc thù
    badges: item.issuesVat ? ["VAT発行可"] : [],
    amenities: item.issuesVat ? ["vat" as AmenityKey] : [],
    cuisine: "ベトナム料理", // Mock vì UI yêu cầu string cuisine
    hasJapaneseMenu: item.features?.some((f) => f.featureId === 3) || false,
    hasJapaneseStaff: false,
  };
};
export const currentLocation = {
  lat: 21.0166,
  lng: 105.8412,
};

export const cuisineTags = [
  "フォー",
  "ブンチャー",
  "シーフード",
  "鍋料理",
  "おまかせ",
];

export const distanceOptions: DistanceOption[] = ["500m", "1.0km", "5km"];

export const restaurants: MapRestaurant[] = [
  {
    id: 1,
    name: "寿司 匠 - Takumi",
    mapName: "Takumi Japanese Restaurant",
    address: "95 Ly Thuong Kiet, Hoan Kiem, Hanoi",
    position: {
      lat: 21.02686,
      lng: 105.84647,
    },
    distance: "92 KM MA",
    distanceValue: "1.0km",
    rating: "4.9",
    ratingValue: 4.9,
    imageUrl:
      "https://www.figma.com/api/mcp/asset/4d82b0d1-6e47-4921-a9fc-4f0105d1f893",
    isVerified: true,
    hasJapaneseStaff: true,
    hasJapaneseMenu: true,
    cuisine: "おまかせ",
    amenities: ["vat", "parking", "privateRoom"],
    badges: ["Residents Badge", "VAT 可"],
    features: ["個室完備", "接待向け"],
  },
  {
    id: 2,
    name: "炉端焼き 炭火",
    mapName: "Robatayaki Sumibi",
    address: "18 Hang Than, Ba Dinh, Hanoi",
    position: {
      lat: 21.03985,
      lng: 105.846,
    },
    distance: "92 KM MA",
    distanceValue: "1.0km",
    rating: "4.7",
    ratingValue: 4.7,
    imageUrl:
      "https://www.figma.com/api/mcp/asset/ce709eb3-9e2e-44e3-ba7b-86ea4d965378",
    cuisine: "鍋料理",
    amenities: ["vat", "parking"],
    badges: ["VAT 可"],
    features: ["深夜営業", "お一人様歓迎"],
  },
  {
    id: 3,
    name: "焼肉 雅 - Miyabi",
    mapName: "Yakiniku Miyabi",
    address: "28 Tran Phu, Ba Dinh, Hanoi",
    position: {
      lat: 21.03061,
      lng: 105.84117,
    },
    distance: "92 KM MA",
    distanceValue: "1.0km",
    rating: "4.8",
    ratingValue: 4.8,
    imageUrl:
      "https://www.figma.com/api/mcp/asset/9e87645d-2d19-4c77-88e0-14581e1f76f6",
    isVerified: true,
    hasJapaneseStaff: true,
    cuisine: "シーフード",
    amenities: ["parking", "privateRoom"],
    badges: ["Residents Badge"],
    features: ["景観良好", "接待向け"],
  },
  {
    id: 4,
    name: "麺処 龍 - Ryu",
    mapName: "Hanoi Ramen Ichiban",
    address: "42 Hang Bac, Hoan Kiem, Hanoi",
    position: {
      lat: 21.03418,
      lng: 105.85255,
    },
    distance: "92 KM MA",
    distanceValue: "500m",
    rating: "4.5",
    ratingValue: 4.5,
    imageUrl:
      "https://www.figma.com/api/mcp/asset/a3ccfdad-85c2-4ce2-aaec-9ccff9e0c4bb",
    isVerified: true,
    hasJapaneseMenu: true,
    cuisine: "フォー",
    amenities: ["vat"],
    badges: ["Hygiene: 90"],
    features: ["深夜営業", "お一人様歓迎"],
  },
  {
    id: 5,
    name: "天ぷら 花",
    mapName: "Tempura Hana",
    address: "17 Tong Dan, Hoan Kiem, Hanoi",
    position: {
      lat: 21.02502,
      lng: 105.85622,
    },
    distance: "92 KM MA",
    distanceValue: "5km",
    rating: "4.6",
    ratingValue: 4.6,
    imageUrl:
      "https://www.figma.com/api/mcp/asset/0f0b3456-e528-4d9c-be15-85b304a8af87",
    hasJapaneseMenu: true,
    cuisine: "ブンチャー",
    amenities: ["vat", "privateRoom"],
    badges: ["VAT 可"],
    features: ["日本語メニュー", "景観良好"],
  },
  {
    id: 6,
    name: "懐石 響 - Hibiki",
    mapName: "Kaiseki Hibiki",
    address: "54 Lieu Giai, Ba Dinh, Hanoi",
    position: {
      lat: 21.03591,
      lng: 105.81263,
    },
    distance: "92 KM MA",
    distanceValue: "1.0km",
    rating: "4.9",
    ratingValue: 4.9,
    imageUrl:
      "https://www.figma.com/api/mcp/asset/02299aec-d1f4-4217-9e0e-410e3bbf45cf",
    isVerified: true,
    hasJapaneseStaff: true,
    hasJapaneseMenu: true,
    cuisine: "おまかせ",
    amenities: ["vat", "parking", "privateRoom"],
    badges: ["Residents Badge", "VAT 可"],
    features: ["景観良好", "接待向け"],
  },
];
