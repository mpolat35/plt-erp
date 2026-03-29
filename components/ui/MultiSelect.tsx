"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X, Search } from "lucide-react";
import clsx from "clsx";

export interface MultiSelectOption {
  value:        string;
  label:        string;
  description?: string;
}

interface MultiSelectProps {
  options:       MultiSelectOption[];
  value?:        string[];
  onChange?:     (values: string[]) => void;
  placeholder?:  string;
  label?:        string;
  hint?:         string;
  error?:        string;
  searchable?:   boolean;
  maxDisplay?:   number;
  compact?:      boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Seçiniz...",
  label,
  hint,
  error,
  searchable = true,
  maxDisplay = 2,
  compact = false,
}: MultiSelectProps) {
  const [open, setOpen]         = useState(false);
  const [search, setSearch]     = useState("");
  const [internal, setInternal] = useState<string[]>([]);
  const containerRef            = useRef<HTMLDivElement>(null);

  const selected    = value ?? internal;
  const setSelected = (next: string[]) => { setInternal(next); onChange?.(next); };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered     = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    o.description?.toLowerCase().includes(search.toLowerCase())
  );
  const allSelected  = selected.length === options.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleAll = () => setSelected(allSelected ? [] : options.map((o) => o.value));
  const toggle    = (val: string) =>
    setSelected(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
  const remove    = (val: string, e: React.MouseEvent) => { e.stopPropagation(); setSelected(selected.filter((v) => v !== val)); };

  const selectedLabels = options.filter((o) => selected.includes(o.value));

  return (
    <div className="relative space-y-1" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 pl-1">{label}</label>
      )}

      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        className={clsx(
          "relative w-full flex items-center gap-1.5 flex-wrap cursor-pointer rounded-md border transition-all",
          compact ? "min-h-[30px] px-2.5 py-1" : "min-h-[38px] px-3 py-1.5",
          "bg-white dark:bg-slate-800",
          open
            ? "border-blue-400 ring-2 ring-blue-500/20 dark:border-blue-500"
            : error
            ? "border-red-300 dark:border-red-700"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        )}
      >
        {selectedLabels.length === 0 ? (
          <span className={clsx("text-slate-400 dark:text-slate-500 flex-1", compact ? "text-xs" : "text-sm")}>{placeholder}</span>
        ) : selectedLabels.length <= maxDisplay ? (
          selectedLabels.map((o) => (
            <span key={o.value} className={clsx("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium rounded-md", compact ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5")}>
              {o.label}
              <button onClick={(e) => remove(o.value, e)} className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors">
                <X className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
              </button>
            </span>
          ))
        ) : (
          <>
            {selectedLabels.slice(0, maxDisplay).map((o) => (
              <span key={o.value} className={clsx("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium rounded-md", compact ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5")}>
                {o.label}
                <button onClick={(e) => remove(o.value, e)} className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors">
                  <X className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
                </button>
              </span>
            ))}
            <span className={clsx("bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-md", compact ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5")}>
              +{selectedLabels.length - maxDisplay} daha
            </span>
          </>
        )}
        <ChevronDown className={clsx(
          "text-slate-400 dark:text-slate-500 ml-auto flex-shrink-0 transition-transform duration-200",
          compact ? "w-3 h-3" : "w-4 h-4",
          open && "rotate-180"
        )} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg shadow-slate-900/10 dark:shadow-slate-950/40 overflow-hidden">

          {/* Arama */}
          {searchable && (
            <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ara..."
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Tümünü Seç */}
          {!search && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleAll(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
            >
              <div className={clsx(
                "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                allSelected
                  ? "bg-blue-600 border-blue-600"
                  : someSelected
                  ? "bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-500"
                  : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              )}>
                {allSelected  && <Check className="w-2.5 h-2.5 text-white" />}
                {someSelected && <div className="w-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tümünü Seç</span>
              {selected.length > 0 && (
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{selected.length}/{options.length}</span>
              )}
            </button>
          )}

          {/* Seçenekler */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">Sonuç bulunamadı</div>
            ) : (
              filtered.map((option) => {
                const isChecked = selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={(e) => { e.stopPropagation(); toggle(option.value); }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      isChecked ? "bg-blue-50/60 dark:bg-blue-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className={clsx(
                      "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                      isChecked
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    )}>
                      {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={clsx("text-sm font-medium truncate",
                        isChecked ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300"
                      )}>
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{option.description}</div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {selected.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400 dark:text-slate-500">{selected.length} seçili</span>
              <button
                onClick={(e) => { e.stopPropagation(); setSelected([]); }}
                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
              >
                Temizle
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}
