// Client-side API functions — utilisées dans les composants React

const BASE = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL ?? "";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erreur réseau" }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Reports ─────────────────────────────────────────────────────────
export async function fetchReports(params?: { buildingId?: string; category?: string; page?: number }) {
  const qs = new URLSearchParams();
  if (params?.buildingId) qs.set("buildingId", params.buildingId);
  if (params?.category && params.category !== "all") qs.set("category", params.category.toUpperCase());
  if (params?.page) qs.set("page", String(params.page));
  return fetcher<{ reports: ReportAPI[] }>(`/api/reports?${qs}`);
}

export async function fetchMyReports() {
  return fetcher<{ reports: ReportAPI[] }>("/api/reports/my");
}

export async function createReport(data: CreateReportPayload) {
  return fetcher<{ report: ReportAPI; buildingId: string }>("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ─── Validations ──────────────────────────────────────────────────────
export async function validateReport(reportId: string, type: "CONFIRM" | "DENY") {
  return fetcher("/api/validations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId, type }),
  });
}

// ─── Buildings ────────────────────────────────────────────────────────
export async function fetchBuildings(params?: { q?: string; postalCode?: string }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.postalCode) qs.set("postalCode", params.postalCode);
  return fetcher<{ buildings: BuildingAPI[] }>(`/api/buildings?${qs}`);
}

export async function fetchBuilding(id: string) {
  return fetcher<{ building: BuildingAPI }>(`/api/buildings/${id}`);
}

// ─── Upload ───────────────────────────────────────────────────────────
export async function uploadMedia(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetcher<{ url: string }>("/api/upload", {
    method: "POST",
    body: formData,
  });
  return res.url;
}

// ─── User ─────────────────────────────────────────────────────────────
export async function fetchUser() {
  return fetcher<{ user: UserAPI | null }>("/api/user");
}

// ─── Address autocomplete (API Adresse data.gouv.fr) ─────────────────
export interface AdresseResult {
  label: string;
  housenumber?: string;
  street?: string;
  postcode: string;
  city: string;
  lat: number;
  lng: number;
}

export async function searchAdresse(query: string): Promise<AdresseResult[]> {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&type=housenumber`
    );
    const data = await res.json();
    return (data.features ?? []).map((f: GeoJSONFeature) => ({
      label: f.properties.label,
      housenumber: f.properties.housenumber,
      street: f.properties.street,
      postcode: f.properties.postcode,
      city: f.properties.city,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    }));
  } catch {
    return [];
  }
}

// ─── Types API ────────────────────────────────────────────────────────
export interface ReportAPI {
  id: string;
  buildingId: string;
  userId: string;
  category: string;
  subcategory?: string;
  severity: string;
  recurrence: string;
  description?: string;
  visibility: string;
  media: { id: string; type: string; url: string }[];
  validations: { id: string; type: string; userId: string }[];
  actions: { id: string; type: string; status: string }[];
  createdAt: string;
  building?: { address: string; city: string; postalCode: string };
}

export interface BuildingAPI {
  id: string;
  address: string;
  postalCode: string;
  city: string;
  lat: number;
  lng: number;
  score: number;
  reportCount: number;
  verifiedResidentCount: number;
  trend: string;
  syndicName?: string;
  syndicEmail?: string;
  reports?: ReportAPI[];
  _count?: { residents: number };
}

export interface UserAPI {
  id: string;
  pseudo: string;
  email: string;
  verified: boolean;
  reportCount: number;
  validationCount: number;
  createdAt: string;
  buildings?: BuildingAPI[];
}

export interface CreateReportPayload {
  address: string;
  postalCode: string;
  city: string;
  lat?: number;
  lng?: number;
  buildingId?: string;
  category: string;
  subcategory?: string;
  severity: string;
  recurrence: string;
  description?: string;
  visibility: string;
  mediaUrls?: string[];
  notifySyndic?: boolean;
}

interface GeoJSONFeature {
  properties: {
    label: string;
    housenumber?: string;
    street?: string;
    postcode: string;
    city: string;
  };
  geometry: { coordinates: [number, number] };
}
