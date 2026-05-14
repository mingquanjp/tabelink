import { notFound } from "next/navigation";
import { RestaurantDetailContent } from "@/components/restaurant-detail";
import { getMockUserRestaurantDetail } from "@/lib/mock/user-restaurant-detail";

type UserRestaurantDetailPageProps = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function UserRestaurantDetailPage({
  params,
}: UserRestaurantDetailPageProps) {
  const { restaurantId } = await params;
  const numericRestaurantId = Number(restaurantId);

  if (!Number.isInteger(numericRestaurantId)) {
    notFound();
  }

  const homeData = getMockUserRestaurantDetail(numericRestaurantId);

  if (!homeData) {
    notFound();
  }

  return <RestaurantDetailContent homeData={homeData} />;
}
