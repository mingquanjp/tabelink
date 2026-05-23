import { notFound } from "next/navigation";
import { RestaurantDetailContent } from "@/components/restaurant-detail";
import { ApiError } from "@/lib/api/client";
import { getAdminRestaurantDetail } from "@/lib/api/restaurants/server";

type AdminRestaurantDetailPageProps = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function AdminRestaurantDetailPage({
  params,
}: AdminRestaurantDetailPageProps) {
  const { restaurantId } = await params;
  const numericRestaurantId = Number(restaurantId);

  if (!Number.isInteger(numericRestaurantId)) {
    notFound();
  }

  const homeData = await getAdminRestaurantDetail(numericRestaurantId).catch(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 404) {
        notFound();
      }

      throw error;
    },
  );

  return <RestaurantDetailContent homeData={homeData} adminReadOnly />;
}
