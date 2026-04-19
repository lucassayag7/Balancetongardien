"use client";

import Link from "next/link";
import { MapPin, TrendingDown, TrendingUp, Minus, Users, AlertCircle } from "lucide-react";
import ScoreGauge from "@/components/ui/ScoreGauge";
import { cn } from "@/lib/utils";
import type { BuildingAPI } from "@/lib/api";

interface BuildingCardProps {
  building: BuildingAPI;
  isMyBuilding?: boolean;
}

const TREND_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  IMPROVING: { icon: TrendingUp, label: "S'améliore", color: "text-green-600" },
  improving: { icon: TrendingUp, label: "S'améliore", color: "text-green-600" },
  STABLE: { icon: Minus, label: "Stable", color: "text-stone-500" },
  stable: { icon: Minus, label: "Stable", color: "text-stone-500" },
  DEGRADING: { icon: TrendingDown, label: "Se dégrade", color: "text-red-500" },
  degrading: { icon: TrendingDown, label: "Se dégrade", color: "text-red-500" },
};

export default function BuildingCard({ building, isMyBuilding = false }: BuildingCardProps) {
  const trend = TREND_CONFIG[building.trend] ?? TREND_CONFIG.STABLE;
  const TrendIcon = trend.icon;
  const residents = building.verifiedResidentCount ?? building._count?.residents ?? 0;

  return (
    <Link href={`/immeuble/${building.id}`}>
      <div
        className={cn(
          "bg-white rounded-2xl border shadow-card p-4 active:scale-[0.98] transition-transform",
          isMyBuilding ? "border-brand-200 ring-1 ring-brand-100" : "border-stone-100"
        )}
      >
        {isMyBuilding && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
              🏠 Mon immeuble
            </span>
          </div>
        )}

        <div className="flex items-start gap-4">
          <ScoreGauge score={building.score} size="md" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={12} className="text-stone-400 flex-shrink-0" />
              <p className="text-sm font-semibold text-stone-900 truncate">
                {building.address}
              </p>
            </div>
            <p className="text-xs text-stone-500 mb-2">
              {building.postalCode} {building.city}
            </p>

            <div className="flex items-center gap-3">
              <div className={cn("flex items-center gap-1", trend.color)}>
                <TrendIcon size={12} />
                <span className="text-[11px] font-medium">{trend.label}</span>
              </div>

              <div className="flex items-center gap-1 text-stone-400">
                <AlertCircle size={11} />
                <span className="text-[11px]">{building.reportCount} signalements</span>
              </div>

              <div className="flex items-center gap-1 text-stone-400">
                <Users size={11} />
                <span className="text-[11px]">{residents} vérifiés</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
