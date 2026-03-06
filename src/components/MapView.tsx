'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

type Pin = {
  id: number;
  title: string;
  priceCents: number;
  lat: number;
  lon: number;
  city: string;
  activityType: string;
};

const markerColors: Record<string, string> = {
  museum: '#2563eb',
  theatre: '#dc2626',
  escape: '#16a34a',
  park: '#15803d',
  cinema: '#7c3aed',
  spa: '#0891b2',
  zoo: '#ea580c',
  event: '#f59e0b',
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function ClusterMarkers({
  pins,
  activityLabels,
  activityEmoji,
}: {
  pins: Pin[];
  activityLabels: Record<string, string>;
  activityEmoji: Record<string, string>;
}) {
  const map = useMap();

  useEffect(() => {
    const clusterLayer = L.markerClusterGroup();

    for (const pin of pins) {
      const color = markerColors[pin.activityType] || '#f59e0b';
      const icon = L.divIcon({
        className: '',
        html: `<span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:999px;background:${color};border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></span>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([pin.lat, pin.lon], { icon });
      const typeLabel = activityLabels[pin.activityType] || 'Activitate';
      const typeEmoji = activityEmoji[pin.activityType] || '🎉';
      const price = new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON',
      }).format(pin.priceCents / 100);

      marker.bindPopup(
        `<div style="min-width:200px">
          <strong>${escapeHtml(pin.title)}</strong><br/>
          <span>${typeEmoji} ${typeLabel}</span><br/>
          <span>📍 ${escapeHtml(pin.city)}</span><br/>
          <span>💸 ${price}</span><br/>
          <a href="/produs/${pin.id}" style="color:#0891b2;font-weight:600">Vezi produs</a>
        </div>`,
      );
      clusterLayer.addLayer(marker);
    }

    map.addLayer(clusterLayer);
    return () => {
      map.removeLayer(clusterLayer);
    };
  }, [map, pins, activityLabels, activityEmoji]);

  return null;
}

export function MapView({
  pins,
  activityLabels,
  activityEmoji,
}: {
  pins: Pin[];
  activityLabels: Record<string, string>;
  activityEmoji: Record<string, string>;
}) {
  const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const romaniaBounds: [[number, number], [number, number]] = [[43.5, 20.2], [48.3, 30.0]];

  return (
    <div className="glass p-2">
      <MapContainer
        bounds={romaniaBounds}
        scrollWheelZoom
        className="h-[calc(100vh-10rem)] w-full rounded-2xl min-h-[60vh]"
      >
        <TileLayer attribution="&copy; OpenStreetMap contributors" url={tileUrl} />
        <ClusterMarkers pins={pins} activityLabels={activityLabels} activityEmoji={activityEmoji} />
      </MapContainer>
    </div>
  );
}
