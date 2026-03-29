import { useState, ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface AccordionProps {
  title: ReactNode;
  icon?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  children: ReactNode;
  className?: string;
}

export function Accordion({
  title,
  icon,
  subtitle,
  actions,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  children,
  className
}: AccordionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleToggle = (e: React.MouseEvent) => {
    // Buton veya input tıklamaları akordiyonu tetiklemesin
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    
    if (isControlled && onToggle) {
      onToggle();
    } else if (!isControlled) {
      setInternalIsOpen(!isOpen);
    }
  };

  return (
    <div className={clsx("bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700/80 flex flex-col overflow-hidden", className)}>
      <div 
        className="flex items-center gap-3 p-3 px-4 border-b border-slate-100 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 group select-none"
        onClick={handleToggle}
      >
        {icon && <span className="text-sm shrink-0">{icon}</span>}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>}
        </div>
        
        {actions && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
            {actions}
          </div>
        )}
        
        <div className="text-slate-400 shrink-0">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </div>
      
      {isOpen && (
        <div className="flex flex-col bg-white dark:bg-slate-800 overflow-x-auto hide-scrollbar">
          {children}
        </div>
      )}
    </div>
  );
}
