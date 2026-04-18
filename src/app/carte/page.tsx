"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, SlidersHorizontal, Search, TrendingDown, Info } from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ScoreGauge from "@/components/ui/ScoreGauge";
import BottomSheet from "@/components/ui/BottomSheet";
import { MOCK_BUILDINGS, scoreBgColor } from "@/lib/mock-data";
import type { Building } from "@/types";
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

export default function CartePage() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredBuildings = MOCK_BUILDINGS.filter((b) => {
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
        {/* Simulated map background */}
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
        {filteredBuildings.map((building, i) => {
          const pin = getBuildingPin(building.score);
          const positions = [
            { top: "30%", left: "25%" },
            { top: "55%", left: "60%" },
            { top: "40%", left: "70%" },
          ];
          const pos = positions[i] || { top: "50%", left: "50%" };

          return (
            <button
              key={building.id}
              onClick={() => setSelectedBuilding(building)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={pos}
            >
              <div
                className={cn(
                  "rounded-full ring-4 flex items-center justify-center shadow-lg transition-all",
                  pin.color,
                  pin.size,
                  pin.ring,
                  selectedBuilding?.id === building.id && "scale-125"
                )}
              >
                <span className="text-white text-[10px] font-bold">
                  {building.score.toFixed(1)}
                </span>
              </div>
            </button>
          );
        })}

        {/* Filter chips on map */}
        <div className="absolute top-3 left-3 right-3">
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

        {/* Légende */}
        <div className="absolute bottom-4 right-3 bg-white rounded-xl shadow-card p-2.5">
          <p className="text-[10px] font-semibold text-stone-500 mb-1.5">Score</p>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-[10px] text-stone-600">&lt; 2 · Critique</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-[10px] text-stone-600">2-3 · Mauvais</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-[10px] text-stone-600">3-4 · Moyen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-[10px] text-stone-600">&gt; 4 · Bon</span>
            </div>
          </div>
        </div>

        {/* Info banner Mapbox */}
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
            {filteredBuildings.length} immeuble{filteredBuildings.length > 1 ? "s" : ""} affiché{filteredBuildings.length > 1 ? "s" : ""}
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
                {building.trend === "degrading" && (
                  <TrendingDown size={14} className="text-red-500 flex-shrink-0" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
