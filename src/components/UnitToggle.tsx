import type { TemperatureUnit } from '@/types';

interface UnitToggleProps {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
}

export function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div className="flex items-center rounded-full border border-white/40 bg-white/70 p-1 text-sm font-semibold shadow-sm shadow-slate-900/5 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => onChange('celsius')}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          unit === 'celsius' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
        }`}
        aria-pressed={unit === 'celsius'}
      >
        °C
      </button>
      <button
        type="button"
        onClick={() => onChange('fahrenheit')}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          unit === 'fahrenheit' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
        }`}
        aria-pressed={unit === 'fahrenheit'}
      >
        °F
      </button>
    </div>
  );
}
