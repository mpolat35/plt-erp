import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:      string;
  hint?:       string;
  error?:      string;
  iconLeft?:   ReactNode;
  iconRight?:  ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, iconLeft, iconRight, className, id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-600 dark:text-slate-300 pl-1">
          {label}
        </label>
      )}
      <div className="relative">
        {iconLeft && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            {iconLeft}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full py-2 text-sm rounded-md border transition-all",
            "bg-white dark:bg-slate-800",
            "text-slate-800 dark:text-slate-200",
            "placeholder-slate-400 dark:placeholder-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            error
              ? "border-red-300 dark:border-red-700 focus:border-red-400"
              : "border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500",
            iconLeft  ? "pl-9"  : "pl-4",
            iconRight ? "pr-9"  : "pr-4",
            className
          )}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {iconRight}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
});
