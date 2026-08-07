import type { GeoRegion } from '@/types';

let sdkPromise: Promise<void> | null = null;

// Loads the Kakao Maps JS SDK exactly once and resolves after
// kakao.maps.load() finishes initializing, so callers can safely use
// window.kakao.maps right after awaiting this.
export function loadKakaoMapsSdk(): Promise<void> {
  if (sdkPromise) return sdkPromise;

  const appKey = import.meta.env.VITE_KAKAO_MAP_KEY;
  if (!appKey) {
    return Promise.reject(
      new Error('VITE_KAKAO_MAP_KEY가 설정되어 있지 않아요. .env 파일을 확인해주세요.'),
    );
  }

  sdkPromise = new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => resolve());
    script.onerror = () => reject(new Error('카카오맵 SDK를 불러오지 못했어요.'));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

// Reverse-geocodes via the Maps SDK's bundled `services` library (client-side,
// same JS key — no separate REST key/CORS setup needed). Kakao's address
// coverage is Korea-only, so clicks elsewhere resolve to null.
export function reverseGeocodeKakao(lat: number, lng: number): Promise<GeoRegion | null> {
  return loadKakaoMapsSdk().then(
    () =>
      new Promise<GeoRegion | null>((resolve) => {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(lng, lat, (result, status) => {
          if (status !== window.kakao.maps.services.Status.OK || !result[0]?.address) {
            resolve(null);
            return;
          }

          const { address, road_address } = result[0];
          const name =
            [address.region_2depth_name, address.region_3depth_name].filter(Boolean).join(' ') ||
            road_address?.address_name ||
            address.address_name;

          resolve({ name, admin1: address.region_1depth_name || null, country: '대한민국' });
        });
      }),
  );
}
