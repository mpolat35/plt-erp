import React from "react";
import clsx from "clsx";

interface PageProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
}

export function Page({ children, className, action }: PageProps) {
  return (
    <div className={clsx("bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 min-h-[calc(100vh-theme(spacing.16)-2rem)] flex flex-col", className)}>
      {/* Aksiyon alanı (varsa) */}
      {action && (
        <div className="flex items-center justify-end p-4 border-b border-slate-100 dark:border-slate-800">
          {action}
        </div>
      )}
      
      {/* İçerik */}
      <div className="p-3 md:p-6 flex-1">
        {children}
      </div>
    </div>
  );
}
