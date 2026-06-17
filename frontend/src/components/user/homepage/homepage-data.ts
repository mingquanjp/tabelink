const assets = {
  restaurant: "/japanese-cuisine.png",
  pho: "/admin/badge/kizuna-main.jpg",
  springRolls: "/menu/nemran.png",
  grilledPork: "/admin/badge/kitchen.jpg",
};

export const homepageUser = {
  name: "Tanaka K.",
  handle: "@tanaka_jp",
  location: "Ho Chi Minh City",
  initials: "TK",
  avatarUrl: null as string | null,
};

export const homepagePosts = [
  {
    id: 1,
    author: "Tanaka K.",
    handle: "@tanaka_jp",
    initials: "TK",
    time: "2時間前",
    restaurant: "Hoàng Yến Cuisine",
    title:
      "地元の人に愛される名店 / Một cửa hàng nổi tiếng được người dân địa phương yêu thích",
    body: "雑誌取材が何度も掲載店ですが、ここはトイレも非常に清潔で日本人でも安心して利用できます。スープの出汁が絶品で、リピート確定です。",
    image: assets.pho,
    tags: ["#HANOIDINING", "#PHOLOVER"],
    metrics: {
      hygiene: 5,
      taste: 5,
      service: 5,
    },
    likes: 128,
    comments: 14,
  },
  {
    id: 2,
    author: "Mai S.",
    handle: "@mai_eats",
    initials: "MS",
    time: "5時間前",
    restaurant: "Saigon Garden",
    title: "個室予約がスムーズで会食にも使いやすいお店",
    body: "日本語メニューがあり、スタッフの説明も丁寧でした。揚げ春巻きは軽くて香ばしく、初めてのベトナム料理にもすすめやすいです。",
    image: assets.springRolls,
    tags: ["#SAIGONFOOD", "#BUSINESSDINNER"],
    metrics: {
      hygiene: 5,
      taste: 4,
      service: 5,
    },
    likes: 94,
    comments: 8,
  },
  {
    id: 3,
    author: "Kenji M.",
    handle: "@kenji.table",
    initials: "KM",
    time: "昨日",
    restaurant: "Tsubomi Hanoi",
    title: "落ち着いた内装で、接待ランチにちょうどいい",
    body: "席間が広く、音量も控えめ。予約時の要望も通りやすく、VAT対応まで含めて安心感がありました。",
    image: assets.restaurant,
    tags: ["#HANOI", "#JAPANESESTAFF"],
    metrics: {
      hygiene: 4,
      taste: 5,
      service: 4,
    },
    likes: 76,
    comments: 6,
  },
];

export const homepageRecommendations = [
  {
    name: "Hoàng Yến Cuisine",
    area: "District 1",
    image: assets.restaurant,
    rating: "4.9",
  },
  {
    name: "Bếp Nhà Saigon",
    area: "Ben Nghe",
    image: assets.grilledPork,
    rating: "4.8",
  },
];

export const homepageHotRestaurants = [
  {
    name: "ハノイ・フォー・ガー",
    image: assets.pho,
    rating: "4.8",
  },
  {
    name: "四季彩ダイニング",
    image: assets.springRolls,
    rating: "4.5",
  },
  {
    name: "カフェ・ル・モンド",
    image: assets.restaurant,
    rating: "4.2",
  },
];

export const homepageFeaturedRestaurants = [
  {
    id: 1,
    restaurantId: 1,
    name: "サクラ・ガーデン・ハノイ",
    eyebrow: "New Open",
    description:
      "ハノイ中心部に位置する、モダンと伝統が融合した究極の日本料理体験。旬の食材を贅沢に使用。",
    image: assets.pho,
    rating: "4.9",
    reviewCount: "120+",
  },
  {
    id: 2,
    restaurantId: 2,
    name: "四季彩ダイニング",
    eyebrow: "Chef's Pick",
    description:
      "落ち着いた個室と日本語メニューが揃った会食向けレストラン。軽やかな春巻きと丁寧な接客が人気です。",
    image: assets.springRolls,
    rating: "4.7",
    reviewCount: "98+",
  },
  {
    id: 3,
    restaurantId: 3,
    name: "カフェ・ル・モンド",
    eyebrow: "Local Favorite",
    description:
      "木目調の温かい空間でゆっくり過ごせる人気店。ランチ、カフェ利用、夜の軽い食事にも使いやすい一軒です。",
    image: assets.restaurant,
    rating: "4.6",
    reviewCount: "84+",
  },
  {
    id: 4,
    restaurantId: 4,
    name: "ベップ・ニャー・サイゴン",
    eyebrow: "Weekend Special",
    description:
      "香ばしいグリル料理とローカル家庭料理を楽しめる店。初めてのベトナム料理にもすすめやすい味付けです。",
    image: assets.grilledPork,
    rating: "4.8",
    reviewCount: "112+",
  },
];

export const homepageReviewers = [
  {
    name: "Aiko N.",
    handle: "@aiko_reviews",
    initials: "AN",
    meta: "清潔さレビュー · 42 posts",
  },
  {
    name: "Minh T.",
    handle: "@minh_table",
    initials: "MT",
    meta: "ローカル案内 · 31 posts",
  },
];

export const homepageTopics = [
  { label: "#HANOIDINING", count: "128 posts" },
  { label: "#JAPANESESTAFF", count: "86 posts" },
  { label: "#VATOK", count: "64 posts" },
];

export const homepageComments = [
  {
    id: "seed-1",
    name: "Maki S.",
    text: "本当にスープが澄んでいて美味しいですよね。私もリピーターです！",
    initials: "MS",
  },
  {
    id: "seed-2",
    name: "Chef Sato",
    text: "ここの麺の湯通しがとてもトップクラスですね。",
    initials: "CS",
  },
];

export type HomepageMediaType = "Photo" | "Video";
export type HomepagePost = (typeof homepagePosts)[number] & {
  authorAccountId?: number;
  restaurantId?: number | null;
  mediaType?: HomepageMediaType;
  avatarUrl?: string | null;
};
export type HomepageComment = (typeof homepageComments)[number] & {
  authorAccountId?: number;
  avatarUrl?: string | null;
};
export type HomepageUser = typeof homepageUser & {
  accountId?: number;
  postCount?: number;
  followerCount?: number;
  followingCount?: number;
};
export type HomepageRecommendation = (typeof homepageRecommendations)[number];
export type HomepageHotRestaurant = (typeof homepageHotRestaurants)[number];
export type HomepageFeaturedRestaurant =
  (typeof homepageFeaturedRestaurants)[number];
export type HomepageReviewer = (typeof homepageReviewers)[number] & {
  accountId?: number;
  avatarUrl?: string | null;
  followerCount?: number;
  isFollowing?: boolean;
  nationality?: string | null;
};
export type HomepageTopic = (typeof homepageTopics)[number];
