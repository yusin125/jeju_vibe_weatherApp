import { useState } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Header } from './components/Header';
import { CitySearch } from './components/CitySearch';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { AirQualityCard } from './components/AirQualityCard';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { useWeather } from './hooks/useWeather';
import type { TemperatureUnit } from './types';

export default function App() {
  const { city, data, loading, error, changeCity, refresh } = useWeather();
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <Header
          city={city}
          unit={unit}
          loading={loading}
          onOpenSearch={() => setIsSearchOpen(true)}
          onUnitChange={setUnit}
          onRefresh={refresh}
        />

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-rose-600">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              {error}
            </div>
            <button
              type="button"
              onClick={refresh}
              className="flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              다시 시도
            </button>
          </div>
        )}

        {!data && loading && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white py-24 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm font-medium">날씨 정보를 불러오는 중...</p>
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <CurrentWeatherCard
                  city={city}
                  current={data.current}
                  today={data.daily[0]}
                  unit={unit}
                />
              </div>
              <div className="lg:col-span-1">
                <AirQualityCard airQuality={data.airQuality} />
              </div>
            </div>

            <HourlyForecast hourly={data.hourly} unit={unit} />
            <DailyForecast daily={data.daily} unit={unit} />
          </>
        )}
      </div>

      <CitySearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={changeCity}
      />
    </div>
  );
}
