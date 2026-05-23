"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  approveAdminBadgeApplication,
  listAdminBadgeApplications,
  rejectAdminBadgeApplication,
  requestAdminBadgeInformation,
  revokeAdminBadge,
} from "@/lib/api/admin-badges/API";
import type {
  AdminBadgeApplicationsResponse,
  AdminBadgeStatusFilter,
} from "@/lib/api/admin-badges/type";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { ApiError } from "@/lib/api/client";
import { ApplicationList } from "./ApplicationList";
import { BadgeActionDialog } from "./BadgeActionDialog";
import { BadgeReviewDetail } from "./BadgeReviewDetail";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import type { BadgeActionDialogType, ChecklistId } from "./types";

const pageSize = 24;

const emptyResponse: AdminBadgeApplicationsResponse = {
  items: [],
  pagination: {
    page: 1,
    limit: pageSize,
    totalItems: 0,
    totalPages: 1,
  },
  counts: {
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  },
};

const emptyChecklist: Record<ChecklistId, boolean> = {
  hygiene: false,
  staff: false,
  reviews: false,
};

function getChecklistState(status: string | null | undefined) {
  return status === "Approved"
    ? {
        hygiene: true,
        staff: true,
        reviews: true,
      }
    : emptyChecklist;
}

function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "エラーが発生しました";
}

export function BadgeReviewPage() {
  const [filter, setFilter] = useState<AdminBadgeStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminBadgeApplicationsResponse>(emptyResponse);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] =
    useState<Record<ChecklistId, boolean>>(emptyChecklist);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionDialog, setActionDialog] =
    useState<BadgeActionDialogType | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const selectedAppIdRef = useRef<number | null>(null);

  const selectedApplication = useMemo(
    () =>
      data.items.find((application) => application.appId === selectedAppId) ??
      data.items[0] ??
      null,
    [data.items, selectedAppId],
  );

  const loadApplications = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const response = await listAdminBadgeApplications({
          status: filter,
          page,
          limit: pageSize,
        });

        setData(response);
        setLoadError(null);
        const nextSelected =
          response.items.find((item) => item.appId === selectedAppIdRef.current) ??
          response.items[0] ??
          null;
        selectedAppIdRef.current = nextSelected?.appId ?? null;
        setSelectedAppId(nextSelected?.appId ?? null);
        setCheckedItems(getChecklistState(nextSelected?.status));

        if (page > response.pagination.totalPages) {
          setPage(response.pagination.totalPages);
        }
      } catch (error) {
        setData(emptyResponse);
        selectedAppIdRef.current = null;
        setSelectedAppId(null);
        setLoadError(getApiErrorMessage(error));
        showErrorToast(getApiErrorMessage(error));
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [filter, page],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadApplications();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadApplications]);

  const handleFilterChange = (nextFilter: AdminBadgeStatusFilter) => {
    setFilter(nextFilter);
    setPage(1);
    selectedAppIdRef.current = null;
    setSelectedAppId(null);
    setCheckedItems(emptyChecklist);
  };

  const handleActionConfirm = async (
    action: BadgeActionDialogType,
    reason?: string,
  ) => {
    if (!selectedApplication) {
      return;
    }

    setIsSaving(true);

    try {
      if (action === "approve") {
        await approveAdminBadgeApplication(selectedApplication.appId, {
          reason,
        });
      }

      if (action === "request-info") {
        await requestAdminBadgeInformation(selectedApplication.appId, {
          reason,
        });
      }

      if (action === "reject") {
        await rejectAdminBadgeApplication(selectedApplication.appId, {
          reason,
        });
      }

      if (action === "revoke") {
        await revokeAdminBadge(selectedApplication.appId, {
          reason,
        });
      }

      setActionDialog(null);
      showSuccessToast();
      await loadApplications(false);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-8 pb-12 pt-24">
      <section className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-jp text-4xl font-medium leading-10 tracking-[-0.9px] text-[#1a1c1b]">
              店舗認証バッジ審査
            </h1>
            <p className="mt-2 font-jp text-xs font-medium uppercase leading-4 tracking-[1.2px] text-[#5a6053]">
              日本食レストラン信頼認証 申請キュー
            </p>
          </div>
          {loadError ? (
            <div className="rounded-md border border-[#f3d5a7] bg-[#fff7ed] px-4 py-3 font-jp text-[13px] font-semibold text-[#9a4d00]">
              {loadError}
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <ApplicationList
          applications={data.items}
          counts={data.counts}
          filter={filter}
          selectedAppId={selectedApplication?.appId ?? null}
          isLoading={isLoading}
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.totalItems}
          onFilterChange={handleFilterChange}
          onPageChange={setPage}
          onSelect={(application) => {
            selectedAppIdRef.current = application.appId;
            setSelectedAppId(application.appId);
            setCheckedItems(getChecklistState(application.status));
          }}
        />
        <BadgeReviewDetail
          application={selectedApplication}
          checkedItems={checkedItems}
          isSaving={isSaving}
          onToggleChecklist={(id, checked) =>
            setCheckedItems((current) => ({
              ...current,
              [id]: checked,
            }))
          }
          onOpenAction={setActionDialog}
          onPreviewImage={setPreviewImageUrl}
        />
      </section>

      <BadgeActionDialog
        action={actionDialog}
        application={selectedApplication}
        isSaving={isSaving}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialog(null);
          }
        }}
        onConfirm={handleActionConfirm}
      />
      <ImagePreviewDialog
        imageUrl={previewImageUrl}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewImageUrl(null);
          }
        }}
      />
    </main>
  );
}
