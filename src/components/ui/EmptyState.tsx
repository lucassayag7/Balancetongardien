import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}

export default function EmptyState({ icon = "📭", title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center px-4", className)}>
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-sm font-semibold text-stone-700 mb-1">{title}</p>
      {description && <p className="text-xs text-stone-400 leading-relaxed mb-5 max-w-xs">{description}</p>}
      {action && (
        <Link href={action.href}>
          <button className="h-10 px-5 rounded-xl bg-brand-500 text-white text-sm font-semibold">
            {action.label}
          </button>
        </Link>
      )}
    </div>
  );
}
