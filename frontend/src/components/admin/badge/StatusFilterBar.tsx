import type { AdminBadgeStatusFilter } from "@/lib/api/admin-badges/type";

const statusFilters: Array<{
  label: string;
  value: AdminBadgeStatusFilter;
}> = [
  { label: "すべて", value: "all" },
  { label: "審査待ち", value: "Pending" },
  { label: "発行済み", value: "Approved" },
];

type StatusFilterBarProps = {
  value: AdminBadgeStatusFilter;
  onChange: (value: AdminBadgeStatusFilter) => void;
};

export function StatusFilterBar({ value, onChange }: StatusFilterBarProps) {
  return (
    <div className="grid w-full grid-cols-3 gap-1 rounded-lg bg-[#f4f4f1] p-1.5">
      {statusFilters.map((filter) => {
        const isActive = filter.value === value;

        return (
          <button
            key={filter.value}
            type="button"
            className={`h-8 rounded px-3 text-center font-jp text-xs font-medium leading-4 transition-colors ${
              isActive
                ? "bg-white text-[#d32f2f] shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                : "text-[#5a6053] hover:text-[#1a1c1b]"
            }`}
            onClick={() => onChange(filter.value)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
