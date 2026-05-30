import { reviewChecklist } from "./badge-review-data";
import type { ChecklistId } from "./types";

type ChecklistPanelProps = {
  checkedItems: Record<ChecklistId, boolean>;
  disabled?: boolean;
  onToggle: (id: ChecklistId, checked: boolean) => void;
};

export function ChecklistPanel({
  checkedItems,
  disabled = false,
  onToggle,
}: ChecklistPanelProps) {
  return (
    <section className="rounded-2xl border border-[#e4beba]/20 bg-[#f9f9f6] p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <h2 className="border-b border-[#e8e8e5] pb-4 font-jp text-xs font-medium uppercase leading-4 tracking-[2.4px] text-[#1a1c1b]">
        管理者審査チェックリスト
      </h2>
      <div className="mt-6 flex flex-col gap-5">
        {reviewChecklist.map((item) => (
          <label
            key={item.id}
            className={`flex items-start gap-4 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            <input
              type="checkbox"
              checked={checkedItems[item.id]}
              disabled={disabled}
              className="mt-1 size-4 shrink-0 rounded-sm border border-[#e4beba] accent-[#d32f2f]"
              onChange={(event) => onToggle(item.id, event.target.checked)}
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-jp text-sm font-medium leading-5 text-[#1a1c1b]">
                {item.title}
              </span>
              <span className="max-w-[270px] font-jp text-xs font-medium leading-4 text-[#5a6053]">
                {item.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
