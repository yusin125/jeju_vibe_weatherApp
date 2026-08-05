import { useCallback, useEffect, useState } from 'react';
import { fetchWeather } from '@/lib/api';
import type { City, WeatherData } from '@/types';

export const DEFAULT_CITY: City = {
  id: 1846266,
  name: '제주시',
  admin1: '제주특별자치도',
  country: '대한민국',
  latitude: 33.4996,
  longitude: 126.5312,
  timezone: 'Asia/Seoul',
};

export function useWeather() {
  const [city, setCity] = useState<City>(DEFAULT_CITY);
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (target: City) => {
    setLoading(true);
    setError(null);
    try {
      const weather = await fetchWeather(target.latitude, target.longitude);
      setData(weather);
    } catch (e) {
      setError(e instanceof Error ? e.message : '날씨 정보를 가져오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(city);
  }, [city, load]);

  const changeCity = useCallback((next: City) => {
    setCity(next);
  }, []);

  const refresh = useCallback(() => {
    load(city);
  }, [city, load]);

  return { city, data, loading, error, changeCity, refresh };
}
