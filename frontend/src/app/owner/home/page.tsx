import Link from "next/link";

export default function OwnerHomePage() {
  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-10">
      <section className="flex flex-col gap-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#af111c]">
          Owner home
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1c1b]">
          Restaurant owner homepage
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-[#5a6053]">
          This route is ready for the linked restaurant owner flow. Replace this
          placeholder when the owner homepage UI is designed.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          className="rounded bg-[#af111c] px-4 py-2 text-sm font-medium text-white hover:bg-[#910e17]"
          href="/owner/dashboard"
        >
          Go to dashboard
        </Link>
        <Link
          className="rounded border border-[#e4beba] px-4 py-2 text-sm font-medium text-[#af111c] hover:bg-[#af111c]/5"
          href="/owner/menu"
        >
          Go to menu
        </Link>
      </div>
    </main>
  );
}
