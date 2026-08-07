import { Clock, Droplet } from 'lucide-react';
import type { HourlyWeather, TemperatureUnit } from '@/types';
import { formatHour, formatTemperature } from '@/lib/format';
import { getWeatherInfo } from '@/lib/weatherCode';

interface HourlyForecastProps {
  hourly: HourlyWeather[];
  unit: TemperatureUnit;
}

export function HourlyForecast({ hourly, unit }: HourlyForecastProps) {
  return (
    <section className="rounded-3xl border border-white/40 bg-white/70 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          <Clock className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-bold text-slate-900">시간별 예보 (24시간)</h2>
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {hourly.map((hour, i) => {
          const { icon: Icon } = getWeatherInfo(hour.weatherCode, hour.isDay);
          return (
            <div
              key={hour.time}
              className="flex min-w-[64px] shrink-0 flex-col items-center gap-1.5 rounded-2xl bg-slate-50 px-2 py-2.5"
            >
              <span className="text-xs font-semibold text-slate-400">
                {i === 0 ? '지금' : formatHour(hour.time)}
              </span>
              <Icon className="h-6 w-6 text-sky-500" />
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold ${
                  hour.precipitationProbability > 0 ? 'text-sky-500' : 'text-slate-300'
                }`}
              >
                <Droplet className="h-3 w-3" />
                {Math.round(hour.precipitationProbability)}%
              </span>
              <span className="text-sm font-bold text-slate-800">
                {formatTemperature(hour.temperature, unit)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
