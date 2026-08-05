# 오늘 날씨 (jeju_vibe_weatherApp)

Open-Meteo API 기반의 반응형 날씨 웹앱입니다.

## 기능

- 도시 검색 (한국 주요 도시 25곳은 로컬 목록으로 우선 매칭, 그 외는 Open-Meteo Geocoding API)
- 오늘 날씨: 체감온도, 습도, 강수 확률, 풍속, 일출/일몰
- 시간별 예보 (24시간)
- 7일 예보
- 미세먼지(PM2.5 / PM10, US AQI)
- 섭씨 / 화씨 전환

## 기술 스택

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- lucide-react
- [Open-Meteo](https://open-meteo.com/) API (Forecast, Air Quality, Geocoding)

## 개발

```bash
npm install
npm run dev
```

## 배포

- Production: https://jeju-vibe-weather-app-one.vercel.app
- GitHub 저장소와 Vercel 프로젝트가 연결되어 있어 `main` 브랜치에 push하면 자동으로 배포됩니다.
