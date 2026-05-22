"use client";

import { useEffect, useMemo, useState } from "react";
import {
  banAdminUser,
  listAdminUsers,
  restoreAdminUser,
  updateAdminUser,
} from "@/lib/api/admin/API";
import type {
  AdminAccountStatus,
  AdminUser,
  AdminUserRole,
  AdminUsersResponse,
  UpdateAdminUserPayload,
} from "@/lib/api/admin/type";
import { fallbackAdminUsersResponse } from "@/components/admin/accounts/admin-account-data";
import { AdminAccountFilters } from "@/components/admin/accounts/AdminAccountFilters";
import { AdminKpiCard } from "@/components/admin/accounts/AdminKpiCard";
import { AdminPagination } from "@/components/admin/accounts/AdminPagination";
import {
  AdminUserEditDialog,
  AdminUserStatusDialog,
} from "@/components/admin/accounts/AdminUserDialogs";
import { AdminUserTable } from "@/components/admin/accounts/AdminUserTable";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";

const pageLimit = 10;

export function AdminAccountManagementView() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<AdminUserRole | "all">("all");
  const [status, setStatus] = useState<AdminAccountStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminUsersResponse>(
    fallbackAdminUsersResponse
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [statusUser, setStatusUser] = useState<AdminUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const query = useMemo(
    () => ({
      search,
      role: role === "all" ? undefined : role,
      status: status === "all" ? undefined : status,
      page,
      limit: pageLimit,
    }),
    [page, role, search, status]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setIsLoading(true);

      try {
        const response = await listAdminUsers(query);

        if (!cancelled) {
          setData(response);
          setIsFallback(false);
        }
      } catch {
        if (!cancelled) {
          setData(fallbackAdminUsersResponse);
          setIsFallback(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [query]);

  function submitSearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function saveUser(
    accountId: number,
    payload: UpdateAdminUserPayload
  ) {
    setIsSaving(true);

    try {
      await updateAdminUser(accountId, payload);
      const response = await listAdminUsers(query);
      setData(response);
      setEditingUser(null);
      setIsFallback(false);
      showSuccessToast();
    } catch {
      showErrorToast();
    } finally {
      setIsSaving(false);
    }
  }

  async function saveStatusAction(user: AdminUser, reason: string) {
    setIsSaving(true);

    try {
      if (user.status === "Banned") {
        await restoreAdminUser(user.accountId, reason.trim());
      } else {
        await banAdminUser(user.accountId, reason.trim());
      }

      const response = await listAdminUsers(query);
      setData(response);
      setStatusUser(null);
      setIsFallback(false);
      showSuccessToast();
    } catch {
      showErrorToast();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-5 py-7 md:px-8 lg:px-10">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-[#1a1c1b] md:text-[34px]">
            全ユーザーアカウント管理
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] font-medium leading-6 text-[#5a6053]">
            システム内の管理者、店舗オーナー、ユーザーアカウントを検索し、権限とステータスを管理します。
          </p>
        </div>
        {isFallback ? (
          <div className="rounded-[6px] border border-[#f3d5a7] bg-[#fff7ed] px-4 py-3 text-[13px] font-semibold text-[#9a4d00]">
            API未接続のためサンプルデータを表示しています。
          </div>
        ) : null}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          title="総ユーザー数"
          value={data.kpi.total}
          status="+12%"
          progress={75}
          statusTone="positive"
          progressTone="brand"
        />
        <AdminKpiCard
          title="今月の新規登録"
          value={data.kpi.pending}
          status="+5%"
          progress={50}
          statusTone="positive"
          progressTone="green"
        />
        <AdminKpiCard
          title="アクティブ店舗"
          value={data.kpi.activeOwners}
          status="安定"
          progress={67}
          statusTone="neutral"
          progressTone="neutral"
        />
        <AdminKpiCard
          title="報告済みアカウント"
          value={data.kpi.banned}
          status="要確認"
          progress={25}
          valueTone="danger"
          statusTone="danger"
          progressTone="danger"
        />
      </section>

      <section className="space-y-4">
        <AdminAccountFilters
          search={searchInput}
          role={role}
          status={status}
          isLoading={isLoading}
          onSearchChange={setSearchInput}
          onRoleChange={(value) => {
            setRole(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          onSubmit={submitSearch}
        />
        <div className="overflow-hidden rounded-[8px] border border-[#ded8d1] bg-white shadow-[0_10px_24px_rgba(26,28,27,0.06)]">
          <AdminUserTable
            users={data.items}
            isLoading={isLoading}
            onEdit={setEditingUser}
            onStatusAction={setStatusUser}
          />
          <AdminPagination
            page={data.pagination.page}
            limit={data.pagination.limit}
            total={data.pagination.total}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>

      <AdminUserEditDialog
        user={editingUser}
        isSaving={isSaving}
        onClose={() => setEditingUser(null)}
        onSave={saveUser}
      />
      <AdminUserStatusDialog
        user={statusUser}
        isSaving={isSaving}
        onClose={() => setStatusUser(null)}
        onConfirm={saveStatusAction}
      />
    </main>
  );
}
