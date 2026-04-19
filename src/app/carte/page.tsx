"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, TrendingDown, TrendingUp, Minus, Loader2, AlertCircle, ChevronUp, X } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import ScoreGauge from "@/components/ui/ScoreGauge";
import { fetchBuildings } from "@/lib/api";
import type { BuildingAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin text-brand-500" />
        <p className="text-xs text-stone-400 font-medium">Chargement de la carte…</p>
      </div>
    </div>
  ),
});

const SCORE_FILTERS = [
  { id: "all", label: "Tous" },
  { id: "critical", label: "🔴 Critique" },
  { id: "bad", label: "🟠 Mauvais" },
  { id: "ok", label: "🟡 Moyen" },
  { id: "good", label: "🟢 Bon" },
];

function getTrend(trend: string) {
  const t = trend?.toUpperCase();
  if (t === "IMPROVING") return { icon: TrendingUp, label: "S'améliore", color: "text-green-600" };
  if (t === "DEGRADING") return { icon: TrendingDown, label: "Se dégrade", color: "text-red-500" };
  return { icon: Minus, label: "Stable", color: "text-stone-400" };
}

function getScoreColor(score: number) {
  if (score < 2) return "text-red-600 bg-red-50";
  if (score < 3) return "text-orange-600 bg-orange-50";
  if (score < 4) return "text-amber-600 bg-amber-50";
  return "text-green-600 bg-green-50";
}

export default function CartePage() {
  const [buildings, setBuildings] = useState<BuildingAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BuildingAPI | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    fetchBuildings()
      .then(({ buildings }) => setBuildings(buildings))
      .catch(() => setBuildings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = buildings.filter((b) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "critical") return b.score < 2;
    if (activeFilter === "bad") return b.score >= 2 && b.score < 3;
    if (activeFilter === "ok") return b.score >= 3 && b.score < 4;
    if (activeFilter === "good") return b.score >= 4;
    return true;
  });

  const handleSelect = (b: BuildingAPI) => {
    setSelected(b);
    setSheetOpen(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Map — full screen behind everything */}
      <div className="absolute inset-0 bottom-[64px]">
        <MapView
          buildings={filtered}
          selectedId={selected?.id}
          onSelect={handleSelect}
          onDeselect={() => setSelected(null)}
        />

        {/* Top filter bar */}
        <div className="absolute top-0 left-0 right-0 z-[1000]">
          {/* Header bar */}
          <div className="bg-white/90 backdrop-blur-md px-4 pt-safe pt-4 pb-3 border-b border-stone-100/50 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
                <MapPin size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-stone-900">Carte des signalements</h1>
                <p className="text-[11px] text-stone-400">
                  {loading ? "Chargement…" : `${filtered.length} immeuble${filtered.length > 1 ? "s" : ""} affiché${filtered.length > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {SCORE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={cn(
                    "flex items-center h-7 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                    activeFilter === f.id
                      ? "bg-stone-900 text-white shadow-sm"
                      : "bg-stone-100 text-stone-600 active:bg-stone-200"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected building card */}
      {selected && (
        <div className="absolute bottom-[80px] left-4 right-4 z-[1001] animate-slide-up">
          <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <ScoreGauge score={selected.score} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-900 truncate">{selected.address}</p>
                  <p className="text-xs text-stone-400 mb-2">{selected.postalCode} {selected.city}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", getScoreColor(selected.score))}>
                      Score {selected.score.toFixed(1)}/5
                    </span>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <AlertCircle size={10} />
                      {selected.reportCount} signalement{selected.reportCount > 1 ? "s" : ""}
                    </span>
                    {(() => {
                      const t = getTrend(selected.trend);
                      return <span className={cn("text-[11px] font-medium flex items-center gap-0.5", t.color)}><t.icon size={11} />{t.label}</span>;
                    })()}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 active:bg-stone-200"
                >
                  <X size={13} className="text-stone-500" />
                </button>
              </div>
              <Link href={`/immeuble/${selected.id}`} className="block mt-3">
                <button className="w-full h-10 bg-brand-500 text-white rounded-xl text-sm font-semibold active:bg-brand-600 transition-colors">
                  Voir tous les signalements →
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bottom sheet — building list */}
      {!selected && (
        <div
          className={cn(
            "absolute left-0 right-0 z-[1000] transition-all duration-300 ease-out",
            sheetOpen ? "bottom-[64px]" : "bottom-[64px] translate-y-[calc(100%-72px)]"
          )}
        >
          <div className="bg-white rounded-t-3xl shadow-2xl border-t border-stone-100">
            {/* Handle + header */}
            <button
              className="w-full flex flex-col items-center pt-3 pb-2 px-4 active:bg-stone-50"
              onClick={() => setSheetOpen((s) => !s)}
            >
              <div className="w-10 h-1 bg-stone-200 rounded-full mb-3" />
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-sm font-bold text-stone-900 text-left">
                    {loading ? "Chargement…" : `${filtered.length} immeuble${filtered.length > 1 ? "s" : ""}`}
                  </p>
                  <p className="text-[11px] text-stone-400 text-left">Appuyez pour voir la liste</p>
                </div>
                <ChevronUp
                  size={18}
                  className={cn("text-stone-400 transition-transform", sheetOpen && "rotate-180")}
                />
              </div>
            </button>

            {/* List */}
            {sheetOpen && (
              <div className="max-h-[45vh] overflow-y-auto divide-y divide-stone-50 pb-2">
                {filtered.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-stone-400">Aucun immeuble trouvé</p>
                  </div>
                ) : (
                  filtered.map((b) => {
                    const trend = getTrend(b.trend);
                    return (
                      <button
                        key={b.id}
                        className="w-full flex items-center gap-3 px-4 py-3 active:bg-stone-50 transition-colors text-left"
                        onClick={() => handleSelect(b)}
                      >
                        <ScoreGauge score={b.score} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stone-900 truncate">{b.address}</p>
                          <p className="text-xs text-stone-400">
                            {b.postalCode} {b.city} · {b.reportCount} signalement{b.reportCount > 1 ? "s" : ""}
                          </p>
                        </div>
                        <span className={cn("text-[11px] font-semibold flex items-center gap-0.5 flex-shrink-0", trend.color)}>
                          <trend.icon size={12} />
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
