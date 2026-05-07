import Link from "next/link";

const imgJapaneseCuisine = "/register/register-hero.png";
const imgStepCheck = "/register/step-check.png";
const imgStepAccount = "/register/step-account.png";
const imgSelectArrow = "/register/select-arrow.png";
const imgButtonArrow = "/register/button-arrow.png";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f9f9f6] text-[#020202]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
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

          <div className="absolute left-12 top-10 text-[30px] font-bold tracking-[-1.5px] text-white [font-family:'Plus_Jakarta_Sans',sans-serif]">
            TABELINK
          </div>

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

        <section className="flex items-center justify-center px-8 py-12 sm:px-12 lg:px-24">
          <div className="w-full max-w-[448px]">
            <div className="space-y-2">
              <h2 className="text-[36px] font-medium tracking-[-0.9px] text-[#af111c] [font-family:'Noto_Sans_JP',sans-serif]">
                新規登録
              </h2>
              <p className="text-[16px] font-medium text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
                美食のコミュニティへようこそ。あなたのアカウントを作成
                しましょう。
              </p>
            </div>

            <div className="mt-10 flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div className="relative flex size-10 items-center justify-center rounded-xl border-2 border-[#af111c] bg-[#af111c]">
                  <div className="absolute inset-0 rounded-xl shadow-[0px_10px_15px_-3px_rgba(175,17,28,0.2),0px_4px_6px_-4px_rgba(175,17,28,0.2)]" />
                  <img alt="" aria-hidden="true" className="h-[10px]" src={imgStepCheck} />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-[1px] text-[#af111c] [font-family:'Noto_Sans_JP',sans-serif]">
                  登録
                </span>
              </div>

              <div className="mx-4 h-px flex-1 bg-[#e4beba]">
                <div className="h-px w-full bg-[#af111c]" />
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="relative flex size-10 items-center justify-center rounded-xl  border-[#af111c] bg-[#af111c]">
                  <div className="absolute inset-0 rounded-xl bg-white shadow-[0px_10px_15px_-3px_rgba(175,17,28,0.2),0px_4px_6px_-4px_rgba(175,17,28,0.2)]" />
                  <img
                    alt=""
                    aria-hidden="true"
                    className="relative z-10 h-5"
                    src={imgStepAccount}
                  />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-[1px] text-[#af111c] [font-family:'Noto_Sans_JP',sans-serif]">
                  アカウント
                </span>
              </div>
            </div>

            <form className="mt-10 space-y-6">
              <label className="block">
                <span className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
                  お名前（フルネーム）
                </span>
                <input
                  className="mt-2 w-full rounded bg-[#f4f4f1] px-4 py-4 text-[16px] font-medium text-[#1a1c1b] placeholder:text-[rgba(90,96,83,0.5)] focus:outline-none focus:ring-2 focus:ring-[#af111c]/30 [font-family:'Noto_Sans_JP',sans-serif]"
                  placeholder="例：佐藤 拓海"
                  type="text"
                />
              </label>

              <label className="block">
                <span className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
                  ご利用目的
                </span>
                <div className="relative mt-2">
                  <select
                    className="w-full appearance-none rounded bg-[#f4f4f1] px-4 py-4 pr-12 text-[16px] font-medium text-[#1a1c1b] focus:outline-none focus:ring-2 focus:ring-[#af111c]/30 [font-family:'Noto_Sans_JP',sans-serif]"
                    defaultValue="diner"
                  >
                    <option value="diner">一般利用者（ダイナー）</option>
                    <option value="store">加盟店</option>
                  </select>
                  <img
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-1/2 h-[7px] w-[12px] -translate-y-1/2"
                    src={imgSelectArrow}
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#5a6053] [font-family:'Noto_Sans_JP',sans-serif]">
                  メールアドレス
                </span>
                <input
                  className="mt-2 w-full rounded bg-[#f4f4f1] px-4 py-4 text-[16px] font-medium text-[#1a1c1b] placeholder:text-[rgba(90,96,83,0.5)] focus:outline-none focus:ring-2 focus:ring-[#af111c]/30 [font-family:'Manrope',sans-serif]"
                  placeholder="name@example.com"
                  type="email"
                />
              </label>

              <Link
                className="relative mt-2 flex w-full items-center justify-center gap-3 rounded bg-[linear-gradient(171.87deg,#af111c_0%,#d32f31_100%)] py-5 text-[16px] font-medium text-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] [font-family:'Noto_Sans_JP',sans-serif]"
                href="/register/customer"
              >
                次に進む
                <img alt="" aria-hidden="true" className="size-4" src={imgButtonArrow} />
              </Link>

              <div className="pt-4 text-center text-[14px] font-medium [font-family:'Noto_Sans_JP',sans-serif]">
                <span className="text-[#5a6053]">すでにアカウントをお持ちですか？ </span>
                <a className="text-[#af111c]" href="/login">
                  ログイン
                </a>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
