"use client";

import { ArrowLeft, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  transparent?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export default function Header({
  title,
  subtitle,
  showBack = false,
  transparent = false,
  rightAction,
  className,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-3 px-4 h-14",
        transparent ? "bg-transparent" : "bg-white border-b border-stone-100",
        !transparent && "glass",
        className
      )}
    >
      {showBack && (
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 active:bg-stone-200 transition-colors"
        >
          <ArrowLeft size={18} className="text-stone-700" />
        </button>
      )}

      {title && (
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-stone-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-stone-500 truncate">{subtitle}</p>
          )}
        </div>
      )}

      {rightAction && <div className="ml-auto">{rightAction}</div>}
    </header>
  );
}
