import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TagSelectorProps = {
  tags: string[];
  tagInput: string;
  isAddingTag: boolean;
  onTagInputChange: (value: string) => void;
  onStartAddTag: () => void;
  onCancelAddTag: () => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
};

export function TagSelector({
  tags,
  tagInput,
  isAddingTag,
  onTagInputChange,
  onStartAddTag,
  onCancelAddTag,
  onAddTag,
  onRemoveTag,
}: TagSelectorProps) {
  return (
    <section className="flex flex-col gap-4 border-t border-[#e4beba4c] pt-6">
      <h2 className="font-manrope text-[10px] font-bold leading-[15px] tracking-[1px] text-[#5a6053]">
        タグ付け
      </h2>
      <div className="flex flex-wrap items-start gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="h-auto gap-2 rounded-xl bg-[#dfe5d4] px-4 py-3 font-jp text-xs font-medium leading-4 tracking-[0.6px] text-[#606659] hover:bg-[#dfe5d4]"
          >
            {tag}
            <button
              type="button"
              aria-label={`${tag} を削除`}
              onClick={() => onRemoveTag(tag)}
              className="inline-flex size-4 items-center justify-center rounded-full hover:bg-[#cfd7c2]"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}

        {isAddingTag ? (
          <div className="flex items-center gap-2">
            <Input
              value={tagInput}
              onChange={(event) => onTagInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onAddTag();
                }
                if (event.key === "Escape") {
                  onCancelAddTag();
                }
              }}
              placeholder="#タグ"
              className="h-10 w-36 rounded-xl border-[#e4beba] bg-white font-jp text-xs shadow-none focus-visible:ring-0"
              autoFocus
            />
            <Button
              type="button"
              className="h-10 rounded-xl bg-[#af111c] px-3 font-jp text-xs text-white hover:bg-[#980f18]"
              onClick={onAddTag}
            >
              追加
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-xl px-2 text-[#8f6f6c] hover:bg-transparent"
              onClick={onCancelAddTag}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="h-auto rounded-xl border-2 border-dashed border-[#e4beba] px-3 py-2 font-manrope text-xs font-bold leading-4 tracking-[0.6px] text-[#8f6f6c] hover:bg-transparent"
            onClick={onStartAddTag}
          >
            <Plus className="mr-2 size-2" />
            タグを追加
          </Button>
        )}
      </div>
    </section>
  );
}
