"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Search, Filter, TrendingDown, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import ReportCard from "@/components/reports/ReportCard";
import BuildingCard from "@/components/building/BuildingCard";
import { MOCK_REPORTS, MOCK_BUILDINGS, MOCK_USER } from "@/lib/mock-data";
import { CATEGORY_CONFIG } from "@/types";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

const FILTER_CATEGORIES: { id: Category | "all"; label: string; icon: string }[] = [
  { id: "all", label: "Tous", icon: "🔍" },
  { id: "nettoyage", label: "Nettoyage", icon: "🧹" },
  { id: "maintenance", label: "Maintenance", icon: "🔧" },
  { id: "presence", label: "Présence", icon: "🚪" },
  { id: "comportement", label: "Comportement", icon: "⚠️" },
  { id: "securite", label: "Sécurité", icon: "🔒" },
  { id: "administratif", label: "Administratif", icon: "📄" },
];

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");
  const [searchOpen, setSearchOpen] = useState(false);

  const publicReports = MOCK_REPORTS.filter((r) => r.visibility === "public");
  const filteredReports =
    activeFilter === "all"
      ? publicReports
      : publicReports.filter((r) => r.category === activeFilter);

  const myBuilding = MOCK_BUILDINGS[0];
  const stats = {
    total: publicReports.length,
    thisWeek: publicReports.filter(
      (r) => Date.now() - r.createdAt.getTime() < 7 * 24 * 3600 * 1000
    ).length,
    confirmed: publicReports.filter((r) => r.validations.length > 0).length,
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <span className="text-brand-500">⚡</span> Balance ton gardien
              </h1>
              <p className="text-xs text-stone-500">Bonjour, {MOCK_USER.pseudo}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 active:bg-stone-200"
              >
                <Search size={16} className="text-stone-600" />
              </button>
              <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 active:bg-stone-200">
                <Bell size={16} className="text-stone-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full pulse-brand" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="mb-2 animate-slide-down">
              <input
                type="text"
                placeholder="Rechercher une adresse, un problème..."
                autoFocus
                className="w-full h-10 px-4 rounded-xl bg-stone-100 text-sm text-stone-900 placeholder-stone-400 border-0"
              />
            </div>
          )}
        </div>
      </header>

      <div className="px-4 pt-4 space-y-5">
        {/* Mon immeuble */}
        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
            Mon immeuble
          </h2>
          <BuildingCard building={myBuilding} isMyBuilding />
        </section>

        {/* Stats rapides */}
        <section className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-3 text-center">
            <p className="text-xl font-bold text-stone-900">{stats.total}</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Signalements</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-3 text-center">
            <p className="text-xl font-bold text-brand-500">{stats.thisWeek}</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Cette semaine</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-3 text-center">
            <p className="text-xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Confirmés</p>
          </div>
        </section>

        {/* Alerte immeuble */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 flex items-start gap-3">
          <TrendingDown size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Situation dégradée</p>
            <p className="text-xs text-red-600 mt-0.5">
              Votre immeuble a enregistré{" "}
              <strong>3 nouveaux signalements</strong> cette semaine.
            </p>
            <Link
              href="/immeuble/b1"
              className="text-xs font-semibold text-red-600 underline mt-1 inline-block"
            >
              Voir le bilan complet →
            </Link>
          </div>
        </div>

        {/* Feed */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Signalements récents
            </h2>
            <button className="flex items-center gap-1 text-xs text-stone-500 active:text-brand-500">
              <Filter size={12} />
              Filtrer
            </button>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3 -mx-4 px-4">
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  activeFilter === cat.id
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-white border border-stone-200 text-stone-600 active:bg-stone-50"
                )}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Report cards */}
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 size={32} className="text-green-400 mx-auto mb-2" />
                <p className="text-sm text-stone-500">Aucun signalement dans cette catégorie</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))
            )}
          </div>
        </section>
      </div>

      {/* FAB */}
      <Link href="/signaler">
        <button className="fixed bottom-[80px] right-4 z-40 w-14 h-14 bg-brand-500 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform pulse-brand">
          <Plus size={26} className="text-white" strokeWidth={2.5} />
        </button>
      </Link>

      <BottomNav />
    </div>
  );
}
