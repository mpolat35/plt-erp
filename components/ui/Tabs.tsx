"use client";
import { useState, type ReactNode } from "react";
import clsx from "clsx";

export interface TabItem {
  key:       string;
  label:     ReactNode;
  icon?:     ReactNode;
  badge?:    string | number;
  disabled?: boolean;
  content:   ReactNode;
}

interface TabsProps {
  items:        TabItem[];
  defaultKey?:  string;
  activeKey?:   string;
  onChange?:    (key: string) => void;
  orientation?: "horizontal" | "vertical";
  variant?:     "default" | "filled" | "pills";
  className?:   string;
}

export function Tabs({
  items,
  defaultKey,
  activeKey,
  onChange,
  orientation = "horizontal",
  variant = "filled",
  className,
}: TabsProps) {
  const [internal, setInternal] = useState<string>(defaultKey ?? items[0]?.key ?? "");
  const active     = activeKey ?? internal;
  const activeItem = items.find((i) => i.key === active);
  const isVertical = orientation === "vertical";

  const handleChange = (key: string) => {
    setInternal(key);
    onChange?.(key);
  };

  // ── Tab listesi wrapper ────────────────────────────────────────────────
  const listClass = clsx(
    isVertical ? "flex flex-col flex-shrink-0 w-56" : "flex flex-row",
    variant === "filled"
      ? clsx("bg-slate-100 dark:bg-slate-800/60 rounded-md p-1.5", isVertical ? "gap-0.5" : "gap-1")
      : variant === "pills"
      ? "gap-1"
      : isVertical
      ? "border-r border-slate-100 dark:border-slate-800"
      : "border-b border-slate-100 dark:border-slate-800"
  );

  // ── Tek tab butonu class ───────────────────────────────────────────────
  const getTabClass = (item: TabItem) => {
    const isActive   = item.key === active;
    const isDisabled = !!item.disabled;

    const base = clsx(
      "flex items-center gap-1.5 text-xs md:text-sm font-medium transition-all focus:outline-none select-none",
      isVertical ? "w-full px-3 py-2 md:py-2.5 justify-start rounded-lg" : "px-3 md:px-4 py-2 md:py-2.5 whitespace-nowrap",
      isDisabled && "opacity-40 cursor-not-allowed pointer-events-none"
    );

    if (variant === "default") {
      return clsx(base,
        isVertical
          ? clsx("border-r-2 rounded-r-none -mr-px",
              isActive
                ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )
          : clsx("border-b-2 -mb-px rounded-none",
              isActive
                ? "border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )
      );
    }

    if (variant === "filled") {
      return clsx(base, "rounded-lg",
        isActive
          ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/40"
      );
    }

    if (variant === "pills") {
      return clsx(base, "rounded-full px-4",
        isActive
          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
      );
    }

    return base;
  };

  return (
    <div className={clsx("flex", isVertical ? "flex-row gap-0" : "flex-col", className)}>

      {/* Tab Listesi */}
      <div className={listClass}>
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              disabled={!!item.disabled}
              onClick={() => !item.disabled && handleChange(item.key)}
              className={getTabClass(item)}
            >
              {item.icon && (
                <span className={clsx(
                  "flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4",
                  isActive
                    ? variant === "pills" ? "text-white" : "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500"
                )}>
                  {item.icon}
                </span>
              )}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && (
                <span className={clsx(
                  "flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium",
                  isActive
                    ? variant === "pills"
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab İçeriği */}
      <div className={clsx(
        "flex-1 min-w-0 flex flex-col min-h-0",
        isVertical ? "pl-5" : "pt-4"
      )}>
        {activeItem?.content}
      </div>

    </div>
  );
}
