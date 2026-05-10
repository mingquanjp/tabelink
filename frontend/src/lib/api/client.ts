const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

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

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth: _auth, headers, ...init } = options;
  void _auth;

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    credentials: "include",
    headers: {
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
