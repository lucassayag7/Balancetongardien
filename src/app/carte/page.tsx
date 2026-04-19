"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Map, List, TrendingDown, TrendingUp, Minus,
  AlertCircle, Loader2, MapPin, ChevronRight, X,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import ScoreGauge from "@/components/ui/ScoreGauge";
import { fetchBuildings } from "@/lib/api";
import type { BuildingAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-stone-50">
      <Loader2 size={24} className="animate-spin text-brand-500" />
    </div>
  ),
});

type Tab = "list" | "map";

const SCORE_FILTERS = [
  { id: "all", label: "Tous" },
  { id: "critical", label: "🔴 Critique" },
  { id: "bad", label: "🟠 Mauvais" },
  { id: "ok", label: "🟡 Moyen" },
  { id: "good", label: "🟢 Bon" },
];

function scoreStyle(score: number) {
  if (score < 2) return { bar: "bg-red-500", text: "text-red-600", badge: "bg-red-50 text-red-700" };
  if (score < 3) return { bar: "bg-orange-500", text: "text-orange-600", badge: "bg-orange-50 text-orange-700" };
  if (score < 4) return { bar: "bg-amber-400", text: "text-amber-600", badge: "bg-amber-50 text-amber-700" };
  return { bar: "bg-green-500", text: "text-green-600", badge: "bg-green-50 text-green-700" };
}

function TrendBadge({ trend }: { trend: string }) {
  const t = trend?.toUpperCase();
  if (t === "IMPROVING") return <span className="flex items-center gap-0.5 text-[10px] font-semibold text-green-600"><TrendingUp size={10} /> S'améliore</span>;
  if (t === "DEGRADING") return <span className="flex items-center gap-0.5 text-[10px] font-semibold text-red-500"><TrendingDown size={10} /> Se dégrade</span>;
  return <span className="flex items-center gap-0.5 text-[10px] font-semibold text-stone-400"><Minus size={10} /> Stable</span>;
}

function BuildingRow({ building }: { building: BuildingAPI }) {
  const s = scoreStyle(building.score);
  return (
    <Link href={`/immeuble/${building.id}`}>
      <div className="flex items-center gap-3.5 px-4 py-3.5 active:bg-stone-50 transition-colors">
        {/* Score circle */}
        <div className={cn("w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm", s.badge)}>
          {building.score.toFixed(1)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-900 truncate leading-tight">
            {building.address}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            {building.postalCode} {building.city}
          </p>
          <div className="flex items-center gap-2.5 mt-1">
            <span className="flex items-center gap-1 text-[11px] text-stone-500">
              <AlertCircle size={10} />
              {building.reportCount} signalement{building.reportCount > 1 ? "s" : ""}
            </span>
            <TrendBadge trend={building.trend} />
          </div>
        </div>

        <ChevronRight size={15} className="text-stone-300 flex-shrink-0" />
      </div>
    </Link>
  );
}

function SelectedCard({ building, onClose }: { building: BuildingAPI; onClose: () => void }) {
  const s = scoreStyle(building.score);
  return (
    <div className="absolute bottom-[72px] left-0 right-0 z-[40] px-3 pb-3">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden">
        <div className="p-4">
          {/* Close */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-900 leading-tight truncate">{building.address}</p>
              <p className="text-xs text-stone-400 mt-0.5">{building.postalCode} {building.city}</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 active:bg-stone-200"
            >
              <X size={13} className="text-stone-500" />
            </button>
          </div>

          {/* Score bar */}
          <div className="flex items-center gap-3 mb-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0", s.badge)}>
              {building.score.toFixed(1)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-500">Score qualité</span>
                <span className={cn("font-bold", s.text)}>{building.score.toFixed(1)}/5</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full", s.bar)}
                  style={{ width: `${(building.score / 5) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <TrendBadge trend={building.trend} />
                <span>{building.reportCount} signalement{building.reportCount > 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link href={`/immeuble/${building.id}`}>
            <button className="w-full h-11 bg-brand-500 text-white rounded-xl text-sm font-bold active:bg-brand-600 transition-colors">
              Voir les signalements →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CartePage() {
  const [tab, setTab] = useState<Tab>("list");
  const [buildings, setBuildings] = useState<BuildingAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selected, setSelected] = useState<BuildingAPI | null>(null);

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

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-surface">

      {/* ── Header ── */}
      <div className="bg-white border-b border-stone-100 px-4 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <MapPin size={15} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-stone-900 leading-tight">Signalements</h1>
              <p className="text-[11px] text-stone-400">
                {loading ? "…" : `${filtered.length} immeuble${filtered.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-stone-100 rounded-xl p-0.5 gap-0.5">
            <button
              onClick={() => setTab("list")}
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-xs font-semibold transition-all",
                tab === "list" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
              )}
            >
              <List size={13} /> Liste
            </button>
            <button
              onClick={() => setTab("map")}
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-xs font-semibold transition-all",
                tab === "map" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
              )}
            >
              <Map size={13} /> Carte
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-3">
          {SCORE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "h-7 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0",
                activeFilter === f.id
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 active:bg-stone-200"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── List View ── */}
      {tab === "list" && (
        <div className="flex-1 overflow-y-auto pb-24">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-brand-500 mb-2" />
              <p className="text-xs text-stone-400">Chargement des immeubles…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
                <MapPin size={28} className="text-stone-300" />
              </div>
              <p className="text-sm font-semibold text-stone-600 mb-1">Aucun immeuble</p>
              <p className="text-xs text-stone-400">Aucun signalement dans cette catégorie pour l'instant.</p>
            </div>
          ) : (
            <div className="bg-white divide-y divide-stone-50 mt-2 rounded-2xl mx-3 shadow-sm border border-stone-100 overflow-hidden">
              {filtered.map((b) => <BuildingRow key={b.id} building={b} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Map View ── */}
      {tab === "map" && (
        <div className="flex-1 relative overflow-hidden">
          <MapView
            buildings={filtered}
            selectedId={selected?.id ?? null}
            onSelect={(b) => setSelected(b)}
            onDeselect={() => setSelected(null)}
          />
          {selected && (
            <SelectedCard building={selected} onClose={() => setSelected(null)} />
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
