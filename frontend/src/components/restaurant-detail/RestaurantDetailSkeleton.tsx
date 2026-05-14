function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-[#e8e8e5] ${className}`}
    />
  );
}

export function RestaurantDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[#f9f9f6] pb-12" aria-busy="true">
      <section className="bg-[#eeeeeb]">
        <div className="grid h-[614px] grid-cols-4 grid-rows-2 gap-2 p-2 max-lg:h-[520px] max-md:h-auto max-md:grid-cols-1 max-md:grid-rows-none">
          <SkeletonBlock className="col-span-2 row-span-2 h-full min-h-[360px] max-md:col-span-1" />
          <SkeletonBlock className="h-full min-h-56" />
          <SkeletonBlock className="h-full min-h-56" />
          <SkeletonBlock className="col-span-2 h-full min-h-56 max-md:col-span-1" />
        </div>
      </section>

      <section className="relative z-20 mx-auto mt-[-10px] w-[calc(100%-64px)] max-w-[1280px] rounded-lg border border-[#e4beba1a] bg-white p-10 shadow-[0_20px_25px_-5px_rgba(26,28,27,0.05),0_8px_10px_-6px_rgba(26,28,27,0.05)] max-md:w-[calc(100%-32px)] max-md:p-6">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <SkeletonBlock className="h-4 w-44" />
              <SkeletonBlock className="h-14 w-full max-w-xl" />
              <SkeletonBlock className="h-6 w-72 max-w-full" />
            </div>
            <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="flex items-start">
                  <SkeletonBlock className="size-5 shrink-0" />
                  <div className="min-w-0 flex-1 pl-3">
                    <SkeletonBlock className="h-4 w-28" />
                    <SkeletonBlock className="mt-2 h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SkeletonBlock className="min-h-[280px] max-lg:min-h-[260px]" />
        </div>

        <div className="mt-12 border-t border-[#e4beba1a] pt-10">
          <div className="grid gap-8 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex items-center">
                <SkeletonBlock className="size-12 shrink-0" />
                <div className="flex-1 pl-4">
                  <SkeletonBlock className="h-3 w-28" />
                  <SkeletonBlock className="mt-2 h-5 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
