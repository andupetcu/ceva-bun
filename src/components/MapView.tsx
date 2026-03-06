'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

type Pin = {
  id: number;
  title: string;
  lat: number;
  lng: number;
};

export function MapView({ pins }: { pins: Pin[] }) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="glass p-2">
      <MapContainer center={[44.4268, 26.1025]} zoom={12} scrollWheelZoom className="h-[70vh] w-full rounded-2xl">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url={tileUrl} />
        {pins.map((pin) => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]}>
            <Popup>{pin.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
