import clsx from "clsx";

export type AvatarSize  = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarColor = "blue" | "violet" | "emerald" | "amber" | "pink" | "teal" | "orange" | "cyan" | "slate";

interface AvatarProps {
  initials:   string;
  color?:     AvatarColor;
  size?:      AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, { wrapper: string; text: string }> = {
  xs: { wrapper: "w-6  h-6  rounded-lg",  text: "text-[9px]"  },
  sm: { wrapper: "w-8  h-8  rounded-lg",  text: "text-xs"     },
  md: { wrapper: "w-9  h-9  rounded-md",  text: "text-xs"     },
  lg: { wrapper: "w-11 h-11 rounded-md",  text: "text-sm"     },
  xl: { wrapper: "w-14 h-14 rounded-2xl", text: "text-base"   },
};

const colorClasses: Record<AvatarColor, string> = {
  blue:    "from-blue-400    to-blue-600",
  violet:  "from-violet-400  to-violet-600",
  emerald: "from-emerald-400 to-emerald-600",
  amber:   "from-amber-400   to-orange-500",
  pink:    "from-pink-400    to-rose-500",
  teal:    "from-teal-400    to-cyan-500",
  orange:  "from-orange-400  to-red-500",
  cyan:    "from-cyan-400    to-blue-500",
  slate:   "from-slate-400   to-slate-600",
};

export function Avatar({ initials, color = "blue", size = "md", className }: AvatarProps) {
  const { wrapper, text } = sizeClasses[size];
  return (
    <div className={clsx(
      "bg-gradient-to-br flex items-center justify-center flex-shrink-0",
      colorClasses[color],
      wrapper,
      className
    )}>
      <span className={clsx("text-white font-semibold", text)}>{initials}</span>
    </div>
  );
}
