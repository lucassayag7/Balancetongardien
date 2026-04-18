"use client";

import Link from "next/link";
import Image from "next/image";
import { ThumbsUp, MapPin, Clock, Shield, Eye, Users, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryBadge, SeverityBadge, VerifiedBadge } from "@/components/ui/Badge";
import { timeAgo } from "@/lib/mock-data";
import type { Report } from "@/types";

interface ReportCardProps {
  report: Report;
  compact?: boolean;
}

const VISIBILITY_ICONS = {
  public: { icon: Eye, label: "Public" },
  voisins: { icon: Users, label: "Voisins" },
  prive: { icon: Lock, label: "Privé" },
};

export default function ReportCard({ report, compact = false }: ReportCardProps) {
  const confirmCount = report.validations.filter((v) => v.type === "confirm").length;
  const hasImage = report.media.length > 0 && report.media[0].type === "image";
  const VisIcon = VISIBILITY_ICONS[report.visibility].icon;

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden active:scale-[0.98] transition-transform">
        <div className="flex gap-3 p-3">
          {hasImage && (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={report.media[0].url}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <CategoryBadge category={report.category} />
              <SeverityBadge severity={report.severity} />
            </div>
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
              {report.description || "Signalement sans description"}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-stone-400">{timeAgo(report.createdAt)}</span>
              {confirmCount > 0 && (
                <span className="text-[10px] text-brand-500 font-medium">
                  +{confirmCount} confirmations
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white rounded-2xl shadow-card overflow-hidden active:scale-[0.99] transition-transform">
      {/* Image */}
      {hasImage ? (
        <div className="relative h-44 w-full">
          <Image
            src={report.media[0].url}
            alt={`Photo signalement ${report.category}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 card-gradient" />
          {/* Badges on image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <CategoryBadge category={report.category} />
            <SeverityBadge severity={report.severity} />
          </div>
          {/* Visibility */}
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-[10px] font-medium bg-black/40 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              <VisIcon size={10} />
              {VISIBILITY_ICONS[report.visibility].label}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-14 bg-gradient-to-r from-stone-100 to-stone-50 flex items-center px-4 gap-2">
          <CategoryBadge category={report.category} />
          <SeverityBadge severity={report.severity} />
          <div className="ml-auto">
            <span className="flex items-center gap-1 text-[10px] font-medium text-stone-400">
              <VisIcon size={10} />
              {VISIBILITY_ICONS[report.visibility].label}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Address */}
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin size={12} className="text-stone-400 flex-shrink-0" />
          <Link
            href={`/immeuble/b1`}
            className="text-xs text-stone-500 hover:text-brand-500 transition-colors truncate"
          >
            {report.address}
          </Link>
        </div>

        {/* Description */}
        {report.description && (
          <p className="text-sm text-stone-700 leading-relaxed line-clamp-3 mb-3">
            {report.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Author */}
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-[9px] font-bold text-brand-600">
                  {report.userPseudo.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-stone-500">{report.userPseudo}</span>
              {report.userVerified && <VerifiedBadge />}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Time */}
            <span className="flex items-center gap-1 text-[11px] text-stone-400">
              <Clock size={10} />
              {timeAgo(report.createdAt)}
            </span>

            {/* Validations */}
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-50 active:bg-brand-50 transition-colors group">
              <ThumbsUp
                size={13}
                className={cn(
                  "transition-colors",
                  confirmCount > 0 ? "text-brand-500" : "text-stone-400 group-active:text-brand-400"
                )}
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  confirmCount > 0 ? "text-brand-500" : "text-stone-400"
                )}
              >
                {confirmCount}
              </span>
            </button>
          </div>
        </div>

        {/* Actions taken */}
        {report.actions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-stone-50 flex items-center gap-1.5 flex-wrap">
            {report.actions.map((action) => (
              <span
                key={action.id}
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full",
                  action.status === "sent"
                    ? "bg-green-50 text-green-700"
                    : "bg-stone-100 text-stone-500"
                )}
              >
                {action.status === "sent" ? "✉ Lettre envoyée" : "📝 Brouillon"}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
