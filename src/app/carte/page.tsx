"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingDown } from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ScoreGauge from "@/components/ui/ScoreGauge";
import { fetchBuildings } from "@/lib/api";
import type { BuildingAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

const SCORE_FILTERS = [
  { id: "all", label: "Tous", color: "bg-stone-500" },
  { id: "critical", label: "Critique (< 2)", color: "bg-red-500" },
  { id: "bad", label: "Mauvais (2-3)", color: "bg-orange-500" },
  { id: "ok", label: "Moyen (3-4)", color: "bg-amber-500" },
  { id: "good", label: "Bon (> 4)", color: "bg-green-500" },
];

function getBuildingPin(score: number) {
  if (score < 2) return { color: "bg-red-500", size: "w-8 h-8", ring: "ring-red-200" };
  if (score < 3) return { color: "bg-orange-500", size: "w-7 h-7", ring: "ring-orange-200" };
  if (score < 4) return { color: "bg-amber-400", size: "w-6 h-6", ring: "ring-amber-200" };
  return { color: "bg-green-500", size: "w-5 h-5", ring: "ring-green-200" };
}

const PIN_POSITIONS = [
  { top: "28%", left: "22%" },
  { top: "52%", left: "58%" },
  { top: "38%", left: "72%" },
  { top: "65%", left: "35%" },
  { top: "45%", left: "45%" },
  { top: "20%", left: "60%" },
  { top: "75%", left: "65%" },
  { top: "30%", left: "80%" },
];

export default function CartePage() {
  const [buildings, setBuildings] = useState<BuildingAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingAPI | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchBuildings()
      .then(({ buildings }) => setBuildings(buildings))
      .catch(() => setBuildings([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredBuildings = buildings.filter((b) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "critical") return b.score < 2;
    if (activeFilter === "bad") return b.score >= 2 && b.score < 3;
    if (activeFilter === "ok") return b.score >= 3 && b.score < 4;
    if (activeFilter === "good") return b.score >= 4;
    return true;
  });

  return (
    <div className="h-screen bg-surface flex flex-col">
      <Header title="Carte des signalements" />

      {/* Map placeholder */}
      <div className="relative flex-1 bg-stone-200 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
            backgroundColor: "#e8e0d8",
          }}
        />

        {/* Road simulation */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-0 right-0 h-1.5 bg-white/70 rounded-full" />
          <div className="absolute top-2/3 left-0 right-0 h-1 bg-white/50 rounded-full" />
          <div className="absolute left-1/3 top-0 bottom-0 w-1.5 bg-white/70 rounded-full" />
          <div className="absolute left-2/3 top-0 bottom-0 w-1 bg-white/50 rounded-full" />
        </div>

        {/* Building pins */}
        {filteredBuildings.slice(0, PIN_POSITIONS.length).map((building, i) => {
          const pin = getBuildingPin(building.score);
          const pos = PIN_POSITIONS[i];
          return (
            <button
              key={building.id}
              onClick={() => setSelectedBuilding(building)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={pos}
            >
              <div className={cn(
                "rounded-full ring-4 flex items-center justify-center shadow-lg transition-all",
                pin.color, pin.size, pin.ring,
                selectedBuilding?.id === building.id && "scale-125"
              )}>
                <span className="text-white text-[10px] font-bold">
                  {building.score.toFixed(1)}
                </span>
              </div>
            </button>
          );
        })}

        {/* Filter chips */}
        <div className="absolute top-3 left-3 right-3">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {SCORE_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-sm transition-all",
                  activeFilter === f.id ? "bg-stone-900 text-white" : "bg-white text-stone-700 active:bg-stone-100"
                )}
              >
                <span className={cn("w-2 h-2 rounded-full flex-shrink-0", f.color)} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-3 bg-white rounded-xl shadow-card p-2.5">
          <p className="text-[10px] font-semibold text-stone-500 mb-1.5">Score</p>
          <div className="space-y-1">
            {[
              { color: "bg-red-500", label: "< 2 · Critique" },
              { color: "bg-orange-500", label: "2-3 · Mauvais" },
              { color: "bg-amber-400", label: "3-4 · Moyen" },
              { color: "bg-green-500", label: "> 4 · Bon" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-full", l.color)} />
                <span className="text-[10px] text-stone-600">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info banner */}
        <div className="absolute bottom-4 left-3 right-20 bg-black/60 backdrop-blur-sm rounded-xl p-2.5">
          <p className="text-[10px] text-white/80 text-center">
            🗺 Carte interactive — intégration Mapbox en production
          </p>
        </div>
      </div>

      {/* Building list */}
      <div className="bg-white border-t border-stone-100 max-h-[30vh] overflow-y-auto">
        <div className="px-4 py-3 border-b border-stone-50">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
            {loading ? "Chargement..." : `${filteredBuildings.length} immeuble${filteredBuildings.length > 1 ? "s" : ""} affiché${filteredBuildings.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="divide-y divide-stone-50">
          {filteredBuildings.map((building) => (
            <Link key={building.id} href={`/immeuble/${building.id}`}>
              <div
                onClick={() => setSelectedBuilding(building)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 active:bg-stone-50 transition-colors",
                  selectedBuilding?.id === building.id && "bg-brand-50"
                )}
              >
                <ScoreGauge score={building.score} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-900 truncate">{building.address}</p>
                  <p className="text-xs text-stone-500">
                    {building.reportCount} signalements · {building.postalCode} {building.city}
                  </p>
                </div>
                {(building.trend === "DEGRADING" || building.trend === "degrading") && (
                  <TrendingDown size={14} className="text-red-500 flex-shrink-0" />
                )}
              </div>
            </Link>
          ))}
          {!loading && filteredBuildings.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-stone-400">Aucun immeuble trouvé</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
