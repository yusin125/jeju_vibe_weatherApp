import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudLightning,
  type LucideIcon,
} from 'lucide-react';

interface WeatherInfo {
  label: string;
  icon: LucideIcon;
}

// WMO Weather interpretation codes (open-meteo.com/en/docs)
export function getWeatherInfo(code: number, isDay: boolean = true): WeatherInfo {
  switch (code) {
    case 0:
      return { label: '맑음', icon: isDay ? Sun : Moon };
    case 1:
      return { label: '대체로 맑음', icon: isDay ? CloudSun : CloudMoon };
    case 2:
      return { label: '구름 조금', icon: isDay ? CloudSun : CloudMoon };
    case 3:
      return { label: '흐림', icon: Cloudy };
    case 45:
    case 48:
      return { label: '안개', icon: CloudFog };
    case 51:
    case 53:
    case 55:
      return { label: '이슬비', icon: CloudDrizzle };
    case 56:
    case 57:
      return { label: '어는 이슬비', icon: CloudDrizzle };
    case 61:
    case 63:
    case 65:
      return { label: '비', icon: CloudRain };
    case 66:
    case 67:
      return { label: '어는 비', icon: CloudRain };
    case 71:
    case 73:
    case 75:
      return { label: '눈', icon: CloudSnow };
    case 77:
      return { label: '싸락눈', icon: CloudSnow };
    case 80:
    case 81:
    case 82:
      return { label: '소나기', icon: CloudRainWind };
    case 85:
    case 86:
      return { label: '눈 소나기', icon: CloudSnow };
    case 95:
      return { label: '뇌우', icon: CloudLightning };
    case 96:
    case 99:
      return { label: '우박 동반 뇌우', icon: CloudLightning };
    default:
      return { label: '알 수 없음', icon: Cloud };
  }
}
