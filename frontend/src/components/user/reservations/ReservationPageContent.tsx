"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { createRestaurantReservation } from "@/lib/api/restaurants/API";
import type { ReservationRequestType } from "@/lib/api/restaurants/type";
import type { OwnerHomeResponse } from "@/lib/api/owner-home/type";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { BookingActions } from "./BookingActions";
import { BookingBreadcrumb } from "./BookingBreadcrumb";
import {
  BookingDetailsCard,
  type BookingFormValues,
} from "./BookingDetailsCard";
import { RequestTemplatesCard } from "./RequestTemplatesCard";
import { RestaurantSummaryCard } from "./RestaurantSummaryCard";
import { requestTemplates } from "./booking-data";
import type { RequestTemplateId } from "./booking-data";

type ReservationPageContentProps = {
  restaurantDetail: OwnerHomeResponse;
};

const requestTypeByTemplateId = Object.fromEntries(
  requestTemplates.map((template) => [template.id, template.requestType]),
) as Record<RequestTemplateId, ReservationRequestType>;

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRestaurantName(restaurant: OwnerHomeResponse["restaurant"]) {
  return restaurant.nameJp || restaurant.nameVn || "レストラン";
}

export function ReservationPageContent({
  restaurantDetail,
}: ReservationPageContentProps) {
  const router = useRouter();
  const minReservationDate = toDateInputValue(new Date());
  const restaurantHref = `/user/restaurants/${restaurantDetail.restaurantId}`;
  const restaurantName = getRestaurantName(restaurantDetail.restaurant);
  const [guestCount, setGuestCount] = useState(2);
  const [bookingValues, setBookingValues] = useState<BookingFormValues>({
    customerName: "",
    phoneNumber: "",
    reservationDate: minReservationDate,
    reservationTime: "19:00",
  });
  const [selectedRequestIds, setSelectedRequestIds] = useState<
    RequestTemplateId[]
  >([]);
  const [customRequest, setCustomRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleRequest(id: RequestTemplateId) {
    setSelectedRequestIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function handleSubmit() {
    const customerName = bookingValues.customerName.trim();
    const phoneNumber = bookingValues.phoneNumber.trim();
    const trimmedCustomRequest = customRequest.trim();

    if (!customerName || !phoneNumber) {
      showErrorToast("氏名と電話番号を入力してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      await createRestaurantReservation(restaurantDetail.restaurantId, {
        customerName,
        phoneNumber,
        reservationDate: bookingValues.reservationDate,
        reservationTime: bookingValues.reservationTime,
        pax: guestCount,
        durationMinutes: 120,
        requestTypes: selectedRequestIds.map((id) => requestTypeByTemplateId[id]),
        customRequest: trimmedCustomRequest || undefined,
      });
      showSuccessToast("予約リクエストを送信しました。");
      router.push("/user/home");
    } catch (error) {
      showErrorToast(
        error instanceof ApiError
          ? error.message
          : "予約リクエストの送信に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f9f6] text-[#1a1c1b]">
      <div className="mx-auto flex w-full max-w-[768px] flex-col px-6 pb-24 pt-12 max-sm:px-4 max-sm:pt-8">
        <BookingBreadcrumb
          restaurantName={restaurantName}
          restaurantHref={restaurantHref}
        />

        <section className="pt-4" aria-labelledby="booking-title">
          <h1
            id="booking-title"
            className="font-jp text-[36px] font-medium leading-[45px] tracking-[-0.9px] text-[#1a1c1b] max-sm:text-[30px] max-sm:leading-10"
          >
            ご予約内容の確認
          </h1>
          <p className="mt-2 font-jp text-lg font-medium leading-7 text-[#5a6053] max-sm:text-base">
            {restaurantName}でのひとときを確定させましょう。
          </p>
        </section>

        <div className="mt-10 flex flex-col gap-8 max-sm:mt-8 max-sm:gap-6">
          <RestaurantSummaryCard homeData={restaurantDetail} />
          <BookingDetailsCard
            values={bookingValues}
            guestCount={guestCount}
            minDate={minReservationDate}
            onChangeValues={setBookingValues}
            onDecreaseGuestCount={() =>
              setGuestCount((count) => Math.max(1, count - 1))
            }
            onIncreaseGuestCount={() =>
              setGuestCount((count) => Math.min(99, count + 1))
            }
          />
          <RequestTemplatesCard
            selectedRequestIds={selectedRequestIds}
            customRequest={customRequest}
            onToggleRequest={toggleRequest}
            onCustomRequestChange={setCustomRequest}
          />
          <BookingActions
            restaurantHref={restaurantHref}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </main>
  );
}
