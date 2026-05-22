export type AdminUserRole = "Admin" | "Owner" | "User";

export type AdminAccountStatus = "Active" | "Banned" | "Disabled";

export type AdminUserProfile = {
  fullName?: string | null;
  displayName?: string | null;
  businessName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
} & Record<string, unknown>;

export type AdminUser = {
  accountId: number;
  email: string;
  role: AdminUserRole;
  status: AdminAccountStatus;
  displayName: string | null;
  profile: AdminUserProfile | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserKpis = {
  total: number;
  byRole: Record<AdminUserRole, number>;
  byStatus: Record<AdminAccountStatus, number>;
  activeUsers: number;
  activeOwners: number;
  banned: number;
  disabled: number;
};

export type AdminUsersQuery = {
  search?: string;
  role?: AdminUserRole;
  status?: AdminAccountStatus;
  page?: number;
  limit?: number;
};

export type AdminUsersResponse = {
  items: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  kpi: AdminUserKpis;
  filters: {
    roles: AdminUserRole[];
    statuses: AdminAccountStatus[];
  };
};

export type UpdateAdminUserPayload = {
  email?: string;
  role?: AdminUserRole;
  status?: AdminAccountStatus;
  fullName?: string;
  displayName?: string;
  phone?: string;
  businessName?: string;
  reason?: string;
};
