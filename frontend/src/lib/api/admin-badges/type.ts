export type AdminBadgeApplicationStatus = "Pending" | "Approved" | "Rejected";

export type AdminBadgeStatusFilter = "all" | AdminBadgeApplicationStatus;

export type AdminBadgeApplication = {
  appId: number;
  restaurantId: number;
  badgeId: number;
  status: AdminBadgeApplicationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
  submittedByOwnerAccountId: number;
  reviewedByAdminId: number | null;
  badge: {
    badgeId: number;
    badgeCode: string | null;
    badgeNameVn: string | null;
    badgeNameJp: string | null;
  };
  restaurant: {
    restaurantId: number;
    nameVn: string;
    nameJp: string;
    address: string;
    areaLabel: string;
    issuesVat: boolean;
    thumbnailUrl: string | null;
    mainImageUrl: string | null;
    publicUrl: string;
    ratingAverage: number | null;
    reviewCount: number;
  };
  documents: {
    businessLicenseUrl: string | null;
    businessLicenseViewUrl?: string | null;
    foodSafetyCertUrl: string | null;
    foodSafetyCertViewUrl?: string | null;
  };
  evidencePhotos: string[];
  details: {
    hasJapaneseStaff: boolean;
    canIssueVatInvoice: boolean;
  };
  hasActiveBadge: boolean;
};

export type AdminBadgeApplicationsResponse = {
  items: AdminBadgeApplication[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
};

export type AdminBadgeApplicationsQuery = {
  status?: AdminBadgeStatusFilter;
  page?: number;
  limit?: number;
};

export type AdminBadgeActionPayload = {
  reason?: string;
};
