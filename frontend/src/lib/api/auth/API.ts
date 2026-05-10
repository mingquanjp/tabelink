import { apiRequest } from "@/lib/api/client";
import type {
  AuthTokens,
  LoginPayload,
  LoginResponse,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
} from "@/lib/api/auth/type";

export function registerAccount(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginAccount(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe() {
  return apiRequest<MeResponse>("/auth/me", { auth: true });
}

export function refreshSession(refreshToken?: string) {
  return apiRequest<{
    account: MeResponse["account"];
    restaurant: MeResponse["restaurant"];
    tokens: AuthTokens;
  }>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify(refreshToken ? { refreshToken } : {}),
  });
}

export function guestLogin() {
  return apiRequest<LoginResponse & { guest: true }>("/auth/guest", {
    method: "POST",
  });
}

export function logoutAccount() {
  return apiRequest<{ loggedOut: true }>("/auth/logout", {
    method: "POST",
  });
}
