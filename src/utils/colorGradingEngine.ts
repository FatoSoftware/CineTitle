import {
  ColorGradingSettings,
  ColorCorrectionSettings,
  LutPreset,
  VignetteSettings,
  AnimatedGradientSettings,
  TextLayer,
} from '../types';

// Shared Offscreen Canvas for GPU-accelerated filter pass without GC thrashing
let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;

function getOffscreen(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (typeof document === 'undefined') return null;
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas');
    offscreenCtx = offscreenCanvas.getContext('2d');
  }
  if (offscreenCanvas.width !== width || offscreenCanvas.height !== height) {
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
  }
  if (!offscreenCtx) return null;
  return { canvas: offscreenCanvas, ctx: offscreenCtx };
}

// Helper: Hex to RGBA
export function hexToRgba(hex: string, alpha: number = 1): string {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(0,0,0,${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Interpolate between two hex colors
export function interpolateHex(hex1: string, hex2: string, t: number): string {
  const clampT = Math.max(0, Math.min(1, t));
  const parse = (h: string) => {
    let c = h.replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    const n = parseInt(c, 16);
    return isNaN(n) ? [0, 0, 0] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [r1, g1, b1] = parse(hex1);
  const [r2, g2, b2] = parse(hex2);
  const r = Math.round(r1 + (r2 - r1) * clampT);
  const g = Math.round(g1 + (g2 - g1) * clampT);
  const b = Math.round(b1 + (b2 - b1) * clampT);
  return `rgb(${r}, ${g}, ${b})`;
}

// ----------------------------------------------------
// 1. ANIMATED COLOR GRADIENTS
// ----------------------------------------------------

/**
 * Creates an animated CanvasGradient with smooth time-based color transitions,
 * rotating angles, or pulsing radial waves.
 */
export function createAnimatedCanvasGradient(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  settings: AnimatedGradientSettings,
  currentTime: number
): CanvasGradient {
  const colors = settings.colors && settings.colors.length >= 2
    ? settings.colors
    : ['#ff007f', '#7928ca', '#00f0ff'];

  const speed = settings.speed ?? 1.0;
  const numColors = colors.length;

  // Smooth cyclic color shift across palette
  const cyclePhase = (currentTime * speed * 0.3) % 1;

  if (settings.style === 'radial') {
    // Pulsing radial gradient
    const baseRadius = Math.max(w, h) * 0.5;
    const pulseFactor = 1 + Math.sin(currentTime * speed * 2.5) * (settings.pulseIntensity ?? 0.35) * 0.4;
    const rOuter = baseRadius * pulseFactor;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(10, rOuter));

    for (let i = 0; i < numColors; i++) {
      const stopPos = (i / (numColors - 1) + cyclePhase) % 1;
      const colorIdx = (i + Math.floor(currentTime * speed * 0.5)) % numColors;
      grad.addColorStop(i / (numColors - 1), colors[colorIdx]);
    }
    return grad;
  }

  // Linear or Conic (Approximated linear multi-stop)
  const angleDeg = ((settings.angle ?? 45) + (settings.rotateWithTime ? currentTime * speed * 35 : 0)) % 360;
  const rad = (angleDeg * Math.PI) / 180;
  const dist = Math.sqrt(w * w + h * h) * 0.5;

  const x1 = cx - Math.cos(rad) * dist;
  const y1 = cy - Math.sin(rad) * dist;
  const x2 = cx + Math.cos(rad) * dist;
  const y2 = cy + Math.sin(rad) * dist;

  const grad = ctx.createLinearGradient(x1, y1, x2, y2);

  // Distribute color stops with time cycle
  for (let i = 0; i < numColors; i++) {
    // Fractional position
    const baseStop = i / (numColors - 1);
    // Dynamic color shift
    const shiftedTime = (currentTime * speed * 0.4 + i / numColors) % 1;
    const fromIdx = Math.floor(shiftedTime * numColors) % numColors;
    const toIdx = (fromIdx + 1) % numColors;
    const t = (shiftedTime * numColors) % 1;
    const blendedColor = interpolateHex(colors[fromIdx], colors[toIdx], t);

    grad.addColorStop(baseStop, blendedColor);
  }

  return grad;
}

// Helper: Convert user blend mode to valid GlobalCompositeOperation
function toGlobalCompositeOperation(mode?: string): GlobalCompositeOperation {
  if (!mode || mode === 'normal') return 'source-over';
  return (mode as GlobalCompositeOperation) || 'source-over';
}

/**
 * Render animated color gradient as full-scene wash / ambient lighting
 */
export function renderSceneAnimatedGradient(
  ctx: CanvasRenderingContext2D,
  settings: AnimatedGradientSettings,
  width: number,
  height: number,
  currentTime: number
): void {
  if (!settings.enabled || (settings.opacity ?? 0.5) <= 0.01) return;

  ctx.save();
  ctx.globalCompositeOperation = toGlobalCompositeOperation(settings.blendMode);
  ctx.globalAlpha = Math.min(1, Math.max(0, settings.opacity ?? 0.5));

  const grad = createAnimatedCanvasGradient(
    ctx,
    width / 2,
    height / 2,
    width,
    height,
    settings,
    currentTime
  );

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

// ----------------------------------------------------
// 2. ADVANCED COLOR CORRECTION (BRIGHTNESS, CONTRAST, ETC.)
// ----------------------------------------------------

export function applyColorCorrection(
  ctx: CanvasRenderingContext2D,
  correction: ColorCorrectionSettings,
  width: number,
  height: number
): void {
  const needsFilter =
    correction.brightness !== 100 ||
    correction.contrast !== 100 ||
    correction.saturation !== 100 ||
    correction.hueRotate !== 0;

  if (needsFilter) {
    const off = getOffscreen(width, height);
    if (off) {
      off.ctx.clearRect(0, 0, width, height);
      off.ctx.drawImage(ctx.canvas, 0, 0);

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.filter = `brightness(${correction.brightness}%) contrast(${correction.contrast}%) saturate(${correction.saturation}%) hue-rotate(${correction.hueRotate}deg)`;
      ctx.drawImage(off.canvas, 0, 0);
      ctx.restore();
    }
  }

  // Temperature (Warm Amber vs Cold Cyan)
  if (correction.temperature !== 0) {
    ctx.save();
    if (correction.temperature > 0) {
      // Warm Amber
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = '#ff9e3b';
      ctx.globalAlpha = Math.min(0.65, (correction.temperature / 100) * 0.45);
    } else {
      // Cold Cyan
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = '#38bdf8';
      ctx.globalAlpha = Math.min(0.65, (-correction.temperature / 100) * 0.45);
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Tint (Magenta vs Green)
  if (correction.tint !== 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    if (correction.tint > 0) {
      // Magenta
      ctx.fillStyle = '#e879f9';
      ctx.globalAlpha = Math.min(0.55, (correction.tint / 100) * 0.35);
    } else {
      // Green
      ctx.fillStyle = '#34d399';
      ctx.globalAlpha = Math.min(0.55, (-correction.tint / 100) * 0.35);
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Exposure (EV adjustment)
  if (correction.exposure !== 0) {
    ctx.save();
    if (correction.exposure > 0) {
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = Math.min(0.7, (correction.exposure / 2.0) * 0.5);
    } else {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = Math.min(0.7, (-correction.exposure / 2.0) * 0.6);
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Shadows lift / crush
  if (correction.shadows !== 0) {
    ctx.save();
    if (correction.shadows > 0) {
      // Lift shadows
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = '#262626';
      ctx.globalAlpha = (correction.shadows / 50) * 0.4;
    } else {
      // Crush darks
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#0a0a0a';
      ctx.globalAlpha = (-correction.shadows / 50) * 0.5;
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Highlights boost / roll-off
  if (correction.highlights !== 0) {
    ctx.save();
    if (correction.highlights > 0) {
      // Boost brights
      ctx.globalCompositeOperation = 'color-dodge';
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = (correction.highlights / 50) * 0.35;
    } else {
      // Roll-off highlights
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#d4d4d4';
      ctx.globalAlpha = (-correction.highlights / 50) * 0.35;
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

// ----------------------------------------------------
// 3. CINEMATIC LUTS & FILTERS
// ----------------------------------------------------

export function applyLutPreset(
  ctx: CanvasRenderingContext2D,
  preset: LutPreset,
  intensity: number,
  width: number,
  height: number
): void {
  if (preset === 'none' || intensity <= 0) return;
  const factor = Math.min(1, Math.max(0, intensity / 100));

  ctx.save();

  switch (preset) {
    case 'teal-orange': {
      // Hollywood Blockbuster: Teal shadows, warm orange highlights
      // 1. Teal Shadows pass
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = '#0f4c5c';
      ctx.globalAlpha = factor * 0.5;
      ctx.fillRect(0, 0, width, height);

      // 2. Warm Amber Highlights
      ctx.globalCompositeOperation = 'overlay';
      const grad = ctx.createLinearGradient(0, height, width, 0);
      grad.addColorStop(0, 'rgba(15, 76, 92, 0.4)');
      grad.addColorStop(1, 'rgba(251, 146, 60, 0.6)');
      ctx.fillStyle = grad;
      ctx.globalAlpha = factor * 0.45;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'bleach-bypass': {
      // Gritty war / dark thriller: High contrast, silvery desaturated sheen
      const off = getOffscreen(width, height);
      if (off) {
        off.ctx.clearRect(0, 0, width, height);
        off.ctx.save();
        off.ctx.filter = 'saturate(10%) contrast(180%)';
        off.ctx.drawImage(ctx.canvas, 0, 0);
        off.ctx.restore();

        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = factor * 0.65;
        ctx.drawImage(off.canvas, 0, 0);
      }
      break;
    }

    case 'vintage-film': {
      // 35mm Analog warm nostalgia (Kodak Portra style)
      // Warm amber soft-light
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = '#e9c46a';
      ctx.globalAlpha = factor * 0.38;
      ctx.fillRect(0, 0, width, height);

      // Lifted matte shadows
      ctx.globalCompositeOperation = 'lighten';
      ctx.fillStyle = '#1c1917';
      ctx.globalAlpha = factor * 0.22;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'noir-bw': {
      // Dramatic High-Contrast Film Noir
      const off = getOffscreen(width, height);
      if (off) {
        off.ctx.clearRect(0, 0, width, height);
        off.ctx.save();
        off.ctx.filter = 'saturate(0%) contrast(160%) brightness(95%)';
        off.ctx.drawImage(ctx.canvas, 0, 0);
        off.ctx.restore();

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = factor;
        ctx.drawImage(off.canvas, 0, 0);
      }
      break;
    }

    case 'cyber-neon': {
      // Synthwave / Cyberpunk Neon: Violet & Cyan duo-tone pop
      ctx.globalCompositeOperation = 'color-dodge';
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#00f0ff');
      grad.addColorStop(0.5, '#7928ca');
      grad.addColorStop(1, '#ff007f');
      ctx.fillStyle = grad;
      ctx.globalAlpha = factor * 0.42;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'golden-hour': {
      // Magic Hour Sunset: Warm golden glow with soft roll-off
      ctx.globalCompositeOperation = 'soft-light';
      const grad = ctx.createRadialGradient(
        width * 0.8,
        height * 0.2,
        width * 0.1,
        width * 0.5,
        height * 0.5,
        width * 0.9
      );
      grad.addColorStop(0, '#ffedd5');
      grad.addColorStop(0.4, '#f59e0b');
      grad.addColorStop(1, '#b45309');
      ctx.fillStyle = grad;
      ctx.globalAlpha = factor * 0.55;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'sci-fi-matrix': {
      // Emerald / Cyber Green futuristic terminal
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = '#059669';
      ctx.globalAlpha = factor * 0.45;
      ctx.fillRect(0, 0, width, height);

      // Deep cyan/green shadows
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#064e3b';
      ctx.globalAlpha = factor * 0.35;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'western-warm': {
      // Dusty Desert Sepia
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = '#d97706';
      ctx.globalAlpha = factor * 0.4;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#78350f';
      ctx.globalAlpha = factor * 0.25;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'pastel-soft': {
      // Luminous Commercial Beauty & Luxury
      ctx.globalCompositeOperation = 'screen';
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#fbcfe8');
      grad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = grad;
      ctx.globalAlpha = factor * 0.3;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'horror-cold': {
      // Chilling Desaturated Icy Steel Blue
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = '#0284c7';
      ctx.globalAlpha = factor * 0.45;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#0f172a';
      ctx.globalAlpha = factor * 0.4;
      ctx.fillRect(0, 0, width, height);
      break;
    }
  }

  ctx.restore();
}

// ----------------------------------------------------
// 4. ADVANCED VIGNETTE EFFECT (SHAPE & POSITION CONTROL)
// ----------------------------------------------------

export function renderVignetteEffect(
  ctx: CanvasRenderingContext2D,
  vignette: VignetteSettings,
  width: number,
  height: number
): void {
  if (!vignette.enabled || vignette.intensity <= 0) return;

  const alpha = Math.min(1, Math.max(0, vignette.intensity / 100));
  const focalX = (vignette.posX / 100) * width;
  const focalY = (vignette.posY / 100) * height;

  const radiusMultiplier = (vignette.radius ?? 75) / 100;
  const feather = Math.max(0.01, Math.min(1, (vignette.feather ?? 60) / 100));
  const color = vignette.color || '#000000';

  ctx.save();
  ctx.globalCompositeOperation = toGlobalCompositeOperation(vignette.blendMode || 'multiply');

  if (vignette.shape === 'rectangle') {
    // Advanced Rectangular / Squircle Vignette with Adjustable Corner Radius
    const rw = (width * 0.5 * radiusMultiplier);
    const rh = (height * 0.5 * radiusMultiplier);
    const roundnessPx = Math.min(rw, rh) * ((vignette.roundness ?? 30) / 100);

    // Multi-step feathered border falloff
    const steps = 14;
    for (let s = 0; s < steps; s++) {
      const p = s / (steps - 1);
      const stepW = rw + (width - rw) * p * feather;
      const stepH = rh + (height - rh) * p * feather;
      const stepR = roundnessPx + (Math.min(width, height) * 0.5 - roundnessPx) * p;
      const stepAlpha = alpha * Math.pow(p, 1.8);

      ctx.save();
      ctx.strokeStyle = hexToRgba(color, stepAlpha / 4);
      ctx.lineWidth = Math.max(2, (width * 0.1) / steps);
      ctx.beginPath();
      ctx.roundRect(
        focalX - stepW,
        focalY - stepH,
        stepW * 2,
        stepH * 2,
        Math.max(0, stepR)
      );
      ctx.stroke();
      ctx.restore();
    }

    // Outer edge dark fill
    ctx.save();
    const borderGrad = ctx.createRadialGradient(
      focalX,
      focalY,
      Math.max(rw, rh),
      focalX,
      focalY,
      Math.max(width, height) * 0.9
    );
    borderGrad.addColorStop(0, 'rgba(0,0,0,0)');
    borderGrad.addColorStop(1, hexToRgba(color, alpha));
    ctx.fillStyle = borderGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

  } else if (vignette.shape === 'circle') {
    // Perfect Symmetrical Circular Vignette
    const maxDim = Math.max(width, height);
    const outerR = (maxDim * 0.6) * radiusMultiplier;
    const innerR = Math.max(0, outerR * (1 - feather));

    const grad = ctx.createRadialGradient(focalX, focalY, innerR, focalX, focalY, outerR);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.7, hexToRgba(color, alpha * 0.6));
    grad.addColorStop(1, hexToRgba(color, alpha));

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

  } else {
    // Elliptical Vignette (conforms to aspect ratio or camera view)
    const rx = (width * 0.6) * radiusMultiplier;
    const ry = (height * 0.6) * radiusMultiplier;
    const rMax = Math.max(rx, ry);

    ctx.save();
    ctx.translate(focalX, focalY);
    ctx.scale(rx / rMax, ry / rMax);

    const innerR = Math.max(0, rMax * (1 - feather));
    const grad = ctx.createRadialGradient(0, 0, innerR, 0, 0, rMax);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.65, hexToRgba(color, alpha * 0.6));
    grad.addColorStop(1, hexToRgba(color, alpha));

    ctx.fillStyle = grad;
    ctx.fillRect(-rMax * 2, -rMax * 2, rMax * 4, rMax * 4);
    ctx.restore();
  }

  ctx.restore();
}

// ----------------------------------------------------
// 5. MASTER COLOR GRADING PIPELINE
// ----------------------------------------------------

export function renderSceneColorGrading(
  ctx: CanvasRenderingContext2D,
  grading: ColorGradingSettings,
  width: number,
  height: number,
  currentTime: number
): void {
  if (!grading || !grading.enabled) return;

  // 1. Scene Animated Gradient Wash (if enabled for scene)
  if (grading.animatedGradient?.enabled && grading.animatedGradient.target !== 'layer') {
    renderSceneAnimatedGradient(ctx, grading.animatedGradient, width, height, currentTime);
  }

  // 2. Advanced Color Correction (Brightness, Contrast, Saturation, Hue, Temp, Tint, Exposure)
  if (grading.correction) {
    applyColorCorrection(ctx, grading.correction, width, height);
  }

  // 3. Cinematic LUTs & Looks
  if (grading.lut?.preset && grading.lut.preset !== 'none') {
    applyLutPreset(ctx, grading.lut.preset, grading.lut.intensity ?? 100, width, height);
  }

  // 4. Advanced Vignette Effect (Shape, Position, Spread, Feather, Roundness)
  if (grading.vignette?.enabled) {
    renderVignetteEffect(ctx, grading.vignette, width, height);
  }
}
