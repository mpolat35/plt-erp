import { type ReactNode } from "react";
import clsx from "clsx";

export type BadgeVariant = "blue" | "violet" | "emerald" | "amber" | "red" | "slate";
export type BadgeSize    = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?:    BadgeSize;
  dot?:     boolean;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  blue:    "bg-blue-50    text-blue-700    dark:bg-blue-950    dark:text-blue-400",
  violet:  "bg-violet-50  text-violet-700  dark:bg-violet-950  dark:text-violet-400",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  amber:   "bg-amber-50   text-amber-700   dark:bg-amber-950   dark:text-amber-400",
  red:     "bg-red-50     text-red-600     dark:bg-red-950     dark:text-red-400",
  slate:   "bg-slate-100  text-slate-600   dark:bg-slate-800   dark:text-slate-400",
};

const dotClasses: Record<BadgeVariant, string> = {
  blue:    "bg-blue-500",
  violet:  "bg-violet-500",
  emerald: "bg-emerald-500",
  amber:   "bg-amber-500",
  red:     "bg-red-500",
  slate:   "bg-slate-400",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2   py-0.5 text-xs rounded-md  gap-1.5",
  md: "px-2.5 py-1   text-xs rounded-lg  gap-1.5",
};

export function Badge({ variant = "slate", size = "md", dot = false, children, className }: BadgeProps) {
  return (
    <span className={clsx("inline-flex items-center font-medium", variantClasses[variant], sizeClasses[size], className)}>
      {dot && <span className={clsx("w-1.5 h-1.5 rounded-full flex-shrink-0", dotClasses[variant])} />}
      {children}
    </span>
  );
}
