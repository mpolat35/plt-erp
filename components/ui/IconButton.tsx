"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type IconButtonVariant = "view" | "edit" | "delete" | "ok" | "warning" | "purple";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  icon: ReactNode;
}

/**
 * Reusable Icon Button for table actions
 * Standardized for the admin dashboard's design system.
 */
export function IconButton({ 
  variant = "view", 
  icon, 
  className, 
  ...props 
}: IconButtonProps) {
  
  const variantClass = {
    view:    "iv", // Blue/Slate hover
    edit:    "ie", // Amber/Yellow hover
    delete:  "id", // Red hover
    ok:      "io", // Green hover
    warning: "iw", // Amber hover (same as edit but different semantic)
    purple:  "isy", // Purple hover
  }[variant];

  return (
    <button
      type="button"
      className={clsx("ib", variantClass, className)}
      {...props}
    >
      {icon}
    </button>
  );
}

/**
 * Container for multiple IconButtons (usually in a table row)
 */
export function IconButtonRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("irow", className)}>
      {children}
    </div>
  );
}
