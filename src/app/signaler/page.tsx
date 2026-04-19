"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera, ImageIcon, ArrowRight, ArrowLeft, X, MapPin,
  Navigation, Check, Send, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG, VISIBILITY_CONFIG } from "@/types";
import type { Category, Severity, Recurrence, Visibility } from "@/types";
import Header from "@/components/layout/Header";
import { uploadMedia, createReport, searchAdresse } from "@/lib/api";
import type { AdresseResult } from "@/lib/api";

const STEPS = [
  { id: 1, label: "Preuve", icon: "📸" },
  { id: 2, label: "Catégorie", icon: "🗂️" },
  { id: 3, label: "Détails", icon: "📝" },
  { id: 4, label: "Adresse", icon: "📍" },
  { id: 5, label: "Visibilité", icon: "👁️" },
  { id: 6, label: "Actions", icon: "✉️" },
  { id: 7, label: "Envoi", icon: "✅" },
];

interface FormState {
  mediaFile: File | null;
  mediaPreviewUrl: string;
  mediaUrl: string;
  uploadingMedia: boolean;
  category: Category | null;
  severity: Severity;
  recurrence: Recurrence;
  description: string;
  address: string;
  postalCode: string;
  city: string;
  lat: number | null;
  lng: number | null;
  buildingId: string | null;
  visibility: Visibility;
  notifySyndic: boolean;
  generateLetter: boolean;
}

const INITIAL: FormState = {
  mediaFile: null, mediaPreviewUrl: "", mediaUrl: "", uploadingMedia: false,
  category: null, severity: "modere", recurrence: "premiere_fois", description: "",
  address: "", postalCode: "", city: "", lat: null, lng: null, buildingId: null,
  visibility: "public", notifySyndic: false, generateLetter: false,
};

function toUpperEnum(val: string) {
  return val.toUpperCase().replace(/-/g, "_");
}

export default function SignalerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdBuildingId, setCreatedBuildingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (updates: Partial<FormState>) => setForm((p) => ({ ...p, ...updates }));

  const canProceed = (): boolean => {
    if (step === 2) return form.category !== null;
    if (step === 4) return form.address.trim().length > 0 && form.city.trim().length > 0;
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    update({ mediaFile: file, mediaPreviewUrl: previewUrl, uploadingMedia: true });
    try {
      const url = await uploadMedia(file);
      update({ mediaUrl: url, uploadingMedia: false });
    } catch {
      update({ mediaUrl: "", uploadingMedia: false });
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      update({ lat, lng });
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`
        );
        const data = await res.json();
        const f = data.features?.[0];
        if (f) {
          update({
            address: `${f.properties.housenumber ?? ""} ${f.properties.street ?? f.properties.name ?? ""}`.trim(),
            postalCode: f.properties.postcode,
            city: f.properties.city,
            lat, lng,
          });
        }
      } catch {}
    });
  };

  const handleSubmit = async () => {
    if (!form.category) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createReport({
        address: form.address,
        postalCode: form.postalCode,
        city: form.city,
        lat: form.lat ?? undefined,
        lng: form.lng ?? undefined,
        buildingId: form.buildingId ?? undefined,
        category: toUpperEnum(form.category),
        severity: toUpperEnum(form.severity),
        recurrence: toUpperEnum(form.recurrence),
        description: form.description || undefined,
        visibility: toUpperEnum(form.visibility),
        mediaUrls: form.mediaUrl ? [form.mediaUrl] : [],
        notifySyndic: form.notifySyndic,
      });
      setCreatedBuildingId(result.buildingId ?? null);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la publication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  if (submitted) {
    return (
      <SuccessScreen
        onHome={() => router.push("/")}
        onBuilding={() => createdBuildingId ? router.push(`/immeuble/${createdBuildingId}`) : router.push("/")}
        form={form}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header
        showBack={step === 1}
        title={step > 1 ? STEPS[step - 1].label : undefined}
        rightAction={
          step === 1 ? (
            <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100">
              <X size={16} className="text-stone-600" />
            </button>
          ) : undefined
        }
      />

      {/* Progress bar */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-medium text-stone-500">Étape {step} sur {STEPS.length}</p>
          <div className="flex gap-1">
            {STEPS.map((s) => (
              <span key={s.id} className={cn("text-sm transition-all", s.id <= step ? "opacity-100" : "opacity-20")}>
                {s.icon}
              </span>
            ))}
          </div>
        </div>
        <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Contenu de l'étape */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-5 pb-8 animate-fade-in" key={step}>
          {step === 1 && <StepMedia form={form} fileRef={fileRef} onFile={handleFileChange} update={update} />}
          {step === 2 && <StepCategory form={form} update={update} />}
          {step === 3 && <StepDetails form={form} update={update} />}
          {step === 4 && <StepAddress form={form} update={update} onGeolocate={handleGeolocate} />}
          {step === 5 && <StepVisibility form={form} update={update} />}
          {step === 6 && <StepActions form={form} update={update} />}
          {step === 7 && <StepConfirm form={form} error={error} />}
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-stone-100 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center justify-center w-12 h-12 rounded-2xl border border-stone-200 active:bg-stone-50"
            >
              <ArrowLeft size={18} className="text-stone-600" />
            </button>
          )}

          {step < 7 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className={cn(
                "flex-1 h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                canProceed() ? "bg-brand-500 text-white active:bg-brand-600" : "bg-stone-100 text-stone-400 cursor-not-allowed"
              )}
            >
              Continuer <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-2xl bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 active:bg-brand-600"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Publication...</>
              ) : (
                <><Send size={16} strokeWidth={2.5} /> Publier le signalement</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Media ─────────────────────────────────────────────────── */
function StepMedia({ form, fileRef, onFile, update }: { form: FormState; fileRef: React.RefObject<HTMLInputElement>; onFile: (e: React.ChangeEvent<HTMLInputElement>) => void; update: (u: Partial<FormState>) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-stone-900 mb-1">Ajoutez une preuve</h2>
      <p className="text-sm text-stone-500 mb-6">Une photo ou vidéo renforce la crédibilité de votre signalement.</p>

      {form.mediaPreviewUrl ? (
        <div className="space-y-3 mb-4">
          <div className="relative rounded-2xl overflow-hidden">
            <Image src={form.mediaPreviewUrl} alt="Preview" width={400} height={250} className="w-full h-52 object-cover" />
            <button
              onClick={() => update({ mediaFile: null, mediaPreviewUrl: "", mediaUrl: "" })}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
            >
              <X size={14} className="text-white" />
            </button>
            <div className="absolute bottom-3 left-3">
              {form.uploadingMedia ? (
                <span className="flex items-center gap-1.5 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                  <Loader2 size={11} className="animate-spin" /> Upload...
                </span>
              ) : form.mediaUrl ? (
                <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                  <Check size={11} /> Preuve ajoutée
                </span>
              ) : (
                <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  ⚠ Upload échoué
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-44 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 flex flex-col items-center justify-center gap-3 active:bg-brand-100 transition-colors"
          >
            <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center">
              <Camera size={28} className="text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-brand-600">Prendre une photo</p>
              <p className="text-xs text-brand-400">ou sélectionner depuis la galerie</p>
            </div>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-12 rounded-xl border border-stone-200 bg-white text-sm font-medium text-stone-600 flex items-center justify-center gap-2 active:bg-stone-50"
          >
            <ImageIcon size={16} className="text-stone-400" /> Galerie photo
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={onFile} />

      <div className="bg-stone-50 rounded-xl p-3">
        <p className="text-xs text-stone-500 text-center">📍 Date, heure et localisation enregistrées automatiquement.</p>
      </div>
    </div>
  );
}

/* ─── Step 2: Catégorie ──────────────────────────────────────────────── */
function StepCategory({ form, update }: { form: FormState; update: (u: Partial<FormState>) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-stone-900 mb-1">Quel est le problème ?</h2>
      <p className="text-sm text-stone-500 mb-6">Sélectionnez la catégorie principale.</p>
      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]).map(([key, config]) => (
          <button
            key={key}
            onClick={() => update({ category: key })}
            className={cn(
              "relative p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.97]",
              form.category === key ? "border-brand-500 bg-brand-50 shadow-sm" : "border-stone-100 bg-white active:bg-stone-50"
            )}
          >
            {form.category === key && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
            )}
            <span className="text-2xl mb-2 block">{config.icon}</span>
            <p className="text-sm font-semibold text-stone-900">{config.label}</p>
            <p className="text-xs text-stone-500 mt-0.5 leading-tight">{config.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 3: Détails ────────────────────────────────────────────────── */
function StepDetails({ form, update }: { form: FormState; update: (u: Partial<FormState>) => void }) {
  const SEVERITIES: { value: Severity; label: string; emoji: string; desc: string }[] = [
    { value: "mineur", label: "Mineur", emoji: "🟢", desc: "Gêne légère, pas urgent" },
    { value: "modere", label: "Modéré", emoji: "🟡", desc: "Problème récurrent, impact quotidien" },
    { value: "grave", label: "Grave", emoji: "🔴", desc: "Urgent, risque pour les résidents" },
  ];
  const RECURRENCES: { value: Recurrence; label: string; emoji: string }[] = [
    { value: "premiere_fois", label: "Première fois", emoji: "1️⃣" },
    { value: "recurrent", label: "Récurrent", emoji: "🔄" },
    { value: "chronique", label: "Chronique", emoji: "📆" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-1">Décrivez le problème</h2>
        <p className="text-sm text-stone-500">Plus c'est précis, plus c'est crédible.</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-stone-700 mb-2.5">Sévérité</p>
        <div className="space-y-2">
          {SEVERITIES.map((s) => (
            <button
              key={s.value}
              onClick={() => update({ severity: s.value })}
              className={cn("w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left", form.severity === s.value ? "border-brand-500 bg-brand-50" : "border-stone-100 bg-white active:bg-stone-50")}
            >
              <span className="text-xl">{s.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-900">{s.label}</p>
                <p className="text-xs text-stone-500">{s.desc}</p>
              </div>
              {form.severity === s.value && (
                <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center ml-auto">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-stone-700 mb-2.5">Fréquence</p>
        <div className="flex gap-2">
          {RECURRENCES.map((r) => (
            <button
              key={r.value}
              onClick={() => update({ recurrence: r.value })}
              className={cn("flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all", form.recurrence === r.value ? "border-brand-500 bg-brand-50 text-brand-600" : "border-stone-100 bg-white text-stone-600 active:bg-stone-50")}
            >
              <span className="text-lg">{r.emoji}</span>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-stone-700 mb-2">
          Description <span className="text-stone-400 font-normal">(optionnel)</span>
        </p>
        <textarea
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Décrivez le problème, les circonstances, les impacts sur les résidents..."
          rows={4}
          className="w-full px-3.5 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400 resize-none leading-relaxed"
          maxLength={500}
        />
        <p className="text-right text-[11px] text-stone-400 mt-1">{form.description.length}/500</p>
      </div>
    </div>
  );
}

/* ─── Step 4: Adresse ────────────────────────────────────────────────── */
function StepAddress({ form, update, onGeolocate }: { form: FormState; update: (u: Partial<FormState>) => void; onGeolocate: () => void }) {
  const [suggestions, setSuggestions] = useState<AdresseResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query: string) => {
    update({ address: query });
    if (query.length < 3) { setSuggestions([]); return; }
    setSearching(true);
    const results = await searchAdresse(query);
    setSuggestions(results);
    setSearching(false);
  };

  const selectSuggestion = (s: AdresseResult) => {
    update({ address: s.label, postalCode: s.postcode, city: s.city, lat: s.lat, lng: s.lng });
    setSuggestions([]);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-1">Où se situe l'immeuble ?</h2>
        <p className="text-sm text-stone-500">Nécessaire pour associer le signalement à l'adresse.</p>
      </div>

      <button
        onClick={onGeolocate}
        className={cn("w-full h-14 rounded-2xl border-2 flex items-center gap-3 px-4 transition-all", form.lat ? "border-green-400 bg-green-50" : "border-brand-400 bg-brand-50 active:bg-brand-100")}
      >
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", form.lat ? "bg-green-500" : "bg-brand-500")}>
          {form.lat ? <Check size={20} className="text-white" strokeWidth={3} /> : <Navigation size={20} className="text-white" />}
        </div>
        <div className="text-left">
          <p className={cn("text-sm font-semibold", form.lat ? "text-green-700" : "text-brand-600")}>
            {form.lat ? "Position détectée !" : "Utiliser ma position GPS"}
          </p>
          <p className={cn("text-xs", form.lat ? "text-green-600" : "text-brand-400")}>
            {form.lat ? `${form.address}` : "Détection automatique de l'adresse"}
          </p>
        </div>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-xs text-stone-400 font-medium">ou</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      <div className="relative">
        <div className="relative">
          <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={form.address}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Numéro et nom de rue, ville..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400"
          />
        </div>
        {suggestions.length > 0 && (
          <div className="absolute top-12 left-0 right-0 bg-white rounded-xl border border-stone-200 shadow-lg z-10 overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => selectSuggestion(s)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-stone-50 border-b border-stone-50 last:border-0"
              >
                <MapPin size={13} className="text-brand-400 flex-shrink-0" />
                <span className="text-sm text-stone-700 truncate">{s.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {form.postalCode && (
        <div className="flex gap-2">
          <input
            value={form.postalCode}
            onChange={(e) => update({ postalCode: e.target.value })}
            placeholder="Code postal"
            className="w-28 h-11 px-3.5 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400"
          />
          <input
            value={form.city}
            onChange={(e) => update({ city: e.target.value })}
            placeholder="Ville"
            className="flex-1 h-11 px-3.5 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400"
          />
        </div>
      )}

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
        <p className="text-xs text-amber-700">ℹ️ L'adresse permet à vos voisins de confirmer votre signalement.</p>
      </div>
    </div>
  );
}

/* ─── Step 5: Visibilité ────────────────────────────────────────────── */
function StepVisibility({ form, update }: { form: FormState; update: (u: Partial<FormState>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-1">Qui peut voir ce signalement ?</h2>
        <p className="text-sm text-stone-500">Vous pouvez changer cela à tout moment.</p>
      </div>
      <div className="space-y-3">
        {(Object.entries(VISIBILITY_CONFIG) as [Visibility, typeof VISIBILITY_CONFIG[Visibility]][]).map(([key, config]) => (
          <button
            key={key}
            onClick={() => update({ visibility: key })}
            className={cn("w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left", form.visibility === key ? "border-brand-500 bg-brand-50" : "border-stone-100 bg-white active:bg-stone-50")}
          >
            <span className="text-2xl">{config.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-900">{config.label}</p>
              <p className="text-xs text-stone-500 mt-0.5">{config.description}</p>
            </div>
            {form.visibility === key && (
              <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={13} className="text-white" strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="bg-stone-50 rounded-xl p-3.5">
        <p className="text-xs text-stone-500 leading-relaxed">🔒 Seul votre pseudo est affiché. Votre identité réelle reste protégée.</p>
      </div>
    </div>
  );
}

/* ─── Step 6: Actions ────────────────────────────────────────────────── */
function StepActions({ form, update }: { form: FormState; update: (u: Partial<FormState>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-1">Voulez-vous agir ?</h2>
        <p className="text-sm text-stone-500">Ces actions peuvent aussi être effectuées après publication.</p>
      </div>
      <div className="space-y-3">
        {[
          { key: "notifySyndic" as const, emoji: "📬", label: "Notifier le syndic", desc: "Envoi d'un email au gestionnaire de l'immeuble." },
          { key: "generateLetter" as const, emoji: "📄", label: "Générer une lettre officielle", desc: "Courrier prêt à envoyer au bailleur ou à la mairie." },
        ].map(({ key, emoji, label, desc }) => (
          <button
            key={key}
            onClick={() => update({ [key]: !form[key] })}
            className={cn("w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left", form[key] ? "border-brand-500 bg-brand-50" : "border-stone-100 bg-white active:bg-stone-50")}
          >
            <span className="text-2xl mt-0.5">{emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-900">{label}</p>
              <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
            </div>
            <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all", form[key] ? "bg-brand-500 border-brand-500" : "border-stone-300")}>
              {form[key] && <Check size={13} className="text-white" strokeWidth={3} />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 7: Confirmation ───────────────────────────────────────────── */
function StepConfirm({ form, error }: { form: FormState; error: string | null }) {
  const catConfig = form.category ? CATEGORY_CONFIG[form.category] : null;
  const visConfig = VISIBILITY_CONFIG[form.visibility];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-1">Vérifiez votre signalement</h2>
        <p className="text-sm text-stone-500">Tout est correct avant publication ?</p>
      </div>
      <div className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden">
        {form.mediaPreviewUrl && (
          <Image src={form.mediaPreviewUrl} alt="Preview" width={400} height={160} className="w-full h-40 object-cover" />
        )}
        <div className="p-4 space-y-3">
          {catConfig && (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{catConfig.icon}</span>
              <div>
                <p className="text-sm font-semibold text-stone-900">{catConfig.label}</p>
                <p className="text-xs text-stone-500">
                  {form.severity === "grave" ? "🔴 Grave" : form.severity === "modere" ? "🟡 Modéré" : "🟢 Mineur"}
                  {" · "}
                  {form.recurrence === "premiere_fois" ? "Première fois" : form.recurrence === "recurrent" ? "Récurrent" : "Chronique"}
                </p>
              </div>
            </div>
          )}
          {form.description && <p className="text-sm text-stone-700 leading-relaxed">{form.description}</p>}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>📍</span>
            <span>{form.address}{form.city ? `, ${form.city}` : ""}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>{visConfig.icon}</span>
            <span>{visConfig.label}</span>
          </div>
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <div className="bg-stone-50 rounded-xl p-3">
        <p className="text-xs text-stone-500 text-center leading-relaxed">
          En publiant, vous certifiez que ces informations sont véridiques.
        </p>
      </div>
    </div>
  );
}

/* ─── Écran de succès ────────────────────────────────────────────────── */
function SuccessScreen({ onHome, onBuilding, form }: { onHome: () => void; onBuilding: () => void; form: FormState }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
      <div className="animate-bounce-gentle mb-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check size={44} className="text-green-500" strokeWidth={3} />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Signalement publié !</h1>
      <p className="text-sm text-stone-500 leading-relaxed mb-8">
        Votre signalement a été enregistré. Vos voisins peuvent maintenant le confirmer.
      </p>
      <div className="w-full space-y-3">
        <button onClick={onBuilding} className="w-full h-12 rounded-2xl bg-brand-500 text-white font-semibold text-sm">
          Voir le profil de l'immeuble
        </button>
        <button onClick={onHome} className="w-full h-12 rounded-2xl border border-stone-200 text-stone-600 font-medium text-sm">
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
