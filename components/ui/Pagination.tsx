"use client";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react";
import clsx from "clsx";

interface PaginationProps {
  page:        number;
  totalPages:  number;
  totalItems:  number;
  perPage:     number;
  onChange:    (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  perPage,
  onChange,
  onPerPageChange,
  perPageOptions = [10, 20, 50, 100],
}: PaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, totalItems);

  // Gösterilecek sayfa numaraları — ortada aktif sayfa, etrafında max 2 komşu
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | "...")[] = [];
    const left  = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800">

      {/* Sol: kayıt bilgisi + sayfa başı seçici */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
          {from}–{to} / <span className="font-medium text-slate-600 dark:text-slate-400">{totalItems}</span> kayıt
        </span>

        {onPerPageChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">Sayfa başı:</span>
            <div className="relative">
              <select
                value={perPage}
                onChange={(e) => { onPerPageChange(Number(e.target.value)); onChange(1); }}
                className="text-xs border border-slate-200 dark:border-slate-700 rounded-md pl-2 pr-7 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 cursor-pointer transition-all appearance-none"
              >
                {perPageOptions.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Sağ: navigasyon butonları */}
      <div className="flex items-center gap-1">

        {/* İlk sayfaya git */}
        <NavButton onClick={() => onChange(1)} disabled={page === 1} title="İlk sayfa">
          <ChevronsLeft className="w-3.5 h-3.5" />
        </NavButton>

        {/* Önceki */}
        <NavButton onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} title="Önceki">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">Önceki</span>
        </NavButton>

        {/* Sayfa numaraları */}
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                ···
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p as number)}
                className={clsx(
                  "w-8 h-8 rounded-full text-xs font-medium transition-all border",
                  p === page
                    ? "bg-blue-50 text-blue-600 border-blue-400 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-600"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:bg-transparent dark:text-slate-400 dark:border-slate-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 dark:hover:border-blue-700"
                )}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Sonraki */}
        <NavButton onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} title="Sonraki">
          <span className="hidden sm:inline text-xs">Sonraki</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </NavButton>

        {/* Son sayfaya git */}
        <NavButton onClick={() => onChange(totalPages)} disabled={page === totalPages} title="Son sayfa">
          <ChevronsRight className="w-3.5 h-3.5" />
        </NavButton>

      </div>
    </div>
  );
}

// ── Küçük yardımcı nav butonu ───────────────────────────────────────────
function NavButton({
  children, onClick, disabled, title,
}: {
  children: React.ReactNode;
  onClick:  () => void;
  disabled: boolean;
  title:    string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 px-2 flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700
                 bg-white dark:bg-transparent
                 text-slate-500 dark:text-slate-400
                 hover:bg-blue-50 dark:hover:bg-blue-950/40
                 hover:border-blue-300 dark:hover:border-blue-700
                 hover:text-blue-600 dark:hover:text-blue-400
                 disabled:opacity-40 disabled:cursor-not-allowed
                 transition-all"
    >
      {children}
    </button>
  );
}
