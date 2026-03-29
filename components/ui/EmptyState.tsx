import { type ReactNode, type ElementType } from "react";
import clsx from "clsx";

interface EmptyStateProps {
  icon:        ElementType;
  title:       string;
  description?: string;
  action?:     ReactNode;
  className?:  string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx("flex flex-col items-center justify-center py-16 px-8 text-center", className)}>
      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
