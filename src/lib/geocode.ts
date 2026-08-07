import type { GeoRegion } from '@/types';
import { reverseGeocodeKakao } from './kakaoMap';
import { reverseGeocodeNominatim } from './nominatim';

// Kakao only covers Korea and can also fail to load its SDK; Nominatim
// (OpenStreetMap) covers the rest of the world, so it's the fallback for
// both a ZERO_RESULT and an outright error.
export async function reverseGeocode(lat: number, lng: number): Promise<GeoRegion | null> {
  const kakaoRegion = await reverseGeocodeKakao(lat, lng).catch(() => null);
  if (kakaoRegion) return kakaoRegion;

  return reverseGeocodeNominatim(lat, lng).catch(() => null);
}
