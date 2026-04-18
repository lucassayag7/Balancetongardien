"use client";

import Link from "next/link";
import { MapPin, TrendingDown, TrendingUp, Minus, Users, AlertCircle } from "lucide-react";
import ScoreGauge from "@/components/ui/ScoreGauge";
import { cn } from "@/lib/utils";
import { scoreBgColor } from "@/lib/mock-data";
import type { Building } from "@/types";

interface BuildingCardProps {
  building: Building;
  isMyBuilding?: boolean;
}

const TREND_CONFIG = {
  improving: { icon: TrendingUp, label: "S'améliore", color: "text-green-600" },
  stable: { icon: Minus, label: "Stable", color: "text-stone-500" },
  degrading: { icon: TrendingDown, label: "Se dégrade", color: "text-red-500" },
};

export default function BuildingCard({ building, isMyBuilding = false }: BuildingCardProps) {
  const trend = TREND_CONFIG[building.trend];
  const TrendIcon = trend.icon;

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
          {/* Score */}
          <ScoreGauge score={building.score} size="md" />

          {/* Info */}
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
              {/* Trend */}
              <div className={cn("flex items-center gap-1", trend.color)}>
                <TrendIcon size={12} />
                <span className="text-[11px] font-medium">{trend.label}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-1 text-stone-400">
                <AlertCircle size={11} />
                <span className="text-[11px]">{building.reportCount} signalements</span>
              </div>

              <div className="flex items-center gap-1 text-stone-400">
                <Users size={11} />
                <span className="text-[11px]">{building.verifiedResidentCount} vérifiés</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
