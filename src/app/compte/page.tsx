"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Shield,
  ChevronRight,
  Bell,
  FileText,
  HelpCircle,
  LogOut,
  Edit3,
  Star,
  Award,
  Building2,
} from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ScoreGauge from "@/components/ui/ScoreGauge";
import { VerifiedBadge } from "@/components/ui/Badge";
import { MOCK_USER, MOCK_BUILDINGS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const MENU_SECTIONS = [
  {
    title: "Mon compte",
    items: [
      { icon: Building2, label: "Mes immeubles", href: "/", badge: "1" },
      { icon: FileText, label: "Mes démarches", href: "/mes-signalements", badge: null },
      { icon: Award, label: "Mes contributions", href: "/mes-signalements", badge: `${MOCK_USER.reportCount + MOCK_USER.validationCount}` },
    ],
  },
  {
    title: "Préférences",
    items: [
      { icon: Bell, label: "Notifications", href: "/", badge: null },
      { icon: Shield, label: "Confidentialité", href: "/", badge: null },
      { icon: Settings, label: "Paramètres", href: "/", badge: null },
    ],
  },
  {
    title: "Aide",
    items: [
      { icon: HelpCircle, label: "Guide d'utilisation", href: "/", badge: null },
      { icon: FileText, label: "Mentions légales & CGU", href: "/", badge: null },
    ],
  },
];

export default function ComptePage() {
  const [editingPseudo, setEditingPseudo] = useState(false);

  const myBuilding = MOCK_BUILDINGS[0];

  return (
    <div className="min-h-screen bg-surface pb-24">
      <Header
        title="Mon profil"
        rightAction={
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100">
            <Settings size={16} className="text-stone-600" />
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-5">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {MOCK_USER.pseudo.charAt(0).toUpperCase()}
                </span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-stone-900 rounded-full flex items-center justify-center">
                <Edit3 size={11} className="text-white" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-base font-bold text-stone-900">{MOCK_USER.pseudo}</p>
                {MOCK_USER.verified && <VerifiedBadge />}
              </div>
              <p className="text-xs text-stone-500">{MOCK_USER.email}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Membre depuis{" "}
                {MOCK_USER.createdAt.toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-50">
            <div className="text-center">
              <p className="text-lg font-bold text-stone-900">{MOCK_USER.reportCount}</p>
              <p className="text-[10px] text-stone-500">Signalements</p>
            </div>
            <div className="text-center border-x border-stone-50">
              <p className="text-lg font-bold text-brand-500">{MOCK_USER.validationCount}</p>
              <p className="text-[10px] text-stone-500">Confirmations</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">2</p>
              <p className="text-[10px] text-stone-500">Lettres envoyées</p>
            </div>
          </div>
        </div>

        {/* Mon immeuble */}
        <div className="bg-white rounded-2xl border border-brand-100 shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
              Mon immeuble
            </p>
            <Link href={`/immeuble/${myBuilding.id}`}>
              <span className="text-xs text-brand-500 font-medium">Voir →</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ScoreGauge score={myBuilding.score} size="sm" />
            <div>
              <p className="text-sm font-semibold text-stone-900">{myBuilding.address}</p>
              <p className="text-xs text-stone-500">
                {myBuilding.reportCount} signalements · score{" "}
                <span className="font-semibold text-red-600">{myBuilding.score.toFixed(1)}/5</span>
              </p>
            </div>
          </div>
        </div>

        {/* Badge / Niveau */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🌟</span>
            </div>
            <div>
              <p className="text-sm font-bold">Résident actif</p>
              <p className="text-xs text-white/80">
                Vous avez signalé {MOCK_USER.reportCount} problèmes. Continuez !
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/80 mb-1">
              <span>Progression vers "Vigilant"</span>
              <span>{MOCK_USER.reportCount}/10</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${(MOCK_USER.reportCount / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
              {section.title}
            </p>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-card divide-y divide-stone-50">
              {section.items.map(({ icon: Icon, label, href, badge }) => (
                <Link key={label} href={href}>
                  <div className="flex items-center gap-3 px-4 py-3.5 active:bg-stone-50 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center">
                      <Icon size={15} className="text-stone-600" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-stone-800">{label}</span>
                    {badge && (
                      <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                        {badge}
                      </span>
                    )}
                    <ChevronRight size={15} className="text-stone-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border border-stone-200 text-stone-500 text-sm font-medium active:bg-stone-50">
          <LogOut size={16} />
          Se déconnecter
        </button>

        <p className="text-center text-[10px] text-stone-300 pb-2">
          Balance ton gardien v0.1.0 · Données protégées RGPD
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
