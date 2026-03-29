"use client";
import { useState } from "react";
import clsx from "clsx";

interface ToggleProps {
  defaultChecked?: boolean;
  checked?:        boolean;
  onChange?:       (val: boolean) => void;
  label?:          string;
  hint?:           string;
  disabled?:       boolean;
  size?:           "sm" | "md";
}

export function Toggle({ defaultChecked, checked, onChange, label, hint, disabled, size = "md" }: ToggleProps) {
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const isOn = checked !== undefined ? checked : internal;

  const handleClick = () => {
    if (disabled) return;
    const next = !isOn;
    setInternal(next);
    onChange?.(next);
  };

  const trackSize = size === "sm" ? "w-8 h-4" : "w-11 h-6";
  const thumbSize = size === "sm" ? "w-3 h-3"  : "w-4 h-4";
  const thumbTranslate = size === "sm"
    ? (isOn ? "translate-x-4" : "translate-x-0.5")
    : (isOn ? "translate-x-6" : "translate-x-1");

  return (
    <button type="button" role="switch" aria-checked={isOn} onClick={handleClick}
      className={clsx("inline-flex items-center gap-3 focus:outline-none", disabled && "opacity-50 cursor-not-allowed")}>
      <span className={clsx(
        "relative inline-flex items-center rounded-full transition-colors duration-200 flex-shrink-0",
        trackSize,
        isOn ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
      )}>
        <span className={clsx(
          "inline-block rounded-full bg-white shadow-sm transition-transform duration-200",
          thumbSize, thumbTranslate
        )} />
      </span>
      {(label || hint) && (
        <span className="text-left">
          {label && <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
          {hint  && <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">{hint}</span>}
        </span>
      )}
    </button>
  );
}
