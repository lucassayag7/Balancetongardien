"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { BuildingAPI } from "@/lib/api";

function getColor(score: number) {
  if (score < 2) return "#ef4444";
  if (score < 3) return "#f97316";
  if (score < 4) return "#f59e0b";
  return "#22c55e";
}

function createPinIcon(score: number, selected: boolean) {
  const color = getColor(score);
  const size = selected ? 52 : 44;
  const fontSize = selected ? 13 : 11;
  return L.divIcon({
    className: "",
    html: `
      <div style="
        background:${color};
        color:white;
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:${fontSize}px;
        font-weight:800;
        font-family:-apple-system,sans-serif;
        box-shadow:0 3px 12px ${color}80, 0 0 0 3px white, 0 0 0 5px ${color}40;
        transition:all 0.2s;
        cursor:pointer;
      ">${score.toFixed(1)}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitBounds({ buildings }: { buildings: BuildingAPI[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current) return;
    const valid = buildings.filter((b) => b.lat && b.lng && !(b.lat === 0 && b.lng === 0));
    if (valid.length === 0) return;
    fitted.current = true;
    if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], 15);
    } else {
      const lats = valid.map((b) => b.lat);
      const lngs = valid.map((b) => b.lng);
      map.fitBounds(
        [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
        { padding: [60, 60] }
      );
    }
  }, [buildings, map]);
  return null;
}

function LocateMe({ onLocated }: { onLocated?: (lat: number, lng: number) => void }) {
  const map = useMap();
  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 15 });
  };
  useMapEvents({
    locationfound(e) {
      onLocated?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return (
    <button
      onClick={handleLocate}
      className="absolute bottom-[280px] right-4 z-[1000] w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center active:bg-stone-50 transition-colors border border-stone-100"
      aria-label="Me localiser"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8400C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        <circle cx="12" cy="12" r="8" strokeOpacity="0.3"/>
      </svg>
    </button>
  );
}

function ClickOutside({ onDeselect }: { onDeselect: () => void }) {
  useMapEvents({ click: () => onDeselect() });
  return null;
}

interface Props {
  buildings: BuildingAPI[];
  selectedId?: string | null;
  onSelect: (b: BuildingAPI) => void;
  onDeselect: () => void;
}

export default function MapView({ buildings, selectedId, onSelect, onDeselect }: Props) {
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
        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.length > 0 && <FitBounds buildings={withCoords} />}
      <LocateMe />
      <ClickOutside onDeselect={onDeselect} />
      {withCoords.map((building) => (
        <Marker
          key={building.id}
          position={[building.lat, building.lng]}
          icon={createPinIcon(building.score, selectedId === building.id)}
          eventHandlers={{
            click: (e) => {
              e.originalEvent.stopPropagation();
              onSelect(building);
            },
          }}
        />
      ))}
    </MapContainer>
  );
}
