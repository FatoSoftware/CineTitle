import { VisualEffectsSettings, TextLayer } from '../types';

// Pattern and offscreen canvas cache to prevent re-allocating textures every frame
const texturePatternCache = new Map<string, CanvasPattern | null>();
let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;

function getOffscreen(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (typeof document === 'undefined') return null;
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas');
  }
  if (offscreenCanvas.width !== width || offscreenCanvas.height !== height) {
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
  }
  if (!offscreenCtx) {
    offscreenCtx = offscreenCanvas.getContext('2d');
  }
  return offscreenCtx ? { canvas: offscreenCanvas, ctx: offscreenCtx } : null;
}

/**
 * 1. Lens Flare & Cinematic Light Effects
 */
export function renderLensFlareEffect(
  ctx: CanvasRenderingContext2D,
  fx: VisualEffectsSettings['lensFlare'],
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  time: number
): void {
  if (!fx.enabled || fx.intensity <= 0.01) return;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const flareX = fx.followLayer ? centerX : (fx.posX !== undefined ? (fx.posX / 100) * width : centerX);
  const flareY = fx.followLayer ? centerY : (fx.posY !== undefined ? (fx.posY / 100) * height : centerY);
  const intensity = fx.intensity;
  const flareColor = fx.color || '#38bdf8';
  const streakW = (fx.streakWidth || 800) * (width / 1920);

  // Optical axis from flare center to canvas center for secondary ghosts
  const cx = width / 2;
  const cy = height / 2;
  const dx = cx - flareX;
  const dy = cy - flareY;

  switch (fx.type) {
    case 'cinematic-anamorphic': {
      // 1. Central Core Glow
      const coreR = Math.max(30, 90 * intensity);
      const coreGrad = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, coreR);
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, ' + Math.min(1, 0.95 * intensity) + ')');
      coreGrad.addColorStop(0.2, flareColor + 'cc');
      coreGrad.addColorStop(0.6, flareColor + '44');
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(flareX, flareY, coreR, 0, Math.PI * 2);
      ctx.fill();

      // 2. Wide Anamorphic Horizontal Laser Streak
      const streakH = Math.max(3, 14 * intensity);
      const streakGrad = ctx.createLinearGradient(flareX - streakW / 2, flareY, flareX + streakW / 2, flareY);
      streakGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      streakGrad.addColorStop(0.25, flareColor + '44');
      streakGrad.addColorStop(0.5, 'rgba(255, 255, 255, ' + Math.min(1, 0.95 * intensity) + ')');
      streakGrad.addColorStop(0.75, flareColor + '44');
      streakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = streakGrad;
      ctx.fillRect(flareX - streakW / 2, flareY - streakH / 2, streakW, streakH);

      // Fine bright needle center streak
      const needleH = Math.max(1.5, 3 * intensity);
      const needleGrad = ctx.createLinearGradient(flareX - streakW * 0.7, flareY, flareX + streakW * 0.7, flareY);
      needleGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      needleGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
      needleGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = needleGrad;
      ctx.fillRect(flareX - streakW * 0.7, flareY - needleH / 2, streakW * 1.4, needleH);

      // 3. Optical Ghost Orbs along lens axis
      const ghosts = [
        { dist: 0.35, size: 28, alpha: 0.25, color: '#38bdf8' },
        { dist: 0.65, size: 45, alpha: 0.18, color: '#818cf8' },
        { dist: -0.25, size: 20, alpha: 0.3, color: '#c084fc' },
        { dist: 1.1, size: 70, alpha: 0.12, color: '#38bdf8' },
        { dist: 1.4, size: 35, alpha: 0.2, color: '#fbbf24' },
      ];

      for (const g of ghosts) {
        const gx = flareX + dx * g.dist;
        const gy = flareY + dy * g.dist;
        const gGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, g.size * intensity);
        gGrad.addColorStop(0, g.color + Math.floor(g.alpha * intensity * 255).toString(16).padStart(2, '0'));
        gGrad.addColorStop(0.8, g.color + '15');
        gGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gGrad;
        ctx.beginPath();
        ctx.arc(gx, gy, g.size * intensity, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'solar-rays': {
      // Volumetric Sun / God Rays
      const rayCount = 18;
      const rayLen = Math.max(width, height) * 0.9;
      const baseAngle = time * 0.12;

      ctx.save();
      ctx.translate(flareX, flareY);

      // Sun core
      const sunCoreR = 120 * intensity;
      const sunGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sunCoreR);
      sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      sunGrad.addColorStop(0.3, flareColor + 'cc');
      sunGrad.addColorStop(0.7, flareColor + '33');
      sunGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(0, 0, sunCoreR, 0, Math.PI * 2);
      ctx.fill();

      // Radiating light rays
      for (let i = 0; i < rayCount; i++) {
        const angle = baseAngle + (i * Math.PI * 2) / rayCount;
        const widthSpread = (0.08 + 0.04 * Math.sin(time * 2 + i * 1.5)) * intensity;
        const rayGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, rayLen);
        rayGrad.addColorStop(0, flareColor + '66');
        rayGrad.addColorStop(0.4, flareColor + '22');
        rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, rayLen, angle - widthSpread, angle + widthSpread);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 'warm-spotlight': {
      // Soft theatrical dramatic spotlight
      const spotR = Math.max(width * 0.45, 500) * intensity;
      const spotGrad = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, spotR);
      spotGrad.addColorStop(0, 'rgba(254, 243, 199, ' + Math.min(0.85, 0.6 * intensity) + ')');
      spotGrad.addColorStop(0.25, flareColor + '77');
      spotGrad.addColorStop(0.65, flareColor + '22');
      spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(flareX, flareY, spotR, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'starburst': {
      // Sharp specular twinkle / starburst
      const starR = 140 * intensity;
      const rot = time * 0.3;

      ctx.save();
      ctx.translate(flareX, flareY);
      ctx.rotate(rot);

      // Core
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 40 * intensity);
      core.addColorStop(0, '#ffffff');
      core.addColorStop(0.4, flareColor);
      core.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, 40 * intensity, 0, Math.PI * 2);
      ctx.fill();

      // 4 primary spikes + 4 secondary spikes
      for (let s = 0; s < 4; s++) {
        const ang = (s * Math.PI) / 2;
        const spkGrad = ctx.createLinearGradient(0, 0, Math.cos(ang) * starR, Math.sin(ang) * starR);
        spkGrad.addColorStop(0, '#ffffff');
        spkGrad.addColorStop(0.3, flareColor);
        spkGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.strokeStyle = spkGrad;
        ctx.lineWidth = 3 * intensity;
        ctx.beginPath();
        ctx.moveTo(-Math.cos(ang) * starR, -Math.sin(ang) * starR);
        ctx.lineTo(Math.cos(ang) * starR, Math.sin(ang) * starR);
        ctx.stroke();
      }

      for (let s = 0; s < 4; s++) {
        const ang = (s * Math.PI) / 2 + Math.PI / 4;
        const subR = starR * 0.55;
        const spkGrad = ctx.createLinearGradient(0, 0, Math.cos(ang) * subR, Math.sin(ang) * subR);
        spkGrad.addColorStop(0, '#ffffff');
        spkGrad.addColorStop(0.4, flareColor);
        spkGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.strokeStyle = spkGrad;
        ctx.lineWidth = 1.8 * intensity;
        ctx.beginPath();
        ctx.moveTo(-Math.cos(ang) * subR, -Math.sin(ang) * subR);
        ctx.lineTo(Math.cos(ang) * subR, Math.sin(ang) * subR);
        ctx.stroke();
      }

      ctx.restore();
      break;
    }

    case 'chromatic-ring': {
      // Diffraction chromatic lens ring
      const ringR = 180 * intensity;
      const ringGrad = ctx.createRadialGradient(flareX, flareY, ringR * 0.85, flareX, flareY, ringR * 1.15);
      ringGrad.addColorStop(0, 'rgba(0,0,0,0)');
      ringGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.45)');
      ringGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.5)');
      ringGrad.addColorStop(0.7, 'rgba(244, 63, 94, 0.45)');
      ringGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.arc(flareX, flareY, ringR * 1.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

/**
 * 2. Smoke, Fog & Atmospheric Particle Effects
 */
export function renderAtmosphericEffect(
  ctx: CanvasRenderingContext2D,
  fx: VisualEffectsSettings['atmosphere'],
  width: number,
  height: number,
  time: number
): void {
  if (!fx.enabled || fx.opacity <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0, fx.opacity));

  const density = fx.density || 1.0;
  const speed = fx.speed || 1.0;
  const baseColor = fx.color || '#94a3b8';

  switch (fx.type) {
    case 'smoke': {
      // Rising volumetric smoke plumes
      const plumeCount = Math.floor(20 * density);
      for (let i = 0; i < plumeCount; i++) {
        // Deterministic pseudo-random placement animated by time
        const seed = i * 137.5;
        const cycle = ((time * speed * 0.35 + seed * 0.05) % 1);
        const y = height * (1.1 - cycle * 1.2);
        const xDrift = Math.sin(cycle * Math.PI * 3 + seed) * (80 * (1 - cycle * 0.5));
        const x = (seed % width) + xDrift;
        const radius = (60 + cycle * 140) * (width / 1920);
        const alpha = Math.sin(cycle * Math.PI) * 0.35;

        const smokeGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        smokeGrad.addColorStop(0, baseColor + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
        smokeGrad.addColorStop(0.5, baseColor + '18');
        smokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = smokeGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'mystic-fog': {
      // Rolling horizontal volumetric mist layers
      const layerCount = Math.floor(6 * density);
      for (let l = 0; l < layerCount; l++) {
        const yBase = height * (0.35 + l * 0.12);
        const waveSpeed = speed * (0.15 + l * 0.06);
        const offset = (time * waveSpeed * 200 + l * 340) % width;
        const grad = ctx.createLinearGradient(0, yBase - 80, 0, yBase + 80);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, baseColor + '30');
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= width; x += 30) {
          const waveY = yBase + Math.sin((x + offset) * 0.008 + l) * 35;
          ctx.lineTo(x, waveY);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'ember-particles': {
      // Glowing embers / sparks floating upwards with turbulence
      ctx.globalCompositeOperation = 'screen';
      const count = Math.floor(45 * density);
      for (let i = 0; i < count; i++) {
        const seed = i * 293.7;
        const lifeCycle = (time * speed * 0.6 + seed * 0.1) % 1;
        const y = height * (1.05 - lifeCycle * 1.1);
        const sway = Math.sin(time * 3 + seed) * 45;
        const x = ((seed * 11) % width) + sway;
        const sz = (1.5 + (seed % 3.5)) * (width / 1920);
        const flicker = 0.5 + 0.5 * Math.sin(time * 12 + seed);

        const emberGrad = ctx.createRadialGradient(x, y, 0, x, y, sz * 3.5);
        emberGrad.addColorStop(0, '#ffffff');
        emberGrad.addColorStop(0.3, '#f97316');
        emberGrad.addColorStop(0.7, '#ef4444');
        emberGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = emberGrad;
        ctx.globalAlpha = fx.opacity * flicker;
        ctx.beginPath();
        ctx.arc(x, y, sz * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'dust-motes': {
      // Gentle cinematic dust motes shimmering in dark space
      ctx.globalCompositeOperation = 'screen';
      const count = Math.floor(60 * density);
      for (let i = 0; i < count; i++) {
        const seed = i * 419.3;
        const x = ((seed * 7 + Math.sin(time * 0.3 + seed) * 40) % width + width) % width;
        const y = ((seed * 13 + Math.cos(time * 0.25 + seed) * 35) % height + height) % height;
        const r = (1 + (seed % 2.5)) * (width / 1920);
        const twinkle = 0.3 + 0.7 * Math.sin(time * 2 + seed);

        ctx.fillStyle = baseColor;
        ctx.globalAlpha = fx.opacity * twinkle * 0.6;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'cinematic-haze': {
      // Soft atmospheric gradient haze
      const hazeGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.75);
      hazeGrad.addColorStop(0, baseColor + '18');
      hazeGrad.addColorStop(0.6, baseColor + '30');
      hazeGrad.addColorStop(1, baseColor + '08');
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
  }

  ctx.restore();
}

/**
 * 3. Textures & Overlays (Paper Grunge, Brushed Metal, Wood, Carbon Fiber, 35mm Grain, CRT)
 */
export function getOrCreateTexturePattern(
  type: VisualEffectsSettings['texture']['type'],
  scale: number
): CanvasPattern | null {
  const cacheKey = `${type}_${scale}`;
  if (texturePatternCache.has(cacheKey)) {
    return texturePatternCache.get(cacheKey)!;
  }

  if (typeof document === 'undefined') return null;

  const patCanvas = document.createElement('canvas');
  const size = Math.max(64, Math.floor(128 * scale));
  patCanvas.width = size;
  patCanvas.height = size;
  const pctx = patCanvas.getContext('2d');
  if (!pctx) return null;

  switch (type) {
    case 'paper-grunge': {
      pctx.fillStyle = '#f5f5f0';
      pctx.fillRect(0, 0, size, size);
      // Grain specks & fibers
      pctx.fillStyle = 'rgba(60, 50, 40, 0.08)';
      for (let i = 0; i < size * 18; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        pctx.fillRect(x, y, Math.random() * 2, Math.random() * 1.5);
      }
      // Crease lines
      pctx.strokeStyle = 'rgba(80, 70, 60, 0.12)';
      pctx.lineWidth = 1;
      pctx.beginPath();
      pctx.moveTo(0, size * 0.3);
      pctx.lineTo(size, size * 0.7);
      pctx.moveTo(size * 0.2, 0);
      pctx.lineTo(size * 0.8, size);
      pctx.stroke();
      break;
    }

    case 'brushed-metal': {
      pctx.fillStyle = '#6b7280';
      pctx.fillRect(0, 0, size, size);
      // Anisotropic horizontal brush strokes
      for (let y = 0; y < size; y++) {
        const brightness = Math.floor(100 + Math.random() * 70);
        pctx.strokeStyle = `rgb(${brightness},${brightness},${brightness + 4})`;
        pctx.beginPath();
        pctx.moveTo(0, y);
        pctx.lineTo(size, y);
        pctx.stroke();
      }
      break;
    }

    case 'wood-grain': {
      pctx.fillStyle = '#78350f';
      pctx.fillRect(0, 0, size, size);
      // Organic wavy rings
      for (let y = 0; y < size; y += 4) {
        const alpha = 0.15 + 0.15 * Math.sin(y * 0.25);
        pctx.strokeStyle = `rgba(30, 15, 5, ${alpha})`;
        pctx.lineWidth = 2.5;
        pctx.beginPath();
        pctx.moveTo(0, y);
        pctx.bezierCurveTo(size * 0.3, y + Math.sin(y) * 6, size * 0.7, y - Math.cos(y) * 6, size, y);
        pctx.stroke();
      }
      break;
    }

    case 'carbon-fiber': {
      pctx.fillStyle = '#111827';
      pctx.fillRect(0, 0, size, size);
      const step = Math.max(4, Math.floor(8 * scale));
      for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
          const isEven = ((x / step) + (y / step)) % 2 === 0;
          pctx.fillStyle = isEven ? '#1f2937' : '#030712';
          pctx.fillRect(x, y, step, step);
          // Highlight diagonal thread
          pctx.strokeStyle = isEven ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.3)';
          pctx.strokeRect(x + 0.5, y + 0.5, step - 1, step - 1);
        }
      }
      break;
    }

    case 'film-grain-35mm': {
      pctx.clearRect(0, 0, size, size);
      const imgData = pctx.createImageData(size, size);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        imgData.data[i] = val;
        imgData.data[i + 1] = val;
        imgData.data[i + 2] = val;
        imgData.data[i + 3] = Math.floor(Math.random() * 90);
      }
      pctx.putImageData(imgData, 0, 0);
      break;
    }

    case 'crt-scanlines': {
      pctx.fillStyle = 'rgba(0, 0, 0, 0)';
      pctx.fillRect(0, 0, size, size);
      for (let y = 0; y < size; y += 3) {
        pctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        pctx.fillRect(0, y, size, 1.5);
      }
      break;
    }
  }

  const pattern = pctx.createPattern(patCanvas, 'repeat');
  texturePatternCache.set(cacheKey, pattern);
  return pattern;
}

/**
 * Render Texture Overlay across canvas or clipped to layer
 */
export function renderTextureOverlay(
  ctx: CanvasRenderingContext2D,
  fx: VisualEffectsSettings['texture'],
  width: number,
  height: number,
  time: number
): void {
  if (!fx.enabled || fx.opacity <= 0.01) return;

  const pat = getOrCreateTexturePattern(fx.type, fx.scale || 1.0);
  if (!pat) return;

  ctx.save();
  ctx.globalCompositeOperation = fx.blendMode || 'overlay';
  ctx.globalAlpha = Math.min(1, Math.max(0, fx.opacity));

  // Dynamic shift for film grain or CRT jitter
  if (fx.type === 'film-grain-35mm' || fx.type === 'crt-scanlines') {
    const jitterX = (Math.sin(time * 60) * 17) % 32;
    const jitterY = (Math.cos(time * 60) * 19) % 32;
    ctx.translate(jitterX, jitterY);
  }

  ctx.fillStyle = pat;
  ctx.fillRect(-64, -64, width + 128, height + 128);
  ctx.restore();
}

/**
 * 4. Distortion Simulation (Water Ripple, Refraction Glass, Sine Wave, Heat Haze)
 */
export function applyDistortionOffset(
  yPos: number,
  time: number,
  fx: VisualEffectsSettings['distortion']
): { dx: number; dy: number } {
  if (!fx.enabled || fx.amplitude <= 0.1) return { dx: 0, dy: 0 };

  const speed = fx.speed || 1.0;
  const amp = fx.amplitude || 6.0;
  const freq = fx.frequency || 4.0;

  switch (fx.type) {
    case 'water-ripple': {
      const wave = Math.sin(yPos * 0.03 * freq + time * speed * 3.5);
      return { dx: wave * amp, dy: Math.cos(yPos * 0.02 * freq + time * speed * 2.5) * (amp * 0.4) };
    }
    case 'refraction-glass': {
      const stepWave = Math.sin(yPos * 0.05 * freq + time * speed * 1.5);
      return { dx: Math.sign(stepWave) * amp * 0.7, dy: 0 };
    }
    case 'sine-wave': {
      const sine = Math.sin(yPos * 0.02 * freq + time * speed * 4.0);
      return { dx: sine * amp, dy: 0 };
    }
    case 'heat-haze': {
      const turbulence = Math.sin(yPos * 0.06 * freq + time * speed * 8.0) * Math.cos(yPos * 0.03 + time * speed * 4.0);
      return { dx: turbulence * amp, dy: Math.sin(time * 6) * (amp * 0.3) };
    }
    default:
      return { dx: 0, dy: 0 };
  }
}

/**
 * 5. Advanced Glitch Effect (RGB Chromatic Split, Slice Blocks, Scanline Jitter, Cyber Chaos)
 */
export function computeGlitchState(
  time: number,
  fx: VisualEffectsSettings['glitch']
): {
  isGlitching: boolean;
  rgbSplitX: number;
  sliceOffsetY: number;
  sliceShiftX: number;
  scanlineJitter: number;
} {
  if (!fx.enabled || fx.intensity <= 0) {
    return { isGlitching: false, rgbSplitX: 0, sliceOffsetY: 0, sliceShiftX: 0, scanlineJitter: 0 };
  }

  const freq = fx.frequency || 4;
  const intensity = (fx.intensity || 40) / 100;
  const colorSplit = fx.colorSplit || 8;

  // Glitch spikes occur in periodic pseudo-random bursts
  const cycle = (time * freq) % 1;
  const spikeThreshold = Math.max(0.1, 0.95 - intensity * 0.4);
  const isGlitching = cycle > spikeThreshold;

  if (!isGlitching) {
    // Subtle constant chromatic aberration if high intensity
    return {
      isGlitching: false,
      rgbSplitX: intensity > 0.6 ? 2 : 0,
      sliceOffsetY: 0,
      sliceShiftX: 0,
      scanlineJitter: 0,
    };
  }

  const seed = Math.sin(Math.floor(time * freq * 10) * 87.3);
  const splitMag = (colorSplit + Math.abs(seed) * 12) * intensity;
  const sliceShift = (seed > 0 ? 1 : -1) * (15 + Math.abs(seed) * 35) * intensity;
  const sliceY = Math.abs(Math.cos(seed * 43.1));

  return {
    isGlitching: true,
    rgbSplitX: splitMag,
    sliceOffsetY: sliceY,
    sliceShiftX: sliceShift,
    scanlineJitter: (Math.random() - 0.5) * 8 * intensity,
  };
}

/**
 * 6. Real Animated Fire Effect (Flamas vivas sobre el contorno del texto)
 */
export function renderRealFireEffect(
  ctx: CanvasRenderingContext2D,
  fx: VisualEffectsSettings['fire'],
  startX: number,
  startY: number,
  totalWidth: number,
  totalHeight: number,
  scale: number,
  time: number
): void {
  if (!fx.enabled || fx.intensity <= 0.05) return;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const intensity = fx.intensity || 1.0;
  const flameH = (fx.flameHeight || 38) * scale * intensity;
  const wind = (fx.wind || 0) * scale;
  const tongueCount = Math.max(12, Math.floor(totalWidth / (14 * scale)));

  // 1. Bottom Glow Heat Line
  const baseGrad = ctx.createLinearGradient(0, startY, 0, startY - flameH * 0.4);
  baseGrad.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
  baseGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.7)');
  baseGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(startX - 20 * scale, startY - flameH * 0.4, totalWidth + 40 * scale, flameH * 0.5);

  // 2. Animated Dancing Flame Tongues
  for (let i = 0; i < tongueCount; i++) {
    const xRatio = i / tongueCount;
    const tongueX = startX + xRatio * totalWidth;
    const seed = i * 47.9;
    // Multi-frequency flame flickers
    const flick = Math.sin(time * 14 + seed) * 0.4 + Math.sin(time * 23 + seed * 2) * 0.3 + 0.7;
    const curH = flameH * flick;
    const tipX = tongueX + wind + Math.sin(time * 10 + seed) * (8 * scale);
    const tipY = startY - curH;
    const halfW = (8 + Math.sin(time * 8 + seed) * 3) * scale;

    // Flame core gradient: white-yellow -> orange -> red -> transparent
    const flameGrad = ctx.createLinearGradient(tongueX, startY, tipX, tipY);
    flameGrad.addColorStop(0, 'rgba(255, 255, 230, 0.95)');
    flameGrad.addColorStop(0.35, '#f97316');
    flameGrad.addColorStop(0.75, '#dc2626');
    flameGrad.addColorStop(1, 'rgba(185, 28, 28, 0)');

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(tongueX - halfW, startY);
    ctx.quadraticCurveTo(tongueX - halfW * 0.6, startY - curH * 0.6, tipX, tipY);
    ctx.quadraticCurveTo(tongueX + halfW * 0.6, startY - curH * 0.6, tongueX + halfW, startY);
    ctx.closePath();
    ctx.fill();
  }

  // 3. Floating Embers & Sparks above flames
  if (fx.embers) {
    const emberCount = Math.floor(18 * intensity);
    for (let e = 0; e < emberCount; e++) {
      const seed = e * 73.1;
      const life = (time * 1.5 + seed * 0.1) % 1;
      const ey = startY - flameH * 0.5 - life * flameH * 1.8;
      const ex = startX + ((seed * 19) % totalWidth) + wind * life * 2 + Math.sin(time * 6 + seed) * (15 * scale);
      const er = (1.5 + (seed % 2.5)) * scale * (1 - life * 0.5);

      ctx.fillStyle = life > 0.6 ? '#dc2626' : '#fef08a';
      ctx.beginPath();
      ctx.arc(ex, ey, er, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Smoke trails if enabled
  if (fx.smokeTrails) {
    const smokeCount = Math.floor(10 * intensity);
    for (let s = 0; s < smokeCount; s++) {
      const seed = s * 113.7;
      const cycle = (time * 0.7 + seed * 0.1) % 1;
      const sy = startY - flameH * 1.2 - cycle * flameH * 2.0;
      const sx = startX + ((seed * 23) % totalWidth) + wind * cycle * 3 + Math.sin(time * 3 + seed) * (30 * scale);
      const sr = (15 + cycle * 45) * scale;
      const sAlpha = Math.sin(cycle * Math.PI) * 0.22;

      const smokeG = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
      smokeG.addColorStop(0, 'rgba(80, 50, 40, ' + sAlpha + ')');
      smokeG.addColorStop(0.6, 'rgba(40, 40, 40, ' + (sAlpha * 0.4) + ')');
      smokeG.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = smokeG;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * 7. Ice & Crystal Effect (Frosted Text, Prism Flares, Icicles)
 */
export function renderIceCrystalEffect(
  ctx: CanvasRenderingContext2D,
  fx: VisualEffectsSettings['ice'],
  startX: number,
  startY: number,
  totalWidth: number,
  totalHeight: number,
  scale: number,
  time: number
): void {
  if (!fx.enabled) return;

  ctx.save();

  // 1. Hanging Icicles (Estalactitas de hielo)
  if (fx.icicles) {
    const icicleCount = Math.max(8, Math.floor(totalWidth / (22 * scale)));
    const botY = startY + totalHeight;

    for (let i = 0; i < icicleCount; i++) {
      const ix = startX + (i / icicleCount) * totalWidth;
      const seed = i * 89.3;
      const icicleLen = (12 + (seed % 28)) * scale;
      const icicleW = (4 + (seed % 5)) * scale;

      const iceGrad = ctx.createLinearGradient(ix, botY, ix, botY + icicleLen);
      iceGrad.addColorStop(0, 'rgba(224, 242, 254, 0.9)');
      iceGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.65)');
      iceGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

      ctx.fillStyle = iceGrad;
      ctx.beginPath();
      ctx.moveTo(ix - icicleW / 2, botY);
      ctx.lineTo(ix, botY + icicleLen);
      ctx.lineTo(ix + icicleW / 2, botY);
      ctx.closePath();
      ctx.fill();

      // Sharp central specular highlight
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(ix, botY);
      ctx.lineTo(ix, botY + icicleLen * 0.8);
      ctx.stroke();
    }
  }

  // 2. Prismatic Diamond Reflection Sparkles
  if (fx.prismReflect > 0.05) {
    ctx.globalCompositeOperation = 'screen';
    const sparkleCount = 6;
    for (let s = 0; s < sparkleCount; s++) {
      const seed = s * 151.7;
      const sx = startX + ((seed * 17) % totalWidth);
      const sy = startY + ((seed * 23) % totalHeight);
      const sparkCycle = Math.sin(time * 3 + seed) * 0.5 + 0.5;
      if (sparkCycle < 0.4) continue;

      const r = (5 + sparkCycle * 10) * scale * fx.prismReflect;
      const pGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.3, 'rgba(165, 243, 252, 0.9)');
      pGrad.addColorStop(0.7, 'rgba(192, 132, 252, 0.4)');
      pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();

      // 4-point cross glint
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + sparkCycle + ')';
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(sx - r * 1.5, sy);
      ctx.lineTo(sx + r * 1.5, sy);
      ctx.moveTo(sx, sy - r * 1.5);
      ctx.lineTo(sx, sy + r * 1.5);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * 8. Realistic Neon with Physical Glass Tube (Gas Discharge, Phosphor Halo, Mounting Brackets)
 */
export function renderRealisticNeonTube(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  lines: string[],
  startY: number,
  lineHeight: number,
  scale: number,
  time: number
): void {
  const fx = layer.vfx?.neonTube;
  if (!fx || !fx.enabled) return;

  const tubeW = (fx.tubeWidth || 3.5) * scale;
  const tubeColor = fx.tubeColor || '#ffffff';
  const glowColor = fx.glowColor || '#ec4899';

  // Electrical micro-flicker: occasional momentary ignition dip
  let flickerIntensity = 1.0;
  if (fx.flicker) {
    const noise = Math.sin(time * 47) * Math.cos(time * 31);
    if (noise > 0.88) {
      flickerIntensity = 0.35 + Math.random() * 0.4;
    } else {
      flickerIntensity = 0.95 + 0.05 * Math.sin(time * 8);
    }
  }

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // 1. Broad Ambient Wall Glow (Diffuse phosphor projection)
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 45 * scale * flickerIntensity;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = tubeW * 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;
    ctx.strokeText(lines[i], 0, y);
  }

  // 2. Focused Ionized Gas Halo
  ctx.shadowBlur = 18 * scale * flickerIntensity;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = tubeW * 1.6;
  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;
    ctx.strokeText(lines[i], 0, y);
  }

  // 3. Central Physical Glass Tube Core (Hot Ionized Discharge Channel)
  ctx.shadowBlur = 4 * scale;
  ctx.shadowColor = '#ffffff';
  ctx.strokeStyle = tubeColor;
  ctx.lineWidth = tubeW;
  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;
    ctx.strokeText(lines[i], 0, y);
  }

  // 4. Mounting Brackets (Soportes metálicos oscuros detrás del tubo de neón)
  if (fx.mountBrackets) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2 * scale;

    for (let i = 0; i < lines.length; i++) {
      const y = startY + i * lineHeight;
      const text = lines[i];
      const width = ctx.measureText(text).width;
      const left = ctx.textAlign === 'center' ? -width / 2 : ctx.textAlign === 'right' ? -width : 0;
      const bracketCount = Math.max(2, Math.floor(width / (180 * scale)));

      for (let b = 0; b <= bracketCount; b++) {
        const bx = left + (b / bracketCount) * width;
        const by = y - lineHeight * 0.3;
        ctx.fillRect(bx - 3 * scale, by - 6 * scale, 6 * scale, 12 * scale);
        ctx.strokeRect(bx - 3 * scale, by - 6 * scale, 6 * scale, 12 * scale);
      }
    }
  }

  ctx.restore();
}
