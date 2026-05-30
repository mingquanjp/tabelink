type SectionHeadingProps = {
  children: string;
};

export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h3 className="font-jp text-xs font-medium uppercase leading-4 tracking-[2.4px] text-[#1a1c1b]">
      {children}
    </h3>
  );
}
