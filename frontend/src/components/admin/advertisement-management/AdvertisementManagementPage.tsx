"use client";

import { useMemo, useState } from "react";
import { showSuccessToast } from "@/lib/app-toast";
import {
  advertisementManagementSummary,
  initialAdvertisementRequests,
  type AdvertisementRequest,
} from "./advertisement-management-data";
import { AdvertisementManagementStatsGrid } from "./AdvertisementManagementStatsGrid";
import { AdvertisementRequestsTable } from "./AdvertisementRequestsTable";
import {
  ApproveAdvertisementDialog,
  RejectAdvertisementDialog,
} from "./AdvertisementRequestDialogs";

const pageSize = 3;

export function AdvertisementManagementPage() {
  const [requests, setRequests] = useState<AdvertisementRequest[]>(
    initialAdvertisementRequests,
  );
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [requestToApprove, setRequestToApprove] = useState<AdvertisementRequest | null>(null);
  const [requestToReject, setRequestToReject] = useState<AdvertisementRequest | null>(null);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return requests;
    }

    return requests.filter((request) => {
      return (
        request.restaurantName.toLowerCase().includes(normalizedQuery) ||
        request.campaignName.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, requests]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setCurrentPage(1);
  };

  const handleApprove = (request: AdvertisementRequest) => {
    setRequests((currentRequests) =>
      currentRequests.map((item) =>
        item.id === request.id
          ? {
              ...item,
              status: "Active",
              periodLabel: "掲載中",
              rejectionReason: undefined,
            }
          : item,
      ),
    );
    setRequestToApprove(null);
    showSuccessToast();
  };

  const handleReject = (request: AdvertisementRequest, reason: string) => {
    setRequests((currentRequests) =>
      currentRequests.map((item) =>
        item.id === request.id
          ? {
              ...item,
              status: "Rejected",
              rejectionReason: reason,
            }
          : item,
      ),
    );
    showSuccessToast();
  };

  return (
    <main className="min-h-screen bg-[#f9f9f6] px-4 pb-10 pt-24 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-0 pb-16 md:px-8">
        <section className="flex flex-col gap-2 pb-2">
          <h1 className="font-jp text-4xl font-medium leading-10 tracking-[-0.9px] text-[#1a1c1b]">
            広告管理
          </h1>
          <p className="font-jp text-base font-medium leading-6 text-[#5a6053]">
            広告の掲載審査とパフォーマンス分析
          </p>
        </section>

        <AdvertisementManagementStatsGrid />

        <AdvertisementRequestsTable
          currentPage={currentPage}
          items={filteredRequests}
          pageSize={pageSize}
          query={query}
          totalCount={advertisementManagementSummary.totalCount}
          onApprove={setRequestToApprove}
          onPageChange={setCurrentPage}
          onQueryChange={handleQueryChange}
          onReject={setRequestToReject}
        />
      </div>

      <ApproveAdvertisementDialog
        open={Boolean(requestToApprove)}
        request={requestToApprove}
        onOpenChange={(open) => {
          if (!open) {
            setRequestToApprove(null);
          }
        }}
        onConfirm={handleApprove}
      />
      <RejectAdvertisementDialog
        open={Boolean(requestToReject)}
        request={requestToReject}
        onOpenChange={(open) => {
          if (!open) {
            setRequestToReject(null);
          }
        }}
        onConfirm={handleReject}
      />
    </main>
  );
}
