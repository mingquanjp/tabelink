const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type RequestOptions = {
  accessToken?: string;
  method?: "GET" | "PATCH" | "POST" | "DELETE";
  body?: unknown;
};

export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers = new Headers();

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!res.ok) {
    const responseText = await res.text().catch(() => "");
    let message = responseText;

    try {
      const parsed = JSON.parse(responseText) as {
        message?: string | string[];
        error?: string;
      };

      if (Array.isArray(parsed.message)) {
        message = parsed.message.join(", ");
      } else {
        message = parsed.message ?? parsed.error ?? responseText;
      }
    } catch {
      message = responseText;
    }

    throw new Error(message || `API request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export type HealthResponse = {
  status: "ok";
};

export function getHealth() {
  return request<HealthResponse>("/health");
}
