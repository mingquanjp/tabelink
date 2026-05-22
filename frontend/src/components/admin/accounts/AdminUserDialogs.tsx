"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type {
  AdminAccountStatus,
  AdminUser,
  AdminUserRole,
  UpdateAdminUserPayload,
} from "@/lib/api/admin/type";
import {
  adminRoleOptions,
  adminStatusOptions,
  roleLabels,
  statusLabels,
} from "@/components/admin/accounts/admin-account-data";

type EditDialogProps = {
  user: AdminUser | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (accountId: number, payload: UpdateAdminUserPayload) => void;
};

type StatusDialogProps = {
  user: AdminUser | null;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (user: AdminUser, reason: string) => void;
};

function getEditableName(user: AdminUser | null) {
  return (
    user?.profile?.fullName ||
    user?.profile?.businessName ||
    user?.displayName ||
    ""
  );
}

function toOptionalField(value: string) {
  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
}

export function AdminUserEditDialog({
  user,
  isSaving,
  onClose,
  onSave,
}: EditDialogProps) {
  if (!user) {
    return null;
  }

  return (
    <AdminUserEditDialogContent
      key={user.accountId}
      user={user}
      isSaving={isSaving}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function AdminUserEditDialogContent({
  user,
  isSaving,
  onClose,
  onSave,
}: EditDialogProps & { user: AdminUser }) {
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(getEditableName(user));
  const [businessName, setBusinessName] = useState(
    user.profile?.businessName ?? ""
  );
  const [phone, setPhone] = useState(user.profile?.phone ?? "");
  const [role, setRole] = useState<AdminUserRole>(user.role);
  const [status, setStatus] = useState<AdminAccountStatus>(user.status);
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1c1b80] px-4 backdrop-blur-[2px]">
      <section className="w-full max-w-[620px] rounded-[8px] border border-[#e6e1dc] bg-white shadow-[0_28px_70px_rgba(26,28,27,0.24)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#efebe6] px-6 py-5">
          <div>
            <h2 className="text-[22px] font-semibold text-[#1a1c1b]">
              アカウント編集
            </h2>
            <p className="mt-1 text-[13px] font-medium text-[#5a6053]">
              ID: {user.accountId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-[6px] p-1 text-[#5a6053] transition hover:bg-[#f1efeb]"
            aria-label="閉じる"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <span className="text-[12px] font-semibold text-[#5a6053]">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-[6px] border border-[#e2e3e0] bg-[#fbfaf7] px-3 text-[14px] font-medium outline-none focus:border-[#af111c] focus:bg-white"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[12px] font-semibold text-[#5a6053]">
              氏名
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="h-11 w-full rounded-[6px] border border-[#e2e3e0] bg-[#fbfaf7] px-3 text-[14px] font-medium outline-none focus:border-[#af111c] focus:bg-white"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[12px] font-semibold text-[#5a6053]">
              店舗名
            </span>
            <input
              type="text"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              className="h-11 w-full rounded-[6px] border border-[#e2e3e0] bg-[#fbfaf7] px-3 text-[14px] font-medium outline-none focus:border-[#af111c] focus:bg-white"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[12px] font-semibold text-[#5a6053]">
              Role
            </span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as AdminUserRole)}
              className="h-11 w-full rounded-[6px] border border-[#e2e3e0] bg-[#fbfaf7] px-3 text-[14px] font-medium outline-none focus:border-[#af111c] focus:bg-white"
            >
              {adminRoleOptions
                .filter((option) => option !== "all")
                .map((option) => (
                  <option key={option} value={option}>
                    {roleLabels[option]}
                  </option>
                ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-[12px] font-semibold text-[#5a6053]">
              ステータス
            </span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AdminAccountStatus)
              }
              className="h-11 w-full rounded-[6px] border border-[#e2e3e0] bg-[#fbfaf7] px-3 text-[14px] font-medium outline-none focus:border-[#af111c] focus:bg-white"
            >
              {adminStatusOptions
                .filter((option) => option !== "all")
                .map((option) => (
                  <option key={option} value={option}>
                    {statusLabels[option]}
                  </option>
                ))}
            </select>
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-[12px] font-semibold text-[#5a6053]">
              電話番号
            </span>
            <input
              type="text"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-11 w-full rounded-[6px] border border-[#e2e3e0] bg-[#fbfaf7] px-3 text-[14px] font-medium outline-none focus:border-[#af111c] focus:bg-white"
            />
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-[12px] font-semibold text-[#5a6053]">
              変更理由
            </span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="h-20 w-full resize-none rounded-[6px] border border-[#e2e3e0] bg-[#fbfaf7] px-3 py-2 text-[14px] font-medium outline-none focus:border-[#af111c] focus:bg-white"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#efebe6] bg-[#fbfaf7] px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-10 rounded-[6px] border border-[#af111c] px-5 text-[14px] font-semibold text-[#af111c] transition hover:bg-[#af111c0d] disabled:opacity-60"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => {
              const payload: UpdateAdminUserPayload = {
                email: email.trim(),
                role,
                status,
                reason: toOptionalField(reason),
              };
              const trimmedFullName = toOptionalField(fullName);

              if (trimmedFullName) {
                payload.fullName = trimmedFullName;
              }

              if (role === "Owner") {
                payload.businessName = toOptionalField(businessName);
                payload.phone = toOptionalField(phone);
              }

              onSave(user.accountId, payload);
            }}
            disabled={isSaving}
            className="h-10 rounded-[6px] bg-[#af111c] px-7 text-[14px] font-semibold text-white transition hover:bg-[#970f18] disabled:opacity-60"
          >
            {isSaving ? "保存中..." : "保存"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function AdminUserStatusDialog({
  user,
  isSaving,
  onClose,
  onConfirm,
}: StatusDialogProps) {
  if (!user) {
    return null;
  }

  return (
    <AdminUserStatusDialogContent
      key={user.accountId}
      user={user}
      isSaving={isSaving}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

function AdminUserStatusDialogContent({
  user,
  isSaving,
  onClose,
  onConfirm,
}: StatusDialogProps & { user: AdminUser }) {
  const [reason, setReason] = useState("");
  const isRestore = user.status === "Banned";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1c1b80] px-4 backdrop-blur-[2px]">
      <section className="w-full max-w-[460px] rounded-[8px] border border-[#e6e1dc] bg-white shadow-[0_28px_70px_rgba(26,28,27,0.24)]">
        <div className="border-b border-[#efebe6] px-6 py-5">
          <h2 className="text-[22px] font-semibold text-[#1a1c1b]">
            {isRestore ? "アカウントを復元" : "アカウントをブロック"}
          </h2>
          <p className="mt-2 text-[13px] font-medium leading-5 text-[#5a6053]">
            {user.email} のステータスを
            {isRestore ? " Active に戻します。" : " Banned に変更します。"}
          </p>
        </div>
        <div className="px-6 py-5">
          <label className="space-y-2">
            <span className="text-[12px] font-semibold text-[#5a6053]">
              理由
            </span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="h-24 w-full resize-none rounded-[6px] border border-[#e2e3e0] bg-[#fbfaf7] px-3 py-2 text-[14px] font-medium outline-none focus:border-[#af111c] focus:bg-white"
              autoFocus
            />
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#efebe6] bg-[#fbfaf7] px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-10 rounded-[6px] border border-[#af111c] px-5 text-[14px] font-semibold text-[#af111c] transition hover:bg-[#af111c0d] disabled:opacity-60"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => onConfirm(user, reason)}
            disabled={isSaving || !reason.trim()}
            className="h-10 rounded-[6px] bg-[#af111c] px-7 text-[14px] font-semibold text-white transition hover:bg-[#970f18] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "処理中..." : isRestore ? "復元" : "ブロック"}
          </button>
        </div>
      </section>
    </div>
  );
}
