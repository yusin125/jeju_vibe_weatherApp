import { ChevronDown, CloudSun, MapPin, RefreshCw } from 'lucide-react';
import type { City, TemperatureUnit } from '@/types';
import { UnitToggle } from './UnitToggle';

interface HeaderProps {
  city: City;
  unit: TemperatureUnit;
  loading: boolean;
  onOpenSearch: () => void;
  onUnitChange: (unit: TemperatureUnit) => void;
  onRefresh: () => void;
}

export function Header({ city, unit, loading, onOpenSearch, onUnitChange, onRefresh }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white">
          <CloudSun className="h-5.5 w-5.5" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight text-slate-900">오늘 날씨</h1>
          <p className="text-xs text-slate-400">Open-Meteo 기반 실시간 날씨</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300"
        >
          <MapPin className="h-4 w-4 text-sky-500" />
          {city.name}
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={onRefresh}
          aria-label="새로고침"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        <UnitToggle unit={unit} onChange={onUnitChange} />
      </div>
    </header>
  );
}
