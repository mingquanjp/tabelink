"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type PostCreateHeaderProps = {
  onPublish: () => void;
  isPublishing?: boolean;
};

export function PostCreateHeader({
  onPublish,
  isPublishing = false,
}: PostCreateHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#ebe8e2] bg-[#f9f9f6]/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/user/home"
            aria-label="閉じる"
            className="inline-flex size-8 items-center justify-center rounded-md text-[#4c4c49] transition-colors hover:bg-[#ecebe7]"
          >
            <X className="size-4" />
          </Link>
          <Link
            href="/user/home"
            className="font-brand text-xl font-bold leading-7 tracking-[-1px] text-[#af111c]"
          >
            TABELINK
          </Link>
        </div>
        <Button
          type="button"
          onClick={onPublish}
          disabled={isPublishing}
          className="h-auto rounded-xl bg-[#af111c] px-6 py-2 font-jp text-sm font-medium tracking-[-0.35px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#980f18]"
        >
          {isPublishing ? "公開中..." : "公開する"}
        </Button>
      </div>
    </header>
  );
}
