type AdminKpiCardProps = {
  title: string;
  value: number;
  status: string;
  progress: number;
  valueTone?: "default" | "danger";
  statusTone?: "positive" | "neutral" | "danger";
  progressTone?: "brand" | "green" | "neutral" | "danger";
};

const statusToneClass = {
  positive: "font-manrope font-normal text-[#3d5f46]",
  neutral: "font-jp font-medium text-[#5a6053]",
  danger: "font-jp font-medium text-[#ba1a1a]",
};

const progressToneClass = {
  brand: "bg-[#af111c]",
  green: "bg-[#3d5f46]",
  neutral: "bg-[#5a6053]",
  danger: "bg-[#ba1a1a]",
};

export function AdminKpiCard({
  title,
  value,
  status,
  progress,
  valueTone = "default",
  statusTone = "neutral",
  progressTone = "brand",
}: AdminKpiCardProps) {
  return (
    <article className="flex min-h-[120px] flex-col rounded-[8px] bg-white p-6">
      <h2 className="font-jp text-[12px] font-medium leading-4 tracking-[1.2px] text-[#5a6053]">
        {title}
      </h2>
      <div className="mt-2 flex min-w-0 items-end gap-2">
        <p
          className={`font-brand text-[30px] font-bold leading-9 tracking-normal ${
            valueTone === "danger" ? "text-[#ba1a1a]" : "text-[#1a1c1b]"
          }`}
        >
          {value.toLocaleString("en-US")}
        </p>
        <span
          className={`mb-[3px] whitespace-nowrap text-[12px] leading-4 tracking-normal ${statusToneClass[statusTone]}`}
        >
          {status}
        </span>
      </div>
      <div
        className={`mt-2 h-1 w-full overflow-hidden rounded-xl ${
          progressTone === "danger" ? "bg-[#ffdad6]" : "bg-[#eeeeeb]"
        }`}
        role="progressbar"
        aria-label={`${title} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className={`h-full ${progressToneClass[progressTone]}`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </article>
  );
}
