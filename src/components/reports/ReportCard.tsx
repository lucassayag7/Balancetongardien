"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThumbsUp, MapPin, Clock, Eye, Users, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateReport } from "@/lib/api";
import type { ReportAPI } from "@/lib/api";
import { useUser } from "@/hooks/useUser";

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  NETTOYAGE: { label: "Nettoyage", icon: "🧹", color: "text-blue-600", bg: "bg-blue-50" },
  MAINTENANCE: { label: "Maintenance", icon: "🔧", color: "text-amber-600", bg: "bg-amber-50" },
  PRESENCE: { label: "Présence", icon: "🚪", color: "text-violet-600", bg: "bg-violet-50" },
  COMPORTEMENT: { label: "Comportement", icon: "⚠️", color: "text-red-600", bg: "bg-red-50" },
  SECURITE: { label: "Sécurité", icon: "🔒", color: "text-orange-600", bg: "bg-orange-50" },
  ADMINISTRATIF: { label: "Administratif", icon: "📄", color: "text-emerald-600", bg: "bg-emerald-50" },
};

const SEVERITY_LABELS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  MINEUR: { label: "Mineur", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  MODERE: { label: "Modéré", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
  GRAVE: { label: "Grave", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
};

const VISIBILITY_ICONS: Record<string, { icon: React.ElementType; label: string }> = {
  PUBLIC: { icon: Eye, label: "Public" },
  VOISINS: { icon: Users, label: "Voisins" },
  PRIVE: { icon: Lock, label: "Privé" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7) return `il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

interface ReportCardProps {
  report: ReportAPI;
  compact?: boolean;
  onValidated?: () => void;
}

export default function ReportCard({ report, compact = false, onValidated }: ReportCardProps) {
  const { user } = useUser();
  const [validations, setValidations] = useState(report.validations);
  const [isValidating, setIsValidating] = useState(false);

  const confirmCount = validations.filter((v) => v.type === "CONFIRM").length;
  const hasImage = report.media.length > 0 && report.media[0].type === "IMAGE";
  const cat = CATEGORY_LABELS[report.category] ?? CATEGORY_LABELS.NETTOYAGE;
  const sev = SEVERITY_LABELS[report.severity] ?? SEVERITY_LABELS.MODERE;
  const vis = VISIBILITY_ICONS[report.visibility] ?? VISIBILITY_ICONS.PUBLIC;
  const VisIcon = vis.icon;
  const hasConfirmed = user ? validations.some((v) => v.userId === user.id && v.type === "CONFIRM") : false;
  const isOwn = user?.id === report.userId;
  const address = report.building
    ? `${report.building.address}, ${report.building.city}`
    : "Adresse inconnue";

  const handleValidate = async () => {
    if (!user || isOwn || isValidating) return;
    setIsValidating(true);
    try {
      await validateReport(report.id, "CONFIRM");
      const newVal = { id: `v-${Date.now()}`, type: "CONFIRM", userId: user.id };
      setValidations((prev) =>
        hasConfirmed ? prev.filter((v) => v.userId !== user.id) : [...prev, newVal]
      );
      onValidated?.();
    } catch {}
    setIsValidating(false);
  };

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden">
        <div className="flex gap-3 p-3">
          {hasImage && (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <Image src={report.media[0].url} alt="" fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", cat.bg, cat.color)}>
                {cat.icon} {cat.label}
              </span>
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1", sev.bg, sev.color)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", sev.dot)} />{sev.label}
              </span>
            </div>
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
              {report.description || "Signalement sans description"}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-stone-400">{timeAgo(report.createdAt)}</span>
              {confirmCount > 0 && (
                <span className="text-[10px] text-brand-500 font-medium">+{confirmCount} confirmations</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white rounded-2xl shadow-card overflow-hidden">
      {hasImage ? (
        <div className="relative h-44 w-full">
          <Image src={report.media[0].url} alt="" fill className="object-cover" />
          <div className="absolute inset-0 card-gradient" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", cat.bg, cat.color)}>
              {cat.icon} {cat.label}
            </span>
            <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1", sev.bg, sev.color)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", sev.dot)} />{sev.label}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-[10px] font-medium bg-black/40 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              <VisIcon size={10} /> {vis.label}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-14 bg-gradient-to-r from-stone-100 to-stone-50 flex items-center px-4 gap-2">
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", cat.bg, cat.color)}>
            {cat.icon} {cat.label}
          </span>
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1", sev.bg, sev.color)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", sev.dot)} />{sev.label}
          </span>
          <div className="ml-auto">
            <span className="flex items-center gap-1 text-[10px] font-medium text-stone-400">
              <VisIcon size={10} /> {vis.label}
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin size={12} className="text-stone-400 flex-shrink-0" />
          <Link href={`/immeuble/${report.buildingId}`}>
            <span className="text-xs text-stone-500 hover:text-brand-500 transition-colors truncate">
              {address}
            </span>
          </Link>
        </div>

        {report.description && (
          <p className="text-sm text-stone-700 leading-relaxed line-clamp-3 mb-3">
            {report.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-[9px] font-bold text-brand-600">R</span>
            </div>
            <span className="text-xs text-stone-500">Résident</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-stone-400">
              <Clock size={10} />
              {timeAgo(report.createdAt)}
            </span>

            <button
              onClick={handleValidate}
              disabled={isOwn || isValidating}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors",
                isOwn ? "opacity-40 cursor-not-allowed" : "active:bg-brand-50",
                hasConfirmed ? "bg-brand-50" : "bg-stone-50"
              )}
            >
              <ThumbsUp
                size={13}
                className={cn(
                  "transition-colors",
                  hasConfirmed ? "text-brand-500 fill-brand-500" : "text-stone-400"
                )}
              />
              <span className={cn("text-xs font-semibold", hasConfirmed ? "text-brand-500" : "text-stone-400")}>
                {confirmCount}
              </span>
            </button>
          </div>
        </div>

        {report.actions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-stone-50 flex items-center gap-1.5 flex-wrap">
            {report.actions.map((action) => (
              <span
                key={action.id}
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full",
                  action.status === "SENT" ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"
                )}
              >
                {action.status === "SENT" ? "✉ Lettre envoyée" : "📝 Brouillon"}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
