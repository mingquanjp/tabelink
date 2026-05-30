import type { AdminBadgeApplication } from "@/lib/api/admin-badges/type";
import { EvidencePanel } from "./EvidencePanel";
import { RestaurantSummary } from "./RestaurantSummary";
import { ReviewPanel } from "./ReviewPanel";
import type { BadgeActionDialogType, ChecklistId } from "./types";

type BadgeReviewDetailProps = {
  application: AdminBadgeApplication | null;
  checkedItems: Record<ChecklistId, boolean>;
  isSaving: boolean;
  onToggleChecklist: (id: ChecklistId, checked: boolean) => void;
  onOpenAction: (action: BadgeActionDialogType) => void;
  onPreviewImage: (imageUrl: string) => void;
};

export function BadgeReviewDetail({
  application,
  checkedItems,
  isSaving,
  onToggleChecklist,
  onOpenAction,
  onPreviewImage,
}: BadgeReviewDetailProps) {
  if (!application) {
    return (
      <section className="flex min-h-[420px] items-center justify-center rounded-lg border border-[#e8e8e5] bg-white p-8 text-center shadow-[0_1px_1px_rgba(0,0,0,0.05)] lg:col-span-8">
        <p className="font-jp text-sm font-medium text-[#5a6053]">
          左側のリストから申請を選択してください。
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[#e8e8e5] bg-white p-8 shadow-[0_1px_1px_rgba(0,0,0,0.05)] lg:col-span-8">
      <div className="flex flex-col gap-8">
        <RestaurantSummary application={application} />
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-2">
          <EvidencePanel
            application={application}
            onPreviewImage={onPreviewImage}
          />
          <ReviewPanel
            application={application}
            checkedItems={checkedItems}
            isSaving={isSaving}
            onToggleChecklist={onToggleChecklist}
            onOpenAction={onOpenAction}
          />
        </div>
      </div>
    </section>
  );
}
