'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';
import type { LatLngLiteral, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ onSelect }: { onSelect?: (pos: LatLngLiteral) => void }) {
  const [position, setPosition] = useState<LatLngLiteral | null>(null);

  useMapEvents({
    click(e) {
      // Always emit numeric lat/lng
      const pos: LatLngLiteral = { lat: Number(e.latlng.lat), lng: Number(e.latlng.lng) };
      setPosition(pos);
      onSelect?.(pos);
    },
  });

  return position ? <Marker position={position as LatLngExpression} /> : null;
}

export default function MapInput({ onLocationSelect }: { onLocationSelect?: (pos: LatLngLiteral) => void }) {
  const center: LatLngExpression = [14.8292, 120.2828]; // Olongapo

  return (
    <MapContainer center={center} zoom={13} style={{ height: '250px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <LocationMarker onSelect={onLocationSelect} />
    </MapContainer>
  );
}