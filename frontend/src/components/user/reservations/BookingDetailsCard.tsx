import { CalendarDays, Clock3, Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BookingFormValues = {
  customerName: string;
  phoneNumber: string;
  reservationDate: string;
  reservationTime: string;
};

type BookingDetailsCardProps = {
  values: BookingFormValues;
  guestCount: number;
  minDate: string;
  onChangeValues: (values: BookingFormValues) => void;
  onDecreaseGuestCount: () => void;
  onIncreaseGuestCount: () => void;
};

type BookingFieldProps = {
  label: string;
  children: ReactNode;
};

const timeOptions = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];

const inputClass =
  "h-12 rounded bg-[#f4f4f1] border-0 px-3 font-manrope text-base font-medium text-[#1a1c1b] shadow-none outline-none focus-visible:ring-1 focus-visible:ring-[#af111c] placeholder:text-[#6b7280]";

function BookingField({ label, children }: BookingFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-jp text-[14px] font-medium uppercase leading-5 tracking-[0.7px] text-[#5b403d]">
        {label}
      </span>
      {children}
    </label>
  );
}

export function BookingDetailsCard({
  values,
  guestCount,
  minDate,
  onChangeValues,
  onDecreaseGuestCount,
  onIncreaseGuestCount,
}: BookingDetailsCardProps) {
  function updateField<Key extends keyof BookingFormValues>(
    field: Key,
    value: BookingFormValues[Key],
  ) {
    onChangeValues({
      ...values,
      [field]: value,
    });
  }

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
        <BookingField label="氏名">
          <Input
            value={values.customerName}
            onChange={(event) => updateField("customerName", event.target.value)}
            placeholder="例：田中 太郎"
            className={inputClass}
          />
        </BookingField>

        <BookingField label="電話番号">
          <Input
            value={values.phoneNumber}
            onChange={(event) => updateField("phoneNumber", event.target.value)}
            placeholder="090-1234-5678"
            inputMode="tel"
            className={inputClass}
          />
        </BookingField>

        <BookingField label="予約日">
          <Input
            type="date"
            value={values.reservationDate}
            min={minDate}
            onChange={(event) =>
              updateField("reservationDate", event.target.value)
            }
            className={`${inputClass} uppercase`}
          />
        </BookingField>

        <BookingField label="時間">
          <Select
            value={values.reservationTime}
            onValueChange={(value) => updateField("reservationTime", value)}
          >
            <SelectTrigger
              className={`${inputClass} w-full justify-between px-3 [&>svg]:hidden`}
            >
              <SelectValue placeholder="時間を選択" />
              <Clock3 className="size-5 text-[#6b7280]" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              align="start"
              className="max-h-72 rounded-md border border-[#e4beba33] bg-white font-manrope shadow-lg"
            >
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BookingField>

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
