export const dynamic = 'force-dynamic';

import { and, eq, isNotNull } from 'drizzle-orm';
import { MapView } from '@/components/MapView';
import { db } from '@/db';
import { products } from '@/db/schema';

const activityLabels: Record<string, string> = {
  museum: 'Muzeu',
  theatre: 'Teatru',
  escape: 'Escape Room',
  park: 'Parc',
  cinema: 'Cinema',
  spa: 'Spa',
  zoo: 'Zoo',
  event: 'Eveniment',
};

const activityEmoji: Record<string, string> = {
  museum: '🏛️',
  theatre: '🎭',
  escape: '🧩',
  park: '🌳',
  cinema: '🎬',
  spa: '💆',
  zoo: '🦁',
  event: '🎉',
};

const knownCities = new Set([
  'bucharest', 'bucuresti', 'cluj', 'timisoara', 'iasi', 'brasov', 'sibiu', 'constanta', 'craiova', 'oradea',
  'galati', 'ploiesti', 'arad', 'pitesti', 'suceava', 'baia_mare', 'romania', 'transilvania',
]);

function inferActivityType(tags: string[]): string {
  const lowerTags = tags.map((tag) => tag.toLowerCase());
  for (const key of Object.keys(activityLabels)) {
    if (lowerTags.includes(key)) return key;
  }
  if (lowerTags.includes('teatru')) return 'theatre';
  if (lowerTags.includes('muzeu')) return 'museum';
  if (lowerTags.includes('escape_room')) return 'escape';
  return 'event';
}

function inferCity(tags: string[]): string {
  const cityTag = tags.find((tag) => knownCities.has(tag.toLowerCase()));
  if (!cityTag) return 'România';
  return cityTag
    .replaceAll('_', ' ')
    .split(' ')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export default async function HartaPage() {
  const items = await db
    .select({
      id: products.id,
      title: products.title,
      priceCents: products.priceCents,
      lat: products.lat,
      lon: products.lon,
      tags: products.tags,
    })
    .from(products)
    .where(and(eq(products.category, 'de_facut'), isNotNull(products.lat), isNotNull(products.lon)));

  const pins = items.map((item) => ({
    id: item.id,
    title: item.title,
    priceCents: item.priceCents,
    lat: item.lat || 0,
    lon: item.lon || 0,
    city: inferCity((item.tags as string[]) || []),
    activityType: inferActivityType((item.tags as string[]) || []),
  }));

  return (
    <main className="space-y-5">
      <section className="glass p-6">
        <h1 className="text-3xl font-bold">Hartă cu activități</h1>
        <p className="mt-2 text-sm text-slate-300">
          {pins.length} activități de făcut din toată România, grupate inteligent pe hartă.
        </p>
      </section>
      <MapView pins={pins} activityLabels={activityLabels} activityEmoji={activityEmoji} />
    </main>
  );
}
