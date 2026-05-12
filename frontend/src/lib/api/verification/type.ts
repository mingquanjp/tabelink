export type VerificationBadge = {
  badgeId: number;
  badgeCode: string;
  badgeNameVn: string;
  badgeNameJp: string;
  descriptionVn: string | null;
  descriptionJp: string | null;
  criteria: string | null;
};

export type ListVerificationBadgesResponse = {
  count: number;
  badges: VerificationBadge[];
};

export type VerificationUploadResponse = {
  fileUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
  originalName: string;
  documentType: string;
};

export type VerificationApplication = {
  appId: number;
  restaurantId: number;
  badgeId: number;
  badge: {
    badgeId: number;
    badgeCode: string;
    badgeNameVn: string | null;
    badgeNameJp: string | null;
  } | null;
  submittedByOwnerAccountId: number;
  businessLicenseUrl: string | null;
  businessLicensePublicId: string | null;
  foodSafetyCertUrl: string | null;
  foodSafetyCertPublicId: string | null;
  status: "Pending" | "Approved" | "Rejected" | string;
  submittedAt: string | Date;
  reviewedByAdminId: number | null;
  reviewedAt: string | Date | null;
  reviewNote: string | null;
};
