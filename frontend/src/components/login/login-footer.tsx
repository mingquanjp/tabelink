import { cn } from "@/lib/utils";

export function LoginFooter() {
  return (
    <div
      className={cn(
        "absolute bottom-10 right-10 flex items-center justify-center gap-4 text-lg uppercase tracking-[0.12em] text-(--ink-600)/40 lg:justify-end",
        "font-manrope"
      )}
    >
      <span>VN / JP シナジー</span>
      <span className="h-px w-12 bg-(--ink-600)/20" />
      <span>© 2024</span>
    </div>
  );
}
