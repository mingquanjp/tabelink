const PUBLIC_API_URL = normalizeApiOrigin(process.env.NEXT_PUBLIC_API_URL);
const SERVER_API_URL =
  normalizeApiOrigin(process.env.BACKEND_ORIGIN) ??
  PUBLIC_API_URL ??
  "http://localhost:8080";

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & {
  auth?: boolean;
};

function normalizeApiOrigin(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
}

function resolveRequestUrl(path: string) {
  if (typeof window === "undefined") {
    return `${SERVER_API_URL}${path}`;
  }

  if (PUBLIC_API_URL) {
    return `${PUBLIC_API_URL}${path}`;
  }

  return path;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth: _auth, headers, ...init } = options;
  void _auth;
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  const response = await fetch(resolveRequestUrl(path), {
    ...init,
    cache: "no-store",
    credentials: "include",
    headers: isFormData
      ? headers
      : {
          "Content-Type": "application/json",
          ...headers,
        },
  });

  if (!response.ok) {
    let detail = `API request failed: ${response.status}`;

    try {
      const body = (await response.json()) as ApiErrorResponse;
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

    throw new ApiError(detail, response.status);
  }

  return response.json() as Promise<T>;
}

export function resolveApiUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).toString();
  } catch {
    const baseUrl =
      typeof window === "undefined"
        ? SERVER_API_URL
        : PUBLIC_API_URL
          ? PUBLIC_API_URL
          : window.location.origin;

    return new URL(value, baseUrl).toString();
  }
}
