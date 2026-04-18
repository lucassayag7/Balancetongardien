"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
  fullHeight = false,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.classList.add("scroll-lock");
    } else {
      document.body.classList.remove("scroll-lock");
    }
    return () => document.body.classList.remove("scroll-lock");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-md mx-auto left-1/2 -translate-x-1/2 w-full">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "relative bg-white rounded-t-3xl shadow-2xl animate-slide-up",
          fullHeight ? "h-[92vh] flex flex-col" : "max-h-[92vh]",
          className
        )}
      >
        {/* Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="drag-handle" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 pb-3 border-b border-stone-100">
            <h2 className="text-base font-semibold text-stone-900">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 active:bg-stone-200"
            >
              <X size={16} className="text-stone-600" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={cn("overflow-y-auto", fullHeight ? "flex-1" : "")}>
          {children}
        </div>
      </div>
    </div>
  );
}
