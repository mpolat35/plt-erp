import { type ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children:   ReactNode;
  className?: string;
  padding?:   "none" | "sm" | "md" | "lg";
}

interface CardHeaderProps {
  title:       string;
  subtitle?:   string;
  action?:     ReactNode;
  className?:  string;
}

interface CardBodyProps {
  children:   ReactNode;
  className?: string;
}

interface CardFooterProps {
  children:   ReactNode;
  className?: string;
}

const paddingClasses = {
  none: "",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6",
};

export function Card({ children, className, padding = "none" }: CardProps) {
  return (
    <div className={clsx(
      "bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800",
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={clsx("flex items-start justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800", className)}>
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={clsx("px-5 py-4", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={clsx("px-5 py-4 border-t border-slate-100 dark:border-slate-800", className)}>
      {children}
    </div>
  );
}
