export type RegisterRole = "User" | "Owner";

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  role: RegisterRole;
  purpose?: string;
  displayName?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  storeName?: string;
  storeNameJp?: string;
  address?: string;
  representativeName?: string;
  phone?: string;
  openingHours?: string;
  issuesVat?: boolean;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthAccountRole = RegisterRole | "Admin" | "Guest";

export type AuthAccount = {
  accountId: number;
  email: string;
  role: AuthAccountRole;
  status: string;
};

export type RegisterResponse = {
  account: AuthAccount;
  profile: unknown;
  tokens: AuthTokens;
};

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type LoginResponse = {
  account: AuthAccount;
  tokens: AuthTokens;
};
