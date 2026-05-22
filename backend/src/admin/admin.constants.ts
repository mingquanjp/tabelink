import { AccountStatus } from '../auth/auth.constants';

export const ADMIN_ACCOUNT_STATUSES = [
  AccountStatus.Active,
  AccountStatus.Banned,
  AccountStatus.Disabled,
] as const;
