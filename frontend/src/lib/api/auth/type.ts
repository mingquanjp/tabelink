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

export type RequestPasswordResetPayload = {
  email: string;
  lang?: "vi" | "ja";
};

export type RequestPasswordResetResponse = {
  message: string;
  tempPassword?: string;
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

export type AuthRestaurantContext = {
  restaurantId: number;
  ownerAccountId: number;
  nameVn: string;
  nameJp: string;
  status: string;
};

export type RegisterResponse = {
  account: AuthAccount;
  profile: unknown;
  restaurant: AuthRestaurantContext | null;
  tokens: AuthTokens;
};

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type LoginResponse = {
  account: AuthAccount;
  restaurant: AuthRestaurantContext | null;
  tokens: AuthTokens;
};

export type MeResponse = {
  account: AuthAccount;
  profile: unknown;
  restaurant: AuthRestaurantContext | null;
  profileCompleted: boolean;
  guest?: boolean;
};
