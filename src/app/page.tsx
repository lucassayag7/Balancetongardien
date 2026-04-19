"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Search, Filter, TrendingDown, Plus, AlertCircle } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import ReportCard from "@/components/reports/ReportCard";
import BuildingCard from "@/components/building/BuildingCard";
import { ReportCardSkeleton, BuildingCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { fetchReports, fetchUser, fetchBuildings } from "@/lib/api";
import type { ReportAPI, BuildingAPI, UserAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

const FILTER_CATEGORIES = [
  { id: "all", label: "Tous", icon: "🔍" },
  { id: "nettoyage", label: "Nettoyage", icon: "🧹" },
  { id: "maintenance", label: "Maintenance", icon: "🔧" },
  { id: "presence", label: "Présence", icon: "🚪" },
  { id: "comportement", label: "Comportement", icon: "⚠️" },
  { id: "securite", label: "Sécurité", icon: "🔒" },
  { id: "administratif", label: "Administratif", icon: "📄" },
];

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<ReportAPI[]>([]);
  const [myBuilding, setMyBuilding] = useState<BuildingAPI | null>(null);
  const [user, setUser] = useState<UserAPI | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetchUser()
      .then(({ user }) => {
        setUser(user);
        if (user?.buildings?.[0]) {
          setMyBuilding(user.buildings[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    setLoadingReports(true);
    fetchReports({ category: activeFilter })
      .then(({ reports }) => setReports(reports))
      .catch(() => setReports([]))
      .finally(() => setLoadingReports(false));
  }, [activeFilter]);

  const filteredReports = searchQuery
    ? reports.filter(
        (r) =>
          r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.building?.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : reports;

  const thisWeek = reports.filter(
    (r) => Date.now() - new Date(r.createdAt).getTime() < 7 * 24 * 3600 * 1000
  ).length;
  const confirmed = reports.filter((r) => r.validations.some((v) => v.type === "CONFIRM")).length;

  return (
    <div className="h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-stone-100 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <span className="text-brand-500">⚡</span> Balance ton gardien
              </h1>
              <p className="text-xs text-stone-500">
                {loadingUser ? "Chargement..." : user ? `Bonjour, ${user.pseudo}` : "Bienvenue"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 active:bg-stone-200"
              >
                <Search size={16} className="text-stone-600" />
              </button>
              <Link href="/mes-signalements">
                <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 active:bg-stone-200">
                  <Bell size={16} className="text-stone-600" />
                </button>
              </Link>
            </div>
          </div>

          {searchOpen && (
            <div className="mb-2 animate-slide-down">
              <input
                type="text"
                placeholder="Rechercher une adresse, un problème..."
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-4 rounded-xl bg-stone-100 text-sm text-stone-900 placeholder-stone-400 border-0"
              />
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 space-y-5 pb-20">
        {/* Mon immeuble */}
        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
            Mon immeuble
          </h2>
          {loadingUser ? (
            <BuildingCardSkeleton />
          ) : myBuilding ? (
            <BuildingCard building={myBuilding} isMyBuilding />
          ) : (
            <div className="bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-4 text-center">
              <p className="text-sm text-stone-500 mb-2">Aucun immeuble associé</p>
              <Link href="/signaler">
                <button className="text-xs font-semibold text-brand-500">
                  Créer votre premier signalement →
                </button>
              </Link>
            </div>
          )}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-3 text-center">
            <p className="text-xl font-bold text-stone-900">{reports.length}</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Signalements</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-3 text-center">
            <p className="text-xl font-bold text-brand-500">{thisWeek}</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Cette semaine</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-3 text-center">
            <p className="text-xl font-bold text-green-600">{confirmed}</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Confirmés</p>
          </div>
        </section>

        {/* Alerte si immeuble dégradé */}
        {myBuilding && myBuilding.score < 2.5 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 flex items-start gap-3">
            <TrendingDown size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Situation dégradée</p>
              <p className="text-xs text-red-600 mt-0.5">
                Votre immeuble a un score de{" "}
                <strong>{myBuilding.score}/5</strong>. Agissez maintenant.
              </p>
              <Link href={`/immeuble/${myBuilding.id}`}>
                <span className="text-xs font-semibold text-red-600 underline mt-1 inline-block">
                  Voir le bilan complet →
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* Feed */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Signalements récents
            </h2>
            <Filter size={12} className="text-stone-400" />
          </div>

          {/* Filtres */}
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

          {/* Liste */}
          {loadingReports ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <ReportCardSkeleton key={i} />)}
            </div>
          ) : filteredReports.length === 0 ? (
            <EmptyState
              icon="🏠"
              title="Aucun signalement"
              description="Soyez le premier à signaler un problème dans votre immeuble."
              action={{ label: "Créer un signalement", href: "/signaler" }}
            />
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </section>
      </div>
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
