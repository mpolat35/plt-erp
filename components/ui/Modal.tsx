"use client";

import React from "react";
import { X } from "lucide-react";
import clsx from "clsx";

// ─── Types ───────────────────────────────────────────────────────────────────

type ModalSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

// ─── Modal (overlay + card) ───────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  /** Tailwind z-index class, e.g. "z-50" or "z-[60]" */
  zIndex?: string;
}

function Modal({ open, onClose, children, size = "md", zIndex = "z-50" }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className={clsx(
        "fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4",
        zIndex
      )}
      onClick={onClose}
    >
      <div
        className={clsx(
          "bg-white dark:bg-slate-900 w-full rounded-xl shadow-xl",
          "border border-slate-100 dark:border-slate-800",
          "flex flex-col overflow-hidden",
          "animate-in fade-in zoom-in-95 duration-200",
          sizeClasses[size]
        )}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Modal.Header ─────────────────────────────────────────────────────────────

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  icon: React.ReactNode;
  /** Full bg className(s) for the icon box, e.g. "bg-blue-50 dark:bg-blue-950" */
  iconBg?: string;
}

function ModalHeader({
  title,
  onClose,
  icon,
  iconBg = "bg-blue-50 dark:bg-blue-950",
}: ModalHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
      <div className={clsx("w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0", iconBg)}>
        {icon}
      </div>
      <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex-1">
        {title}
      </h2>
      <button
        onClick={onClose}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Modal.Content ────────────────────────────────────────────────────────────

interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

function ModalContent({ children, className }: ModalContentProps) {
  return (
    <div className={clsx("px-5 pt-7 pb-7", className)}>
      {children}
    </div>
  );
}

// ─── Modal.Footer ─────────────────────────────────────────────────────────────

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={clsx(
        "px-6 py-4 border-t border-slate-100 dark:border-slate-800",
        "bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2 flex-shrink-0",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Modal.Label ─────────────────────────────────────────────────────────────

interface ModalLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

function ModalLabel({ children, required }: ModalLabelProps) {
  return (
    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 pl-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

// ─── Compound export ──────────────────────────────────────────────────────────

Modal.Header  = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer  = ModalFooter;
Modal.Label   = ModalLabel;

export { Modal };
