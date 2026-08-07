import { Droplets, Sunrise, Sunset, Umbrella, Wind } from 'lucide-react';
import type { City, CurrentWeather, DailyWeather, TemperatureUnit } from '@/types';
import { formatTemperature, formatTime } from '@/lib/format';
import { getWeatherInfo } from '@/lib/weatherCode';

interface CurrentWeatherCardProps {
  city: City;
  current: CurrentWeather;
  today?: DailyWeather;
  unit: TemperatureUnit;
}

export function CurrentWeatherCard({ city, current, today, unit }: CurrentWeatherCardProps) {
  const { label, icon: Icon } = getWeatherInfo(current.weatherCode, current.isDay);

  return (
    <section className="flex h-full flex-col justify-between rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-400">
            {[city.admin1, city.country].filter(Boolean).join(' · ') || '현재 위치'}
          </p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-6xl font-bold tracking-tight text-slate-900">
              {formatTemperature(current.temperature, unit)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {label} · 체감 {formatTemperature(current.apparentTemperature, unit)}
          </p>
          {today && (
            <p className="mt-2 text-sm font-semibold text-slate-700">
              최고 {formatTemperature(today.tempMax, unit)} · 최저{' '}
              {formatTemperature(today.tempMin, unit)}
            </p>
          )}
        </div>

        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
          <Icon className="h-9 w-9" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatItem icon={Droplets} label="습도" value={`${Math.round(current.humidity)}%`} />
        <StatItem
          icon={Umbrella}
          label="강수 확률"
          value={`${Math.round(today?.precipitationProbability ?? 0)}%`}
        />
        <StatItem icon={Wind} label="풍속" value={`${Math.round(current.windSpeed)}km/h`} />
        {today && <StatItem icon={Sunrise} label="일출" value={formatTime(today.sunrise)} />}
        {today && <StatItem icon={Sunset} label="일몰" value={formatTime(today.sunset)} />}
      </div>
    </section>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Droplets;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
      <Icon className="h-4.5 w-4.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-400">{label}</p>
        <p className="truncate text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
