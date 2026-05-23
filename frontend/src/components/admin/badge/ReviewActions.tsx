import { BadgeCheck, Ban } from "lucide-react";
import type { AdminBadgeApplicationStatus } from "@/lib/api/admin-badges/type";
import { SectionHeading } from "./SectionHeading";

type ReviewActionsProps = {
  status: AdminBadgeApplicationStatus;
  allChecked: boolean;
  isSaving: boolean;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
  onRevoke: () => void;
};

export function ReviewActions({
  status,
  allChecked,
  isSaving,
  onApprove,
  onReject,
  onRequestInfo,
  onRevoke,
}: ReviewActionsProps) {
  const isPending = status === "Pending";
  const isApproved = status === "Approved";

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading>審査アクション</SectionHeading>
      {isApproved ? (
        <div className="border-t border-[#e8e8e5] pt-5">
          <button
            type="button"
            disabled={isSaving}
            className="flex h-[46px] w-full items-center justify-center gap-2 rounded border border-[#ba1a1a]/20 bg-[#ba1a1a]/5 px-4 font-jp text-sm font-medium leading-5 text-[#ba1a1a] transition-colors hover:bg-[#ba1a1a]/10 disabled:opacity-60"
            onClick={onRevoke}
          >
            <Ban className="size-3.5" />
            バッジを取消
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          <button
            type="button"
            disabled={!isPending || !allChecked || isSaving}
            className="flex h-14 items-center justify-center gap-2 rounded-lg bg-[#d32f2f] font-jp text-base font-medium leading-6 text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] transition-colors hover:bg-[#ba1a1a] disabled:cursor-not-allowed disabled:bg-[#d7d0cb] disabled:text-white"
            onClick={onApprove}
          >
            <BadgeCheck className="size-[22px] fill-white text-white" strokeWidth={2} />
            バッジを付与する
          </button>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={!isPending || isSaving}
              className="h-[46px] rounded bg-[#e8e8e5] px-4 font-jp text-sm font-medium leading-5 text-[#1a1c1b] transition-colors hover:bg-[#deded9] disabled:opacity-60"
              onClick={onRequestInfo}
            >
              不足情報の再請求
            </button>
            <button
              type="button"
              disabled={!isPending || isSaving}
              className="h-[46px] rounded border border-[#ba1a1a]/30 px-4 font-jp text-sm font-medium leading-5 text-[#ba1a1a] transition-colors hover:bg-[#fff6f5] disabled:opacity-60"
              onClick={onReject}
            >
              申請を却下
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
