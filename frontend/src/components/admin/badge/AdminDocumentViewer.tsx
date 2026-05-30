"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { resolveApiUrl } from "@/lib/api/client";

type AdminDocumentViewerProps = {
  appId: number;
  documentType: "business-license" | "food-safety-certificate";
};

type ViewerState =
  | { status: "loading"; objectUrl: null; contentType: null; message: null }
  | { status: "ready"; objectUrl: string; contentType: string; message: null }
  | { status: "error"; objectUrl: null; contentType: null; message: string };

const documentLabels = {
  "business-license": "営業許可証",
  "food-safety-certificate": "食品安全証明書",
} as const;

function inferContentType(buffer: ArrayBuffer, fallback: string) {
  const bytes = new Uint8Array(buffer);
  const normalizedFallback = fallback.split(";")[0]?.trim().toLowerCase();

  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return "application/pdf";
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    normalizedFallback === "application/pdf" ||
    normalizedFallback === "image/png" ||
    normalizedFallback === "image/jpeg" ||
    normalizedFallback === "image/jpg"
  ) {
    return normalizedFallback === "image/jpg"
      ? "image/jpeg"
      : normalizedFallback;
  }

  return null;
}

export function AdminDocumentViewer({
  appId,
  documentType,
}: AdminDocumentViewerProps) {
  const [state, setState] = useState<ViewerState>({
    status: "loading",
    objectUrl: null,
    contentType: null,
    message: null,
  });
  const title = documentLabels[documentType];
  const endpoint = useMemo(
    () => `/admin/verification/applications/${appId}/documents/${documentType}`,
    [appId, documentType],
  );

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function loadDocument() {
      setState({
        status: "loading",
        objectUrl: null,
        contentType: null,
        message: null,
      });

      try {
        const response = await fetch(resolveApiUrl(endpoint) ?? endpoint, {
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const responseContentType =
          response.headers.get("content-type") ?? "application/octet-stream";
        const buffer = await response.arrayBuffer();
        const contentType = inferContentType(buffer, responseContentType);

        if (!contentType) {
          throw new Error("Unsupported document type");
        }

        const viewBlob = new Blob([buffer], { type: contentType });
        objectUrl = URL.createObjectURL(viewBlob);

        if (!cancelled) {
          setState({
            status: "ready",
            objectUrl,
            contentType,
            message: null,
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            status: "error",
            objectUrl: null,
            contentType: null,
            message: "書類を表示できませんでした。",
          });
        }
      }
    }

    loadDocument();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [endpoint]);

  return (
    <main className="min-h-screen bg-[#f9f9f6] px-6 pb-8 pt-24">
      <div className="mx-auto flex h-[calc(100vh-128px)] max-w-[1280px] flex-col overflow-hidden rounded-lg border border-[#e4beba33] bg-white shadow-sm">
        <header className="flex items-center justify-between gap-4 border-b border-[#e8e8e5] px-5 py-4">
          <div>
            <p className="font-jp text-xs font-bold uppercase tracking-[1.2px] text-[#af111c]">
              提出書類の確認
            </p>
            <h1 className="mt-1 font-jp text-xl font-bold leading-7 text-[#1a1c1b]">
              {title}
            </h1>
          </div>
        </header>

        <div className="min-h-0 flex-1 bg-[#eeeeeb]">
          {state.status === "loading" ? (
            <div className="flex h-full items-center justify-center gap-3 font-jp text-sm text-[#5a6053]">
              <Loader2 className="size-5 animate-spin" />
              読み込み中...
            </div>
          ) : null}

          {state.status === "error" ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center font-jp text-sm text-[#5a6053]">
              <AlertCircle className="size-8 text-[#af111c]" />
              {state.message}
            </div>
          ) : null}

          {state.status === "ready" &&
          state.contentType.startsWith("image/") ? (
            <div className="flex h-full items-center justify-center overflow-auto p-6">
              <img
                src={state.objectUrl}
                alt={title}
                className="max-h-full max-w-full rounded bg-white object-contain shadow-sm"
              />
            </div>
          ) : null}

          {state.status === "ready" &&
          state.contentType === "application/pdf" ? (
            <object
              data={`${state.objectUrl}#toolbar=1&navpanes=0`}
              type="application/pdf"
              className="h-full w-full bg-white"
            >
              <div className="flex h-full items-center justify-center px-6 text-center font-jp text-sm text-[#5a6053]">
                このブラウザではPDFを画面内に表示できません。
              </div>
            </object>
          ) : null}
        </div>
      </div>
    </main>
  );
}
