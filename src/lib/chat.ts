import type { City, TemperatureUnit, WeatherData } from '@/types';
import { getWeatherInfo } from './weatherCode';

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export function buildWeatherContext(city: City, data: WeatherData, unit: TemperatureUnit) {
  const unitLabel = unit === 'celsius' ? '°C' : '°F';
  const toDisplayTemp = (celsius: number) =>
    Math.round(unit === 'celsius' ? celsius : celsius * (9 / 5) + 32);

  return {
    city: [city.name, city.admin1, city.country].filter(Boolean).join(' '),
    unit: unitLabel,
    current: {
      temperature: toDisplayTemp(data.current.temperature),
      apparentTemperature: toDisplayTemp(data.current.apparentTemperature),
      condition: getWeatherInfo(data.current.weatherCode, data.current.isDay).label,
      humidity: data.current.humidity,
      windSpeed: data.current.windSpeed,
    },
    today: data.daily[0]
      ? {
          tempMax: toDisplayTemp(data.daily[0].tempMax),
          tempMin: toDisplayTemp(data.daily[0].tempMin),
          precipitationProbability: data.daily[0].precipitationProbability,
          sunrise: data.daily[0].sunrise,
          sunset: data.daily[0].sunset,
        }
      : null,
    next24Hours: data.hourly.slice(0, 24).map((h) => ({
      time: h.time,
      temperature: toDisplayTemp(h.temperature),
      precipitationProbability: h.precipitationProbability,
      condition: getWeatherInfo(h.weatherCode, h.isDay).label,
    })),
    next7Days: data.daily.slice(0, 7).map((d) => ({
      date: d.date,
      tempMax: toDisplayTemp(d.tempMax),
      tempMin: toDisplayTemp(d.tempMin),
      precipitationProbability: d.precipitationProbability,
      condition: getWeatherInfo(d.weatherCode, true).label,
    })),
    airQuality: data.airQuality,
  };
}

export async function sendChatMessage(
  message: string,
  history: ChatTurn[],
  weatherContext: unknown,
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, weatherContext }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? '챗봇 응답을 가져오지 못했어요.');
  }
  return data.reply ?? '';
}
