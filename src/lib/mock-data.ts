import type { Building, Report, User } from "@/types";

export const MOCK_USER: User = {
  id: "user-1",
  pseudo: "Résident75011",
  email: "user@example.com",
  verified: true,
  buildings: [],
  reportCount: 4,
  validationCount: 12,
  createdAt: new Date("2024-09-01"),
};

export const MOCK_REPORTS: Report[] = [
  {
    id: "r1",
    buildingId: "b1",
    userId: "user-1",
    userPseudo: "Résident75011",
    userVerified: true,
    category: "nettoyage",
    severity: "grave",
    recurrence: "chronique",
    description:
      "Les poubelles débordent depuis 3 semaines, l'odeur est insupportable dans le couloir du RDC. Signalé au syndic le 5 mars, aucune réponse.",
    media: [
      {
        id: "m1",
        type: "image",
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
        timestamp: new Date("2024-11-10T09:30:00"),
        location: { lat: 48.8566, lng: 2.3522 },
      },
    ],
    visibility: "public",
    validations: [
      {
        id: "v1",
        userId: "user-2",
        userPseudo: "Habitant_B",
        type: "confirm",
        createdAt: new Date("2024-11-10T11:00:00"),
      },
      {
        id: "v2",
        userId: "user-3",
        userPseudo: "Voisin3eme",
        type: "confirm",
        createdAt: new Date("2024-11-10T14:00:00"),
      },
      {
        id: "v3",
        userId: "user-4",
        userPseudo: "Resident2B",
        type: "confirm",
        createdAt: new Date("2024-11-11T08:00:00"),
      },
    ],
    actions: [
      {
        id: "a1",
        type: "letter_syndic",
        status: "sent",
        sentAt: new Date("2024-11-10T12:00:00"),
      },
    ],
    createdAt: new Date("2024-11-10T09:30:00"),
    updatedAt: new Date("2024-11-11T08:00:00"),
    address: "12 rue de la Roquette, Paris 11e",
  },
  {
    id: "r2",
    buildingId: "b1",
    userId: "user-2",
    userPseudo: "Habitant_B",
    userVerified: true,
    category: "maintenance",
    severity: "grave",
    recurrence: "recurrent",
    description:
      "L'ascenseur est en panne depuis 5 jours. Pas de nouvelle de réparation. Problème pour les résidents à mobilité réduite au 5ème.",
    media: [
      {
        id: "m2",
        type: "image",
        url: "https://images.unsplash.com/photo-1558618047-f4e60c0d8be7?w=400&h=300&fit=crop",
        timestamp: new Date("2024-11-08T16:00:00"),
      },
    ],
    visibility: "public",
    validations: [
      {
        id: "v4",
        userId: "user-1",
        userPseudo: "Résident75011",
        type: "confirm",
        createdAt: new Date("2024-11-08T18:00:00"),
      },
      {
        id: "v5",
        userId: "user-5",
        userPseudo: "locataire5eme",
        type: "confirm",
        createdAt: new Date("2024-11-09T09:00:00"),
      },
    ],
    actions: [],
    createdAt: new Date("2024-11-08T16:00:00"),
    updatedAt: new Date("2024-11-09T09:00:00"),
    address: "12 rue de la Roquette, Paris 11e",
  },
  {
    id: "r3",
    buildingId: "b2",
    userId: "user-5",
    userPseudo: "MadameD",
    userVerified: false,
    category: "presence",
    severity: "modere",
    recurrence: "recurrent",
    description:
      "Le gardien est absent tous les lundis et vendredis. Impossible à joindre sur son téléphone professionnel.",
    media: [],
    visibility: "public",
    validations: [
      {
        id: "v6",
        userId: "user-6",
        userPseudo: "ResidentImm2",
        type: "confirm",
        createdAt: new Date("2024-11-07T10:00:00"),
      },
    ],
    actions: [],
    createdAt: new Date("2024-11-07T10:00:00"),
    updatedAt: new Date("2024-11-07T10:00:00"),
    address: "8 avenue Philippe-Auguste, Paris 11e",
  },
  {
    id: "r4",
    buildingId: "b3",
    userId: "user-7",
    userPseudo: "Locataire_Roquette",
    userVerified: true,
    category: "comportement",
    severity: "grave",
    recurrence: "recurrent",
    description:
      "Comportement agressif et intimidant envers plusieurs locataires. A insulté une résidente âgée ce matin.",
    media: [
      {
        id: "m3",
        type: "image",
        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
        timestamp: new Date("2024-11-09T09:00:00"),
      },
    ],
    visibility: "public",
    validations: [
      {
        id: "v7",
        userId: "user-8",
        userPseudo: "Resident_A",
        type: "confirm",
        createdAt: new Date("2024-11-09T11:00:00"),
      },
      {
        id: "v8",
        userId: "user-9",
        userPseudo: "Témoin_1er",
        type: "confirm",
        createdAt: new Date("2024-11-09T12:00:00"),
      },
      {
        id: "v9",
        userId: "user-10",
        userPseudo: "Voisinage11",
        type: "confirm",
        createdAt: new Date("2024-11-09T15:00:00"),
      },
      {
        id: "v10",
        userId: "user-11",
        userPseudo: "Résid_RDC",
        type: "confirm",
        createdAt: new Date("2024-11-10T08:00:00"),
      },
    ],
    actions: [
      {
        id: "a2",
        type: "letter_bailleur",
        status: "sent",
        sentAt: new Date("2024-11-09T14:00:00"),
      },
      {
        id: "a3",
        type: "letter_mairie",
        status: "draft",
      },
    ],
    createdAt: new Date("2024-11-09T09:00:00"),
    updatedAt: new Date("2024-11-10T08:00:00"),
    address: "34 boulevard Voltaire, Paris 11e",
  },
  {
    id: "r5",
    buildingId: "b1",
    userId: "user-1",
    userPseudo: "Résident75011",
    userVerified: true,
    category: "securite",
    severity: "grave",
    recurrence: "chronique",
    description:
      "La porte d'entrée principale ne ferme plus correctement depuis 2 semaines. N'importe qui peut entrer dans l'immeuble.",
    media: [
      {
        id: "m4",
        type: "image",
        url: "https://images.unsplash.com/photo-1558618048-fbd4db6a2a0b?w=400&h=300&fit=crop",
        timestamp: new Date("2024-11-06T19:00:00"),
      },
    ],
    visibility: "voisins",
    validations: [
      {
        id: "v11",
        userId: "user-2",
        userPseudo: "Habitant_B",
        type: "confirm",
        createdAt: new Date("2024-11-06T20:00:00"),
      },
    ],
    actions: [],
    createdAt: new Date("2024-11-06T19:00:00"),
    updatedAt: new Date("2024-11-06T20:00:00"),
    address: "12 rue de la Roquette, Paris 11e",
  },
];

export const MOCK_BUILDINGS: Building[] = [
  {
    id: "b1",
    address: "12 rue de la Roquette",
    postalCode: "75011",
    city: "Paris",
    lat: 48.8551,
    lng: 2.3741,
    score: 2.1,
    scoreBreakdown: {
      nettoyage: 1.5,
      maintenance: 2.0,
      presence: 3.5,
      comportement: 4.0,
      securite: 1.8,
      administratif: 3.2,
    },
    reportCount: 12,
    verifiedResidentCount: 8,
    trend: "degrading",
    reports: MOCK_REPORTS.filter((r) => r.buildingId === "b1"),
    syndicEmail: "cabinet@syndic-paris11.fr",
    syndicName: "Cabinet Immobilier Voltaire",
  },
  {
    id: "b2",
    address: "8 avenue Philippe-Auguste",
    postalCode: "75011",
    city: "Paris",
    lat: 48.8527,
    lng: 2.3845,
    score: 3.4,
    scoreBreakdown: {
      nettoyage: 3.5,
      maintenance: 4.0,
      presence: 2.5,
      comportement: 4.5,
      securite: 3.0,
      administratif: 3.0,
    },
    reportCount: 5,
    verifiedResidentCount: 12,
    trend: "stable",
    reports: MOCK_REPORTS.filter((r) => r.buildingId === "b2"),
  },
  {
    id: "b3",
    address: "34 boulevard Voltaire",
    postalCode: "75011",
    city: "Paris",
    lat: 48.8565,
    lng: 2.3712,
    score: 1.8,
    scoreBreakdown: {
      nettoyage: 2.0,
      maintenance: 3.0,
      presence: 2.5,
      comportement: 1.0,
      securite: 2.0,
      administratif: 1.5,
    },
    reportCount: 18,
    verifiedResidentCount: 6,
    trend: "degrading",
    reports: MOCK_REPORTS.filter((r) => r.buildingId === "b3"),
    syndicEmail: "contact@gestion-voltaire.fr",
    syndicName: "Gestion Voltaire SARL",
  },
];

export function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7) return `il y a ${days}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function scoreColor(score: number): string {
  if (score >= 4) return "text-green-600";
  if (score >= 3) return "text-amber-600";
  if (score >= 2) return "text-orange-600";
  return "text-red-600";
}

export function scoreBgColor(score: number): string {
  if (score >= 4) return "bg-green-50 border-green-200";
  if (score >= 3) return "bg-amber-50 border-amber-200";
  if (score >= 2) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}

export function scoreLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 4) return "Bon";
  if (score >= 3) return "Moyen";
  if (score >= 2) return "Mauvais";
  return "Très mauvais";
}
