import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG, SEVERITY_CONFIG } from "@/types";
import type { Category, Severity } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full",
        size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        variant === "default" && "bg-stone-100 text-stone-700",
        variant === "outline" && "border border-stone-200 text-stone-600",
        variant === "ghost" && "text-stone-500",
        className
      )}
    >
      {children}
    </span>
  );
}

export function CategoryBadge({ category }: { category: Category }) {
  const config = CATEGORY_CONFIG[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full",
        config.bg,
        config.color
      )}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full",
        config.bg,
        config.color
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", config.dotColor)} />
      {config.label}
    </span>
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-600",
        className
      )}
    >
      ✓ Vérifié
    </span>
  );
}
