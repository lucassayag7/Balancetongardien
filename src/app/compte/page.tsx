"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  Shield,
  ChevronRight,
  Bell,
  FileText,
  HelpCircle,
  LogOut,
  Building2,
  Award,
} from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ScoreGauge from "@/components/ui/ScoreGauge";
import { VerifiedBadge } from "@/components/ui/Badge";
import { fetchUser } from "@/lib/api";
import type { UserAPI, BuildingAPI } from "@/lib/api";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const MENU_SECTIONS = [
  {
    title: "Mon compte",
    items: [
      { icon: Building2, label: "Mes immeubles", href: "/" },
      { icon: FileText, label: "Mes démarches", href: "/mes-signalements" },
      { icon: Award, label: "Mes contributions", href: "/mes-signalements" },
    ],
  },
  {
    title: "Préférences",
    items: [
      { icon: Bell, label: "Notifications", href: "/" },
      { icon: Shield, label: "Confidentialité", href: "/" },
      { icon: Settings, label: "Paramètres", href: "/" },
    ],
  },
  {
    title: "Aide",
    items: [
      { icon: HelpCircle, label: "Guide d'utilisation", href: "/" },
      { icon: FileText, label: "Mentions légales & CGU", href: "/" },
    ],
  },
];

export default function ComptePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserAPI | null>(null);
  const [myBuilding, setMyBuilding] = useState<BuildingAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    fetchUser()
      .then(({ user }) => {
        setUser(user);
        if (user?.buildings?.[0]) {
          setMyBuilding(user.buildings[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/auth");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  };

  const displayName = user?.pseudo ?? "Utilisateur";
  const reportCount = user?.reportCount ?? 0;
  const validationCount = user?.validationCount ?? 0;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface">
      <Header
        title="Mon profil"
        rightAction={
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100">
            <Settings size={16} className="text-stone-600" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 space-y-5 pb-20">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {loading ? "?" : displayName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-base font-bold text-stone-900">
                  {loading ? "Chargement..." : displayName}
                </p>
                {user?.verified && <VerifiedBadge />}
              </div>
              <p className="text-xs text-stone-500">{user?.email ?? ""}</p>
              {memberSince && (
                <p className="text-xs text-stone-400 mt-0.5">Membre depuis {memberSince}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-50">
            <div className="text-center">
              <p className="text-lg font-bold text-stone-900">{reportCount}</p>
              <p className="text-[10px] text-stone-500">Signalements</p>
            </div>
            <div className="text-center border-x border-stone-50">
              <p className="text-lg font-bold text-brand-500">{validationCount}</p>
              <p className="text-[10px] text-stone-500">Confirmations</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">0</p>
              <p className="text-[10px] text-stone-500">Lettres envoyées</p>
            </div>
          </div>
        </div>

        {/* Mon immeuble */}
        {myBuilding && (
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
                  <span className={cn("font-semibold", myBuilding.score < 3 ? "text-red-600" : "text-green-600")}>
                    {myBuilding.score.toFixed(1)}/5
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Badge / Niveau */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🌟</span>
            </div>
            <div>
              <p className="text-sm font-bold">Résident actif</p>
              <p className="text-xs text-white/80">
                Vous avez signalé {reportCount} problème{reportCount > 1 ? "s" : ""}. Continuez !
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/80 mb-1">
              <span>Progression vers "Vigilant"</span>
              <span>{reportCount}/10</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${Math.min((reportCount / 10) * 100, 100)}%` }}
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
              {section.items.map(({ icon: Icon, label, href }) => (
                <Link key={label} href={href}>
                  <div className="flex items-center gap-3 px-4 py-3.5 active:bg-stone-50 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center">
                      <Icon size={15} className="text-stone-600" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-stone-800">{label}</span>
                    <ChevronRight size={15} className="text-stone-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border border-stone-200 text-stone-500 text-sm font-medium active:bg-stone-50 disabled:opacity-50"
        >
          <LogOut size={16} />
          {signingOut ? "Déconnexion..." : "Se déconnecter"}
        </button>

        <p className="text-center text-[10px] text-stone-300 pb-2">
          Balance ton gardien v1.0.0 · Données protégées RGPD
        </p>
      </div>
      </div>

      <BottomNav />
    </div>
  );
}
