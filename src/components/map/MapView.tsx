"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { BuildingAPI } from "@/lib/api";
import Link from "next/link";

function getColor(score: number) {
  if (score < 2) return "#ef4444";
  if (score < 3) return "#f97316";
  if (score < 4) return "#f59e0b";
  return "#22c55e";
}

function FitBounds({ buildings }: { buildings: BuildingAPI[] }) {
  const map = useMap();
  useEffect(() => {
    const valid = buildings.filter((b) => b.lat && b.lng && !(b.lat === 0 && b.lng === 0));
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], 14);
    } else {
      const lats = valid.map((b) => b.lat);
      const lngs = valid.map((b) => b.lng);
      map.fitBounds(
        [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
        { padding: [40, 40] }
      );
    }
  }, [buildings, map]);
  return null;
}

interface Props {
  buildings: BuildingAPI[];
  selectedId?: string | null;
  onSelect: (b: BuildingAPI) => void;
}

export default function MapView({ buildings, selectedId, onSelect }: Props) {
  const withCoords = buildings.filter(
    (b) => b.lat && b.lng && !(b.lat === 0 && b.lng === 0)
  );

  return (
    <MapContainer
      center={[46.6, 2.3]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.length > 0 && <FitBounds buildings={withCoords} />}
      {withCoords.map((building) => (
        <CircleMarker
          key={building.id}
          center={[building.lat, building.lng]}
          radius={selectedId === building.id ? 18 : 14}
          pathOptions={{
            fillColor: getColor(building.score),
            fillOpacity: 0.9,
            color: "white",
            weight: 2,
          }}
          eventHandlers={{ click: () => onSelect(building) }}
        >
          <Popup>
            <div className="text-xs font-semibold leading-snug">
              <p className="font-bold text-stone-900">{building.address}</p>
              <p className="text-stone-500">{building.postalCode} {building.city}</p>
              <p className="mt-1">Score : <strong>{building.score.toFixed(1)}/5</strong></p>
              <Link
                href={`/immeuble/${building.id}`}
                className="mt-1 inline-block text-orange-600 font-semibold underline"
              >
                Voir le détail →
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
