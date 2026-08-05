import type { City } from '@/types';

// Open-Meteo's geocoding search matches primarily against Latin-script
// names, so Korean-script queries for major Korean cities (e.g. "서울",
// "인천", "제주") often return obscure villages instead of the actual
// city, or nothing at all. This curated list is checked first so the
// common case works reliably; the API is still used for everything else.
export const KOREAN_CITIES: City[] = [
  { id: -1, name: '서울특별시', admin1: '서울특별시', country: '대한민국', latitude: 37.5665, longitude: 126.978, timezone: 'Asia/Seoul' },
  { id: -2, name: '부산광역시', admin1: '부산광역시', country: '대한민국', latitude: 35.1796, longitude: 129.0756, timezone: 'Asia/Seoul' },
  { id: -3, name: '인천광역시', admin1: '인천광역시', country: '대한민국', latitude: 37.4563, longitude: 126.7052, timezone: 'Asia/Seoul' },
  { id: -4, name: '대구광역시', admin1: '대구광역시', country: '대한민국', latitude: 35.8714, longitude: 128.6014, timezone: 'Asia/Seoul' },
  { id: -5, name: '대전광역시', admin1: '대전광역시', country: '대한민국', latitude: 36.3504, longitude: 127.3845, timezone: 'Asia/Seoul' },
  { id: -6, name: '광주광역시', admin1: '광주광역시', country: '대한민국', latitude: 35.1595, longitude: 126.8526, timezone: 'Asia/Seoul' },
  { id: -7, name: '울산광역시', admin1: '울산광역시', country: '대한민국', latitude: 35.5384, longitude: 129.3114, timezone: 'Asia/Seoul' },
  { id: -8, name: '세종특별자치시', admin1: '세종특별자치시', country: '대한민국', latitude: 36.48, longitude: 127.289, timezone: 'Asia/Seoul' },
  { id: -9, name: '제주시', admin1: '제주특별자치도', country: '대한민국', latitude: 33.4996, longitude: 126.5312, timezone: 'Asia/Seoul' },
  { id: -10, name: '서귀포시', admin1: '제주특별자치도', country: '대한민국', latitude: 33.2541, longitude: 126.5601, timezone: 'Asia/Seoul' },
  { id: -11, name: '수원시', admin1: '경기도', country: '대한민국', latitude: 37.2636, longitude: 127.0286, timezone: 'Asia/Seoul' },
  { id: -12, name: '성남시', admin1: '경기도', country: '대한민국', latitude: 37.42, longitude: 127.1268, timezone: 'Asia/Seoul' },
  { id: -13, name: '고양시', admin1: '경기도', country: '대한민국', latitude: 37.6584, longitude: 126.832, timezone: 'Asia/Seoul' },
  { id: -14, name: '용인시', admin1: '경기도', country: '대한민국', latitude: 37.2411, longitude: 127.1776, timezone: 'Asia/Seoul' },
  { id: -15, name: '전주시', admin1: '전라북도', country: '대한민국', latitude: 35.8242, longitude: 127.148, timezone: 'Asia/Seoul' },
  { id: -16, name: '청주시', admin1: '충청북도', country: '대한민국', latitude: 36.6424, longitude: 127.489, timezone: 'Asia/Seoul' },
  { id: -17, name: '천안시', admin1: '충청남도', country: '대한민국', latitude: 36.8151, longitude: 127.1139, timezone: 'Asia/Seoul' },
  { id: -18, name: '포항시', admin1: '경상북도', country: '대한민국', latitude: 36.019, longitude: 129.3435, timezone: 'Asia/Seoul' },
  { id: -19, name: '창원시', admin1: '경상남도', country: '대한민국', latitude: 35.2281, longitude: 128.6811, timezone: 'Asia/Seoul' },
  { id: -20, name: '강릉시', admin1: '강원특별자치도', country: '대한민국', latitude: 37.7519, longitude: 128.8761, timezone: 'Asia/Seoul' },
  { id: -21, name: '춘천시', admin1: '강원특별자치도', country: '대한민국', latitude: 37.8813, longitude: 127.7298, timezone: 'Asia/Seoul' },
  { id: -22, name: '여수시', admin1: '전라남도', country: '대한민국', latitude: 34.7604, longitude: 127.6622, timezone: 'Asia/Seoul' },
  { id: -23, name: '목포시', admin1: '전라남도', country: '대한민국', latitude: 34.8118, longitude: 126.3922, timezone: 'Asia/Seoul' },
  { id: -24, name: '경주시', admin1: '경상북도', country: '대한민국', latitude: 35.8562, longitude: 129.2247, timezone: 'Asia/Seoul' },
  { id: -25, name: '김해시', admin1: '경상남도', country: '대한민국', latitude: 35.2285, longitude: 128.8894, timezone: 'Asia/Seoul' },
];

const SUFFIX_RE = /(특별자치시|특별자치도|광역시|특별시|시|도)$/;
const stripSuffix = (s: string) => s.replace(SUFFIX_RE, '');

export function searchKoreanCities(query: string): City[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const q = stripSuffix(trimmed);
  return KOREAN_CITIES.filter((city) => {
    const name = stripSuffix(city.name);
    return city.name.includes(trimmed) || name.includes(q) || q.includes(name);
  });
}
