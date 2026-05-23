import { ExternalLink, type LucideIcon } from "lucide-react";

type DocumentLinkProps = {
  label: string;
  href: string | null;
  Icon: LucideIcon;
};

export function DocumentLink({ label, href, Icon }: DocumentLinkProps) {
  return (
    <button
      type="button"
      className="flex h-12 w-full items-center justify-between rounded bg-[#f4f4f1] p-3 text-left transition-colors hover:bg-[#eeeeeb] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={!href}
      onClick={() => {
        if (href) {
          window.open(href, "_blank", "noopener,noreferrer");
        }
      }}
    >
      <span className="flex min-w-0 items-center gap-3">
        <Icon className="size-5 shrink-0 text-[#d32f2f]" strokeWidth={1.8} />
        <span className="truncate font-jp text-sm font-medium leading-5 text-[#1a1c1b]">
          {label}
        </span>
      </span>
      <ExternalLink
        className="size-[18px] shrink-0 text-[#5a6053]"
        strokeWidth={2}
      />
    </button>
  );
}
