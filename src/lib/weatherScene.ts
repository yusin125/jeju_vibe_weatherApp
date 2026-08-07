export type SceneKey =
  | 'clear-day'
  | 'few-clouds'
  | 'overcast'
  | 'rain'
  | 'showers'
  | 'thunderstorm'
  | 'snow'
  | 'sleet'
  | 'fog'
  | 'strong-wind'
  | 'heatwave'
  | 'heavy-snow'
  | 'clear-night'
  | 'cloudy-night';

export interface SceneInput {
  weatherCode: number;
  isDay: boolean;
  temperature: number;
  windSpeed: number;
}

const HEATWAVE_TEMP_C = 33;
const STRONG_WIND_KMH = 40;

/** Maps live weather data onto one of 14 background scenes. Extreme
 * temperature/wind take priority over the plain sky-condition codes so a
 * hot clear day reads as a heatwave rather than plain "clear". */
export function classifyScene({ weatherCode, isDay, temperature, windSpeed }: SceneInput): SceneKey {
  const code = weatherCode;

  if (code === 95 || code === 96 || code === 99) return 'thunderstorm';
  if (code === 75 || code === 86) return 'heavy-snow';
  if (code === 56 || code === 57 || code === 66 || code === 67) return 'sleet';
  if (code === 71 || code === 73 || code === 77 || code === 85) return 'snow';
  if (isDay && temperature >= HEATWAVE_TEMP_C && code <= 2) return 'heatwave';
  if (windSpeed >= STRONG_WIND_KMH && code <= 3) return 'strong-wind';
  if (code === 80 || code === 81 || code === 82) return 'showers';
  if (
    code === 51 ||
    code === 53 ||
    code === 55 ||
    code === 61 ||
    code === 63 ||
    code === 65
  )
    return 'rain';
  if (code === 45 || code === 48) return 'fog';
  if (code === 3) return isDay ? 'overcast' : 'cloudy-night';
  if (code === 1 || code === 2) return isDay ? 'few-clouds' : 'cloudy-night';
  if (code === 0) return isDay ? 'clear-day' : 'clear-night';
  return isDay ? 'overcast' : 'cloudy-night';
}

/** Top-to-bottom sky gradient stops per scene. Kept mid-brightness (never
 * too dark/saturated) so translucent cards stay readable on top of it. */
export const SKY_GRADIENTS: Record<SceneKey, [string, string, string]> = {
  'clear-day': ['#6fb6ec', '#a9d8f4', '#e8f5fb'],
  'few-clouds': ['#68b0e6', '#a3d1ee', '#e0eff8'],
  overcast: ['#8b98a6', '#a9b4be', '#c9d0d7'],
  rain: ['#4f5f6e', '#6b7a87', '#8996a1'],
  showers: ['#57697a', '#788a95', '#9aa6ad'],
  thunderstorm: ['#1c2330', '#2e3646', '#454f60'],
  snow: ['#a7b6c4', '#c6d3dd', '#e6edf2'],
  sleet: ['#727f8c', '#94a1ab', '#b9c3ca'],
  fog: ['#b6bfc6', '#c9d1d6', '#dde3e6'],
  'strong-wind': ['#7ea6c7', '#a8c6dd', '#d2e3ee'],
  heatwave: ['#ff8f4d', '#ffb668', '#ffdb94'],
  'heavy-snow': ['#8695a3', '#a9b7c2', '#ccd7de'],
  'clear-night': ['#0a1330', '#152249', '#213865'],
  'cloudy-night': ['#181f30', '#262f43', '#353f54'],
};
