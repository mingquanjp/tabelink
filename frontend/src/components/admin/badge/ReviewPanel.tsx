import type { AdminBadgeApplication } from "@/lib/api/admin-badges/type";
import { ChecklistPanel } from "./ChecklistPanel";
import { ReviewActions } from "./ReviewActions";
import type { BadgeActionDialogType, ChecklistId } from "./types";

type ReviewPanelProps = {
  application: AdminBadgeApplication;
  checkedItems: Record<ChecklistId, boolean>;
  isSaving: boolean;
  onToggleChecklist: (id: ChecklistId, checked: boolean) => void;
  onOpenAction: (action: BadgeActionDialogType) => void;
};

export function ReviewPanel({
  application,
  checkedItems,
  isSaving,
  onToggleChecklist,
  onOpenAction,
}: ReviewPanelProps) {
  const allChecked = Object.values(checkedItems).every(Boolean);
  const isChecklistDisabled = application.status !== "Pending";

  return (
    <div className="flex flex-col gap-8">
      <ChecklistPanel
        checkedItems={checkedItems}
        disabled={isChecklistDisabled}
        onToggle={onToggleChecklist}
      />
      <ReviewActions
        status={application.status}
        allChecked={allChecked}
        isSaving={isSaving}
        onApprove={() => onOpenAction("approve")}
        onReject={() => onOpenAction("reject")}
        onRequestInfo={() => onOpenAction("request-info")}
        onRevoke={() => onOpenAction("revoke")}
      />
    </div>
  );
}
