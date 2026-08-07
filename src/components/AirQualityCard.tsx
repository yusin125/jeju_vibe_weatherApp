import { Wind } from 'lucide-react';
import type { AirQuality } from '@/types';
import { getPm10Level, getPm25Level } from '@/lib/format';

interface AirQualityCardProps {
  airQuality: AirQuality | null;
}

export function AirQualityCard({ airQuality }: AirQualityCardProps) {
  const pm25 = airQuality?.pm2_5 ?? null;
  const pm10 = airQuality?.pm10 ?? null;
  const pm25Level = getPm25Level(pm25);
  const pm10Level = getPm10Level(pm10);

  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          <Wind className="h-4.5 w-4.5" />
        </div>
        <h2 className="text-sm font-bold text-slate-900">미세먼지</h2>
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-center gap-5">
        <AqiRow label="초미세먼지 (PM2.5)" value={pm25} unit="µg/m³" level={pm25Level} max={100} />
        <AqiRow label="미세먼지 (PM10)" value={pm10} unit="µg/m³" level={pm10Level} max={200} />
      </div>

      {airQuality?.usAqi != null && (
        <p className="mt-4 text-center text-xs text-slate-400">US AQI {Math.round(airQuality.usAqi)}</p>
      )}
    </section>
  );
}

function AqiRow({
  label,
  value,
  unit,
  level,
  max,
}: {
  label: string;
  value: number | null;
  unit: string;
  level: { label: string; colorClass: string };
  max: number;
}) {
  const percent = value === null ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="text-xs font-bold text-slate-700">
          {value === null ? '정보 없음' : `${Math.round(value)} ${unit}`}
        </p>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${level.colorClass}`} style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1.5 text-xs font-medium text-slate-400">{level.label}</p>
    </div>
  );
}
