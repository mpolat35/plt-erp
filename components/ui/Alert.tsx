import { type ReactNode } from "react";
import { Info, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";
import clsx from "clsx";

export type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?:   AlertVariant;
  title?:     string;
  children:   ReactNode;
  onClose?:   () => void;
  className?: string;
}

const config: Record<AlertVariant, {
  wrapper: string; icon: typeof Info; iconClass: string;
}> = {
  info:    { wrapper: "bg-blue-50    border-blue-200    dark:bg-blue-950/40    dark:border-blue-800",    icon: Info,          iconClass: "text-blue-500    dark:text-blue-400"    },
  success: { wrapper: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800", icon: CheckCircle,   iconClass: "text-emerald-500 dark:text-emerald-400" },
  warning: { wrapper: "bg-amber-50   border-amber-200   dark:bg-amber-950/40   dark:border-amber-800",   icon: AlertTriangle, iconClass: "text-amber-500   dark:text-amber-400"   },
  error:   { wrapper: "bg-red-50     border-red-200     dark:bg-red-950/40     dark:border-red-800",     icon: XCircle,       iconClass: "text-red-500     dark:text-red-400"     },
};

const textConfig: Record<AlertVariant, string> = {
  info:    "text-blue-800    dark:text-blue-300",
  success: "text-emerald-800 dark:text-emerald-300",
  warning: "text-amber-800   dark:text-amber-300",
  error:   "text-red-800     dark:text-red-300",
};

export function Alert({ variant = "info", title, children, onClose, className }: AlertProps) {
  const { wrapper, icon: Icon, iconClass } = config[variant];
  return (
    <div className={clsx("flex gap-3 p-4 rounded-md border", wrapper, className)}>
      <Icon className={clsx("w-5 h-5 flex-shrink-0 mt-0.5", iconClass)} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={clsx("text-sm font-semibold mb-0.5", textConfig[variant])}>{title}</p>
        )}
        <div className={clsx("text-sm", textConfig[variant])}>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className={clsx("flex-shrink-0 p-0.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors", iconClass)}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
