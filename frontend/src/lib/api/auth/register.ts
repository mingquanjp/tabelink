import type { AuthTokens, RegisterRole } from "@/lib/api/auth/type";

export const REGISTER_DRAFT_KEY = "tabelink.registerDraft";

export type RegisterDraft = {
  fullName: string;
  email: string;
  password: string;
  role: RegisterRole;
};

export function saveRegisterDraft(draft: RegisterDraft) {
  sessionStorage.setItem(REGISTER_DRAFT_KEY, JSON.stringify(draft));
}

export function readRegisterDraft(): RegisterDraft | null {
  const raw = sessionStorage.getItem(REGISTER_DRAFT_KEY);

  if (!raw) {
    return null;
  }

  try {
    const draft = JSON.parse(raw) as RegisterDraft;
    if (!draft.fullName || !draft.email || !draft.password || !draft.role) {
      return null;
    }

    return draft;
  } catch {
    return null;
  }
}

export function clearRegisterDraft() {
  sessionStorage.removeItem(REGISTER_DRAFT_KEY);
}

export function persistAuthSession(tokens: AuthTokens) {
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
}
