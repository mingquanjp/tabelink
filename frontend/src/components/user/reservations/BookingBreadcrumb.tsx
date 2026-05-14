import { ChevronRight } from "lucide-react";
import { breadcrumbs } from "./booking-data";

export function BookingBreadcrumb() {
  return (
    <nav
      aria-label="パンくず"
      className="flex flex-wrap items-center gap-y-1 font-jp text-sm font-medium leading-5 text-[#5a6053]"
    >
      {breadcrumbs.map((item, index) => (
        <span key={item} className="inline-flex items-center">
          <span
            className={
              index === breadcrumbs.length - 1 ? "text-[#1a1c1b]" : ""
            }
          >
            {item}
          </span>
          {index < breadcrumbs.length - 1 ? (
            <ChevronRight className="mx-2 size-3.5 text-[#7b8175]" />
          ) : null}
        </span>
      ))}
    </nav>
  );
}
