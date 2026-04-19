"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  MapPin,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  ChevronRight,
  FileText,
  Send,
  Share2,
  Star,
} from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ReportCard from "@/components/reports/ReportCard";
import ScoreGauge from "@/components/ui/ScoreGauge";
import BottomSheet from "@/components/ui/BottomSheet";
import { ReportCardSkeleton } from "@/components/ui/Skeleton";
import { fetchBuilding } from "@/lib/api";
import type { BuildingAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

const TREND_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  IMPROVING: { icon: TrendingUp, label: "S'améliore", color: "text-green-600", bg: "bg-green-50" },
  STABLE: { icon: Minus, label: "Stable", color: "text-stone-500", bg: "bg-stone-50" },
  DEGRADING: { icon: TrendingDown, label: "Se dégrade", color: "text-red-500", bg: "bg-red-50" },
};

const ACTION_TYPES = [
  { id: "letter_syndic", label: "Lettre au syndic", description: "Signalement formel au gestionnaire", icon: "📬", color: "text-blue-600", bg: "bg-blue-50" },
  { id: "letter_bailleur", label: "Lettre au bailleur", description: "Mise en demeure au propriétaire", icon: "🏠", color: "text-purple-600", bg: "bg-purple-50" },
  { id: "letter_mairie", label: "Courrier à la mairie", description: "Signalement aux services municipaux", icon: "🏛️", color: "text-amber-600", bg: "bg-amber-50" },
  { id: "ar24", label: "Recommandé électronique", description: "Envoi AR24 avec valeur légale", icon: "✉️", color: "text-brand-600", bg: "bg-brand-50" },
];

export default function ImmeubleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [building, setBuilding] = useState<BuildingAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"signalements" | "demarches">("signalements");
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  useEffect(() => {
    fetchBuilding(id)
      .then(({ building }) => setBuilding(building))
      .catch(() => setBuilding(null))
      .finally(() => setLoading(false));
  }, [id]);

  const trendKey = building?.trend ?? "STABLE";
  const trend = TREND_CONFIG[trendKey] ?? TREND_CONFIG.STABLE;
  const TrendIcon = trend.icon;

  const publicReports = building?.reports ?? [];
  const allActions = publicReports.flatMap((r) =>
    r.actions.map((a) => ({ ...a, reportId: r.id, reportCategory: r.category }))
  );

  if (loading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-surface">
        <Header showBack title="Chargement..." />
        <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3 pb-20">
          {[1, 2, 3].map((i) => <ReportCardSkeleton key={i} />)}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!building) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-surface">
        <Header showBack title="Immeuble introuvable" />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <AlertCircle size={48} className="text-stone-200 mb-4" />
          <p className="text-sm text-stone-600 mb-4">Cet immeuble n'existe pas ou a été supprimé.</p>
          <Link href="/">
            <button className="h-10 px-5 rounded-xl bg-brand-500 text-white text-sm font-semibold">
              Retour à l'accueil
            </button>
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface">
      <Header
        showBack
        title={building.address}
        subtitle={`${building.postalCode} ${building.city}`}
        rightAction={
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100">
            <Share2 size={16} className="text-stone-600" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
      <div className="space-y-4 pb-20">
        {/* Score hero */}
        <div className="bg-white px-4 py-5 border-b border-stone-100">
          <div className="flex items-center gap-5 mb-4">
            <ScoreGauge score={building.score} size="lg" />

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5", trend.bg, trend.color)}>
                  <TrendIcon size={12} />
                  {trend.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-stone-50 rounded-xl">
                  <p className="text-lg font-bold text-stone-900">{building.reportCount}</p>
                  <p className="text-[10px] text-stone-500">Signalements</p>
                </div>
                <div className="text-center p-2 bg-stone-50 rounded-xl">
                  <p className="text-lg font-bold text-stone-900">
                    {building.verifiedResidentCount ?? building._count?.residents ?? 0}
                  </p>
                  <p className="text-[10px] text-stone-500">Résidents</p>
                </div>
              </div>
            </div>
          </div>

          {/* Score bar */}
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2.5">
              Score global
            </p>
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    building.score >= 4 ? "bg-green-400" : building.score >= 3 ? "bg-amber-400" : "bg-red-400"
                  )}
                  style={{ width: `${(building.score / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-stone-700">{building.score.toFixed(1)}/5</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => setActionSheetOpen(true)}
            className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-brand-500 text-white text-sm font-semibold active:bg-brand-600 transition-colors"
          >
            <FileText size={16} />
            Agir
          </button>
          <Link href={`/signaler?buildingId=${building.id}`}>
            <button className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl border-2 border-brand-500 text-brand-500 text-sm font-semibold active:bg-brand-50 transition-colors">
              <AlertCircle size={16} />
              Signaler
            </button>
          </Link>
        </div>

        {/* Syndic info */}
        {building.syndicName && (
          <div className="mx-4 bg-white rounded-2xl border border-stone-100 shadow-card p-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
              Gestionnaire
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-900">{building.syndicName}</p>
                {building.syndicEmail && (
                  <p className="text-xs text-stone-500">{building.syndicEmail}</p>
                )}
              </div>
              <button className="w-9 h-9 bg-brand-50 rounded-full flex items-center justify-center">
                <Send size={15} className="text-brand-500" />
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mx-4">
          <div className="flex bg-stone-100 rounded-2xl p-1 mb-4">
            <button
              onClick={() => setActiveTab("signalements")}
              className={cn(
                "flex-1 h-9 rounded-xl text-sm font-medium transition-all",
                activeTab === "signalements" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
              )}
            >
              Signalements ({publicReports.length})
            </button>
            <button
              onClick={() => setActiveTab("demarches")}
              className={cn(
                "flex-1 h-9 rounded-xl text-sm font-medium transition-all",
                activeTab === "demarches" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
              )}
            >
              Démarches ({allActions.length})
            </button>
          </div>

          {activeTab === "signalements" && (
            <div className="space-y-3 pb-4">
              {publicReports.length === 0 ? (
                <div className="text-center py-10">
                  <Star size={32} className="text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-stone-500">Aucun signalement public pour cet immeuble</p>
                </div>
              ) : (
                publicReports.map((report) => (
                  <ReportCard key={report.id} report={report} compact />
                ))
              )}
            </div>
          )}

          {activeTab === "demarches" && (
            <div className="space-y-2.5 pb-4">
              {allActions.length === 0 ? (
                <div className="text-center py-10 pb-4">
                  <FileText size={32} className="text-stone-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-stone-600 mb-1">Aucune démarche</p>
                  <p className="text-xs text-stone-400 mb-4">
                    Formalisez votre signalement avec une lettre officielle.
                  </p>
                  <button
                    onClick={() => setActionSheetOpen(true)}
                    className="h-10 px-5 rounded-xl bg-brand-500 text-white text-sm font-semibold"
                  >
                    Commencer une démarche
                  </button>
                </div>
              ) : (
                allActions.map((action) => (
                  <div key={action.id} className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-3">
                    <span className="text-xl">
                      {action.type === "LETTRE_SYNDIC" ? "📬" : action.type === "LETTRE_MAIRIE" ? "🏛️" : action.type === "LETTRE_BAILLEUR" ? "🏠" : "✉️"}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-stone-900">
                        {action.type === "LETTRE_SYNDIC" ? "Lettre au syndic" :
                         action.type === "LETTRE_MAIRIE" ? "Courrier mairie" :
                         action.type === "LETTRE_BAILLEUR" ? "Lettre bailleur" : "Recommandé AR24"}
                      </p>
                      <span className={cn("text-[11px] font-medium px-1.5 py-0.5 rounded-full",
                        action.status === "SENT" ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"
                      )}>
                        {action.status === "SENT" ? "✓ Envoyé" : "✏ Brouillon"}
                      </span>
                    </div>
                    <ChevronRight size={15} className="text-stone-400" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Action bottom sheet */}
      <BottomSheet open={actionSheetOpen} onClose={() => setActionSheetOpen(false)} title="Choisir une action">
        <div className="px-4 py-3 pb-8 space-y-2.5">
          {ACTION_TYPES.map((action) => (
            <button
              key={action.id}
              onClick={() => setActionSheetOpen(false)}
              className="w-full flex items-center gap-3.5 p-4 rounded-2xl border border-stone-100 bg-white active:bg-stone-50 transition-colors text-left"
            >
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl", action.bg)}>
                {action.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-900">{action.label}</p>
                <p className="text-xs text-stone-500">{action.description}</p>
              </div>
              <ChevronRight size={16} className="text-stone-400" />
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomNav />
    </div>
  );
}
