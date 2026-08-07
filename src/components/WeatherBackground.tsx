import { useEffect, useRef } from 'react';
import { classifyScene, SKY_GRADIENTS, type SceneKey } from '@/lib/weatherScene';

interface WeatherBackgroundProps {
  weatherCode: number;
  isDay: boolean;
  temperature: number;
  windSpeed: number;
}

interface Cloud {
  x: number;
  y: number;
  scale: number;
  stretch: number;
  speed: number;
  opacity: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
  sway: number;
  phase: number;
  opacity: number;
  slant: number;
}

interface Ripple {
  x: number;
  y: number;
  maxR: number;
  timer: number;
  delay: number;
  radius: number;
  alpha: number;
}

interface Snowflake {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  phase: number;
  opacity: number;
}

interface FogBand {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  opacity: number;
}

interface WindLine {
  x: number;
  y: number;
  len: number;
  speed: number;
  opacity: number;
}

interface ShimmerLine {
  x: number;
  y: number;
  width: number;
  speed: number;
  phase: number;
}

interface SceneState {
  clouds: Cloud[];
  stars: Star[];
  rain: RainDrop[];
  ripples: Ripple[];
  snow: Snowflake[];
  fog: FogBand[];
  wind: WindLine[];
  shimmer: ShimmerLine[];
  lightning: { alpha: number; timer: number; flashesLeft: number };
}

const RIPPLE_DURATION = 1.4;
const TRANSITION_MS = 1400;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeClouds(
  count: number,
  w: number,
  h: number,
  opts: {
    yMin: number;
    yMax: number;
    scaleMin: number;
    scaleMax: number;
    speedMin: number;
    speedMax: number;
    opacityMin: number;
    opacityMax: number;
    stretch?: number;
    color: string;
  },
): Cloud[] {
  return Array.from({ length: count }, () => ({
    x: rand(-0.2 * w, w),
    y: rand(opts.yMin * h, opts.yMax * h),
    scale: rand(opts.scaleMin, opts.scaleMax),
    stretch: opts.stretch ?? 1,
    speed: rand(opts.speedMin, opts.speedMax),
    opacity: rand(opts.opacityMin, opts.opacityMax),
    color: opts.color,
  }));
}

function makeStars(count: number, w: number, h: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: rand(0, w),
    y: rand(0, h * 0.75),
    r: rand(0.6, 1.8),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.6, 1.6),
  }));
}

function makeRain(
  count: number,
  w: number,
  h: number,
  opts: { speedMin: number; speedMax: number; lenMin: number; lenMax: number; slant: number },
): RainDrop[] {
  return Array.from({ length: count }, () => ({
    x: rand(-0.1 * w, w * 1.1),
    y: rand(0, h),
    len: rand(opts.lenMin, opts.lenMax),
    speed: rand(opts.speedMin, opts.speedMax),
    sway: rand(4, 12),
    phase: rand(0, Math.PI * 2),
    opacity: rand(0.25, 0.55),
    slant: opts.slant,
  }));
}

function makeRipples(count: number, w: number, h: number): Ripple[] {
  return Array.from({ length: count }, () => ({
    x: rand(0, w),
    y: h - rand(0, 30),
    maxR: rand(14, 26),
    timer: 0,
    delay: rand(0, 3),
    radius: 0,
    alpha: 0,
  }));
}

function makeSnow(
  count: number,
  w: number,
  h: number,
  opts: { speedMin: number; speedMax: number; sizeMin: number; sizeMax: number; drift: number },
): Snowflake[] {
  return Array.from({ length: count }, () => ({
    x: rand(0, w),
    y: rand(0, h),
    r: rand(opts.sizeMin, opts.sizeMax),
    speed: rand(opts.speedMin, opts.speedMax),
    drift: rand(opts.drift * 0.5, opts.drift),
    phase: rand(0, Math.PI * 2),
    opacity: rand(0.5, 0.9),
  }));
}

function makeFog(count: number, w: number, h: number): FogBand[] {
  return Array.from({ length: count }, (_, i) => ({
    x: rand(-0.3 * w, w),
    y: (h / count) * i + rand(-20, 20),
    w: rand(0.6 * w, 1.1 * w),
    h: rand(60, 130),
    speed: rand(8, 22),
    opacity: rand(0.12, 0.24),
  }));
}

function makeWind(count: number, w: number, h: number): WindLine[] {
  return Array.from({ length: count }, () => ({
    x: rand(-0.2 * w, w),
    y: rand(0, h * 0.85),
    len: rand(40, 110),
    speed: rand(360, 620),
    opacity: rand(0.15, 0.4),
  }));
}

function makeShimmer(count: number, w: number, h: number): ShimmerLine[] {
  return Array.from({ length: count }, () => ({
    x: rand(0, w),
    y: rand(h * 0.55, h * 1.1),
    width: rand(80, 200),
    speed: rand(18, 34),
    phase: rand(0, Math.PI * 2),
  }));
}

function createSceneState(key: SceneKey, w: number, h: number): SceneState {
  const state: SceneState = {
    clouds: [],
    stars: [],
    rain: [],
    ripples: [],
    snow: [],
    fog: [],
    wind: [],
    shimmer: [],
    lightning: { alpha: 0, timer: rand(2, 4), flashesLeft: 0 },
  };

  switch (key) {
    case 'clear-day':
      state.clouds = makeClouds(4, w, h, {
        yMin: 0.08,
        yMax: 0.32,
        scaleMin: 1.5,
        scaleMax: 2.3,
        speedMin: 4,
        speedMax: 8,
        opacityMin: 0.7,
        opacityMax: 0.9,
        color: 'rgba(255,255,255,0.95)',
      });
      break;
    case 'few-clouds':
      state.clouds = makeClouds(6, w, h, {
        yMin: 0.08,
        yMax: 0.4,
        scaleMin: 1.2,
        scaleMax: 2,
        speedMin: 6,
        speedMax: 11,
        opacityMin: 0.65,
        opacityMax: 0.88,
        color: 'rgba(255,255,255,0.92)',
      });
      break;
    case 'overcast':
      state.clouds = makeClouds(11, w, h, {
        yMin: 0.02,
        yMax: 0.55,
        scaleMin: 1.4,
        scaleMax: 2.5,
        speedMin: 3,
        speedMax: 6,
        opacityMin: 0.6,
        opacityMax: 0.85,
        color: 'rgba(226,231,236,0.85)',
      });
      break;
    case 'rain':
      state.clouds = makeClouds(9, w, h, {
        yMin: 0,
        yMax: 0.4,
        scaleMin: 1.5,
        scaleMax: 2.4,
        speedMin: 5,
        speedMax: 9,
        opacityMin: 0.55,
        opacityMax: 0.8,
        color: 'rgba(96,108,120,0.75)',
      });
      state.rain = makeRain(110, w, h, { speedMin: 480, speedMax: 640, lenMin: 14, lenMax: 22, slant: 0.06 });
      state.ripples = makeRipples(10, w, h);
      break;
    case 'showers':
      state.clouds = makeClouds(6, w, h, {
        yMin: 0,
        yMax: 0.35,
        scaleMin: 2,
        scaleMax: 3.1,
        speedMin: 26,
        speedMax: 42,
        opacityMin: 0.65,
        opacityMax: 0.88,
        stretch: 1.6,
        color: 'rgba(70,82,94,0.82)',
      });
      state.rain = makeRain(90, w, h, { speedMin: 620, speedMax: 820, lenMin: 16, lenMax: 26, slant: 0.55 });
      break;
    case 'thunderstorm':
      state.clouds = makeClouds(10, w, h, {
        yMin: 0,
        yMax: 0.45,
        scaleMin: 1.8,
        scaleMax: 2.9,
        speedMin: 10,
        speedMax: 18,
        opacityMin: 0.75,
        opacityMax: 0.95,
        color: 'rgba(40,46,58,0.9)',
      });
      state.rain = makeRain(150, w, h, { speedMin: 760, speedMax: 980, lenMin: 20, lenMax: 30, slant: 0.45 });
      break;
    case 'snow':
      state.clouds = makeClouds(7, w, h, {
        yMin: 0,
        yMax: 0.35,
        scaleMin: 1.5,
        scaleMax: 2.3,
        speedMin: 3,
        speedMax: 6,
        opacityMin: 0.6,
        opacityMax: 0.85,
        color: 'rgba(215,224,232,0.85)',
      });
      state.snow = makeSnow(90, w, h, { speedMin: 30, speedMax: 60, sizeMin: 1.6, sizeMax: 3.4, drift: 26 });
      break;
    case 'sleet':
      state.clouds = makeClouds(8, w, h, {
        yMin: 0,
        yMax: 0.4,
        scaleMin: 1.5,
        scaleMax: 2.3,
        speedMin: 5,
        speedMax: 9,
        opacityMin: 0.6,
        opacityMax: 0.85,
        color: 'rgba(120,131,140,0.8)',
      });
      state.rain = makeRain(55, w, h, { speedMin: 500, speedMax: 660, lenMin: 10, lenMax: 16, slant: 0.2 });
      state.snow = makeSnow(45, w, h, { speedMin: 60, speedMax: 100, sizeMin: 1.3, sizeMax: 2.4, drift: 18 });
      break;
    case 'fog':
      state.fog = makeFog(7, w, h);
      state.clouds = makeClouds(3, w, h, {
        yMin: 0.05,
        yMax: 0.25,
        scaleMin: 1.6,
        scaleMax: 2.4,
        speedMin: 2,
        speedMax: 4,
        opacityMin: 0.25,
        opacityMax: 0.4,
        color: 'rgba(255,255,255,0.6)',
      });
      break;
    case 'strong-wind':
      state.clouds = makeClouds(8, w, h, {
        yMin: 0.05,
        yMax: 0.5,
        scaleMin: 1.3,
        scaleMax: 2.1,
        speedMin: 55,
        speedMax: 90,
        opacityMin: 0.55,
        opacityMax: 0.8,
        stretch: 2.2,
        color: 'rgba(255,255,255,0.85)',
      });
      state.wind = makeWind(45, w, h);
      break;
    case 'heatwave':
      state.shimmer = makeShimmer(26, w, h);
      break;
    case 'heavy-snow':
      state.clouds = makeClouds(11, w, h, {
        yMin: 0,
        yMax: 0.5,
        scaleMin: 1.7,
        scaleMax: 2.7,
        speedMin: 6,
        speedMax: 11,
        opacityMin: 0.7,
        opacityMax: 0.92,
        color: 'rgba(190,201,210,0.9)',
      });
      state.snow = makeSnow(190, w, h, { speedMin: 90, speedMax: 160, sizeMin: 2.4, sizeMax: 4.6, drift: 40 });
      break;
    case 'clear-night':
      state.stars = makeStars(100, w, h);
      state.clouds = makeClouds(2, w, h, {
        yMin: 0.1,
        yMax: 0.35,
        scaleMin: 1.6,
        scaleMax: 2.2,
        speedMin: 2,
        speedMax: 4,
        opacityMin: 0.12,
        opacityMax: 0.22,
        color: 'rgba(255,255,255,0.5)',
      });
      break;
    case 'cloudy-night':
      state.stars = makeStars(18, w, h);
      state.clouds = makeClouds(9, w, h, {
        yMin: 0,
        yMax: 0.5,
        scaleMin: 1.5,
        scaleMax: 2.5,
        speedMin: 4,
        speedMax: 8,
        opacityMin: 0.55,
        opacityMax: 0.8,
        color: 'rgba(60,68,84,0.85)',
      });
      break;
  }

  return state;
}

// ---- update (mutates state using real dt; no drawing) ----

function updateClouds(clouds: Cloud[], dt: number, w: number) {
  for (const c of clouds) {
    c.x += c.speed * dt;
    const wrapAt = 220 * c.scale * c.stretch;
    if (c.x - wrapAt > w) c.x = -wrapAt;
  }
}

function updateRain(drops: RainDrop[], dt: number, h: number) {
  for (const d of drops) {
    d.y += d.speed * dt;
    if (d.y > h + d.len) {
      d.y = -d.len;
      d.x = rand(-0.1 * h, h);
    }
  }
}

function updateRipples(ripples: Ripple[], dt: number) {
  for (const r of ripples) {
    r.timer += dt;
    if (r.timer < r.delay) {
      r.alpha = 0;
      continue;
    }
    const elapsed = r.timer - r.delay;
    if (elapsed > RIPPLE_DURATION) {
      r.timer = 0;
      r.delay = rand(0.3, 3);
      r.alpha = 0;
      continue;
    }
    const progress = elapsed / RIPPLE_DURATION;
    r.radius = r.maxR * progress;
    r.alpha = (1 - progress) * 0.45;
  }
}

function updateSnow(flakes: Snowflake[], dt: number, w: number, h: number) {
  for (const f of flakes) {
    f.y += f.speed * dt;
    if (f.y > h + f.r * 2) {
      f.y = -f.r * 2;
      f.x = rand(0, w);
    }
  }
}

function updateFog(bands: FogBand[], dt: number, w: number) {
  for (const b of bands) {
    b.x += b.speed * dt;
    if (b.x > w + b.w * 0.5) b.x = -b.w * 0.5;
  }
}

function updateWind(lines: WindLine[], dt: number, w: number, h: number) {
  for (const l of lines) {
    l.x += l.speed * dt;
    if (l.x > w + l.len) {
      l.x = -l.len;
      l.y = rand(0, h * 0.85);
    }
  }
}

function updateShimmer(lines: ShimmerLine[], dt: number, w: number, h: number) {
  for (const s of lines) {
    s.y -= s.speed * dt;
    if (s.y < h * 0.4) {
      s.y = h * 1.05;
      s.x = rand(0, w);
    }
  }
}

function updateLightning(state: SceneState, dt: number) {
  const l = state.lightning;
  if (l.alpha > 0) {
    l.alpha = Math.max(0, l.alpha - dt * 3.2);
    if (l.alpha === 0 && l.flashesLeft > 0) {
      l.flashesLeft -= 1;
      l.alpha = 0.7;
      l.timer = 0.12;
    }
    return;
  }
  l.timer -= dt;
  if (l.timer <= 0) {
    l.alpha = 0.85;
    l.flashesLeft = Math.random() < 0.4 ? 1 : 0;
    l.timer = rand(3, 7);
  }
}

function updateScene(state: SceneState, key: SceneKey, dt: number, w: number, h: number) {
  updateClouds(state.clouds, dt, w);
  updateRain(state.rain, dt, h);
  updateRipples(state.ripples, dt);
  updateSnow(state.snow, dt, w, h);
  updateFog(state.fog, dt, w);
  updateWind(state.wind, dt, w, h);
  updateShimmer(state.shimmer, dt, w, h);
  if (key === 'thunderstorm') updateLightning(state, dt);
}

// ---- draw (reads current state + `now` for phase-based visual wobble only) ----

function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number, stops: [string, string, string]) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, stops[0]);
  gradient.addColorStop(0.55, stops[1]);
  gradient.addColorStop(1, stops[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

const CLOUD_PUFFS = [
  { dx: -1.15, dy: 0.12, r: 0.55 },
  { dx: -0.42, dy: -0.28, r: 0.78 },
  { dx: 0.32, dy: -0.18, r: 0.86 },
  { dx: 1.05, dy: 0.14, r: 0.6 },
  { dx: 0.05, dy: 0.28, r: 0.92 },
];

function drawClouds(ctx: CanvasRenderingContext2D, clouds: Cloud[]) {
  for (const cloud of clouds) {
    ctx.save();
    ctx.globalAlpha = cloud.opacity;
    ctx.fillStyle = cloud.color;
    const unit = 60 * cloud.scale;
    for (const p of CLOUD_PUFFS) {
      ctx.beginPath();
      ctx.ellipse(
        cloud.x + p.dx * unit * cloud.stretch,
        cloud.y + p.dy * unit,
        p.r * unit * cloud.stretch,
        p.r * unit,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawSun(ctx: CanvasRenderingContext2D, w: number, h: number, now: number, warm: boolean) {
  const x = w * 0.78;
  const y = h * 0.22;
  const pulse = 1 + Math.sin(now / 900) * 0.03;
  const baseR = (warm ? 70 : 54) * pulse;
  const glowR = baseR * (warm ? 5.5 : 4.2);

  const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  if (warm) {
    glow.addColorStop(0, 'rgba(255,224,150,0.55)');
    glow.addColorStop(0.4, 'rgba(255,190,110,0.28)');
    glow.addColorStop(1, 'rgba(255,190,110,0)');
  } else {
    glow.addColorStop(0, 'rgba(255,250,220,0.5)');
    glow.addColorStop(0.4, 'rgba(255,244,200,0.22)');
    glow.addColorStop(1, 'rgba(255,244,200,0)');
  }
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(now / 12000);
  ctx.strokeStyle = warm ? 'rgba(255,214,150,0.35)' : 'rgba(255,250,220,0.4)';
  ctx.lineWidth = 2;
  const rayCount = 12;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const inner = baseR * 1.15;
    const outer = baseR * (warm ? 1.9 : 1.6);
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = warm ? '#fff2d6' : '#fffbea';
  ctx.beginPath();
  ctx.arc(x, y, baseR, 0, Math.PI * 2);
  ctx.fill();
}

function drawMoon(ctx: CanvasRenderingContext2D, w: number, h: number, now: number) {
  const x = w * 0.78;
  const y = h * 0.2;
  const r = 40 + Math.sin(now / 1400) * 1.5;

  const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
  glow.addColorStop(0, 'rgba(220,230,255,0.35)');
  glow.addColorStop(1, 'rgba(220,230,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f4f6ff';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(180,190,220,0.45)';
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.2, r * 0.9, 0, Math.PI * 2);
  ctx.fill();
}

function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], now: number) {
  ctx.fillStyle = '#ffffff';
  for (const s of stars) {
    const twinkle = 0.5 + Math.sin((now / 500) * s.speed + s.phase) * 0.5;
    ctx.globalAlpha = 0.3 + twinkle * 0.7;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawRain(ctx: CanvasRenderingContext2D, drops: RainDrop[], now: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.4;
  for (const d of drops) {
    const sway = Math.sin(now / 260 + d.phase) * d.sway * 0.3;
    const dx = d.slant * d.len + sway;
    ctx.globalAlpha = d.opacity;
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x + dx, d.y + d.len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawRipples(ctx: CanvasRenderingContext2D, ripples: Ripple[]) {
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1.2;
  for (const r of ripples) {
    if (r.alpha <= 0) continue;
    ctx.globalAlpha = r.alpha;
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawSnow(ctx: CanvasRenderingContext2D, flakes: Snowflake[], now: number) {
  ctx.fillStyle = '#ffffff';
  for (const f of flakes) {
    const dx = Math.sin(now / 700 + f.phase) * f.drift;
    ctx.globalAlpha = f.opacity;
    ctx.beginPath();
    ctx.arc(f.x + dx, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFog(ctx: CanvasRenderingContext2D, bands: FogBand[], w: number, h: number) {
  for (const b of bands) {
    const gradient = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.5, `rgba(255,255,255,${b.opacity})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(0, 0, w, h);
}

function drawWind(ctx: CanvasRenderingContext2D, lines: WindLine[]) {
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.5;
  for (const l of lines) {
    ctx.globalAlpha = l.opacity;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(l.x + l.len, l.y + l.len * 0.08);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawShimmer(ctx: CanvasRenderingContext2D, lines: ShimmerLine[], h: number, now: number) {
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineCap = 'round';
  ctx.lineWidth = 2;
  for (const s of lines) {
    const fade = Math.max(0, 1 - (h * 1.05 - s.y) / (h * 0.65));
    ctx.globalAlpha = 0.14 * fade;
    ctx.beginPath();
    const segments = 5;
    for (let i = 0; i <= segments; i++) {
      const px = s.x + (i / segments) * s.width;
      const py = s.y + Math.sin(now / 180 + s.phase + i) * 6;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function renderScene(ctx: CanvasRenderingContext2D, key: SceneKey, state: SceneState, w: number, h: number, now: number) {
  drawSky(ctx, w, h, SKY_GRADIENTS[key]);

  if (key === 'clear-day') drawSun(ctx, w, h, now, false);
  if (key === 'heatwave') drawSun(ctx, w, h, now, true);
  if (key === 'clear-night') drawMoon(ctx, w, h, now);

  if (state.stars.length) drawStars(ctx, state.stars, now);
  if (state.fog.length) drawFog(ctx, state.fog, w, h);
  if (state.clouds.length) drawClouds(ctx, state.clouds);
  if (state.wind.length) drawWind(ctx, state.wind);
  if (state.rain.length) {
    const rainColor = key === 'thunderstorm' ? 'rgba(200,215,230,0.6)' : 'rgba(220,230,240,0.55)';
    drawRain(ctx, state.rain, now, rainColor);
  }
  if (state.ripples.length) drawRipples(ctx, state.ripples);
  if (state.snow.length) drawSnow(ctx, state.snow, now);
  if (state.shimmer.length) drawShimmer(ctx, state.shimmer, h, now);

  if (key === 'thunderstorm' && state.lightning.alpha > 0) {
    ctx.fillStyle = `rgba(235,240,255,${state.lightning.alpha})`;
    ctx.fillRect(0, 0, w, h);
  }
}

export function WeatherBackground({ weatherCode, isDay, temperature, windSpeed }: WeatherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneKey = classifyScene({ weatherCode, isDay, temperature, windSpeed });

  const activeKeyRef = useRef<SceneKey>(sceneKey);
  const prevKeyRef = useRef<SceneKey | null>(null);
  const transitionStartRef = useRef(0);
  const statesRef = useRef(new Map<SceneKey, SceneState>());
  const dimsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    if (sceneKey !== activeKeyRef.current) {
      prevKeyRef.current = activeKeyRef.current;
      activeKeyRef.current = sceneKey;
      transitionStartRef.current = performance.now();
    }
  }, [sceneKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTime = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      dimsRef.current = { w, h };
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      statesRef.current.clear();
      statesRef.current.set(activeKeyRef.current, createSceneState(activeKeyRef.current, w, h));
    }
    resize();
    window.addEventListener('resize', resize);

    function getState(key: SceneKey) {
      let s = statesRef.current.get(key);
      if (!s) {
        s = createSceneState(key, dimsRef.current.w, dimsRef.current.h);
        statesRef.current.set(key, s);
      }
      return s;
    }

    function frame(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const { w, h } = dimsRef.current;
      ctx!.clearRect(0, 0, w, h);

      const activeKey = activeKeyRef.current;
      const prevKey = prevKeyRef.current;
      const elapsed = now - transitionStartRef.current;
      const t = prevKey ? Math.min(elapsed / TRANSITION_MS, 1) : 1;
      const eased = t * t * (3 - 2 * t);

      if (prevKey && t < 1) {
        const prevState = getState(prevKey);
        updateScene(prevState, prevKey, dt, w, h);
        ctx!.globalAlpha = 1;
        renderScene(ctx!, prevKey, prevState, w, h, now);
      }

      const activeState = getState(activeKey);
      updateScene(activeState, activeKey, dt, w, h);
      ctx!.globalAlpha = prevKey ? eased : 1;
      renderScene(ctx!, activeKey, activeState, w, h, now);
      ctx!.globalAlpha = 1;

      if (prevKey && t >= 1) prevKeyRef.current = null;

      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" />;
}
