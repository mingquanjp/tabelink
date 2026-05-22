export enum UserRole {
  Admin = 'Admin',
  User = 'User',
  Owner = 'Owner',
}

export enum AuthRole {
  Admin = 'Admin',
  User = 'User',
  Owner = 'Owner',
  Guest = 'Guest',
}

export enum AccountStatus {
  Active = 'Active',
  Banned = 'Banned',
  Disabled = 'Disabled',
}

export const DEFAULT_ACCESS_TTL = '15m';
export const DEFAULT_REFRESH_TTL = '7d';
export const DEFAULT_REFRESH_TTL_LONG = '30d';

export const REGISTER_ROLES = [UserRole.User, UserRole.Owner] as const;
export type RegisterRole = (typeof REGISTER_ROLES)[number];

export const AUTH_STRATEGY = {
  jwt: 'jwt',
} as const;
