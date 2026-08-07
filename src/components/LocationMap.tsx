import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin, Loader2 } from 'lucide-react';
import { reverseGeocode } from '@/lib/geocode';
import type { GeoRegion } from '@/types';

// Vite serves these as hashed URLs, but Leaflet's default icon otherwise
// looks for them relative to the page (broken once bundled), so the
// default icon has to be told about the bundled URLs explicitly.
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export interface SelectedLocation {
  lat: number;
  lng: number;
  region: GeoRegion | null;
}

interface LocationMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  onSelectLocation?: (location: SelectedLocation) => void;
}

export function LocationMap({ center, zoom = 7, onSelectLocation }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [region, setRegion] = useState<GeoRegion | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  // Tracks the last location *this component* reported via onSelectLocation
  // (a map click), so the center-sync effect below can tell "the parent's
  // city changed because we told it to" apart from "the parent's city
  // changed for some other reason (e.g. the search dropdown)" and only
  // react to the latter.
  const lastEmittedRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Leaflet's tile canvas doesn't track its container's size on its own,
    // so a layout change (e.g. the sidebar reflowing) leaves stale blank
    // space until invalidateSize() runs.
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }

      setSelected({ lat, lng });
      setRegion(null);
      setGeocoding(true);
      lastEmittedRef.current = { lat, lng };

      reverseGeocode(lat, lng).then((resolvedRegion) => {
        setRegion(resolvedRegion);
        setGeocoding(false);
        onSelectLocation?.({ lat, lng, region: resolvedRegion });
      });
    });

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Map is only initialized once here; it's kept in sync with later
    // `center` prop changes by the effect below instead, so a drag doesn't
    // get fought by this effect re-running.
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const last = lastEmittedRef.current;
    const isEcho =
      last !== null &&
      Math.abs(last.lat - center.lat) < 1e-9 &&
      Math.abs(last.lng - center.lng) < 1e-9;
    if (isEcho) return;

    map.flyTo([center.lat, center.lng], map.getZoom());

    if (!markerRef.current) {
      markerRef.current = L.marker([center.lat, center.lng]).addTo(map);
    } else {
      markerRef.current.setLatLng([center.lat, center.lng]);
    }
  }, [center.lat, center.lng]);

  return (
    <div className="rounded-3xl border border-white/40 bg-white/70 p-4 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-700">
          <MapPin className="h-4 w-4 text-sky-500" />
          지도에서 위치 선택
        </h2>
        {selected && (
          <p className="truncate text-right text-xs font-medium text-slate-400">
            {geocoding ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                주소 확인 중...
              </span>
            ) : (
              (region &&
                [region.admin1, region.name, region.country].filter(Boolean).join(' · ')) ||
              '주소를 찾을 수 없어요'
            )}
            {' · '}
            {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
          </p>
        )}
      </div>

      <div className="relative h-96 w-full overflow-hidden rounded-2xl bg-slate-100 lg:h-[32rem]">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
