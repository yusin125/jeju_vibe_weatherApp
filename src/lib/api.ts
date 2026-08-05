import type { AirQuality, City, DailyWeather, HourlyWeather, WeatherData } from '@/types';
import { searchKoreanCities } from './koreanCities';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export class WeatherApiError extends Error {}

export async function searchCities(query: string): Promise<City[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Open-Meteo's geocoding search matches Latin-script names, so it
  // handles Korean-script queries for Korean cities poorly (or not at
  // all). Check the curated local list first, then fill in with the API.
  const localMatches = searchKoreanCities(trimmed);

  const url = new URL(GEOCODING_URL);
  url.searchParams.set('name', trimmed);
  url.searchParams.set('count', '8');
  url.searchParams.set('language', 'ko');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString());
  if (!res.ok) {
    if (localMatches.length > 0) return localMatches;
    throw new WeatherApiError('도시 검색에 실패했어요.');
  }
  const data = await res.json();

  const apiResults: City[] = (data.results ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }));

  const localNames = new Set(localMatches.map((c) => c.name));
  return [...localMatches, ...apiResults.filter((c) => !localNames.has(c.name))].slice(0, 8);
}

export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherData> {
  const forecastUrl = new URL(FORECAST_URL);
  forecastUrl.searchParams.set('latitude', String(latitude));
  forecastUrl.searchParams.set('longitude', String(longitude));
  forecastUrl.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day',
  );
  forecastUrl.searchParams.set(
    'hourly',
    'temperature_2m,precipitation_probability,weather_code,is_day',
  );
  forecastUrl.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
  );
  forecastUrl.searchParams.set('timezone', 'auto');
  forecastUrl.searchParams.set('forecast_days', '8');

  const airQualityUrl = new URL(AIR_QUALITY_URL);
  airQualityUrl.searchParams.set('latitude', String(latitude));
  airQualityUrl.searchParams.set('longitude', String(longitude));
  airQualityUrl.searchParams.set('current', 'pm10,pm2_5,us_aqi');
  airQualityUrl.searchParams.set('timezone', 'auto');

  const [forecastRes, airQualityRes] = await Promise.all([
    fetch(forecastUrl.toString()),
    fetch(airQualityUrl.toString()).catch(() => null),
  ]);

  if (!forecastRes.ok) throw new WeatherApiError('날씨 정보를 가져오지 못했어요.');
  const forecast = await forecastRes.json();

  let airQuality: AirQuality | null = null;
  if (airQualityRes && airQualityRes.ok) {
    const aq = await airQualityRes.json();
    if (aq.current) {
      airQuality = {
        pm2_5: aq.current.pm2_5 ?? null,
        pm10: aq.current.pm10 ?? null,
        usAqi: aq.current.us_aqi ?? null,
      };
    }
  }

  // hourly.time is a flat array of local ISO timestamps; find the one
  // matching the current hour and take the next 24 from there.
  const currentHourTime = `${forecast.current.time.slice(0, 13)}:00`;
  let startIndex = forecast.hourly.time.indexOf(currentHourTime);
  if (startIndex === -1) {
    startIndex = forecast.hourly.time.findIndex((t: string) => t >= forecast.current.time);
  }
  if (startIndex === -1) startIndex = 0;

  const hourly: HourlyWeather[] = forecast.hourly.time
    .slice(startIndex, startIndex + 24)
    .map((time: string, i: number) => {
      const idx = startIndex + i;
      return {
        time,
        temperature: forecast.hourly.temperature_2m[idx],
        precipitationProbability: forecast.hourly.precipitation_probability[idx] ?? 0,
        weatherCode: forecast.hourly.weather_code[idx],
        isDay: forecast.hourly.is_day[idx] === 1,
      };
    });

  const daily: DailyWeather[] = forecast.daily.time.map((date: string, i: number) => ({
    date,
    weatherCode: forecast.daily.weather_code[i],
    tempMax: forecast.daily.temperature_2m_max[i],
    tempMin: forecast.daily.temperature_2m_min[i],
    precipitationProbability: forecast.daily.precipitation_probability_max[i] ?? 0,
    sunrise: forecast.daily.sunrise[i],
    sunset: forecast.daily.sunset[i],
  }));

  return {
    current: {
      time: forecast.current.time,
      temperature: forecast.current.temperature_2m,
      apparentTemperature: forecast.current.apparent_temperature,
      humidity: forecast.current.relative_humidity_2m,
      precipitation: forecast.current.precipitation,
      weatherCode: forecast.current.weather_code,
      windSpeed: forecast.current.wind_speed_10m,
      isDay: forecast.current.is_day === 1,
    },
    hourly,
    daily,
    airQuality,
  };
}
