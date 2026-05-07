import heroImage from "@/public/japanese-cuisine.png";

export function HeroPanel() {
  return (
    <section className="relative flex min-h-105 items-end justify-start overflow-hidden bg-(--ink-900) lg:min-h-screen">
      <div className="absolute inset-0 opacity-60">
        <img
          src={heroImage.src}
          alt="japanese cuisine"
          className="absolute left-[-30%] top-0 h-full w-[160%] max-w-none object-cover"          
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-(--ink-900) via-(--ink-900)/0 to-transparent opacity-80" />
      <div className="absolute left-10 top-10 text-[28px] font-bold tracking-[-0.06em] text-white sm:left-12 sm:top-12 font-brand">
        TABELINK
      </div>
      <div className="relative z-10 w-full p-8 sm:p-16 lg:p-20">
        <h1 className="text-3xl font-medium leading-[1.2] tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
          <span className="block">日本の伝統的なおもて</span>
          <span className="block">なしと、</span>
          <span className="block">ハノイの活気ある美食</span>
          <span className="block">の魂を繋ぐ。</span>
        </h1>
        <div className="mt-8 flex gap-2">
          <span className="h-1 w-12 rounded-full bg-primary" />
          <span className="h-1 w-2 rounded-full bg-white/30" />
          <span className="h-1 w-2 rounded-full bg-white/30" />
        </div>
      </div>
    </section>
  );
}
