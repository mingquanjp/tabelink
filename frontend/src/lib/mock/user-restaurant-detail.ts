import type { OwnerHomeResponse } from "@/lib/api/owner-home/type";
import { restaurants } from "@/components/user/map/map-data";
import { restaurantDetailPhotos } from "@/components/restaurant-detail/restaurant-detail-assets";

const now = "2026-05-14T00:00:00.000Z";

const menuCategories: OwnerHomeResponse["menu"]["categories"] = [
  {
    categoryId: 1,
    restaurantId: 1,
    categoryCode: "signature",
    categoryNameVn: "Signature",
    categoryNameJp: "看板料理",
    sortOrder: 1,
    itemCount: 2,
  },
  {
    categoryId: 2,
    restaurantId: 1,
    categoryCode: "main",
    categoryNameVn: "Main",
    categoryNameJp: "メイン",
    sortOrder: 2,
    itemCount: 2,
  },
];

const menuItems: OwnerHomeResponse["menu"]["items"] = [
  {
    itemId: 1,
    restaurantId: 1,
    categoryId: 1,
    category: {
      categoryId: 1,
      categoryCode: "signature",
      categoryNameVn: "Signature",
      categoryNameJp: "看板料理",
    },
    nameVn: "Nem Ran Truyen Thong",
    nameJp: "伝統的な揚げ春巻き",
    price: 120000,
    descriptionVn: "Crispy spring rolls with pork and seasonal vegetables.",
    descriptionJp:
      "外はカリッと、中はジューシーな豚肉と野菜の旨味が広がります。",
    imageUrl: restaurantDetailPhotos.springRolls,
    isRecommendedForJp: true,
    isActive: true,
    criteria: [
      { criterionId: 1, criterionName: "辛さ", ratingLevel: 1, sortOrder: 1 },
      { criterionId: 2, criterionName: "パクチー", ratingLevel: 1, sortOrder: 2 },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    itemId: 2,
    restaurantId: 1,
    categoryId: 1,
    category: {
      categoryId: 1,
      categoryCode: "signature",
      categoryNameVn: "Signature",
      categoryNameJp: "看板料理",
    },
    nameVn: "Goi Ngo Sen Tom Thit",
    nameJp: "蓮の茎と海老のサラダ",
    price: 185000,
    descriptionVn: "Lotus stem salad with shrimp, pork, herbs, and light dressing.",
    descriptionJp:
      "シャキシャキとした蓮の茎の食感が特徴。甘酸っぱいタレでさっぱり頂けます。",
    imageUrl: restaurantDetailPhotos.lotusStemSalad,
    isRecommendedForJp: true,
    isActive: true,
    criteria: [
      { criterionId: 3, criterionName: "辛さ", ratingLevel: 1, sortOrder: 1 },
      { criterionId: 4, criterionName: "パクチー", ratingLevel: 2, sortOrder: 2 },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    itemId: 3,
    restaurantId: 1,
    categoryId: 2,
    category: {
      categoryId: 2,
      categoryCode: "main",
      categoryNameVn: "Main",
      categoryNameJp: "メイン",
    },
    nameVn: "Thit Heo Nuong Ong Tre",
    nameJp: "竹筒入りの豚肉焼き",
    price: 245000,
    descriptionVn: "Grilled pork with bamboo aroma and a mild spice profile.",
    descriptionJp:
      "竹の香りがほのかに移った香ばしい豚肉です。スパイスは控えめです。",
    imageUrl: restaurantDetailPhotos.grilledPork,
    isRecommendedForJp: true,
    isActive: false,
    criteria: [
      { criterionId: 5, criterionName: "辛さ", ratingLevel: 1, sortOrder: 1 },
      { criterionId: 6, criterionName: "パクチー", ratingLevel: 0, sortOrder: 2 },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    itemId: 4,
    restaurantId: 1,
    categoryId: 2,
    category: {
      categoryId: 2,
      categoryCode: "main",
      categoryNameVn: "Main",
      categoryNameJp: "メイン",
    },
    nameVn: "Ca Chem Hap Hong Kong",
    nameJp: "シーバスの香港蒸し",
    price: 580000,
    descriptionVn: "Steamed seabass with ginger, soy sauce, and fresh herbs.",
    descriptionJp:
      "柔らかく蒸し上げたシーバス。生姜と醤油の味付けが日本人にも馴染みやすい一品です。",
    imageUrl: restaurantDetailPhotos.steamedFish,
    isRecommendedForJp: true,
    isActive: true,
    criteria: [
      { criterionId: 7, criterionName: "辛さ", ratingLevel: 0, sortOrder: 1 },
      { criterionId: 8, criterionName: "パクチー", ratingLevel: 0, sortOrder: 2 },
    ],
    createdAt: now,
    updatedAt: now,
  },
];

export function getMockUserRestaurantDetail(
  restaurantId: number,
): OwnerHomeResponse | null {
  const restaurant = restaurants.find((item) => item.id === restaurantId);

  if (!restaurant) {
    return null;
  }

  const hasVat = restaurant.badges.some((badge) => badge.includes("VAT"));

  return {
    restaurantId,
    restaurant: {
      restaurantId,
      ownerAccountId: 0,
      nameVn: restaurant.name,
      nameJp: restaurant.name,
      address: "Hoan Kiem District, Hanoi, Vietnam",
      latitude: 21.0285,
      longitude: 105.8542,
      descriptionVn: null,
      descriptionJp: null,
      phone: "+84 24 1234 5678",
      openingHours: "11:30 - 22:30",
      issuesVat: hasVat,
      status: "Active",
      socialLinks: [
        {
          socialLinkId: 1,
          restaurantId,
          provider: "Facebook",
          url: "https://facebook.com/tabelink",
          displayLabel: "Facebook",
          sortOrder: 1,
        },
        {
          socialLinkId: 2,
          restaurantId,
          provider: "Instagram",
          url: "https://instagram.com/tabelink",
          displayLabel: "Instagram",
          sortOrder: 2,
        },
      ],
      sns: {
        facebook: "https://facebook.com/tabelink",
        instagram: "https://instagram.com/tabelink",
      },
      map: {
        latitude: 21.0285,
        longitude: 105.8542,
        embedUrl: "https://www.google.com/maps?q=21.0285,105.8542",
      },
      coverImageUrl: restaurant.imageUrl,
      media: [
        {
          mediaId: 1,
          mediaUrl: restaurant.imageUrl,
          mediaType: "Cover",
          sortOrder: 0,
          status: "Approved",
        },
        {
          mediaId: 2,
          mediaUrl: restaurantDetailPhotos.dish,
          mediaType: "Photo",
          sortOrder: 1,
          status: "Approved",
        },
        {
          mediaId: 3,
          mediaUrl: restaurantDetailPhotos.staff,
          mediaType: "Photo",
          sortOrder: 2,
          status: "Approved",
        },
        {
          mediaId: 4,
          mediaUrl: restaurantDetailPhotos.interior,
          mediaType: "Photo",
          sortOrder: 3,
          status: "Approved",
        },
      ],
      features: restaurant.features.map((feature, index) => ({
        featureId: index + 1,
        featureCode: `FEATURE_${index + 1}`,
        featureNameVn: feature,
        featureNameJp: feature,
      })),
      paymentMethods: [
        {
          paymentMethodId: 1,
          methodCode: "JCB",
          methodName: "JCBカード対応",
        },
        {
          paymentMethodId: 2,
          methodCode: "CASH",
          methodName: "現金",
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    menu: {
      count: menuItems.length,
      activeCount: menuItems.filter((item) => item.isActive).length,
      recommendedForJpCount: menuItems.filter((item) => item.isRecommendedForJp).length,
      categories: menuCategories.map((category) => ({
        ...category,
        restaurantId,
      })),
      items: menuItems.map((item) => ({
        ...item,
        restaurantId,
        category: item.category
          ? {
              ...item.category,
            }
          : null,
      })),
    },
    promotions: {
      count: 0,
      items: [],
    },
    reviews: {
      summary: {
        visibleCount: 3,
        averageRating: Number(restaurant.rating),
        japaneseReviewCount: 2,
        sentiment: {
          positiveCount: 3,
          neutralCount: 0,
          negativeCount: 0,
        },
      },
      items: [
        {
          reviewId: 1,
          restaurantId,
          customerAccountId: 101,
          customerName: "Tanaka",
          customerAvatarUrl: null,
          rating: 5,
          toiletCleanliness: 5,
          dishCleanliness: 5,
          spaceCleanliness: 4,
          content: "日本語メニューとVAT対応があり、会食でも使いやすいお店でした。",
          sentiment: "Positive",
          isJapaneseTag: true,
          mediaUrls: [],
          tags: ["VAT", "Clean"],
          createdAt: now,
        },
        {
          reviewId: 2,
          restaurantId,
          customerAccountId: 102,
          customerName: "Nguyen Minh",
          customerAvatarUrl: null,
          rating: 4,
          toiletCleanliness: 4,
          dishCleanliness: 5,
          spaceCleanliness: 4,
          content: "Good service, clean space, and easy to find from the map.",
          sentiment: "Positive",
          isJapaneseTag: false,
          mediaUrls: [],
          tags: ["Service"],
          createdAt: now,
        },
        {
          reviewId: 3,
          restaurantId,
          customerAccountId: 103,
          customerName: "Sato",
          customerAvatarUrl: null,
          rating: 5,
          toiletCleanliness: 5,
          dishCleanliness: 5,
          spaceCleanliness: 5,
          content: "辛さの調整をしてくれて、日本からのゲストにも安心でした。",
          sentiment: "Positive",
          isJapaneseTag: true,
          mediaUrls: [],
          tags: ["Japanese"],
          createdAt: now,
        },
      ],
    },
    badges: {
      count: restaurant.isVerified ? 1 : 0,
      isVerified: Boolean(restaurant.isVerified),
      items: restaurant.isVerified
        ? [
            {
              badgeId: 1,
              badgeCode: "VERIFIED",
              badgeNameVn: "Verified",
              badgeNameJp: "認証済み",
              descriptionVn: null,
              descriptionJp: null,
              grantedAt: now,
              expiresAt: null,
            },
          ]
        : [],
    },
  };
}
