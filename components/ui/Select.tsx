import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface SelectOption { label: string; value: string; }

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:    string;
  hint?:     string;
  error?:    string;
  options:   SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, className, id, ...props },
  ref
) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-600 dark:text-slate-300 pl-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            "w-full pl-4 pr-9 py-2 text-sm rounded-md border transition-all appearance-none cursor-pointer",
            "bg-white dark:bg-slate-800",
            "text-slate-700 dark:text-slate-300",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            error
              ? "border-red-300 dark:border-red-700 focus:border-red-400"
              : "border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500",
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
});
