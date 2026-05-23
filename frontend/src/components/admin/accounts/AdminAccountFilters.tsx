import { ChevronDown, ListFilter, Search } from "lucide-react";
import type { AdminAccountStatus, AdminUserRole } from "@/lib/api/admin/type";
import {
  roleLabels,
  statusLabels,
} from "@/components/admin/accounts/admin-account-data";

type AdminAccountFiltersProps = {
  search: string;
  role: AdminUserRole | "all";
  status: AdminAccountStatus | "all";
  roleOptions: AdminUserRole[];
  statusOptions: AdminAccountStatus[];
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: AdminUserRole | "all") => void;
  onStatusChange: (value: AdminAccountStatus | "all") => void;
  onSubmit: () => void;
};

export function AdminAccountFilters({
  search,
  role,
  status,
  roleOptions,
  statusOptions,
  isLoading,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onSubmit,
}: AdminAccountFiltersProps) {
  return (
    <section
      className="flex flex-col gap-4 rounded-[8px] border border-[#ded8d1] bg-[#f4f4f1] p-6 shadow-[0_10px_24px_rgba(26,28,27,0.06)] lg:flex-row lg:items-end"
      aria-label="Filter & Search Section"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-[8.5px]">
        <label className="font-jp text-[12px] font-medium leading-4 tracking-[0.6px] text-[#5a6053]">
          キーワード検索
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-[#5f6368]" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSubmit();
              }
            }}
            placeholder="名前、メールアドレス、IDで検索..."
            className="h-11 w-full rounded-[4px] bg-white py-3 pl-10 pr-4 font-jp text-[14px] font-medium leading-normal text-[#1a1c1b] shadow-[0_0_0_1px_#e4beba33] outline-none transition placeholder:text-[#6b7280] focus:shadow-[0_0_0_1px_#af111c]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-[8.5px] lg:w-48">
        <label className="font-jp text-[12px] font-medium leading-4 tracking-[0.6px] text-[#5a6053]">
          ロール
        </label>
        <div className="relative">
          <select
            value={role}
            onChange={(event) =>
              onRoleChange(event.target.value as AdminUserRole | "all")
            }
            className="h-11 w-full cursor-pointer appearance-none rounded-[4px] bg-white px-4 pr-10 font-jp text-[14px] font-medium leading-5 text-[#1a1c1b] shadow-[0_0_0_1px_#e4beba33] outline-none transition focus:shadow-[0_0_0_1px_#af111c]"
            aria-label="ロール"
          >
            {(["all", ...roleOptions] as Array<AdminUserRole | "all">).map((option) => (
              <option key={option} value={option}>
                {roleLabels[option]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#6b7280]" />
        </div>
      </div>

      <div className="flex flex-col gap-[8.5px] lg:w-48">
        <label className="font-jp text-[12px] font-medium leading-4 tracking-[0.6px] text-[#5a6053]">
          ステータス
        </label>
        <div className="relative">
          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as AdminAccountStatus | "all")
            }
            className="h-11 w-full cursor-pointer appearance-none rounded-[4px] bg-white px-4 pr-10 font-jp text-[14px] font-medium leading-5 text-[#1a1c1b] shadow-[0_0_0_1px_#e4beba33] outline-none transition focus:shadow-[0_0_0_1px_#af111c]"
            aria-label="ステータス"
          >
            {(["all", ...statusOptions] as Array<
              AdminAccountStatus | "all"
            >).map((option) => (
              <option key={option} value={option}>
                {statusLabels[option]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#6b7280]" />
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[4px] bg-[#af111c] px-8 font-jp text-[14px] font-medium leading-5 text-white shadow-[0_1px_2px_#0000000d] transition hover:bg-[#970f18] disabled:cursor-not-allowed disabled:opacity-60 lg:min-w-[156px]"
      >
        <ListFilter className="size-4" />
        <span className="whitespace-nowrap">検索を実行</span>
      </button>
    </section>
  );
}
