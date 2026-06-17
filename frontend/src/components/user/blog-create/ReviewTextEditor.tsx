import { Bold, Italic, Link2, List } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type ReviewTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const toolbarItems = [
  { label: "太字", icon: Bold },
  { label: "斜体", icon: Italic },
  { label: "リンク", icon: Link2 },
  { label: "リスト", icon: List },
];

export function ReviewTextEditor({ value, onChange }: ReviewTextEditorProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between border-b border-[#e4beba] pb-2">
        <label
          htmlFor="review-body"
          className="font-manrope text-xl font-bold leading-7 tracking-[1px] text-[#5a6053]"
        >
          レビュー本文
        </label>
        <div className="flex items-center gap-3 text-[#5a6053]">
          {toolbarItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                aria-label={item.label}
                className="inline-flex size-6 items-center justify-center rounded-sm transition-colors hover:bg-[#f4f4f1]"
              >
                <Icon className="size-3.5" />
              </button>
            );
          })}
        </div>
      </div>
      <Textarea
        id="review-body"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="料理の魂、食感、店内の雰囲気などを綴ってください"
        className="min-h-[300px] resize-none rounded-none border-[#af111c] bg-transparent px-3 py-2 font-manrope text-[22px] leading-[34px] text-[#1a1c1b] shadow-none placeholder:text-[#8f6f6c4c] focus-visible:border-[#af111c] focus-visible:ring-0"
      />
    </section>
  );
}
