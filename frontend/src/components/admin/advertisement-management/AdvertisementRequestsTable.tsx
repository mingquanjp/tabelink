"use client";

import { Search } from "lucide-react";
import { AdminPagination } from "@/components/admin/accounts/AdminPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AdminPromotion,
  AdminPromotionDisplayStatus,
  AdminPromotionsPagination,
} from "@/lib/api/admin-promotions/type";

type AdvertisementRequestsTableProps = {
  isLoading: boolean;
  items: AdminPromotion[];
  pagination: AdminPromotionsPagination;
  query: string;
  onApprove: (request: AdminPromotion) => void;
  onPageChange: (page: number) => void;
  onQueryChange: (value: string) => void;
  onReject: (request: AdminPromotion) => void;
};

const statusStyles: Record<
  AdminPromotionDisplayStatus,
  {
    className: string;
  }
> = {
  審査待ち: {
    className: "bg-[#ffdad6] text-[#93000a]",
  },
  配信中: {
    className: "bg-[#c5eccc] text-[#00210e]",
  },
  開始前: {
    className: "bg-blue-100 text-blue-700",
  },
  却下済み: {
    className: "bg-[#dfe5d4] text-[#181d13]",
  },
  終了済み: {
    className: "bg-[#dfe5d4] text-[#181d13]",
  },
};

const numberFormatter = new Intl.NumberFormat("en");
const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatPeriod(startDate: string, endDate: string) {
  return `${dateFormatter.format(new Date(startDate)).replaceAll("/", ".")} - ${dateFormatter
    .format(new Date(endDate))
    .replaceAll("/", ".")}`;
}

function formatImpressions(value: number | null) {
  return value === null ? "-" : numberFormatter.format(value);
}

function formatCtr(value: number | null) {
  return value === null ? "-" : `${value.toFixed(1)}%`;
}

function getRestaurantName(request: AdminPromotion) {
  return request.restaurantNameJP || request.restaurantNameVN;
}

function StatusBadge({ status }: { status: AdminPromotionDisplayStatus }) {
  const style = statusStyles[status];

  return (
    <span
      className={`inline-flex min-w-[56px] items-center justify-center rounded-xl px-3 py-1 text-center font-jp text-[10px] font-medium uppercase leading-[14px] tracking-[0.5px] ${style.className}`}
    >
      {status}
    </span>
  );
}

export function AdvertisementRequestsTable({
  isLoading,
  items,
  pagination,
  query,
  onApprove,
  onPageChange,
  onQueryChange,
  onReject,
}: AdvertisementRequestsTableProps) {
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
              <th className="w-[420px] px-8 py-4 text-left">
                レストラン / 広告内容
              </th>
              <th className="w-[218px] px-6 py-4 text-left">掲載期間</th>
              <th className="w-[172px] px-6 py-4 text-left">
                パフォーマンス
              </th>
              <th className="w-[124px] px-6 py-4 text-center">
                ステータス
              </th>
              <th className="w-[202px] px-8 py-4 text-right">アクション</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: pagination.limit }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-t border-[#e2e3e0] first:border-t-0"
                  >
                    <td className="px-8 py-[18px]">
                      <div className="flex items-center">
                        <div className="h-12 w-16 rounded bg-[#e2e3e0]" />
                        <div className="flex flex-1 flex-col gap-2 pl-4">
                          <div className="h-4 w-32 rounded bg-[#e2e3e0]" />
                          <div className="h-3 w-48 rounded bg-[#eeeeeb]" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-[18px]">
                      <div className="h-4 w-36 rounded bg-[#e2e3e0]" />
                      <div className="mt-2 h-3 w-24 rounded bg-[#eeeeeb]" />
                    </td>
                    <td className="px-6 py-[18px]">
                      <div className="h-4 w-24 rounded bg-[#e2e3e0]" />
                    </td>
                    <td className="px-6 py-[18px]">
                      <div className="mx-auto h-6 w-16 rounded-xl bg-[#e2e3e0]" />
                    </td>
                    <td className="px-8 py-[18px]">
                      <div className="ml-auto h-9 w-24 rounded bg-[#e2e3e0]" />
                    </td>
                  </tr>
                ))
              : items.map((request) => (
                  <tr
                    key={request.promotionId}
                    className="border-t border-[#e2e3e0] first:border-t-0"
                  >
                    <td className="px-8 py-[18px]">
                      <div className="flex min-w-0 items-center">
                        <div className="h-12 w-16 shrink-0 overflow-hidden rounded">
                          {request.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt=""
                              src={request.imageUrl}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-[#e7dfd3]" />
                          )}
                        </div>
                        <div className="min-w-0 pl-4">
                          <p className="truncate font-jp text-base font-medium leading-[22px] text-[#1a1c1b]">
                            {getRestaurantName(request)}
                          </p>
                          <p className="mt-1 truncate font-jp text-xs font-medium leading-4 text-[#5a6053]">
                            {request.displayTitle}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-[18px]">
                      <p className="font-manrope text-sm font-normal leading-5 text-[#1a1c1b]">
                        {formatPeriod(request.startDate, request.endDate)}
                      </p>
                      <p
                        className={`mt-1 font-jp text-xs font-medium leading-4 ${
                          request.displayStatus === "配信中"
                            ? "text-[#3d5f46]"
                            : "text-[#5a6053]"
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
                            {formatImpressions(request.impressions)}
                          </p>
                        </div>
                        <div>
                          <p className="font-manrope text-xs font-normal leading-4 text-[#5a6053]">
                            CTR
                          </p>
                          <p
                            className={`mt-1 font-jp text-sm font-medium leading-5 ${
                              request.displayStatus === "配信中"
                                ? "text-[#3d5f46]"
                                : "text-[#1a1c1b]"
                            }`}
                          >
                            {formatCtr(request.ctr)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-[18px] text-center">
                      <StatusBadge status={request.displayStatus} />
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
                        {request.status === "Pending" ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded border-[#e4beba] px-4 font-jp text-xs font-medium text-[#5a6053] hover:bg-[#af111c0d] hover:text-[#5a6053]"
                            onClick={() => onReject(request)}
                          >
                            却下
                          </Button>
                        ) : null}
                        {request.status !== "Pending" ? (
                          <span className="inline-flex h-9 items-center justify-center rounded px-4 font-jp text-xs font-medium text-[#8a8d85]">
                            対応不要
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
            {!isLoading && items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-8 py-10 text-center font-jp text-sm text-[#5a6053]"
                >
                  条件に一致する広告掲載リクエストはありません。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <AdminPagination
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.totalItems}
        totalPages={pagination.totalPages}
        itemLabel="広告"
        onPageChange={onPageChange}
      />
    </section>
  );
}
