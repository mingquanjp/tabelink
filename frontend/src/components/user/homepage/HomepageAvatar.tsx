type HomepageAvatarProps = {
  initials: string;
  size?: "default" | "sm";
};

export function HomepageAvatar({
  initials,
  size = "default",
}: HomepageAvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#dfe5d4] font-manrope font-bold text-[#5a6053] ${
        size === "sm" ? "size-8 text-[11px]" : "size-11 text-[13px]"
      }`}
    >
      {initials}
    </span>
  );
}
