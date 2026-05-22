"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AdvertisementRequest,
  AdvertisementStatus,
} from "./advertisement-management-data";

type AdvertisementRequestsTableProps = {
  currentPage: number;
  items: AdvertisementRequest[];
  pageSize: number;
  query: string;
  totalCount: number;
  onApprove: (request: AdvertisementRequest) => void;
  onPageChange: (page: number) => void;
  onQueryChange: (value: string) => void;
  onReject: (request: AdvertisementRequest) => void;
};

const statusStyles: Record<
  AdvertisementStatus,
  {
    label: string;
    className: string;
  }
> = {
  Pending: {
    label: "審査待ち",
    className: "bg-[#ffdad6] text-[#93000a]",
  },
  Active: {
    label: "配信中",
    className: "bg-[#c5eccc] text-[#00210e]",
  },
  Scheduled: {
    label: "開始前",
    className: "bg-[#dfe5d4] text-[#181d13]",
  },
  Rejected: {
    label: "却下済み",
    className: "bg-[#f2d6d4] text-[#7f1d1d]",
  },
};

function StatusBadge({ status }: { status: AdvertisementStatus }) {
  const style = statusStyles[status];

  return (
    <span
      className={`inline-flex min-w-[56px] items-center justify-center rounded-xl px-3 py-1 text-center font-jp text-[10px] font-medium uppercase leading-[14px] tracking-[0.5px] ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export function AdvertisementRequestsTable({
  currentPage,
  items,
  pageSize,
  query,
  totalCount,
  onApprove,
  onPageChange,
  onQueryChange,
  onReject,
}: AdvertisementRequestsTableProps) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageStart = items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, items.length);
  const currentItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const displayTotal = query ? items.length : totalCount;

  return (
    <section className="overflow-hidden rounded-lg bg-white pt-2 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-4 border-b border-[#e2e3e0] px-6 pb-[25px] pt-6 md:flex-row md:items-center md:justify-between md:px-8">
        <h2 className="font-jp text-lg font-medium leading-7 text-[#1a1c1b]">
          広告掲載リクエスト一覧
        </h2>
        <div className="relative w-full md:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-[#6b7280]" />
          <Input
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value);
            }}
            placeholder="レストラン名を検索..."
            className="h-[38px] rounded bg-[#f4f4f1] pl-10 pr-4 font-jp text-sm font-medium text-[#1a1c1b] shadow-none placeholder:text-[#6b7280] focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead className="bg-[#f4f4f1]">
            <tr className="font-jp text-xs font-medium uppercase leading-4 tracking-[0.6px] text-[#5a6053]">
              <th className="w-[420px] px-8 py-4 text-left">レストラン / 広告内容</th>
              <th className="w-[218px] px-6 py-4 text-left">掲載期間</th>
              <th className="w-[172px] px-6 py-4 text-left">パフォーマンス</th>
              <th className="w-[124px] px-6 py-4 text-center">ステータス</th>
              <th className="w-[202px] px-8 py-4 text-right">アクション</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((request) => (
              <tr key={request.id} className="border-t border-[#e2e3e0] first:border-t-0">
                <td className="px-8 py-[18px]">
                  <div className="flex min-w-0 items-center">
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        src={request.imageUrl}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 pl-4">
                      <p className="truncate font-jp text-base font-medium leading-[22px] text-[#1a1c1b]">
                        {request.restaurantName}
                      </p>
                      <p className="mt-1 truncate font-jp text-xs font-medium leading-4 text-[#5a6053]">
                        {request.campaignName}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-[18px]">
                  <p className="font-manrope text-sm font-normal leading-5 text-[#1a1c1b]">
                    {request.period}
                  </p>
                  <p
                    className={`mt-1 font-jp text-xs font-medium leading-4 ${
                      request.status === "Active" ? "text-[#3d5f46]" : "text-[#5a6053]"
                    }`}
                  >
                    {request.periodLabel}
                  </p>
                </td>
                <td className="px-6 py-[18px]">
                  <div className="flex gap-6">
                    <div>
                      <p className="font-manrope text-xs font-normal leading-4 text-[#5a6053]">
                        Imp
                      </p>
                      <p className="mt-1 font-jp text-sm font-medium leading-5 text-[#1a1c1b]">
                        {request.impressions}
                      </p>
                    </div>
                    <div>
                      <p className="font-manrope text-xs font-normal leading-4 text-[#5a6053]">
                        CTR
                      </p>
                      <p
                        className={`mt-1 font-jp text-sm font-medium leading-5 ${
                          request.status === "Active" ? "text-[#3d5f46]" : "text-[#1a1c1b]"
                        }`}
                      >
                        {request.ctr}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-[18px] text-center">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-8 py-[18px]">
                  <div className="flex justify-end gap-2">
                    {request.status === "Pending" ? (
                      <Button
                        type="button"
                        className="h-9 rounded bg-[#af111c] px-4 font-jp text-xs font-medium text-white hover:bg-[#960e18]"
                        onClick={() => onApprove(request)}
                      >
                        承認
                      </Button>
                    ) : null}
                    {request.status !== "Rejected" ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded border-[#e4beba] px-4 font-jp text-xs font-medium text-[#5a6053] hover:bg-[#af111c0d] hover:text-[#5a6053]"
                        onClick={() => onReject(request)}
                      >
                        却下
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-10 text-center font-jp text-sm text-[#5a6053]">
                  条件に一致する広告掲載リクエストはありません。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#e2e3e0] bg-[rgba(244,244,241,0.3)] px-8 pb-4 pt-[17px]">
        <p className="font-manrope text-xs font-normal leading-4 text-[#5a6053]">
          全 {displayTotal} 件中 {pageStart}-{pageEnd} 件を表示
        </p>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={currentPage === 1}
            className="rounded-md text-[#1a1c1b] disabled:opacity-30"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="font-jp text-xs font-medium leading-4 text-[#af111c]">
            {currentPage}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={currentPage === totalPages}
            className="rounded-md text-[#1a1c1b] disabled:opacity-30"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
