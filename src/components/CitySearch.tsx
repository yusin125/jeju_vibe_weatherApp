import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import { searchCities } from '@/lib/api';
import type { City } from '@/types';

interface CitySearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
}

export function CitySearch({ isOpen, onClose, onSelect }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setError(null);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const cities = await searchCities(query);
        setResults(cities);
        setError(cities.length === 0 ? '검색 결과가 없어요.' : null);
      } catch {
        setError('도시 검색에 실패했어요.');
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="도시 이름을 입력하세요 (예: 서울, Tokyo)"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button type="button" onClick={onClose} aria-label="닫기">
            <X className="h-4.5 w-4.5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <div className="mt-3 max-h-72 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              검색 중...
            </div>
          )}
          {!loading && error && (
            <p className="py-6 text-center text-sm text-slate-400">{error}</p>
          )}
          {!loading &&
            results.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => {
                  onSelect(city);
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
              >
                <MapPin className="h-4 w-4 shrink-0 text-sky-500" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {city.name}
                  </span>
                  <span className="block truncate text-xs text-slate-400">
                    {[city.admin1, city.country].filter(Boolean).join(', ')}
                  </span>
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
