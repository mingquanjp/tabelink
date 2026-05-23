import type { LucideIcon } from "lucide-react";

type DetailRowProps = {
  label: string;
  value: string;
  Icon: LucideIcon;
};

export function DetailRow({ label, value, Icon }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-[#5a6053]" strokeWidth={1.8} />
        <span className="truncate font-jp text-sm font-medium leading-5 text-[#1a1c1b]">
          {label}
        </span>
      </div>
      <span className="shrink-0 font-jp text-sm font-medium leading-5 text-[#3d5f46]">
        {value}
      </span>
    </div>
  );
}
