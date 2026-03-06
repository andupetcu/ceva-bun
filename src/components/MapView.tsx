'use client';

import dynamic from 'next/dynamic';

type Pin = {
  id: number;
  title: string;
  lat: number;
  lng: number;
};

const MapInner = dynamic(() => import('./MapInner'), { ssr: false });

export function MapView({ pins }: { pins: Pin[] }) {
  return <MapInner pins={pins} />;
}
