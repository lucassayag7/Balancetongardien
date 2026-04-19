"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Accueil" },
  { href: "/carte", icon: Map, label: "Carte" },
  { href: "/mes-signalements", icon: Bell, label: "Mes alertes" },
  { href: "/compte", icon: User, label: "Profil" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white shadow-nav bottom-nav border-t border-stone-100">
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-200 min-w-[64px]",
                isActive
                  ? "text-brand-500"
                  : "text-stone-400 active:text-stone-600"
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={cn("transition-transform", isActive && "scale-110")}
              />
              <span
                className={cn(
                  "text-[10px] font-medium tracking-tight",
                  isActive ? "text-brand-500" : "text-stone-400"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
