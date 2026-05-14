import { ArrowRight, ChevronRight } from "lucide-react";

export function BookingActions() {
  return (
    <section
      aria-label="予約アクション"
      className="flex flex-col items-center pt-6"
    >
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(169deg,#af111c_0%,#d32f31_100%)] px-24 py-5 font-jp text-xl font-medium leading-7 text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-opacity hover:opacity-95 max-sm:w-full max-sm:px-6 max-sm:text-base"
      >
        予約を確定する
        <ArrowRight className="ml-3 size-4" />
      </button>
      <button
        type="button"
        className="mt-6 inline-flex items-center gap-1 font-jp text-base font-medium leading-6 text-[#5a6053] transition-colors hover:text-[#1a1c1b]"
      >
        <ChevronRight className="size-3.5 rotate-180" />
        予約をキャンセルする
      </button>
    </section>
  );
}
