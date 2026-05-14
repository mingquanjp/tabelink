export type MapRestaurant = {
  id: number;
  name: string;
  distance: string;
  rating: string;
  imageUrl: string;
  isVerified?: boolean;
  badges: string[];
  features: string[];
};

export const cuisineTags = [
  "フォー",
  "ブンチャー",
  "シーフード",
  "鍋料理",
  "おまかせ",
];

export const distanceOptions = ["500m", "1000m", "2000m"];

export const restaurants: MapRestaurant[] = [
  {
    id: 1,
    name: "寿司 匠 - Takumi",
    distance: "92 KM MA",
    rating: "4.9",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/4d82b0d1-6e47-4921-a9fc-4f0105d1f893",
    isVerified: true,
    badges: ["Residents Badge", "VAT 可"],
    features: ["個室完備", "接待向け"],
  },
  {
    id: 2,
    name: "炉端焼き 炭火",
    distance: "92 KM MA",
    rating: "4.7",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/ce709eb3-9e2e-44e3-ba7b-86ea4d965378",
    badges: ["VAT 可"],
    features: ["深夜営業", "お一人様歓迎"],
  },
  {
    id: 3,
    name: "焼肉 雅 - Miyabi",
    distance: "92 KM MA",
    rating: "4.8",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/9e87645d-2d19-4c77-88e0-14581e1f76f6",
    badges: ["Residents Badge"],
    features: ["景観良好", "接待向け"],
  },
  {
    id: 4,
    name: "麺処 龍 - Ryu",
    distance: "92 KM MA",
    rating: "4.5",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/a3ccfdad-85c2-4ce2-aaec-9ccff9e0c4bb",
    badges: ["Hygiene: 90"],
    features: ["深夜営業", "お一人様歓迎"],
  },
  {
    id: 5,
    name: "天ぷら 花",
    distance: "92 KM MA",
    rating: "4.6",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/0f0b3456-e528-4d9c-be15-85b304a8af87",
    badges: ["VAT 可"],
    features: ["日本語メニュー", "景観良好"],
  },
  {
    id: 6,
    name: "懐石 響 - Hibiki",
    distance: "92 KM MA",
    rating: "4.9",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/02299aec-d1f4-4217-9e0e-410e3bbf45cf",
    badges: ["Residents Badge", "VAT 可"],
    features: ["景観良好", "接待向け"],
  },
];
