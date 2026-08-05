import type { TemperatureUnit } from '@/types';

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const value = unit === 'celsius' ? celsius : celsius * (9 / 5) + 32;
  return `${Math.round(value)}°`;
}

// Open-Meteo returns timezone-less local ISO strings ("YYYY-MM-DDTHH:mm").
// We parse them manually instead of `new Date()` so a searched city's own
// local time is used, regardless of the browser's timezone.
function parseLocalParts(iso: string) {
  const [datePart, timePart] = iso.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = (timePart ?? '00:00').split(':').map(Number);
  return { year, month, day, hour, minute };
}

export function formatHour(isoTime: string): string {
  const { hour } = parseLocalParts(isoTime);
  if (hour === 0) return '자정';
  if (hour === 12) return '정오';
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${displayHour}시`;
}

export function formatDayLabel(isoDate: string, index: number): string {
  if (index === 0) return '오늘';
  if (index === 1) return '내일';
  const { year, month, day } = parseLocalParts(isoDate);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${days[dayOfWeek]}요일`;
}

export function formatMonthDay(isoDate: string): string {
  const { month, day } = parseLocalParts(isoDate);
  return `${month}.${day}`;
}

export function formatTime(isoTime: string): string {
  const { hour, minute } = parseLocalParts(isoTime);
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${displayHour}:${minute.toString().padStart(2, '0')}`;
}

export interface AqiLevel {
  label: string;
  colorClass: string;
}

export function getPm25Level(value: number | null): AqiLevel {
  if (value === null) return { label: '정보 없음', colorClass: 'bg-slate-300' };
  if (value <= 15) return { label: '좋음', colorClass: 'bg-sky-500' };
  if (value <= 35) return { label: '보통', colorClass: 'bg-emerald-500' };
  if (value <= 75) return { label: '나쁨', colorClass: 'bg-amber-500' };
  return { label: '매우 나쁨', colorClass: 'bg-rose-500' };
}

export function getPm10Level(value: number | null): AqiLevel {
  if (value === null) return { label: '정보 없음', colorClass: 'bg-slate-300' };
  if (value <= 30) return { label: '좋음', colorClass: 'bg-sky-500' };
  if (value <= 80) return { label: '보통', colorClass: 'bg-emerald-500' };
  if (value <= 150) return { label: '나쁨', colorClass: 'bg-amber-500' };
  return { label: '매우 나쁨', colorClass: 'bg-rose-500' };
}
