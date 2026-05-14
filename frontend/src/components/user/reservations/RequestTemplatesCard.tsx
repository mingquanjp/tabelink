import { Check, Sparkles } from "lucide-react";
import { requestTemplates, type RequestTemplateId } from "./booking-data";

type RequestTemplatesCardProps = {
  selectedRequestIds: RequestTemplateId[];
  onToggleRequest: (id: RequestTemplateId) => void;
};

export function RequestTemplatesCard({
  selectedRequestIds,
  onToggleRequest,
}: RequestTemplatesCardProps) {
  const selectedRequestSet = new Set(selectedRequestIds);

  return (
    <section
      aria-labelledby="request-title"
      className="rounded-lg border border-[#e4beba1a] bg-white p-8 shadow-[0_1px_1px_rgba(0,0,0,0.05)] max-sm:p-5"
    >
      <div className="mb-6 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkles className="size-[22px] text-[#af111c]" />
          <h3
            id="request-title"
            className="font-jp text-xl font-medium leading-7 text-[#1a1c1b]"
          >
            ご要望（テンプレート）
          </h3>
        </div>
        <p className="font-jp text-sm font-medium leading-5 text-[#5a6053]">
          ご希望の項目を選択してください。スタッフに正確に伝わります。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {requestTemplates.map((request) => {
          const checked = selectedRequestSet.has(request.id);

          return (
            <button
              key={request.id}
              type="button"
              aria-pressed={checked}
              onClick={() => onToggleRequest(request.id)}
              className={`relative min-h-[124px] rounded-lg border-2 p-[18px] pr-12 text-left transition-colors ${
                checked
                  ? "border-[#af111c] bg-[#fff8f8]"
                  : "border-transparent bg-[#f9f9f6] hover:border-[#e4beba66]"
              }`}
            >
              <span
                className={`absolute right-4 top-4 flex size-4 items-center justify-center rounded-sm border ${
                  checked
                    ? "border-[#af111c] bg-[#af111c] text-white"
                    : "border-[#6b7280] bg-white text-transparent"
                }`}
              >
                <Check className="size-3" />
              </span>
              <span className="block font-jp text-lg font-medium leading-7 text-[#1a1c1b]">
                {request.title}
              </span>
              <span className="mt-3 block font-jp text-xs font-medium leading-[15px] text-[#5a6053]">
                {request.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 border-t border-[#eeeeeb] pt-8">
        <label
          htmlFor="other-request"
          className="mb-3 block font-jp text-[14px] font-medium uppercase leading-5 tracking-[0.7px] text-[#5b403d]"
        >
          その他のご要望
        </label>
        <textarea
          id="other-request"
          defaultValue="その他、スタッフに伝えたいことがあればご記入ください。"
          className="min-h-24 w-full resize-none rounded border-0 bg-[#f4f4f1] p-4 font-jp text-base font-medium leading-6 text-[#6b7280] outline-none focus:ring-2 focus:ring-[#af111c]/20"
        />
      </div>
    </section>
  );
}
