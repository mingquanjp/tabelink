import { CalendarDays, Clock3, Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { bookingFields } from "./booking-data";

function StaticField({
  label,
  value,
  tone = "strong",
  trailingIcon,
}: {
  label: string;
  value: string;
  tone?: "strong" | "muted";
  trailingIcon?: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-jp text-[14px] font-medium uppercase leading-5 tracking-[0.7px] text-[#5b403d]">
        {label}
      </span>
      <span
        className={`flex h-12 items-center justify-between rounded bg-[#f4f4f1] px-3 font-manrope text-base font-medium ${
          tone === "muted" ? "text-[#6b7280]" : "text-[#1a1c1b]"
        }`}
      >
        {value}
        {trailingIcon}
      </span>
    </label>
  );
}

type BookingDetailsCardProps = {
  guestCount: number;
  onDecreaseGuestCount: () => void;
  onIncreaseGuestCount: () => void;
};

export function BookingDetailsCard({
  guestCount,
  onDecreaseGuestCount,
  onIncreaseGuestCount,
}: BookingDetailsCardProps) {
  return (
    <section
      aria-labelledby="reservation-detail-title"
      className="rounded-lg border border-[#e4beba1a] bg-white p-8 shadow-[0_1px_1px_rgba(0,0,0,0.05)] max-sm:p-5"
    >
      <div className="mb-6 flex items-center gap-2">
        <CalendarDays className="size-5 text-[#af111c]" />
        <h3
          id="reservation-detail-title"
          className="font-jp text-xl font-medium leading-7 text-[#1a1c1b]"
        >
          予約詳細
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-6 max-sm:grid-cols-1">
        {bookingFields.map((field) => (
          <StaticField
            key={field.label}
            label={field.label}
            value={field.value}
            tone={field.tone}
          />
        ))}

        <StaticField
          label="時間"
          value="19:00"
          trailingIcon={<Clock3 className="size-5 text-[#6b7280]" />}
        />

        <label className="flex flex-col gap-2">
          <span className="font-jp text-[14px] font-medium uppercase leading-5 tracking-[0.7px] text-[#5b403d]">
            人数
          </span>
          <span className="flex h-12 items-center rounded bg-[#f4f4f1] p-1">
            <button
              type="button"
              aria-label="人数を減らす"
              onClick={onDecreaseGuestCount}
              className="flex size-10 items-center justify-center rounded-md text-[#1a1c1b] transition-colors hover:bg-white/75"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="flex flex-1 justify-center px-3 font-manrope text-base font-bold leading-6 text-[#1a1c1b]">
              {guestCount} 名
            </span>
            <button
              type="button"
              aria-label="人数を増やす"
              onClick={onIncreaseGuestCount}
              className="flex size-10 items-center justify-center rounded-md text-[#1a1c1b] transition-colors hover:bg-white/75"
            >
              <Plus className="size-3.5" />
            </button>
          </span>
        </label>
      </div>
    </section>
  );
}
