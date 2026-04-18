"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera,
  ImageIcon,
  ArrowRight,
  ArrowLeft,
  X,
  MapPin,
  Navigation,
  Check,
  Send,
  FileText,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG, VISIBILITY_CONFIG } from "@/types";
import type { Category, Severity, Recurrence, Visibility, ReportFormData } from "@/types";
import Header from "@/components/layout/Header";

const STEPS = [
  { id: 1, label: "Preuve", icon: "📸" },
  { id: 2, label: "Catégorie", icon: "🗂️" },
  { id: 3, label: "Détails", icon: "📝" },
  { id: 4, label: "Adresse", icon: "📍" },
  { id: 5, label: "Visibilité", icon: "👁️" },
  { id: 6, label: "Actions", icon: "✉️" },
  { id: 7, label: "Envoi", icon: "✅" },
];

const INITIAL_FORM: ReportFormData = {
  media: [],
  mediaPreviewUrls: [],
  category: null,
  subcategory: "",
  severity: "modere",
  recurrence: "premiere_fois",
  description: "",
  address: "",
  postalCode: "",
  city: "",
  lat: null,
  lng: null,
  visibility: "public",
  notifySyndic: false,
  generateLetter: false,
};

export default function SignalerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ReportFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateForm = (updates: Partial<ReportFormData>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return true;
      case 2: return form.category !== null;
      case 3: return true;
      case 4: return form.address.trim().length > 0;
      case 5: return true;
      case 6: return true;
      default: return true;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    updateForm({ media: files, mediaPreviewUrls: urls });
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateForm({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: "12 rue de la Roquette",
          postalCode: "75011",
          city: "Paris",
        });
      },
      () => {}
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  if (submitted) {
    return <SuccessScreen onHome={() => router.push("/")} form={form} />;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header
        showBack={step === 1}
        title={step > 1 ? STEPS[step - 1].label : undefined}
        rightAction={
          step === 1 ? (
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100"
            >
              <X size={16} className="text-stone-600" />
            </button>
          ) : undefined
        }
      />

      {/* Progress */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-medium text-stone-500">
            Étape {step} sur {STEPS.length}
          </p>
          <div className="flex gap-1">
            {STEPS.map((s) => (
              <span
                key={s.id}
                className={cn(
                  "text-sm transition-all",
                  s.id < step
                    ? "opacity-100"
                    : s.id === step
                    ? "opacity-100"
                    : "opacity-20"
                )}
              >
                {s.icon}
              </span>
            ))}
          </div>
        </div>
        <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-5 pb-8 animate-fade-in" key={step}>
          {step === 1 && <StepMedia form={form} fileRef={fileRef} onFile={handleFileChange} updateForm={updateForm} />}
          {step === 2 && <StepCategory form={form} updateForm={updateForm} />}
          {step === 3 && <StepDetails form={form} updateForm={updateForm} />}
          {step === 4 && <StepAddress form={form} updateForm={updateForm} onGeolocate={handleGeolocate} />}
          {step === 5 && <StepVisibility form={form} updateForm={updateForm} />}
          {step === 6 && <StepActions form={form} updateForm={updateForm} />}
          {step === 7 && <StepConfirm form={form} />}
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
                canProceed()
                  ? "bg-brand-500 text-white active:bg-brand-600"
                  : "bg-stone-100 text-stone-400 cursor-not-allowed"
              )}
            >
              Continuer
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-2xl bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 active:bg-brand-600 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publication...
                </>
              ) : (
                <>
                  <Send size={16} strokeWidth={2.5} />
                  Publier le signalement
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Media ──────────────────────────────────────────────── */
function StepMedia({
  form,
  fileRef,
  onFile,
  updateForm,
}: {
  form: ReportFormData;
  fileRef: React.RefObject<HTMLInputElement>;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateForm: (u: Partial<ReportFormData>) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-stone-900 mb-1">Ajoutez une preuve</h2>
      <p className="text-sm text-stone-500 mb-6">
        Une photo ou vidéo renforce la crédibilité de votre signalement.
      </p>

      {form.mediaPreviewUrls.length > 0 ? (
        <div className="space-y-3 mb-4">
          <div className="relative rounded-2xl overflow-hidden">
            <Image
              src={form.mediaPreviewUrls[0]}
              alt="Preview"
              width={400}
              height={250}
              className="w-full h-52 object-cover"
            />
            <button
              onClick={() => updateForm({ media: [], mediaPreviewUrls: [] })}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
            >
              <X size={14} className="text-white" />
            </button>
            <div className="absolute bottom-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <Check size={11} /> Preuve ajoutée
            </div>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-10 rounded-xl border border-dashed border-stone-300 text-sm text-stone-500 flex items-center justify-center gap-2"
          >
            <ImageIcon size={14} /> Ajouter une autre photo
          </button>
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
            <ImageIcon size={16} className="text-stone-400" />
            Galerie photo
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={onFile}
      />

      <div className="bg-stone-50 rounded-xl p-3">
        <p className="text-xs text-stone-500 text-center">
          📍 La date, l'heure et la localisation seront automatiquement enregistrées comme preuves.
        </p>
      </div>

      <button
        onClick={() => {}}
        className="w-full mt-3 h-11 rounded-xl text-sm text-stone-500 flex items-center justify-center gap-2"
      >
        Continuer sans preuve →
      </button>
    </div>
  );
}

/* ─── Step 2: Category ───────────────────────────────────────────── */
function StepCategory({
  form,
  updateForm,
}: {
  form: ReportFormData;
  updateForm: (u: Partial<ReportFormData>) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-stone-900 mb-1">Quel est le problème ?</h2>
      <p className="text-sm text-stone-500 mb-6">Sélectionnez la catégorie principale.</p>

      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]).map(
          ([key, config]) => (
            <button
              key={key}
              onClick={() => updateForm({ category: key })}
              className={cn(
                "relative p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.97]",
                form.category === key
                  ? "border-brand-500 bg-brand-50 shadow-sm"
                  : "border-stone-100 bg-white active:bg-stone-50"
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
          )
        )}
      </div>
    </div>
  );
}

/* ─── Step 3: Details ────────────────────────────────────────────── */
function StepDetails({
  form,
  updateForm,
}: {
  form: ReportFormData;
  updateForm: (u: Partial<ReportFormData>) => void;
}) {
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

      {/* Severity */}
      <div>
        <p className="text-sm font-semibold text-stone-700 mb-2.5">Sévérité</p>
        <div className="space-y-2">
          {SEVERITIES.map((s) => (
            <button
              key={s.value}
              onClick={() => updateForm({ severity: s.value })}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                form.severity === s.value
                  ? "border-brand-500 bg-brand-50"
                  : "border-stone-100 bg-white active:bg-stone-50"
              )}
            >
              <span className="text-xl">{s.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-stone-900">{s.label}</p>
                <p className="text-xs text-stone-500">{s.desc}</p>
              </div>
              {form.severity === s.value && (
                <div className="ml-auto w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recurrence */}
      <div>
        <p className="text-sm font-semibold text-stone-700 mb-2.5">Fréquence</p>
        <div className="flex gap-2">
          {RECURRENCES.map((r) => (
            <button
              key={r.value}
              onClick={() => updateForm({ recurrence: r.value })}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all",
                form.recurrence === r.value
                  ? "border-brand-500 bg-brand-50 text-brand-600"
                  : "border-stone-100 bg-white text-stone-600 active:bg-stone-50"
              )}
            >
              <span className="text-lg">{r.emoji}</span>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="text-sm font-semibold text-stone-700 mb-2">
          Description{" "}
          <span className="text-stone-400 font-normal">(optionnel)</span>
        </p>
        <textarea
          value={form.description}
          onChange={(e) => updateForm({ description: e.target.value })}
          placeholder="Décrivez le problème, les circonstances, les impacts sur les résidents..."
          rows={4}
          className="w-full px-3.5 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400 resize-none leading-relaxed"
          maxLength={500}
        />
        <p className="text-right text-[11px] text-stone-400 mt-1">
          {form.description.length}/500
        </p>
      </div>
    </div>
  );
}

/* ─── Step 4: Address ────────────────────────────────────────────── */
function StepAddress({
  form,
  updateForm,
  onGeolocate,
}: {
  form: ReportFormData;
  updateForm: (u: Partial<ReportFormData>) => void;
  onGeolocate: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-1">Où se situe l'immeuble ?</h2>
        <p className="text-sm text-stone-500">Nécessaire pour associer le signalement à l'adresse.</p>
      </div>

      {/* Geolocate button */}
      <button
        onClick={onGeolocate}
        className={cn(
          "w-full h-14 rounded-2xl border-2 flex items-center gap-3 px-4 transition-all",
          form.lat
            ? "border-green-400 bg-green-50"
            : "border-brand-400 bg-brand-50 active:bg-brand-100"
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            form.lat ? "bg-green-500" : "bg-brand-500"
          )}
        >
          {form.lat ? (
            <Check size={20} className="text-white" strokeWidth={3} />
          ) : (
            <Navigation size={20} className="text-white" />
          )}
        </div>
        <div className="text-left">
          <p className={cn("text-sm font-semibold", form.lat ? "text-green-700" : "text-brand-600")}>
            {form.lat ? "Position détectée !" : "Utiliser ma position GPS"}
          </p>
          <p className={cn("text-xs", form.lat ? "text-green-600" : "text-brand-400")}>
            {form.lat
              ? `${form.address}, ${form.city}`
              : "Détection automatique de l'adresse"}
          </p>
        </div>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-xs text-stone-400 font-medium">ou</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      {/* Manual address */}
      <div className="space-y-2.5">
        <div className="relative">
          <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={form.address}
            onChange={(e) => updateForm({ address: e.target.value })}
            placeholder="Numéro et nom de rue"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={form.postalCode}
            onChange={(e) => updateForm({ postalCode: e.target.value })}
            placeholder="Code postal"
            className="w-28 h-11 px-3.5 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400"
          />
          <input
            type="text"
            value={form.city}
            onChange={(e) => updateForm({ city: e.target.value })}
            placeholder="Ville"
            className="flex-1 h-11 px-3.5 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400"
          />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
        <p className="text-xs text-amber-700">
          ℹ️ L'adresse exacte est nécessaire pour que vos voisins puissent confirmer votre signalement.
        </p>
      </div>
    </div>
  );
}

/* ─── Step 5: Visibility ─────────────────────────────────────────── */
function StepVisibility({
  form,
  updateForm,
}: {
  form: ReportFormData;
  updateForm: (u: Partial<ReportFormData>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-1">Qui peut voir ce signalement ?</h2>
        <p className="text-sm text-stone-500">Vous pouvez changer cela à tout moment.</p>
      </div>

      <div className="space-y-3">
        {(Object.entries(VISIBILITY_CONFIG) as [Visibility, typeof VISIBILITY_CONFIG[Visibility]][]).map(
          ([key, config]) => (
            <button
              key={key}
              onClick={() => updateForm({ visibility: key })}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                form.visibility === key
                  ? "border-brand-500 bg-brand-50"
                  : "border-stone-100 bg-white active:bg-stone-50"
              )}
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
          )
        )}
      </div>

      <div className="bg-stone-50 rounded-xl p-3.5">
        <p className="text-xs text-stone-500 leading-relaxed">
          🔒 <strong>Votre identité reste protégée.</strong> Seul votre pseudo est affiché. Pour les signalements publics, une preuve (photo) est requise pour garantir la crédibilité.
        </p>
      </div>
    </div>
  );
}

/* ─── Step 6: Actions ────────────────────────────────────────────── */
function StepActions({
  form,
  updateForm,
}: {
  form: ReportFormData;
  updateForm: (u: Partial<ReportFormData>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-1">Voulez-vous agir ?</h2>
        <p className="text-sm text-stone-500">
          Nous pouvons vous aider à formaliser votre signalement.
        </p>
      </div>

      <div className="space-y-3">
        {/* Notify syndic */}
        <button
          onClick={() => updateForm({ notifySyndic: !form.notifySyndic })}
          className={cn(
            "w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left",
            form.notifySyndic
              ? "border-brand-500 bg-brand-50"
              : "border-stone-100 bg-white active:bg-stone-50"
          )}
        >
          <span className="text-2xl mt-0.5">📬</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-stone-900">Notifier le syndic</p>
            <p className="text-xs text-stone-500 mt-0.5">
              Envoi d'un email de signalement au gestionnaire de l'immeuble.
            </p>
          </div>
          <div
            className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
              form.notifySyndic
                ? "bg-brand-500 border-brand-500"
                : "border-stone-300"
            )}
          >
            {form.notifySyndic && <Check size={13} className="text-white" strokeWidth={3} />}
          </div>
        </button>

        {/* Generate letter */}
        <button
          onClick={() => updateForm({ generateLetter: !form.generateLetter })}
          className={cn(
            "w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left",
            form.generateLetter
              ? "border-brand-500 bg-brand-50"
              : "border-stone-100 bg-white active:bg-stone-50"
          )}
        >
          <span className="text-2xl mt-0.5">📄</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-stone-900">Générer une lettre officielle</p>
            <p className="text-xs text-stone-500 mt-0.5">
              Courrier prêt à envoyer au bailleur ou à la mairie, avec toutes les preuves.
            </p>
          </div>
          <div
            className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
              form.generateLetter
                ? "bg-brand-500 border-brand-500"
                : "border-stone-300"
            )}
          >
            {form.generateLetter && <Check size={13} className="text-white" strokeWidth={3} />}
          </div>
        </button>
      </div>

      <div className="bg-stone-50 rounded-xl p-3.5">
        <p className="text-xs text-stone-500 leading-relaxed">
          Ces actions peuvent être effectuées après la publication. Rien n'est envoyé sans votre confirmation.
        </p>
      </div>
    </div>
  );
}

/* ─── Step 7: Confirm ────────────────────────────────────────────── */
function StepConfirm({ form }: { form: ReportFormData }) {
  const catConfig = form.category ? CATEGORY_CONFIG[form.category] : null;
  const visConfig = VISIBILITY_CONFIG[form.visibility];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-1">Vérifiez votre signalement</h2>
        <p className="text-sm text-stone-500">Tout est correct avant publication ?</p>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden">
        {form.mediaPreviewUrls.length > 0 && (
          <Image
            src={form.mediaPreviewUrls[0]}
            alt="Preview"
            width={400}
            height={160}
            className="w-full h-40 object-cover"
          />
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
                  {form.recurrence === "premiere_fois"
                    ? "Première fois"
                    : form.recurrence === "recurrent"
                    ? "Récurrent"
                    : "Chronique"}
                </p>
              </div>
            </div>
          )}

          {form.description && (
            <p className="text-sm text-stone-700 leading-relaxed">{form.description}</p>
          )}

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>📍</span>
            <span>
              {form.address || "Adresse non renseignée"}
              {form.city ? `, ${form.city}` : ""}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>{visConfig.icon}</span>
            <span>{visConfig.label}</span>
          </div>
        </div>
      </div>

      {(form.notifySyndic || form.generateLetter) && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-3.5 space-y-1.5">
          <p className="text-xs font-semibold text-brand-700">Actions prévues</p>
          {form.notifySyndic && (
            <p className="text-xs text-brand-600">✉️ Email au syndic</p>
          )}
          {form.generateLetter && (
            <p className="text-xs text-brand-600">📄 Génération de lettre officielle</p>
          )}
        </div>
      )}

      <div className="bg-stone-50 rounded-xl p-3">
        <p className="text-xs text-stone-500 text-center leading-relaxed">
          En publiant, vous certifiez que ces informations sont véridiques. Tout signalement mensonger peut entraîner la suppression de votre compte.
        </p>
      </div>
    </div>
  );
}

/* ─── Success Screen ─────────────────────────────────────────────── */
function SuccessScreen({
  onHome,
  form,
}: {
  onHome: () => void;
  form: ReportFormData;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
      <div className="animate-bounce-gentle mb-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check size={44} className="text-green-500" strokeWidth={3} />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-stone-900 mb-2">Signalement publié !</h1>
      <p className="text-sm text-stone-500 leading-relaxed mb-8">
        Votre signalement a été enregistré. Vos voisins peuvent maintenant le confirmer pour renforcer sa crédibilité.
      </p>

      <div className="w-full space-y-3 mb-6">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-4 flex items-center gap-3">
          <span className="text-2xl">👥</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-stone-900">Invitez vos voisins</p>
            <p className="text-xs text-stone-500">Chaque confirmation renforce votre dossier</p>
          </div>
        </div>

        {form.generateLetter && (
          <div className="bg-brand-50 rounded-2xl border border-brand-100 p-4 flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-brand-700">Lettre générée</p>
              <p className="text-xs text-brand-500">Disponible dans "Mes démarches"</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onHome}
        className="w-full h-12 rounded-2xl bg-brand-500 text-white font-semibold text-sm"
      >
        Retour à l'accueil
      </button>
    </div>
  );
}
