import { type ReactNode } from "react";
import clsx from "clsx";

interface TableProps      { children: ReactNode; className?: string; }
interface ThProps         { children: ReactNode; className?: string; onClick?: () => void; align?: "left"|"center"|"right"; }
interface TdProps         { children: ReactNode; className?: string; align?: "left"|"center"|"right"; colSpan?: number; }
interface TrProps         { children: ReactNode; className?: string; selected?: boolean; onClick?: () => void; }

const alignClasses = { left: "text-left", center: "text-center", right: "text-right" };

export function Table({ children, className }: TableProps) {
  return (
    <div className={clsx("overflow-x-auto", className)}>
      <table className="w-full">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-50 dark:bg-slate-800/40">{children}</thead>;
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[#e8edf2] dark:divide-slate-700">{children}</tbody>;
}

export function Th({ children, className, onClick, align = "left" }: ThProps) {
  return (
    <th className={clsx(
      "px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800",
      alignClasses[align],
      onClick && "cursor-pointer hover:text-slate-700 dark:hover:text-slate-200",
      className
    )} onClick={onClick}>
      {children}
    </th>
  );
}

export function Td({ children, className, align = "left", colSpan }: TdProps) {
  return (
    <td colSpan={colSpan} className={clsx("px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400", alignClasses[align], className)}>
      {children}
    </td>
  );
}

export function Tr({ children, className, selected, onClick }: TrProps) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        "transition-colors group",
        selected ? "bg-blue-50/60 dark:bg-blue-950/30" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/50",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </tr>
  );
}
