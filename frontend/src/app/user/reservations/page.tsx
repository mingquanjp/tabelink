"use client";

import { useState } from "react";
import {
  BookingActions,
  BookingBreadcrumb,
  BookingDetailsCard,
  type BookingFormValues,
  RequestTemplatesCard,
  RestaurantSummaryCard,
  type RequestTemplateId,
} from "@/components/user/reservations";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function UserReservationsPage() {
  const minReservationDate = toDateInputValue(new Date());
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

  function toggleRequest(id: RequestTemplateId) {
    setSelectedRequestIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f9f6] text-[#1a1c1b]">
      <div className="mx-auto flex w-full max-w-[768px] flex-col px-6 pb-24 pt-12 max-sm:px-4 max-sm:pt-8">
        <BookingBreadcrumb />

        <section className="pt-4" aria-labelledby="booking-title">
          <h1
            id="booking-title"
            className="font-jp text-[36px] font-medium leading-[45px] tracking-[-0.9px] text-[#1a1c1b] max-sm:text-[30px] max-sm:leading-10"
          >
            ご予約内容の確認
          </h1>
          <p className="mt-2 font-jp text-lg font-medium leading-7 text-[#5a6053] max-sm:text-base">
            ハノイ最高峰のレストランでのひとときを確定させましょう。
          </p>
        </section>

        <div className="mt-10 flex flex-col gap-8 max-sm:mt-8 max-sm:gap-6">
          <RestaurantSummaryCard />
          <BookingDetailsCard
            values={bookingValues}
            guestCount={guestCount}
            minDate={minReservationDate}
            onChangeValues={setBookingValues}
            onDecreaseGuestCount={() =>
              setGuestCount((count) => Math.max(1, count - 1))
            }
            onIncreaseGuestCount={() => setGuestCount((count) => count + 1)}
          />
          <RequestTemplatesCard
            selectedRequestIds={selectedRequestIds}
            onToggleRequest={toggleRequest}
          />
          <BookingActions />
        </div>
      </div>
    </main>
  );
}
