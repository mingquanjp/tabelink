const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let detail = `API request failed: ${res.status}`;

    try {
      const body = (await res.json()) as ApiErrorResponse;
      if (Array.isArray(body.message)) {
        detail = body.message.join("\n");
      } else if (body.message) {
        detail = body.message;
      } else if (body.error) {
        detail = body.error;
      }
    } catch {
      // Keep the status-based fallback when the response body is empty or invalid JSON.
    }

    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

export type HealthResponse = {
  status: "ok";
};

export function getHealth() {
  return request<HealthResponse>("/health");
}

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

export type RegisterResponse = {
  account: {
    accountId: number;
    email: string;
    role: RegisterRole;
    status: string;
  };
  profile: unknown;
  tokens: AuthTokens;
};

export function registerAccount(payload: RegisterPayload) {
  return request<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
