export type ChecklistId = "hygiene" | "staff" | "reviews";

export type ChecklistItem = {
  id: ChecklistId;
  title: string;
  description: string;
};

export type BadgeActionDialogType =
  | "approve"
  | "request-info"
  | "reject"
  | "revoke";
