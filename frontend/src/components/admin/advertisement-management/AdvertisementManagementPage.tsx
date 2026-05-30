"use client";

import { useCallback, useEffect, useState } from "react";
import {
  approveAdminPromotion,
  getAdminPromotions,
  getAdminPromotionSummary,
  rejectAdminPromotion,
} from "@/lib/api/admin-promotions/API";
import type {
  AdminPromotion,
  AdminPromotionsResponse,
  AdminPromotionSummary,
} from "@/lib/api/admin-promotions/type";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { AdvertisementManagementStatsGrid } from "./AdvertisementManagementStatsGrid";
import { AdvertisementRequestsTable } from "./AdvertisementRequestsTable";
import {
  ApproveAdvertisementDialog,
  RejectAdvertisementDialog,
} from "./AdvertisementRequestDialogs";

const pageSize = 3;

const emptyPromotionsResponse: AdminPromotionsResponse = {
  items: [],
  pagination: {
    page: 1,
    limit: pageSize,
    totalItems: 0,
    totalPages: 1,
  },
};

export function AdvertisementManagementPage() {
  const [summary, setSummary] = useState<AdminPromotionSummary | null>(null);
  const [promotions, setPromotions] = useState<AdminPromotionsResponse>(
    emptyPromotionsResponse,
  );
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);
  const [requestToApprove, setRequestToApprove] =
    useState<AdminPromotion | null>(null);
  const [requestToReject, setRequestToReject] =
    useState<AdminPromotion | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      const data = await getAdminPromotionSummary();
      setSummary(data);
    } catch {
      showErrorToast();
    }
  }, []);

  const loadPromotions = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setIsLoadingPromotions(true);
      }

      try {
        const data = await getAdminPromotions({
          search: debouncedQuery || undefined,
          page: currentPage,
          limit: pageSize,
        });
        setPromotions(data);

        if (currentPage > data.pagination.totalPages) {
          setCurrentPage(data.pagination.totalPages);
        }
      } catch {
        showErrorToast();
      } finally {
        if (showLoading) {
          setIsLoadingPromotions(false);
        }
      }
    },
    [currentPage, debouncedQuery],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSummary();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadSummary]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPromotions();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadPromotions]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setCurrentPage(1);
  };

  const handleApprove = async (request: AdminPromotion) => {
    try {
      await approveAdminPromotion(request.promotionId);
      setRequestToApprove(null);
      showSuccessToast();
      await Promise.all([loadSummary(), loadPromotions(false)]);
    } catch {
      showErrorToast();
    }
  };

  const handleReject = async (request: AdminPromotion, reason: string) => {
    try {
      await rejectAdminPromotion(request.promotionId, reason);
      showSuccessToast();
      await Promise.all([loadSummary(), loadPromotions(false)]);
    } catch (error) {
      showErrorToast();
      throw error;
    }
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

        <AdvertisementManagementStatsGrid summary={summary} />

        <AdvertisementRequestsTable
          isLoading={isLoadingPromotions}
          items={promotions.items}
          pagination={promotions.pagination}
          query={query}
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
