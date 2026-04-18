export type Category =
  | "nettoyage"
  | "maintenance"
  | "presence"
  | "comportement"
  | "securite"
  | "administratif";

export type Severity = "mineur" | "modere" | "grave";
export type Recurrence = "premiere_fois" | "recurrent" | "chronique";
export type Visibility = "public" | "voisins" | "prive";
export type MediaType = "image" | "video" | "audio";

export interface Media {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  timestamp: Date;
  location?: { lat: number; lng: number };
}

export interface Validation {
  id: string;
  userId: string;
  userPseudo: string;
  type: "confirm" | "deny";
  comment?: string;
  createdAt: Date;
}

export interface Action {
  id: string;
  type:
    | "letter_syndic"
    | "letter_mairie"
    | "letter_bailleur"
    | "letter_prefecture"
    | "ar24";
  status: "draft" | "sent" | "responded" | "ignored";
  sentAt?: Date;
  respondedAt?: Date;
  documentUrl?: string;
}

export interface Report {
  id: string;
  buildingId: string;
  userId: string;
  userPseudo: string;
  userVerified: boolean;
  category: Category;
  subcategory?: string;
  severity: Severity;
  recurrence: Recurrence;
  description?: string;
  media: Media[];
  visibility: Visibility;
  validations: Validation[];
  actions: Action[];
  createdAt: Date;
  updatedAt: Date;
  address: string;
}

export interface Building {
  id: string;
  address: string;
  postalCode: string;
  city: string;
  lat: number;
  lng: number;
  score: number;
  scoreBreakdown: Record<Category, number>;
  reportCount: number;
  verifiedResidentCount: number;
  trend: "improving" | "stable" | "degrading";
  reports: Report[];
  syndicEmail?: string;
  syndicName?: string;
}

export interface User {
  id: string;
  pseudo: string;
  email: string;
  phone?: string;
  verified: boolean;
  buildings: Building[];
  reportCount: number;
  validationCount: number;
  createdAt: Date;
}

export interface ReportFormData {
  media: File[];
  mediaPreviewUrls: string[];
  category: Category | null;
  subcategory: string;
  severity: Severity;
  recurrence: Recurrence;
  description: string;
  address: string;
  postalCode: string;
  city: string;
  lat: number | null;
  lng: number | null;
  visibility: Visibility;
  notifySyndic: boolean;
  generateLetter: boolean;
}

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; icon: string; color: string; bg: string; description: string }
> = {
  nettoyage: {
    label: "Nettoyage",
    icon: "🧹",
    color: "text-blue-600",
    bg: "bg-blue-50",
    description: "Parties communes, poubelles, cave...",
  },
  maintenance: {
    label: "Maintenance",
    icon: "🔧",
    color: "text-amber-600",
    bg: "bg-amber-50",
    description: "Ascenseur, éclairage, interphone...",
  },
  presence: {
    label: "Présence",
    icon: "🚪",
    color: "text-violet-600",
    bg: "bg-violet-50",
    description: "Absent, ne répond pas...",
  },
  comportement: {
    label: "Comportement",
    icon: "⚠️",
    color: "text-red-600",
    bg: "bg-red-50",
    description: "Grossier, discriminatoire...",
  },
  securite: {
    label: "Sécurité",
    icon: "🔒",
    color: "text-orange-600",
    bg: "bg-orange-50",
    description: "Portes cassées, accès non sécurisé...",
  },
  administratif: {
    label: "Administratif",
    icon: "📄",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    description: "Charges, comptes rendus...",
  },
};

export const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; color: string; bg: string; dotColor: string }
> = {
  mineur: {
    label: "Mineur",
    color: "text-green-700",
    bg: "bg-green-50",
    dotColor: "bg-green-500",
  },
  modere: {
    label: "Modéré",
    color: "text-amber-700",
    bg: "bg-amber-50",
    dotColor: "bg-amber-500",
  },
  grave: {
    label: "Grave",
    color: "text-red-700",
    bg: "bg-red-50",
    dotColor: "bg-red-500",
  },
};

export const VISIBILITY_CONFIG: Record<
  Visibility,
  { label: string; icon: string; description: string }
> = {
  public: {
    label: "Public",
    icon: "🌍",
    description: "Visible par tous, même les futurs locataires",
  },
  voisins: {
    label: "Voisins seulement",
    icon: "🏢",
    description: "Uniquement les résidents de votre immeuble",
  },
  prive: {
    label: "Privé",
    icon: "🔒",
    description: "Uniquement vous — pour votre dossier personnel",
  },
};
