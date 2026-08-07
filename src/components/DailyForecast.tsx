import { CalendarDays, Droplet } from 'lucide-react';
import type { DailyWeather, TemperatureUnit } from '@/types';
import { formatDayLabel, formatMonthDay, formatTemperature } from '@/lib/format';
import { getWeatherInfo } from '@/lib/weatherCode';

interface DailyForecastProps {
  daily: DailyWeather[];
  unit: TemperatureUnit;
}

export function DailyForecast({ daily, unit }: DailyForecastProps) {
  const days = daily.slice(0, 7);

  return (
    <section className="rounded-3xl border border-white/40 bg-white/70 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          <CalendarDays className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-bold text-slate-900">7일 예보</h2>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
        {days.map((day, i) => {
          const { label, icon: Icon } = getWeatherInfo(day.weatherCode, true);
          return (
            <div
              key={day.date}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-50 px-2 py-3 text-center"
            >
              <span className="text-sm font-bold text-slate-800">{formatDayLabel(day.date, i)}</span>
              <span className="text-[11px] text-slate-400">{formatMonthDay(day.date)}</span>
              <Icon className="h-7 w-7 text-sky-500" />
              <span className="text-[11px] font-medium text-slate-400">{label}</span>
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold ${
                  day.precipitationProbability > 0 ? 'text-sky-500' : 'text-slate-300'
                }`}
              >
                <Droplet className="h-3 w-3" />
                {Math.round(day.precipitationProbability)}%
              </span>
              <span className="text-sm font-bold text-slate-800">
                {formatTemperature(day.tempMax, unit)}
                <span className="ml-1 font-medium text-slate-400">
                  {formatTemperature(day.tempMin, unit)}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
