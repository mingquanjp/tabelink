import { ReactNode } from "react";

const imgJapaneseCuisine = "/register/register-hero.png";

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f9f9f6] text-[#020202]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Visual Narrative (Shared) */}
        <section className="relative min-h-[560px] overflow-hidden bg-[#1a1c1b]">
          <div className="absolute inset-0 opacity-60">
            <img
              alt=""
              aria-hidden="true"
              className="absolute -left-[30%] h-full w-[160%] max-w-none object-cover"
              src={imgJapaneseCuisine}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c1b] via-[rgba(26,28,27,0)] to-[rgba(26,28,27,0)] opacity-80" />

          {/* Logo */}
          <div className="absolute left-12 top-10 text-[30px] font-bold tracking-[-1.5px] text-white [font-family:'Plus_Jakarta_Sans',sans-serif]">
            TABELINK
          </div>

          {/* Narrative Text */}
          <div className="relative flex h-full items-end px-8 pb-10 sm:px-12 lg:px-20 lg:pb-20">
            <div className="w-full max-w-[576px]">
              <h1 className="text-[36px] leading-[48px] text-white sm:text-[44px] sm:leading-[56px] lg:text-[48px] lg:leading-[60px] [font-family:'Noto_Sans_JP',sans-serif]">
                <span className="block">日本の伝統的なおもて</span>
                <span className="block">なしと、</span>
                <span className="block">ハノイの活気ある美食</span>
                <span className="block">の魂を繋ぐ。</span>
              </h1>
              <div className="mt-8 flex items-center gap-2">
                <span className="h-1 w-12 rounded-full bg-[#af111c]" />
                <span className="h-1 w-2 rounded-full bg-white/30" />
                <span className="h-1 w-2 rounded-full bg-white/30" />
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Content Area (Dynamic) */}
        <section className="flex items-center justify-center px-8 py-12 sm:px-12 lg:px-24">
          <div className="w-full max-w-[448px]">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
