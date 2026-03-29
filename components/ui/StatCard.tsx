import { type ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import clsx from "clsx";

export type StatColor = "blue" | "violet" | "emerald" | "amber" | "red" | "slate";

interface StatCardProps {
  title:      string;
  value:      string;
  icon:       LucideIcon;
  color?:     StatColor;
  change?:    string;
  trend?:     "up" | "down" | "neutral";
  trendLabel?: string;
}

const colorClasses: Record<StatColor, string> = {
  blue:    "bg-blue-50    text-blue-600    dark:bg-blue-950    dark:text-blue-400",
  violet:  "bg-violet-50  text-violet-600  dark:bg-violet-950  dark:text-violet-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  amber:   "bg-amber-50   text-amber-600   dark:bg-amber-950   dark:text-amber-400",
  red:     "bg-red-50     text-red-500     dark:bg-red-950     dark:text-red-400",
  slate:   "bg-slate-100  text-slate-600   dark:bg-slate-800   dark:text-slate-400",
};

export function StatCard({ title, value, icon: Icon, color = "blue", change, trend, trendLabel }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={clsx("w-10 h-10 rounded-md flex items-center justify-center", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{title}</div>
        {(change || trendLabel) && (
          <div className="flex items-center gap-1 mt-2">
            {trend === "up"   && <ArrowUpRight   className="w-3.5 h-3.5 text-emerald-500" />}
            {trend === "down" && <ArrowDownRight  className="w-3.5 h-3.5 text-red-400"     />}
            {change && (
              <span className={clsx("text-xs font-medium",
                trend === "up"   ? "text-emerald-600 dark:text-emerald-400" :
                trend === "down" ? "text-red-500 dark:text-red-400"         : "text-slate-500 dark:text-slate-400"
              )}>
                {change}
              </span>
            )}
            {trendLabel && <span className="text-xs text-slate-400 dark:text-slate-500">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
