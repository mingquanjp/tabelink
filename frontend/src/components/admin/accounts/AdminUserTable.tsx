import { Ban, Pencil, RotateCcw } from "lucide-react";
import type {
  AdminAccountStatus,
  AdminUser,
  AdminUserRole,
} from "@/lib/api/admin/type";
import {
  roleLabels,
  statusLabels,
} from "@/components/admin/accounts/admin-account-data";

type AdminUserTableProps = {
  users: AdminUser[];
  isLoading: boolean;
  onEdit: (user: AdminUser) => void;
  onStatusAction: (user: AdminUser) => void;
};

const roleTone: Record<AdminUserRole, string> = {
  Admin: "bg-[#eeeeeb] text-[#43493d]",
  Owner: "bg-[#dfe5d4] text-[#606659]",
  User: "bg-[#c5eccc] text-[#2c4e36]",
};

const statusDotTone: Record<AdminAccountStatus, string> = {
  Active: "bg-[#3d5f46]",
  Banned: "bg-[#ba1a1a]",
  Disabled: "bg-[#8a8d85]",
};

const avatarTone: Record<AdminUserRole, string> = {
  Admin: "bg-[#d32f311a] text-[#af111c]",
  Owner: "bg-[#e4beba1a] text-[#5a6053]",
  User: "bg-[#dfe5d433] text-[#5a6053]",
};

function getUserName(user: AdminUser) {
  return (
    user.displayName ||
    user.profile?.businessName ||
    user.profile?.fullName ||
    user.email.split("@")[0]
  );
}

function getInitials(user: AdminUser) {
  const name = getUserName(user);
  const asciiParts = name.match(/[A-Za-z0-9]+/g);

  if (asciiParts?.length) {
    return asciiParts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }

  return name.slice(0, 2).toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function ActionButton({
  label,
  onClick,
  children,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex size-6 items-center justify-center transition ${
        tone === "danger"
          ? "text-[#ba1a1a] hover:text-[#8f1414]"
          : "text-[#43493d] hover:text-[#af111c]"
      }`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

export function AdminUserTable({
  users,
  isLoading,
  onEdit,
  onStatusAction,
}: AdminUserTableProps) {
  return (
    <section
      aria-label="ユーザー一覧"
      className="overflow-hidden bg-white"
    >
      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full border-collapse bg-white">
          <colgroup>
            <col className="w-[39%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[15%]" />
          </colgroup>
          <thead className="bg-[#f4f4f1]">
            <tr>
              {["ユーザー名", "ロール", "ステータス", "登録日", "アクション"].map(
                (label, index) => (
                  <th
                    key={label}
                    className={`px-6 py-4 font-jp text-[12px] font-medium leading-4 tracking-[1.2px] text-[#5a6053] ${
                      index === 4 ? "text-right" : "text-left"
                    }`}
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const name = getUserName(user);
              const isBanned = user.status === "Banned";

              return (
                <tr
                  key={user.accountId}
                  className="h-20 border-t border-[#eeeeeb] first:border-t-0"
                >
                  <td className="px-6 py-4">
                    <div className="flex min-w-0 items-center">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl font-manrope text-[16px] font-bold ${avatarTone[user.role]}`}
                      >
                        {user.profile?.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.profile.avatarUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          getInitials(user)
                        )}
                      </div>
                      <div className="min-w-0 pl-3">
                        <p className="truncate font-manrope text-[16px] font-bold leading-[22px] text-[#1a1c1b]">
                          {name}
                        </p>
                        <p className="truncate font-manrope text-[12px] font-normal leading-4 text-[#5a6053]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-xl px-3 py-1 font-jp text-[10px] font-bold leading-[14px] ${roleTone[user.role]}`}
                    >
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span
                        className={`size-2 rounded-xl ${statusDotTone[user.status]}`}
                      />
                      <span className="pl-2 font-jp text-[14px] font-medium leading-5 text-[#1a1c1b]">
                        {statusLabels[user.status]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <time className="font-manrope text-[14px] font-normal leading-5 text-[#5a6053]">
                      {formatDate(user.createdAt)}
                    </time>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-5">
                      <ActionButton
                        label={`${name}を編集`}
                        onClick={() => onEdit(user)}
                      >
                        <Pencil className="size-5" />
                      </ActionButton>
                      <ActionButton
                        label={
                          isBanned
                            ? `${name}を復元`
                            : `${name}をブロック`
                        }
                        onClick={() => onStatusAction(user)}
                        tone={isBanned ? "default" : "danger"}
                      >
                        {isBanned ? (
                          <RotateCcw className="size-5" />
                        ) : (
                          <Ban className="size-5" />
                        )}
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isLoading ? (
        <div className="border-t border-[#eeeeeb] bg-white px-6 py-4 font-jp text-[13px] font-medium text-[#5a6053]">
          読み込み中...
        </div>
      ) : null}

      {!isLoading && users.length === 0 ? (
        <div className="bg-white px-6 py-12 text-center font-jp text-[14px] font-medium text-[#5a6053]">
          条件に一致するアカウントはありません。
        </div>
      ) : null}
    </section>
  );
}
