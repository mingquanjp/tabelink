import type {
  AdminAccountStatus,
  AdminUser,
  AdminUserKpis,
  AdminUserRole,
  AdminUsersResponse,
} from "@/lib/api/admin/type";

export const adminRoleOptions: Array<AdminUserRole | "all"> = [
  "all",
  "Admin",
  "Owner",
  "User",
];

export const adminStatusOptions: Array<AdminAccountStatus | "all"> = [
  "all",
  "Active",
  "Banned",
  "Disabled",
];

export const roleLabels: Record<AdminUserRole | "all", string> = {
  all: "すべて",
  Admin: "ADMIN",
  Owner: "OWNER",
  User: "USER",
};

export const statusLabels: Record<AdminAccountStatus | "all", string> = {
  all: "すべて",
  Active: "Active",
  Banned: "Banned",
  Disabled: "Disabled",
};

const fallbackUsers: AdminUser[] = [
  {
    accountId: 1024,
    email: "sakura.owner@example.com",
    role: "Owner",
    status: "Active",
    displayName: "Sakura Dining",
    profile: {
      fullName: "Ito Haruka",
      businessName: "Sakura Dining",
      phone: "+84 90 112 2401",
      avatarUrl: null,
    },
    createdAt: "2026-05-18T08:30:00.000Z",
    updatedAt: "2026-05-18T08:30:00.000Z",
  },
  {
    accountId: 1023,
    email: "mai.tanaka@example.com",
    role: "User",
    status: "Active",
    displayName: "Mai Tanaka",
    profile: {
      fullName: "Mai Tanaka",
      displayName: "Mai",
      avatarUrl: null,
    },
    createdAt: "2026-05-17T10:15:00.000Z",
    updatedAt: "2026-05-17T10:15:00.000Z",
  },
  {
    accountId: 1022,
    email: "reported.user@example.com",
    role: "User",
    status: "Banned",
    displayName: "Reported User",
    profile: {
      fullName: "Reported User",
      displayName: "Reported",
      avatarUrl: null,
    },
    createdAt: "2026-05-13T12:00:00.000Z",
    updatedAt: "2026-05-21T14:40:00.000Z",
  },
  {
    accountId: 1021,
    email: "admin.ops@example.com",
    role: "Admin",
    status: "Active",
    displayName: "Admin Ops",
    profile: {
      fullName: "Admin Ops",
      avatarUrl: null,
    },
    createdAt: "2026-05-08T09:00:00.000Z",
    updatedAt: "2026-05-08T09:00:00.000Z",
  },
];

const fallbackKpi: AdminUserKpis = {
  total: 2486,
  byRole: {
    Admin: 8,
    Owner: 186,
    User: 2292,
  },
  byStatus: {
    Active: 2411,
    Banned: 18,
    Disabled: 15,
  },
  activeUsers: 2292,
  activeOwners: 186,
  banned: 18,
  disabled: 15,
};

export const fallbackAdminUsersResponse: AdminUsersResponse = {
  items: fallbackUsers,
  pagination: {
    page: 1,
    limit: 10,
    total: fallbackKpi.total,
    totalPages: 249,
  },
  kpi: fallbackKpi,
  filters: {
    roles: ["Admin", "Owner", "User"],
    statuses: ["Active", "Banned", "Disabled"],
  },
};
