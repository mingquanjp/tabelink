import { ChevronLeft, ChevronRight } from "lucide-react";

type AdminPaginationProps = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
};

type PageItem = number | "...";

function getVisiblePages(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  if (page >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", page - 1, page, page + 1, "...", totalPages];
}

export function AdminPagination({
  page,
  limit,
  total,
  totalPages,
  itemLabel = "アカウント",
  onPageChange,
}: AdminPaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);
  const from = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const to = Math.min(safePage * limit, total);
  const visiblePages = getVisiblePages(safePage, safeTotalPages);
  const handlePageChange = (nextPage: number) => {
    onPageChange(Math.min(Math.max(nextPage, 1), safeTotalPages));
  };

  return (
    <footer className="flex flex-col gap-3 border-t border-[#e4beba1a] bg-[#f4f4f1] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-jp text-[12px] font-medium leading-4 text-[#5a6053]">
        {total.toLocaleString("en-US")}の{itemLabel}中 {from}-{to}を表示中
      </p>
      <nav className="flex items-center" aria-label="Pagination">
        <button
          type="button"
          onClick={() => handlePageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="inline-flex size-8 items-center justify-center text-[#43493d] transition hover:text-[#af111c] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" strokeWidth={2} />
        </button>
        {visiblePages.map((visiblePage, index) =>
          visiblePage === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="ml-2 inline-flex h-8 items-center px-2 font-manrope text-[16px] font-normal leading-6 text-[#5a6053]"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <div key={visiblePage} className="flex h-8 w-10 pl-2">
              <button
                type="button"
                onClick={() => handlePageChange(visiblePage)}
                className={`inline-flex size-8 items-center justify-center rounded-[4px] font-manrope text-[12px] leading-4 transition ${
                  visiblePage === safePage
                    ? "bg-[#af111c] font-bold text-white"
                    : "font-medium text-[#1a1c1b] hover:bg-white hover:text-[#af111c]"
                }`}
                aria-current={visiblePage === safePage ? "page" : undefined}
                aria-label={`Page ${visiblePage}`}
              >
                {visiblePage}
              </button>
            </div>
          ),
        )}
        <button
          type="button"
          onClick={() => handlePageChange(safePage + 1)}
          disabled={safePage >= safeTotalPages}
          className="ml-2 inline-flex size-8 items-center justify-center text-[#43493d] transition hover:text-[#af111c] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" strokeWidth={2} />
        </button>
      </nav>
    </footer>
  );
}
