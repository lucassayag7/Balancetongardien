"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Users,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  ChevronRight,
  FileText,
  Send,
  Bell,
  Share2,
  Star,
} from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ReportCard from "@/components/reports/ReportCard";
import ScoreGauge from "@/components/ui/ScoreGauge";
import BottomSheet from "@/components/ui/BottomSheet";
import { CategoryBadge } from "@/components/ui/Badge";
import { MOCK_BUILDINGS, scoreBgColor, scoreColor, scoreLabel } from "@/lib/mock-data";
import { CATEGORY_CONFIG } from "@/types";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

const TREND_CONFIG = {
  improving: { icon: TrendingUp, label: "S'améliore", color: "text-green-600", bg: "bg-green-50" },
  stable: { icon: Minus, label: "Stable", color: "text-stone-500", bg: "bg-stone-50" },
  degrading: { icon: TrendingDown, label: "Se dégrade", color: "text-red-500", bg: "bg-red-50" },
};

const ACTION_TYPES = [
  {
    id: "letter_syndic",
    label: "Lettre au syndic",
    description: "Signalement formel au gestionnaire",
    icon: "📬",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "letter_bailleur",
    label: "Lettre au bailleur",
    description: "Mise en demeure au propriétaire",
    icon: "🏠",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    id: "letter_mairie",
    label: "Courrier à la mairie",
    description: "Signalement aux services municipaux",
    icon: "🏛️",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    id: "ar24",
    label: "Recommandé électronique",
    description: "Envoi AR24 avec valeur légale",
    icon: "✉️",
    color: "text-brand-600",
    bg: "bg-brand-50",
  },
];

export default function ImmeubleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const building = MOCK_BUILDINGS.find((b) => b.id === params.id) ?? MOCK_BUILDINGS[0];
  const [activeTab, setActiveTab] = useState<"signalements" | "demarches">("signalements");
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const trend = TREND_CONFIG[building.trend];
  const TrendIcon = trend.icon;

  const publicReports = building.reports.filter((r) => r.visibility === "public");

  return (
    <div className="min-h-screen bg-surface pb-24">
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

      <div className="space-y-4">
        {/* Score hero */}
        <div className="bg-white px-4 py-5 border-b border-stone-100">
          <div className="flex items-center gap-5 mb-4">
            <ScoreGauge score={building.score} size="lg" />

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5",
                    trend.bg,
                    trend.color
                  )}
                >
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
                  <p className="text-lg font-bold text-stone-900">{building.verifiedResidentCount}</p>
                  <p className="text-[10px] text-stone-500">Vérifiés</p>
                </div>
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2.5">
              Détail par catégorie
            </p>
            {(Object.entries(building.scoreBreakdown) as [Category, number][]).map(
              ([cat, score]) => {
                const config = CATEGORY_CONFIG[cat];
                const width = (score / 5) * 100;
                const barColor =
                  score >= 4 ? "bg-green-400" : score >= 3 ? "bg-amber-400" : "bg-red-400";
                return (
                  <div key={cat} className="flex items-center gap-2.5">
                    <span className="text-sm w-5 text-center">{config.icon}</span>
                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", barColor)}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-stone-600 w-7 text-right">
                      {score.toFixed(1)}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* CTA band */}
        <div className="px-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => setActionSheetOpen(true)}
            className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-brand-500 text-white text-sm font-semibold active:bg-brand-600 transition-colors"
          >
            <FileText size={16} />
            Agir
          </button>
          <Link href="/signaler">
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
                <p className="text-xs text-stone-500">{building.syndicEmail}</p>
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
                activeTab === "signalements"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500"
              )}
            >
              Signalements ({publicReports.length})
            </button>
            <button
              onClick={() => setActiveTab("demarches")}
              className={cn(
                "flex-1 h-9 rounded-xl text-sm font-medium transition-all",
                activeTab === "demarches"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500"
              )}
            >
              Mes démarches
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
            <DemarchesTab building={building} onAction={() => setActionSheetOpen(true)} />
          )}
        </div>
      </div>

      {/* Action bottom sheet */}
      <BottomSheet
        open={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        title="Choisir une action"
      >
        <div className="px-4 py-3 pb-8 space-y-2.5">
          {ACTION_TYPES.map((action) => (
            <button
              key={action.id}
              onClick={() => setActionSheetOpen(false)}
              className="w-full flex items-center gap-3.5 p-4 rounded-2xl border border-stone-100 bg-white active:bg-stone-50 transition-colors text-left"
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl",
                  action.bg
                )}
              >
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

function DemarchesTab({
  building,
  onAction,
}: {
  building: (typeof MOCK_BUILDINGS)[0];
  onAction: () => void;
}) {
  const allActions = building.reports.flatMap((r) =>
    r.actions.map((a) => ({ ...a, reportId: r.id, reportCategory: r.category }))
  );

  if (allActions.length === 0) {
    return (
      <div className="text-center py-10 pb-4">
        <FileText size={32} className="text-stone-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-stone-600 mb-1">Aucune démarche</p>
        <p className="text-xs text-stone-400 mb-4">
          Formalisez votre signalement avec une lettre officielle.
        </p>
        <button
          onClick={onAction}
          className="h-10 px-5 rounded-xl bg-brand-500 text-white text-sm font-semibold"
        >
          Commencer une démarche
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 pb-4">
      {allActions.map((action) => (
        <div
          key={action.id}
          className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-3"
        >
          <span className="text-xl">
            {action.type.includes("syndic")
              ? "📬"
              : action.type.includes("mairie")
              ? "🏛️"
              : action.type.includes("bailleur")
              ? "🏠"
              : "✉️"}
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-stone-900">
              {action.type === "letter_syndic"
                ? "Lettre au syndic"
                : action.type === "letter_mairie"
                ? "Courrier mairie"
                : action.type === "letter_bailleur"
                ? "Lettre bailleur"
                : "Recommandé AR24"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CategoryBadge category={action.reportCategory as Category} />
              <span
                className={cn(
                  "text-[11px] font-medium px-1.5 py-0.5 rounded-full",
                  action.status === "sent"
                    ? "bg-green-50 text-green-700"
                    : action.status === "responded"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-stone-100 text-stone-500"
                )}
              >
                {action.status === "sent"
                  ? "✓ Envoyé"
                  : action.status === "responded"
                  ? "↩ Répondu"
                  : "✏ Brouillon"}
              </span>
            </div>
          </div>
          <ChevronRight size={15} className="text-stone-400" />
        </div>
      ))}
    </div>
  );
}
