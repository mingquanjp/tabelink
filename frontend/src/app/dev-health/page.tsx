"use client";

import { useEffect, useState } from "react";
import { getHealth, type HealthResponse } from "@/lib/api";

type HealthState =
  | { status: "loading" }
  | { status: "connected"; data: HealthResponse }
  | { status: "error"; message: string };

export default function DevHealthPage() {
  const [health, setHealth] = useState<HealthState>({ status: "loading" });

  useEffect(() => {
    getHealth()
      .then((data) => setHealth({ status: "connected", data }))
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Unable to reach backend";
        setHealth({ status: "error", message });
      });
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dev Health</h1>
      <pre className="mt-4 rounded border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-900">
        {JSON.stringify(health, null, 2)}
      </pre>
    </main>
  );
}
