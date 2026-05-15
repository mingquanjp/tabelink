export type ProfileBadgeTone = "green" | "sage" | "red";

export type UserProfileBadge = {
  label: string;
  tone: ProfileBadgeTone;
};

export type UserProfileStat = {
  value: string;
  label: string;
};

export type FoodReport = {
  id: number;
  restaurantName: string;
  location: string;
  rating: string;
  description: string;
  imageUrl: string;
  detailImageUrl?: string;
  title?: string;
  tags?: string[];
};

export const profileSummary = {
  name: "佐藤 健二",
  avatarUrl:
    "https://www.figma.com/api/mcp/asset/af8e9232-0e58-4bf0-94cd-24261d4030b2",
  description:
    "日本の精密さとベトナムの魂が交差する場所を探求中。バーディン区やホアンキエム区で、衛生的かつ本物のローカルフードを求めています。",
};

export const profileBadges: UserProfileBadge[] = [
  { label: "プロ・クリティック", tone: "green" },
  { label: "ハノイ居住者", tone: "sage" },
  { label: "在住日本人", tone: "red" },
];

export const profileStats: UserProfileStat[] = [
  { value: "128", label: "レポート数" },
  { value: "2.4k", label: "フォロワー" },
  { value: "56", label: "保存済み" },
];

const ramenImage =
  "https://www.figma.com/api/mcp/asset/6ef7cb9d-c492-4ec9-92d3-88deb01bd2a6";
const bunChaImage =
  "https://www.figma.com/api/mcp/asset/98de97ba-c2b5-4380-8134-fb2eafe9465a";
const postDetailImage =
  "https://www.figma.com/api/mcp/asset/3a7041c9-f2a6-4379-a8ab-1012e2dbb5ab";

export const foodReports: FoodReport[] = [
  {
    id: 1,
    restaurantName: "博多 一幸舎 ハノイ",
    location: "ベトナム・ハノイ バーディン区",
    rating: "4.8",
    imageUrl: ramenImage,
    detailImageUrl: postDetailImage,
    title:
      "地元の人に愛される名店 / Một cửa hàng nổi tiếng được người dân địa phương yêu thích",
    tags: ["#HanoiDining", "#PhoLover"],
    description:
      "日本を思い出させる本場の豚骨スープ。衛生管理も徹底されており、スタッフの対応も非常に丁寧です。",
  },
  {
    id: 2,
    restaurantName: "ブンチャー・タ (Bun Cha Ta)",
    location: "ベトナム・ハノイ ホアンキエム区",
    rating: "4.2",
    imageUrl: bunChaImage,
    detailImageUrl: postDetailImage,
    title:
      "伝統のブンチャーを清潔な空間で / Bun cha truyền thống trong không gian sạch sẽ",
    tags: ["#BunCha", "#HanoiDining"],
    description:
      "従来の屋台に比べて非常にクリーンな店。肉の焼き加減が絶妙で、ヌクマムベースのタレのバランスも素晴らしいです。",
  },
  {
    id: 3,
    restaurantName: "Gia Truyen Pho",
    location: "ベトナム・ハノイ オールドクォーター",
    rating: "4.5",
    imageUrl: ramenImage,
    description:
      "行列必須の名店。濃厚な牛肉の出汁が特徴的で、これぞハノイのフォーといった深い味わいを楽しめます。",
  },
  {
    id: 4,
    restaurantName: "Sushi Lab Hanoi",
    location: "ベトナム・ハノイ バーディン区",
    rating: "4.9",
    imageUrl: ramenImage,
    description:
      "接待にも使える最高級の鮨屋。ネタの鮮度はもちろん、シャリの温度管理まで完璧。ハノイで一番の鮨です。",
  },
  {
    id: 5,
    restaurantName: "Banh Mi 25",
    location: "ベトナム・ハノイ ホアンキエム区",
    rating: "4.0",
    imageUrl: ramenImage,
    description:
      "観光客に大人気のバインミー店。パンのサクサク感と具材のバランスが良く、安定したクオリティを提供しています。",
  },
  {
    id: 6,
    restaurantName: "Quan Com Pho",
    location: "ベトナム・ハノイ ドンダー区",
    rating: "4.3",
    imageUrl: ramenImage,
    description:
      "家庭的なベトナム料理が楽しめるレストラン。特に魚の土鍋煮は絶品で、白米が止まらなくなる美味しさです。",
  },
];
