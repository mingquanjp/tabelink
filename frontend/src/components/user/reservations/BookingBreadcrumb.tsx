import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BookingBreadcrumbProps = {
  restaurantName: string;
  restaurantHref: string;
};

export function BookingBreadcrumb({
  restaurantName,
  restaurantHref,
}: BookingBreadcrumbProps) {
  const breadcrumbs = [
    { label: "探す", href: "/user/map" },
    { label: restaurantName, href: restaurantHref },
    { label: "予約手続き" },
  ];

  return (
    <nav
      aria-label="パンくず"
      className="flex flex-wrap items-center gap-y-1 font-jp text-sm font-medium leading-5 text-[#5a6053]"
    >
      {breadcrumbs.map((item, index) => (
        <span
          key={`${item.label}-${index}`}
          className="inline-flex min-w-0 items-center"
        >
          {item.href ? (
            <Link
              href={item.href}
              className="truncate transition-colors hover:text-[#1a1c1b]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="truncate text-[#1a1c1b]">{item.label}</span>
          )}
          {index < breadcrumbs.length - 1 ? (
            <ChevronRight className="mx-2 size-3.5 shrink-0 text-[#7b8175]" />
          ) : null}
        </span>
      ))}
    </nav>
  );
}
