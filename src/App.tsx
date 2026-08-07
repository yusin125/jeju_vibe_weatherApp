import { useCallback, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Header } from './components/Header';
import { CitySearch } from './components/CitySearch';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { ChatBot } from './components/ChatBot';
import { LocationMap, type SelectedLocation } from './components/LocationMap';
import { WeatherBackground } from './components/WeatherBackground';
import { useWeather } from './hooks/useWeather';
import type { TemperatureUnit } from './types';

export default function App() {
  const { city, data, loading, error, changeCity, refresh } = useWeather();
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleMapSelect = useCallback(
    ({ lat, lng, region }: SelectedLocation) => {
      changeCity({
        id: Date.now(),
        name: region?.name ?? `위도 ${lat.toFixed(4)}, 경도 ${lng.toFixed(4)}`,
        admin1: region?.admin1 ?? undefined,
        country: region?.country ?? '',
        latitude: lat,
        longitude: lng,
        timezone: 'Asia/Seoul',
      });
    },
    [changeCity],
  );

  return (
    <div className="min-h-screen">
      <WeatherBackground
        weatherCode={data?.current.weatherCode ?? 0}
        isDay={data?.current.isDay ?? true}
        temperature={data?.current.temperature ?? 20}
        windSpeed={data?.current.windSpeed ?? 10}
      />
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5">
        <Header
          city={city}
          unit={unit}
          loading={loading}
          onOpenSearch={() => setIsSearchOpen(true)}
          onUnitChange={setUnit}
          onRefresh={refresh}
        />

        {error && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-rose-200/60 bg-rose-50/85 px-4 py-2.5 backdrop-blur-xl">
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
          <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/40 bg-white/70 py-24 text-slate-400 backdrop-blur-xl">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm font-medium">날씨 정보를 불러오는 중...</p>
          </div>
        )}

        {data && (
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 lg:grid-cols-3 lg:items-start">
            <div className="lg:col-span-2">
              <CurrentWeatherCard
                city={city}
                current={data.current}
                today={data.daily[0]}
                unit={unit}
                airQuality={data.airQuality}
              />
            </div>

            <div className="lg:sticky lg:top-4 lg:col-span-1 lg:row-span-2">
              <LocationMap
                center={{ lat: city.latitude, lng: city.longitude }}
                onSelectLocation={handleMapSelect}
              />
            </div>

            <div className="space-y-4 lg:col-span-2">
              <HourlyForecast hourly={data.hourly} unit={unit} />
              <DailyForecast daily={data.daily} unit={unit} />
            </div>
          </div>
        )}
      </div>

      <CitySearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={changeCity}
      />

      <ChatBot city={city} data={data} unit={unit} />
    </div>
  );
}
