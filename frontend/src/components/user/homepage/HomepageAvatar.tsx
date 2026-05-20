type HomepageAvatarProps = {
  avatarUrl?: string | null;
  initials: string;
  size?: "default" | "sm";
};

export function HomepageAvatar({
  avatarUrl,
  initials,
  size = "default",
}: HomepageAvatarProps) {
  const hasAvatar = Boolean(avatarUrl);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#dfe5d4] font-manrope font-bold text-[#5a6053] ${
        size === "sm" ? "size-8 text-[11px]" : "size-11 text-[13px]"
      } ${hasAvatar ? "bg-cover bg-center text-transparent" : ""}`}
      style={
        hasAvatar
          ? {
              backgroundImage: `url(${avatarUrl})`,
            }
          : undefined
      }
    >
      {initials}
    </span>
  );
}
