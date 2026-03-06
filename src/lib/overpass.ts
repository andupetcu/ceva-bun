const cache = new Map<string, { expiresAt: number; value: unknown }>();

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const TTL_MS = 1000 * 60 * 60;

export const buildBucharestQuery = () => `
[out:json][timeout:25];
area[name="Bucuresti"]->.searchArea;
(
  node["amenity"~"restaurant|cafe|bar|theatre|arts_centre|cinema|events_venue"](area.searchArea);
  node["tourism"~"museum|attraction"](area.searchArea);
  node["leisure"~"park|escape_game"](area.searchArea);
);
out body 120;
`;

export async function fetchOverpass(query: string) {
  const key = query.trim();
  const now = Date.now();
  const fromCache = cache.get(key);

  if (fromCache && fromCache.expiresAt > now) {
    return fromCache.value;
  }

  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: query,
    headers: { 'Content-Type': 'text/plain' },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Overpass a răspuns cu status ${response.status}`);
  }

  const data = await response.json();
  cache.set(key, { expiresAt: now + TTL_MS, value: data });
  return data;
}
