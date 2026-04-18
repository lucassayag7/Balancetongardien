"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    pseudo: "",
    acceptTerms: false,
  });

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-b from-brand-500 to-brand-600 px-6 pt-16 pb-10 text-white text-center">
        <div className="text-5xl mb-3">⚡</div>
        <h1 className="text-2xl font-bold mb-1">Balance ton gardien</h1>
        <p className="text-sm text-white/80 leading-relaxed">
          La plateforme de signalement citoyenne pour les résidents
        </p>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-surface px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 -mt-2">
          {/* Mode toggle */}
          <div className="flex bg-stone-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => setMode("signup")}
              className={cn(
                "flex-1 h-9 rounded-xl text-sm font-semibold transition-all",
                mode === "signup"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500"
              )}
            >
              Créer un compte
            </button>
            <button
              onClick={() => setMode("login")}
              className={cn(
                "flex-1 h-9 rounded-xl text-sm font-semibold transition-all",
                mode === "login"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500"
              )}
            >
              Se connecter
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1.5">
                  Pseudo (anonyme)
                </label>
                <input
                  type="text"
                  value={form.pseudo}
                  onChange={update("pseudo")}
                  placeholder="Ex: Résident75011"
                  className="w-full h-12 px-4 rounded-xl bg-stone-100 text-sm text-stone-900 placeholder-stone-400 border-0"
                />
                <p className="text-[11px] text-stone-400 mt-1.5">
                  Votre identité réelle n'est jamais affichée.
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="votre@email.com"
                required
                className="w-full h-12 px-4 rounded-xl bg-stone-100 text-sm text-stone-900 placeholder-stone-400 border-0"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-stone-100 text-sm text-stone-900 placeholder-stone-400 border-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-stone-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, acceptTerms: !p.acceptTerms }))}
                className="flex items-start gap-3 w-full text-left"
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                    form.acceptTerms
                      ? "bg-brand-500 border-brand-500"
                      : "border-stone-300"
                  )}
                >
                  {form.acceptTerms && (
                    <Check size={11} className="text-white" strokeWidth={3} />
                  )}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  J'accepte les{" "}
                  <span className="text-brand-500 font-medium">CGU</span> et la{" "}
                  <span className="text-brand-500 font-medium">politique de confidentialité</span>.
                  Je certifie que mes signalements sont véridiques.
                </p>
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || (mode === "signup" && !form.acceptTerms)}
              className={cn(
                "w-full h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-2",
                isLoading || (mode === "signup" && !form.acceptTerms)
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : "bg-brand-500 text-white active:bg-brand-600"
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "signup" ? "Créer mon compte" : "Se connecter"}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Trust signals */}
        <div className="mt-5 space-y-2.5 pb-8">
          {[
            { icon: "🔒", text: "Données chiffrées et protégées (RGPD)" },
            { icon: "👤", text: "Identité anonymisée — seul votre pseudo est visible" },
            { icon: "⚖️", text: "Signalements soumis à vérification" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <span className="text-base">{icon}</span>
              <p className="text-xs text-stone-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
