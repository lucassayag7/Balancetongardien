"use client";

import Link from "next/link";

export default function AccountConfirmedPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 text-center">
        {/* Icône succès */}
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#22c55e" fillOpacity="0.15" />
            <path
              d="M12 20.5l6 6 10-12"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Logo */}
        <p className="text-2xl mb-2">⚡</p>

        {/* Titre */}
        <h1 className="text-xl font-bold text-stone-900 mb-2">
          Compte confirmé !
        </h1>
        <p className="text-sm text-stone-500 leading-relaxed mb-6">
          Votre adresse email a bien été vérifiée. Votre compte{" "}
          <strong>Balance ton gardien</strong> est maintenant actif.
        </p>

        {/* CTA */}
        <Link href="/auth">
          <button className="w-full h-12 bg-brand-500 text-white rounded-2xl font-semibold text-sm active:bg-brand-600 transition-colors">
            Se connecter →
          </button>
        </Link>
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-stone-400 text-center">
        Balance ton gardien · La voix des résidents
      </p>
    </div>
  );
}
