"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, AlertCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ReportCard from "@/components/reports/ReportCard";
import { ReportCardSkeleton } from "@/components/ui/Skeleton";
import { fetchMyReports } from "@/lib/api";
import type { ReportAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

type TabId = "mes" | "notifications";

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${days}j`;
}

const NOTIFICATIONS = [
  { id: "n1", type: "validation", message: "Un voisin a confirmé votre signalement.", time: new Date(Date.now() - 3600000), read: false },
  { id: "n2", type: "building", message: "Nouveau signalement dans votre immeuble.", time: new Date(Date.now() - 172800000), read: true },
];

const NOTIFICATION_ICONS: Record<string, string> = {
  validation: "👍",
  action: "✉️",
  building: "🏢",
  reminder: "⏰",
};

export default function MesSignalementsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("mes");
  const [reports, setReports] = useState<ReportAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => {
    fetchMyReports()
      .then(({ reports }) => setReports(reports))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  const confirmCount = reports.reduce(
    (acc, r) => acc + r.validations.filter((v) => v.type === "CONFIRM").length,
    0
  );
  const sentCount = reports.filter((r) => r.actions.some((a) => a.status === "SENT")).length;

  return (
    <div className="min-h-screen bg-surface pb-24">
      <Header
        title="Mes alertes"
        rightAction={
          <Link href="/signaler">
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-brand-500 text-white text-xs font-semibold">
              <Plus size={13} strokeWidth={3} />
              Signaler
            </button>
          </Link>
        }
      />

      {/* Tabs */}
      <div className="px-4 py-3">
        <div className="flex bg-stone-100 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab("mes")}
            className={cn(
              "flex-1 h-9 rounded-xl text-sm font-medium transition-all",
              activeTab === "mes" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
            )}
          >
            Mes signalements ({loading ? "…" : reports.length})
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "flex-1 h-9 rounded-xl text-sm font-medium transition-all relative",
              activeTab === "notifications" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
            )}
          >
            Notifications
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-3 w-4 h-4 bg-brand-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {activeTab === "mes" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-3 text-center">
                <p className="text-xl font-bold text-stone-900">{loading ? "…" : reports.length}</p>
                <p className="text-[10px] text-stone-500">Total</p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-3 text-center">
                <p className="text-xl font-bold text-brand-500">{loading ? "…" : confirmCount}</p>
                <p className="text-[10px] text-stone-500">Confirmations</p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-3 text-center">
                <p className="text-xl font-bold text-green-600">{loading ? "…" : sentCount}</p>
                <p className="text-[10px] text-stone-500">Lettres envoyées</p>
              </div>
            </div>

            {/* Reports */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <ReportCardSkeleton key={i} />)}
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle size={40} className="text-stone-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-stone-600 mb-1">Aucun signalement</p>
                <p className="text-xs text-stone-400 mb-5">
                  Documentez les manquements de votre gardien.
                </p>
                <Link href="/signaler">
                  <button className="h-10 px-5 rounded-xl bg-brand-500 text-white text-sm font-semibold">
                    Créer un signalement
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <ReportCard key={report.id} report={report} compact />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-2">
            {NOTIFICATIONS.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-2xl border transition-all",
                  notif.read ? "bg-white border-stone-100" : "bg-brand-50 border-brand-100"
                )}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{NOTIFICATION_ICONS[notif.type]}</span>
                <div className="flex-1">
                  <p className={cn("text-sm leading-relaxed", notif.read ? "text-stone-600" : "text-stone-900 font-medium")}>
                    {notif.message}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">{timeAgo(notif.time)}</p>
                </div>
                {!notif.read && <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
