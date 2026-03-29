import { type TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?:  string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id, ...props },
  ref
) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 pl-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={clsx(
          "w-full px-4 py-2 text-sm rounded-md border transition-all resize-y min-h-[80px]",
          "bg-white dark:bg-slate-800",
          "text-slate-800 dark:text-slate-200",
          "placeholder-slate-400 dark:placeholder-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          error
            ? "border-red-300 dark:border-red-700 focus:border-red-400"
            : "border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 dark:text-red-400 pl-1">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400 dark:text-slate-500 pl-1">{hint}</p>}
    </div>
  );
});
