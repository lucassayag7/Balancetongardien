"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { TrendingDown, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ScoreGauge from "@/components/ui/ScoreGauge";
import { fetchBuildings } from "@/lib/api";
import type { BuildingAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-stone-100">
      <Loader2 size={28} className="animate-spin text-stone-400" />
    </div>
  ),
});

const SCORE_FILTERS = [
  { id: "all", label: "Tous", color: "bg-stone-500" },
  { id: "critical", label: "Critique (< 2)", color: "bg-red-500" },
  { id: "bad", label: "Mauvais (2-3)", color: "bg-orange-500" },
  { id: "ok", label: "Moyen (3-4)", color: "bg-amber-500" },
  { id: "good", label: "Bon (> 4)", color: "bg-green-500" },
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
    <div className="h-screen bg-surface flex flex-col overflow-hidden">
      <Header title="Carte des signalements" />

      {/* Map */}
      <div className="relative flex-1 overflow-hidden">
        <MapView
          buildings={filteredBuildings}
          selectedId={selectedBuilding?.id}
          onSelect={setSelectedBuilding}
        />

        {/* Filter chips over the map */}
        <div className="absolute top-3 left-3 right-3 z-[1000]">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {SCORE_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-sm transition-all",
                  activeFilter === f.id
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-700 active:bg-stone-100"
                )}
              >
                <span className={cn("w-2 h-2 rounded-full flex-shrink-0", f.color)} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Score legend */}
        <div className="absolute bottom-4 right-3 z-[1000] bg-white rounded-xl shadow-card p-2.5">
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
      </div>

      {/* Building list */}
      <div className="bg-white border-t border-stone-100 max-h-[30vh] overflow-y-auto">
        <div className="px-4 py-3 border-b border-stone-50">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
            {loading
              ? "Chargement..."
              : `${filteredBuildings.length} immeuble${filteredBuildings.length > 1 ? "s" : ""}`}
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
                  <p className="text-sm font-semibold text-stone-900 truncate">
                    {building.address}
                  </p>
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
