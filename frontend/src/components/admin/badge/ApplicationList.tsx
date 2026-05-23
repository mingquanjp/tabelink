import { ChevronLeft, ChevronRight } from "lucide-react";
import type {
  AdminBadgeApplication,
  AdminBadgeApplicationsResponse,
  AdminBadgeStatusFilter,
} from "@/lib/api/admin-badges/type";
import { ApplicationCard } from "./ApplicationCard";
import { StatusFilterBar } from "./StatusFilterBar";

type ApplicationListProps = {
  applications: AdminBadgeApplication[];
  counts: AdminBadgeApplicationsResponse["counts"];
  filter: AdminBadgeStatusFilter;
  selectedAppId: number | null;
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  onFilterChange: (filter: AdminBadgeStatusFilter) => void;
  onPageChange: (page: number) => void;
  onSelect: (application: AdminBadgeApplication) => void;
};

function getListCount(
  filter: AdminBadgeStatusFilter,
  counts: AdminBadgeApplicationsResponse["counts"],
) {
  if (filter === "Pending") {
    return counts.pending;
  }

  if (filter === "Approved") {
    return counts.approved;
  }

  if (filter === "Rejected") {
    return counts.rejected;
  }

  return counts.all;
}

export function ApplicationList({
  applications,
  counts,
  filter,
  selectedAppId,
  isLoading,
  page,
  totalPages,
  totalItems,
  onFilterChange,
  onPageChange,
  onSelect,
}: ApplicationListProps) {
  const listCount = getListCount(filter, counts);
  const start = totalItems === 0 ? 0 : (page - 1) * 24 + 1;
  const end = totalItems === 0 ? 0 : start + applications.length - 1;

  return (
    <aside className="flex flex-col gap-4 lg:col-span-4">
      <StatusFilterBar value={filter} onChange={onFilterChange} />

      <div className="flex items-center justify-between px-1">
        <h2 className="font-jp text-lg font-medium leading-7 text-[#1a1c1b]">
          申請中リスト ({listCount})
        </h2>
        <span className="rounded-sm bg-[#d32f2f] px-2 py-0.5 font-jp text-[10px] font-medium leading-[15px] text-white">
          優先審査
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg bg-[#f4f4f1]"
            />
          ))
        ) : applications.length > 0 ? (
          applications.map((application) => (
            <ApplicationCard
              key={application.appId}
              application={application}
              isActive={application.appId === selectedAppId}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-[#deded9] bg-white p-6 text-center font-jp text-sm font-medium text-[#5a6053]">
            表示できる申請はありません。
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-1 font-jp text-xs font-medium text-[#5a6053]">
        <span>
          {start}-{end} / {totalItems}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous page"
            className="inline-flex size-8 items-center justify-center rounded border border-[#e8e8e5] bg-white disabled:opacity-40"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            <ChevronLeft className="size-4" />
          </button>
          <span>
            {page}/{totalPages}
          </span>
          <button
            type="button"
            aria-label="Next page"
            className="inline-flex size-8 items-center justify-center rounded border border-[#e8e8e5] bg-white disabled:opacity-40"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
