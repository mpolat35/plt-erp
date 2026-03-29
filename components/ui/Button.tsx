import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline" | "soft";
export type ButtonSize    = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children:  ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 hover:shadow-blue-600/30 border border-blue-600 hover:border-blue-700",
  secondary: "bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-600/20 border border-violet-600 hover:border-violet-700",
  success:   "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 border border-emerald-600 hover:border-emerald-700",
  danger:    "bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20 border border-red-500 hover:border-red-600",
  outline:   "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 dark:bg-transparent dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:border-slate-600",
  ghost:     "bg-transparent hover:bg-slate-100 text-slate-600 border border-transparent hover:border-transparent dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
  soft:      "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 hover:border-blue-300 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900 dark:hover:bg-blue-900/60",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1.5 text-xs rounded-md  gap-1.5",
  sm: "px-3   py-2   text-xs rounded-md  gap-2",
  md: "px-4   py-2.5 text-sm rounded-md  gap-2",
  lg: "px-5   py-3   text-sm rounded-md  gap-2.5",
};

export function Button({
  variant  = "primary",
  size     = "md",
  loading  = false,
  iconLeft,
  iconRight,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center font-medium transition-all",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : (
        iconLeft && <span className="flex-shrink-0">{iconLeft}</span>
      )}
      {children}
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
}
