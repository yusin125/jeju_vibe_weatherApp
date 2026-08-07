import type { GeoRegion } from '@/types';

const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

// Free, no API key. Coverage is worldwide, used as the fallback for
// coordinates outside Kakao's Korea-only reverse-geocoding coverage.
// Usage policy (max ~1 req/sec, no bulk requests) is a non-issue here
// since this only ever fires once per map click.
export async function reverseGeocodeNominatim(lat: number, lng: number): Promise<GeoRegion | null> {
  const url = new URL(NOMINATIM_REVERSE_URL);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('zoom', '10');
  url.searchParams.set('accept-language', 'ko');

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = await res.json();
  const addr = data.address;
  if (!addr) return null;

  const name =
    addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.county ?? data.name;
  if (!name) return null;

  return { name, admin1: addr.state ?? null, country: addr.country ?? '' };
}
