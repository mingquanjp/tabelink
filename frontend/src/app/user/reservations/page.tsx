import { notFound } from "next/navigation";
import { ReservationPageContent } from "@/components/user/reservations/ReservationPageContent";
import { ApiError } from "@/lib/api/client";
import { getUserRestaurantDetail } from "@/lib/api/restaurants/server";

type UserReservationsPageProps = {
  searchParams: Promise<{
    restaurantId?: string | string[];
  }>;
};

function parseRestaurantId(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const restaurantId = rawValue ? Number(rawValue) : NaN;

  return Number.isInteger(restaurantId) && restaurantId > 0
    ? restaurantId
    : null;
}

export default async function UserReservationsPage({
  searchParams,
}: UserReservationsPageProps) {
  const restaurantId = parseRestaurantId((await searchParams).restaurantId);

  if (!restaurantId) {
    notFound();
  }

  let restaurantDetail;

  try {
    restaurantDetail = await getUserRestaurantDetail(restaurantId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  return <ReservationPageContent restaurantDetail={restaurantDetail} />;
}
