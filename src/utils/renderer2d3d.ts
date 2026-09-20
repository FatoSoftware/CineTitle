import { ProjectSettings, TextLayer, MaterialType, Keyframe, LayerMaskSettings } from '../types';
import { typewriterAudio } from './typewriterAudio';
import {
  renderLensFlareEffect,
  renderAtmosphericEffect,
  renderTextureOverlay,
  applyDistortionOffset,
  computeGlitchState,
  renderRealFireEffect,
  renderIceCrystalEffect,
  renderRealisticNeonTube,
} from './visualEffectsRenderer';
import {
  renderComplexParticleSystem,
  renderExplosionEffect,
  renderConfettiRain,
  renderLightTrails,
  renderMagicEffects,
} from './particleSystemEngine';

// Image Cache for fast frame-by-frame rendering of Image/Logo layers
const imageCache = new Map<string, HTMLImageElement>();

export function getOrLoadImage(url: string, onLoaded?: () => void): HTMLImageElement | null {
  if (!url) return null;
  const existing = imageCache.get(url);
  if (existing) {
    return existing.complete ? existing : null;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    imageCache.set(url, img);
    if (onLoaded) onLoaded();
  };
  img.src = url;
  imageCache.set(url, img);
  return null;
}

// Easing Functions
export function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}

export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

export function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function easeOutElastic(x: number): number {
  const c4 = (2 * Math.PI) / 3;
  return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeInQuad(x: number): number {
  return x * x;
}

export function easeInCubic(x: number): number {
  return x * x * x;
}

export function easeInBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * x * x * x - c1 * x * x;
}

export function getEasingValue(type: string, t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  switch (type) {
    case 'easeOutQuad':
      return easeOutQuad(clamped);
    case 'easeOutCubic':
      return easeOutCubic(clamped);
    case 'easeOutBack':
      return easeOutBack(clamped);
    case 'easeOutElastic':
      return easeOutElastic(clamped);
    case 'easeInOutCubic':
      return easeInOutCubic(clamped);
    case 'easeInQuad':
      return easeInQuad(clamped);
    case 'easeInCubic':
      return easeInCubic(clamped);
    case 'easeInBack':
      return easeInBack(clamped);
    default:
      return clamped;
  }
}

// Compute animated state of a layer at specific timestamp
export interface LayerAnimatedState {
  opacity: number;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  blur: number;
  depthScale: number;
  textToRender: string;
  glitchOffset: number;
  shimmerOffset: number;
  overrideX?: number;
  overrideY?: number;

  // Special Text Effects State
  isTypewriter?: boolean;
  typewriterCursor?: string;
  isHandwriting?: boolean;
  handwritingProgress?: number;
  handwritingNib?: boolean;
  isErasing?: boolean;
  eraseProgress?: number;
  eraseMode?: 'backspace' | 'letter-fade';
  maskRevealType?: string;
  maskRevealProgress?: number;
  maskRevealFeather?: number;
}

export function computeLayerAnimation(
  layer: TextLayer,
  currentTime: number,
  totalDuration: number
): LayerAnimatedState {
  const anim = layer.animation;

  // Defaults
  let opacity = layer.opacity;
  let scaleX = 1;
  let scaleY = 1;
  let offsetX = 0;
  let offsetY = 0;
  let rotX = layer.threeD.rotX;
  let rotY = layer.threeD.rotY;
  let rotZ = layer.threeD.rotZ;
  let blur = 0;
  let depthScale = 1;
  let textToRender = layer.text;
  let glitchOffset = 0;
  let shimmerOffset = 0;

  // Special effects flags
  let isTypewriter = false;
  let typewriterCursor = '';
  let isHandwriting = false;
  let handwritingProgress = 1;
  let handwritingNib = anim.handwritingNib !== false;
  let isErasing = false;
  let eraseProgress = 0;
  let eraseMode: 'backspace' | 'letter-fade' | undefined = undefined;
  let maskRevealType: string | undefined = undefined;
  let maskRevealProgress = 1;
  let maskRevealFeather = anim.maskRevealFeather ?? 35;

  // --- Intro Phase ---
  const inStart = anim.inDelay;
  const inEnd = inStart + anim.inDuration;

  if (currentTime < inStart) {
    // Hasn't started yet
    return {
      opacity: 0,
      scaleX: 0,
      scaleY: 0,
      offsetX: 0,
      offsetY: 0,
      rotX,
      rotY,
      rotZ,
      blur: 0,
      depthScale: 0,
      textToRender: '',
      glitchOffset: 0,
      shimmerOffset: 0,
    };
  } else if (currentTime < inEnd && anim.inType !== 'none') {
    const rawProgress = (currentTime - inStart) / anim.inDuration;
    const progress = getEasingValue(anim.inEasing, rawProgress);

    switch (anim.inType) {
      case 'fade':
        opacity *= progress;
        break;
      case 'zoom-in':
        opacity *= Math.min(1, progress * 1.5);
        scaleX = 0.2 + 0.8 * progress;
        scaleY = 0.2 + 0.8 * progress;
        break;
      case 'zoom-3d':
        opacity *= Math.min(1, progress * 1.3);
        scaleX = 0.05 + 0.95 * progress;
        scaleY = 0.05 + 0.95 * progress;
        rotX += (1 - progress) * -45;
        depthScale = 0.1 + 0.9 * progress;
        break;
      case 'slide-up':
        opacity *= Math.min(1, progress * 1.4);
        offsetY += (1 - progress) * 180;
        break;
      case 'slide-down':
        opacity *= Math.min(1, progress * 1.4);
        offsetY -= (1 - progress) * 180;
        break;
      case 'slide-left':
        opacity *= Math.min(1, progress * 1.4);
        offsetX += (1 - progress) * 250;
        break;
      case 'slide-right':
        opacity *= Math.min(1, progress * 1.4);
        offsetX -= (1 - progress) * 250;
        break;
      case 'flip-3d-x':
        opacity *= Math.min(1, progress * 1.5);
        rotX += (1 - progress) * 90;
        break;
      case 'flip-3d-y':
        opacity *= Math.min(1, progress * 1.5);
        rotY += (1 - progress) * 90;
        break;
      case 'spin-3d':
        opacity *= Math.min(1, progress * 1.3);
        rotY += (1 - progress) * 360;
        scaleX = 0.3 + 0.7 * progress;
        scaleY = 0.3 + 0.7 * progress;
        break;
      case 'pop-bounce':
        opacity *= Math.min(1, progress * 2);
        scaleX = progress;
        scaleY = progress;
        break;

      // Special Effect 2: Typewriter with Sound
      case 'typewriter': {
        isTypewriter = true;
        const totalChars = layer.text.length;
        const charCount = Math.min(totalChars, Math.floor(totalChars * progress));
        const cursorMode = anim.typewriterCursor || 'bar';
        const cursorChar = cursorMode === 'bar' ? '|' : cursorMode === 'block' ? '█' : cursorMode === 'underscore' ? '_' : '';
        const isBlinking = Math.floor(currentTime * 4) % 2 === 0;
        typewriterCursor = isBlinking ? cursorChar : ' ';
        textToRender = layer.text.slice(0, charCount) + (charCount < totalChars ? typewriterCursor : '');

        // Trigger mechanical audio click / carriage return bell
        if (anim.typewriterSound !== false) {
          typewriterAudio.handleTypewriterStep(
            layer.id,
            charCount,
            totalChars,
            layer.text,
            true,
            false
          );
        }
        break;
      }

      // Special Effect 3: Handwriting / Calligraphy Simulation
      case 'handwriting': {
        isHandwriting = true;
        handwritingProgress = progress;
        handwritingNib = anim.handwritingNib !== false;
        const totalChars = layer.text.length;
        const charsToShow = Math.min(totalChars, Math.max(1, Math.ceil(totalChars * progress)));
        textToRender = layer.text.slice(0, charsToShow);

        // Soft fountain pen scratch audio
        if (anim.typewriterSound !== false && Math.random() < 0.22 && progress < 0.98) {
          typewriterAudio.playPenScratch(anim.typewriterVolume ?? 1.0);
        }
        break;
      }

      // Special Effect 5: Gradual Mask Reveals (Wipe, Curtain, Radial, Shimmer)
      case 'mask-reveal-wipe':
      case 'mask-reveal-curtain':
      case 'mask-reveal-radial':
      case 'mask-reveal-shimmer': {
        maskRevealType = anim.inType;
        maskRevealProgress = progress;
        maskRevealFeather = anim.maskRevealFeather ?? 35;
        textToRender = layer.text;
        break;
      }

      case 'glitch-split':
        opacity *= Math.min(1, progress * 1.8);
        glitchOffset = (1 - progress) * 15 * (Math.random() > 0.5 ? 1 : -1);
        rotZ += (1 - progress) * 6 * Math.sin(currentTime * 20);
        break;
      case 'drop-bounce':
        offsetY -= (1 - progress) * 350;
        opacity *= Math.min(1, progress * 2.5);
        break;
      case 'blur-focus':
        opacity *= progress;
        scaleX = 1.3 - 0.3 * progress;
        scaleY = 1.3 - 0.3 * progress;
        blur = (1 - progress) * 20;
        break;
    }
  }

  // --- Outro Phase ---
  const outroDuration = anim.outDuration;
  const outroStart = totalDuration - anim.outDelay - outroDuration;

  if (currentTime > outroStart && anim.outType !== 'none') {
    const rawOutProgress = (currentTime - outroStart) / outroDuration;
    const outProgress = getEasingValue(anim.outEasing, Math.min(1, rawOutProgress));

    switch (anim.outType) {
      case 'fade':
        opacity *= 1 - outProgress;
        break;
      case 'zoom-out':
        scaleX *= 1 + 0.8 * outProgress;
        scaleY *= 1 + 0.8 * outProgress;
        opacity *= 1 - outProgress;
        break;
      case 'zoom-out-3d':
        scaleX *= Math.max(0, 1 - outProgress);
        scaleY *= Math.max(0, 1 - outProgress);
        rotX += outProgress * 45;
        opacity *= 1 - outProgress;
        break;
      case 'slide-down':
        offsetY += outProgress * 200;
        opacity *= 1 - outProgress;
        break;
      case 'slide-up':
        offsetY -= outProgress * 200;
        opacity *= 1 - outProgress;
        break;
      case 'slide-left':
        offsetX -= outProgress * 250;
        opacity *= 1 - outProgress;
        break;
      case 'slide-right':
        offsetX += outProgress * 250;
        opacity *= 1 - outProgress;
        break;
      case 'spin-out-3d':
        rotY += outProgress * 360;
        scaleX *= Math.max(0, 1 - outProgress);
        scaleY *= Math.max(0, 1 - outProgress);
        opacity *= 1 - outProgress;
        break;
      case 'shatter-sink':
        offsetY += outProgress * 140;
        rotZ += outProgress * 15;
        opacity *= 1 - outProgress;
        break;
      case 'blur-dissolve':
        blur += outProgress * 25;
        scaleX *= 1 + 0.2 * outProgress;
        scaleY *= 1 + 0.2 * outProgress;
        opacity *= 1 - outProgress;
        break;

      // Special Effect 4: Eraser Effect - Backspace deletion letter-by-letter
      case 'erase-backspace': {
        isErasing = true;
        eraseMode = 'backspace';
        const totalChars = layer.text.length;
        const remainingCount = Math.max(0, Math.floor(totalChars * (1 - outProgress)));
        const cursorChar = Math.floor(currentTime * 6) % 2 === 0 ? '|' : '';
        textToRender = layer.text.slice(0, remainingCount) + cursorChar;

        // Trigger backspace mechanical audio
        if (anim.typewriterSound !== false) {
          typewriterAudio.handleTypewriterStep(
            layer.id,
            remainingCount,
            totalChars,
            layer.text,
            false,
            true
          );
        }
        break;
      }

      // Special Effect 4: Eraser Effect - Letter-by-letter fade out
      case 'letter-fade-out': {
        isErasing = true;
        eraseMode = 'letter-fade';
        eraseProgress = outProgress;
        opacity *= Math.max(0, 1 - outProgress * 0.9);
        break;
      }
    }
  }

  // --- Loop / Idle Phase ---
  if (currentTime >= inEnd && currentTime <= outroStart) {
    const loopT = currentTime * anim.loopIntensity;
    switch (anim.loopType) {
      case 'float-gentle':
        offsetY += Math.sin(loopT * 2) * 8;
        rotZ += Math.sin(loopT * 1.5) * 1.5;
        break;
      case 'breathe-3d': {
        const factor = 1 + Math.sin(loopT * 2.5) * 0.04;
        scaleX *= factor;
        scaleY *= factor;
        rotX += Math.sin(loopT * 2) * 3;
        break;
      }
      case 'pulse-glow':
        scaleX *= 1 + Math.sin(loopT * 4) * 0.02;
        scaleY *= 1 + Math.sin(loopT * 4) * 0.02;
        break;
      case 'wobble-3d':
        rotX += Math.sin(loopT * 2.2) * 6;
        rotY += Math.cos(loopT * 1.8) * 6;
        break;
      case 'continuous-rotate':
        rotY = (rotY + (currentTime * 45 * anim.loopIntensity) % 360);
        break;
      case 'shimmer-light':
        shimmerOffset = (currentTime * 120 * anim.loopIntensity) % 360;
        break;
      case 'glitch-flicker':
        if (Math.sin(currentTime * 30) > 0.85) {
          glitchOffset = (Math.random() - 0.5) * 8;
          opacity *= 0.7 + Math.random() * 0.3;
        }
        break;
    }
  }

  // --- Advanced Keyframes Interpolation ---
  let overrideX: number | undefined = undefined;
  let overrideY: number | undefined = undefined;

  if (layer.keyframes && layer.keyframes.length > 0) {
    const sorted = [...layer.keyframes].sort((a, b) => a.time - b.time);
    let targetProps: Partial<Keyframe['properties']> = {};

    if (currentTime <= sorted[0].time) {
      targetProps = sorted[0].properties;
    } else if (currentTime >= sorted[sorted.length - 1].time) {
      targetProps = sorted[sorted.length - 1].properties;
    } else {
      for (let i = 0; i < sorted.length - 1; i++) {
        const k1 = sorted[i];
        const k2 = sorted[i + 1];
        if (currentTime >= k1.time && currentTime <= k2.time) {
          const dt = k2.time - k1.time;
          const rawT = dt > 0 ? (currentTime - k1.time) / dt : 0;
          const t = getEasingValue(k2.easing || 'easeOutQuad', rawT);

          const lerp = (v1?: number, v2?: number) => {
            if (v1 === undefined && v2 === undefined) return undefined;
            const a = v1 !== undefined ? v1 : (v2 ?? 0);
            const b = v2 !== undefined ? v2 : a;
            return a + (b - a) * t;
          };

          targetProps = {
            x: lerp(k1.properties.x, k2.properties.x),
            y: lerp(k1.properties.y, k2.properties.y),
            scale: lerp(k1.properties.scale, k2.properties.scale),
            opacity: lerp(k1.properties.opacity, k2.properties.opacity),
            rotX: lerp(k1.properties.rotX, k2.properties.rotX),
            rotY: lerp(k1.properties.rotY, k2.properties.rotY),
            rotZ: lerp(k1.properties.rotZ, k2.properties.rotZ),
            depth: lerp(k1.properties.depth, k2.properties.depth),
          };
          break;
        }
      }
    }

    if (targetProps.x !== undefined) overrideX = targetProps.x;
    if (targetProps.y !== undefined) overrideY = targetProps.y;
    if (targetProps.scale !== undefined) {
      scaleX = targetProps.scale;
      scaleY = targetProps.scale;
    }
    if (targetProps.opacity !== undefined) {
      opacity = targetProps.opacity;
    }
    if (targetProps.rotX !== undefined) rotX = targetProps.rotX;
    if (targetProps.rotY !== undefined) rotY = targetProps.rotY;
    if (targetProps.rotZ !== undefined) rotZ = targetProps.rotZ;
    if (targetProps.depth !== undefined && layer.threeD.depth > 0) {
      depthScale = targetProps.depth / layer.threeD.depth;
    }
  }

  // Advanced Visual Effects (VFX) - Distortion perturbation
  if (layer.vfx?.distortion?.enabled) {
    const dist = applyDistortionOffset(layer.y, currentTime, layer.vfx.distortion);
    offsetX += dist.dx;
    offsetY += dist.dy;
  }

  // Advanced Visual Effects (VFX) - Glitch slice shift
  if (layer.vfx?.glitch?.enabled) {
    const gState = computeGlitchState(currentTime, layer.vfx.glitch);
    if (gState.isGlitching) {
      glitchOffset += gState.sliceShiftX;
      offsetX += gState.scanlineJitter;
    }
  }

  return {
    opacity: Math.max(0, Math.min(1, opacity)),
    scaleX,
    scaleY,
    offsetX,
    offsetY,
    rotX,
    rotY,
    rotZ,
    blur,
    depthScale,
    textToRender,
    glitchOffset,
    shimmerOffset,
    overrideX,
    overrideY,
    isTypewriter,
    typewriterCursor,
    isHandwriting,
    handwritingProgress,
    handwritingNib,
    isErasing,
    eraseProgress,
    eraseMode,
    maskRevealType,
    maskRevealProgress,
    maskRevealFeather,
  };
}

// Generate color palette for 3D extrusion depending on material
function getMaterialDepthColors(material: MaterialType, layer: TextLayer, stepProgress: number, lightDot: number): string {
  // stepProgress: 0 (front) to 1 (back)
  // lightDot: -1 to 1 based on lighting angle
  const brightness = 0.5 + 0.5 * lightDot;

  switch (material) {
    case 'gold': {
      // Shimmering rich metallic gold
      const r = Math.floor((245 * (1 - stepProgress * 0.5) + 180 * stepProgress) * (0.6 + 0.4 * brightness));
      const g = Math.floor((158 * (1 - stepProgress * 0.6) + 100 * stepProgress) * (0.6 + 0.4 * brightness));
      const b = Math.floor((11 * (1 - stepProgress * 0.7) + 5 * stepProgress) * (0.6 + 0.4 * brightness));
      return `rgb(${r},${g},${b})`;
    }
    case 'chrome': {
      // Mirror-like silver with high contrast bands
      const val = Math.floor((220 - stepProgress * 140) * (0.5 + 0.5 * brightness));
      const blueTint = Math.min(255, val + 15);
      return `rgb(${val},${val},${blueTint})`;
    }
    case 'neon': {
      // Saturated glowing color with dark core
      return layer.fillColor;
    }
    case 'synthwave': {
      // Gradient from magenta to deep purple / dark cyan
      const r = Math.floor(255 * (1 - stepProgress) + 13 * stepProgress);
      const g = Math.floor(97 * (1 - stepProgress) + 148 * stepProgress);
      const b = Math.floor(210 * (1 - stepProgress) + 136 * stepProgress);
      return `rgb(${r},${g},${b})`;
    }
    case 'metal': {
      // Brushed steel
      const v = Math.floor((120 - stepProgress * 70) * (0.5 + 0.5 * brightness));
      return `rgb(${v},${v + 5},${v + 10})`;
    }
    case 'glass': {
      // Translucent frosted edge
      return `rgba(255, 255, 255, ${0.4 * (1 - stepProgress * 0.6)})`;
    }
    case 'matte':
    default: {
      // Natural diffuse darkening of base color
      return `rgba(0, 0, 0, ${0.15 + 0.65 * stepProgress})`;
    }
  }
}

export interface RenderOptions {
  renderSafeAreas?: boolean;
  selectedLayerId?: string | null;
  bgMediaElement?: HTMLVideoElement | HTMLImageElement | null;
}

// Master Render Function
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  project: ProjectSettings,
  currentTime: number,
  options: RenderOptions = {}
): void {
  // Clear canvas (ensures transparent canvas if transparent background)
  ctx.clearRect(0, 0, width, height);

  const bg = project.background;

  // 1. Render Background
  if (bg.type === 'transparent') {
    // Checkerboard pattern in preview mode (if requested)
    if (bg.checkerboardInPreview) {
      drawCheckerboard(ctx, width, height);
    }
    // When exporting, transparent background has clearRect (alpha = 0)
  } else if (bg.type === 'chroma-green') {
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'chroma-blue') {
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'color') {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'gradient') {
    const angleRad = (bg.gradient.angle * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const length = Math.sqrt(width * width + height * height) / 2;
    const x1 = cx - Math.cos(angleRad) * length;
    const y1 = cy - Math.sin(angleRad) * length;
    const x2 = cx + Math.cos(angleRad) * length;
    const y2 = cy + Math.sin(angleRad) * length;

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, bg.gradient.from);
    grad.addColorStop(1, bg.gradient.to);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Draw background video or image overlay if present
  if ((bg.type === 'video' || bg.type === 'image') && options.bgMediaElement) {
    ctx.save();
    ctx.globalAlpha = bg.mediaOpacity ?? 1;
    ctx.drawImage(options.bgMediaElement, 0, 0, width, height);
    ctx.restore();
  }

  // 2. Render Layers (Back to front)
  // Scale reference: project base design is relative to 1920x1080
  const scale = width / 1920;

  for (const layer of project.layers) {
    if (!layer.visible) continue;

    const state = computeLayerAnimation(layer, currentTime, project.duration);
    if (state.opacity <= 0.001) continue;
    if ((!layer.type || layer.type === 'text') && !state.textToRender) continue;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    // Apply Blur filter if active
    if (state.blur > 0.5) {
      ctx.filter = `blur(${state.blur * scale}px)`;
    }

    // Position coordinates
    const layerX = state.overrideX !== undefined ? state.overrideX : layer.x;
    const layerY = state.overrideY !== undefined ? state.overrideY : layer.y;
    const anchorX = (layerX / 100) * width + state.offsetX * scale + state.glitchOffset;
    const anchorY = (layerY / 100) * height + state.offsetY * scale;

    // Mask Clipping (if enabled)
    if (layer.mask && layer.mask.enabled && layer.mask.type !== 'none') {
      applyLayerMask(ctx, layer.mask, width, height);
    }

    ctx.translate(anchorX, anchorY);

    // Apply 2D Scale
    ctx.scale(state.scaleX, state.scaleY);

    // Apply 3D Perspective Rotation Simulation (Euler 3D Matrix & Vanishing Point Projection)
    const rotXRad = (state.rotX * Math.PI) / 180;
    const rotYRad = (state.rotY * Math.PI) / 180;
    const rotZRad = (state.rotZ * Math.PI) / 180;

    const cx = Math.cos(rotXRad);
    const sx = Math.sin(rotXRad);
    const cy = Math.cos(rotYRad);
    const sy = Math.sin(rotYRad);
    const cz = Math.cos(rotZRad);
    const sz = Math.sin(rotZRad);

    // 3D Euler Matrix Projection onto 2D Canvas
    const m11 = cy * cz;
    const m12 = cy * sz;
    const m21 = sx * sy * cz - cx * sz;
    const m22 = sx * sy * sz + cx * cz;

    ctx.transform(m11, m12, m21, m22, 0, 0);

    if (layer.type === 'shape') {
      renderShapeLayer(ctx, layer, scale, state, currentTime);
    } else if (layer.type === 'image') {
      renderImageLayer(ctx, layer, scale, state);
    } else {
      // Standard Text Layer
      renderTextLayerContent(ctx, layer, scale, state, currentTime);
    }

    ctx.restore();

    // 3. Selection outline if layer is selected in UI
    if (options.selectedLayerId === layer.id) {
      drawSelectionBox(ctx, anchorX, anchorY, layer, scale, state);
    }

    // Advanced Particle Systems attached to layer
    if (layer.particles) {
      let bW = 220 * scale;
      let bH = 80 * scale;
      if (layer.type === 'shape') {
        bW = (layer.shapeWidth ?? 400) * scale;
        bH = (layer.shapeHeight ?? 80) * scale;
      } else if (layer.type === 'image') {
        bW = (layer.imageWidth ?? 200) * scale;
        bH = (layer.imageHeight ?? 200) * scale;
      } else {
        const fSize = layer.fontSize * scale;
        const textStr = state.textToRender || layer.text || '';
        const lines = textStr.split('\n');
        let maxLineChars = 0;
        for (const l of lines) {
          if (l.length > maxLineChars) maxLineChars = l.length;
        }
        bW = Math.max(120 * scale, maxLineChars * fSize * 0.55);
        bH = Math.max(40 * scale, lines.length * fSize * layer.lineHeight);
      }

      // 1. Complex particle system with emitters, forces and collisions
      if (layer.particles.system?.enabled) {
        renderComplexParticleSystem(
          ctx,
          layer.particles.system,
          anchorX,
          anchorY,
          bW,
          bH,
          scale,
          currentTime,
          width,
          height
        );
      }

      // 2. Explosion with fragments, debris and shockwave
      if (layer.particles.explosion?.enabled) {
        renderExplosionEffect(
          ctx,
          layer.particles.explosion,
          anchorX,
          anchorY,
          scale,
          currentTime
        );
      }

      // 4. Light trails & orbits
      if (layer.particles.trails?.enabled) {
        renderLightTrails(
          ctx,
          layer.particles.trails,
          anchorX,
          anchorY,
          bW,
          bH,
          scale,
          currentTime
        );
      }

      // 5. Magic effects (destellos, chispas y runas místicas)
      if (layer.particles.magic?.enabled) {
        renderMagicEffects(
          ctx,
          layer.particles.magic,
          anchorX,
          anchorY,
          bW,
          bH,
          scale,
          currentTime
        );
      }
    }
  }

  // Realistic Confetti Rain (Full canvas)
  for (const layer of project.layers) {
    if (!layer.visible || !layer.particles?.confetti?.enabled) continue;
    renderConfettiRain(ctx, layer.particles.confetti, width, height, scale, currentTime);
  }

  // 4. Advanced Full-Scene Atmospheric Effects (Smoke, Fog, Embers, Dust Motes)
  for (const layer of project.layers) {
    if (!layer.visible || !layer.vfx?.atmosphere?.enabled) continue;
    renderAtmosphericEffect(ctx, layer.vfx.atmosphere, width, height, currentTime);
  }

  // 5. Advanced Full-Scene Texture Overlays (Paper Grunge, Brushed Metal, 35mm Grain, CRT Scanlines)
  for (const layer of project.layers) {
    if (!layer.visible || !layer.vfx?.texture?.enabled || layer.vfx.texture.applyToLayerOnly) continue;
    renderTextureOverlay(ctx, layer.vfx.texture, width, height, currentTime);
  }

  // 6. Advanced Full-Scene Lens Flares & Light Effects (Cinematic Anamorphic, Solar God Rays, Spotlight, Starburst)
  for (const layer of project.layers) {
    if (!layer.visible || !layer.vfx?.lensFlare?.enabled) continue;
    const lState = computeLayerAnimation(layer, currentTime, project.duration);
    const lx = lState.overrideX !== undefined ? lState.overrideX : layer.x;
    const ly = lState.overrideY !== undefined ? lState.overrideY : layer.y;
    const lAnchorX = (lx / 100) * width + lState.offsetX * scale + lState.glitchOffset;
    const lAnchorY = (ly / 100) * height + lState.offsetY * scale;
    renderLensFlareEffect(ctx, layer.vfx.lensFlare, lAnchorX, lAnchorY, width, height, currentTime);
  }

  // 7. Safe Areas Overlay (Broadcast Standard: 90% Action Safe & 80% Title Safe)
  if (options.renderSafeAreas) {
    drawSafeAreas(ctx, width, height);
  }
}

// Apply Layer Mask & Clipping
function applyLayerMask(
  ctx: CanvasRenderingContext2D,
  mask: LayerMaskSettings,
  width: number,
  height: number
): void {
  ctx.beginPath();
  const mx = (mask.x / 100) * width;
  const my = (mask.y / 100) * height;
  const mw = (mask.width / 100) * width;
  const mh = (mask.height / 100) * height;

  if (mask.type === 'rectangle') {
    ctx.rect(mx - mw / 2, my - mh / 2, mw, mh);
  } else if (mask.type === 'circle') {
    const r = Math.max(5, mw / 2);
    ctx.arc(mx, my, r, 0, Math.PI * 2);
  } else if (mask.type === 'linear-wipe') {
    const progress = Math.max(0, Math.min(1, mask.progress / 100));
    const wipeW = width * progress;
    if (mask.invert) {
      ctx.rect(wipeW, 0, width - wipeW, height);
    } else {
      ctx.rect(0, 0, wipeW, height);
    }
  }
  ctx.clip();
}

// Build shape path helper
function buildShapePath(ctx: CanvasRenderingContext2D, layer: TextLayer, scale: number): { w: number; h: number } {
  const shapeType = layer.shapeType || 'rectangle';
  const w = (layer.shapeWidth ?? 400) * scale;
  const h = (layer.shapeHeight ?? 80) * scale;
  const radius = (layer.cornerRadius ?? 8) * scale;

  ctx.beginPath();
  switch (shapeType) {
    case 'circle':
    case 'badge': {
      const r = Math.max(4, w / 2);
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      break;
    }
    case 'line': {
      const th = Math.max(2, h);
      ctx.roundRect(-w / 2, -th / 2, w, th, th / 2);
      break;
    }
    case 'arrow': {
      const stemW = w * 0.7;
      const headW = w * 0.3;
      const stemH = Math.max(3, h * 0.4);
      const headH = h;
      ctx.moveTo(-w / 2, -stemH / 2);
      ctx.lineTo(-w / 2 + stemW, -stemH / 2);
      ctx.lineTo(-w / 2 + stemW, -headH / 2);
      ctx.lineTo(w / 2, 0);
      ctx.lineTo(-w / 2 + stemW, headH / 2);
      ctx.lineTo(-w / 2 + stemW, stemH / 2);
      ctx.lineTo(-w / 2, stemH / 2);
      ctx.closePath();
      break;
    }
    case 'diamond': {
      const halfW = w / 2;
      const halfH = h / 2;
      ctx.moveTo(0, -halfH);
      ctx.lineTo(halfW, 0);
      ctx.lineTo(0, halfH);
      ctx.lineTo(-halfW, 0);
      ctx.closePath();
      break;
    }
    case 'rectangle':
    default: {
      ctx.roundRect(-w / 2, -h / 2, w, h, Math.min(radius, Math.min(w, h) / 2));
      break;
    }
  }
  return { w, h };
}

// Render Shape Layer (with optional 3D extrusion, bevel, shadows, glow)
function renderShapeLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  scale: number,
  state: LayerAnimatedState,
  currentTime: number
): void {
  const is3D = layer.threeD.enabled && layer.threeD.depth > 0;
  const maxDepth = layer.threeD.depth * scale * state.depthScale;
  const { w } = buildShapePath(ctx, layer, scale);

  // 3D Extrusion
  if (is3D && maxDepth > 0.5) {
    const angleRad = (layer.threeD.angle * Math.PI) / 180;
    const stepCount = Math.max(6, Math.min(50, Math.floor(maxDepth)));
    const stepDist = maxDepth / stepCount;

    const lightAngleRad = ((layer.threeD.lightAngle + state.shimmerOffset) * Math.PI) / 180;
    const lightDirX = Math.cos(lightAngleRad);
    const lightDirY = Math.sin(lightAngleRad);

    // Drop Shadow behind 3D shape
    if (layer.shadowEnabled) {
      ctx.save();
      ctx.shadowColor = layer.shadowColor;
      ctx.shadowBlur = layer.shadowBlur * scale;
      ctx.shadowOffsetX = layer.shadowOffsetX * scale + Math.cos(angleRad) * maxDepth * 1.1;
      ctx.shadowOffsetY = layer.shadowOffsetY * scale + Math.sin(angleRad) * maxDepth * 1.1;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      buildShapePath(ctx, layer, scale);
      ctx.fill();
      ctx.restore();
    }

    // Extrusion Slices
    for (let s = stepCount; s >= 1; s--) {
      const depth = s * stepDist;
      const sliceX = Math.cos(angleRad) * depth;
      const sliceY = Math.sin(angleRad) * depth;
      const stepProgress = s / stepCount;

      const normalX = Math.cos(angleRad + Math.PI / 2);
      const normalY = Math.sin(angleRad + Math.PI / 2);
      const lightDot = normalX * lightDirX + normalY * lightDirY;

      ctx.save();
      ctx.translate(sliceX, sliceY);
      buildShapePath(ctx, layer, scale);
      ctx.fillStyle = getMaterialDepthColors(layer.threeD.material, layer, stepProgress, lightDot);
      ctx.fill();

      if (layer.threeD.bevelSize > 0 && s % 2 === 0) {
        ctx.strokeStyle = layer.threeD.bevelColor;
        ctx.lineWidth = layer.threeD.bevelSize * scale * 0.5;
        ctx.stroke();
      }
      ctx.restore();
    }
  } else if (layer.shadowEnabled) {
    ctx.save();
    ctx.shadowColor = layer.shadowColor;
    ctx.shadowBlur = layer.shadowBlur * scale;
    ctx.shadowOffsetX = layer.shadowOffsetX * scale;
    ctx.shadowOffsetY = layer.shadowOffsetY * scale;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    buildShapePath(ctx, layer, scale);
    ctx.fill();
    ctx.restore();
  }

  // Glow
  if (layer.glowEnabled) {
    ctx.save();
    ctx.shadowColor = layer.glowColor;
    ctx.shadowBlur = layer.glowBlur * scale * 1.5;
    ctx.fillStyle = layer.glowColor;
    buildShapePath(ctx, layer, scale);
    ctx.fill();
    ctx.restore();
  }

  // Front Face
  buildShapePath(ctx, layer, scale);
  if (layer.fillType === 'solid') {
    ctx.fillStyle = layer.fillColor;
  } else {
    const gradAngleRad = (layer.gradientAngle * Math.PI) / 180;
    const r = Math.max(20, w / 2);
    const gx1 = -Math.cos(gradAngleRad) * r;
    const gy1 = -Math.sin(gradAngleRad) * r;
    const gx2 = Math.cos(gradAngleRad) * r;
    const gy2 = Math.sin(gradAngleRad) * r;
    const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
    grad.addColorStop(0, layer.gradientColors[0]);
    grad.addColorStop(1, layer.gradientColors[1]);
    ctx.fillStyle = grad;
  }
  ctx.fill();

  // Bevel highlight
  if (is3D && layer.threeD.bevelSize > 0) {
    ctx.save();
    ctx.strokeStyle = layer.threeD.bevelColor;
    ctx.lineWidth = layer.threeD.bevelSize * scale;
    buildShapePath(ctx, layer, scale);
    ctx.stroke();
    ctx.restore();
  }

  // User Stroke
  if (layer.strokeEnabled && layer.strokeWidth > 0) {
    ctx.strokeStyle = layer.strokeColor;
    ctx.lineWidth = layer.strokeWidth * scale;
    buildShapePath(ctx, layer, scale);
    ctx.stroke();
  }
}

// Render Image / Logo Layer
function renderImageLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  scale: number,
  state: LayerAnimatedState
): void {
  const w = (layer.imageWidth ?? 200) * scale;
  const h = (layer.imageHeight ?? 200) * scale;

  if (layer.shadowEnabled) {
    ctx.save();
    ctx.shadowColor = layer.shadowColor;
    ctx.shadowBlur = layer.shadowBlur * scale;
    ctx.shadowOffsetX = layer.shadowOffsetX * scale;
    ctx.shadowOffsetY = layer.shadowOffsetY * scale;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  if (layer.glowEnabled) {
    ctx.save();
    ctx.shadowColor = layer.glowColor;
    ctx.shadowBlur = layer.glowBlur * scale * 1.5;
    ctx.fillStyle = layer.glowColor;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  if (layer.imageUrl) {
    const img = getOrLoadImage(layer.imageUrl);
    if (img && img.complete) {
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
      // Placeholder while loading
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
      ctx.fillRect(-w / 2, -h / 2, w, h);
    }
  }

  if (layer.strokeEnabled && layer.strokeWidth > 0) {
    ctx.strokeStyle = layer.strokeColor;
    ctx.lineWidth = layer.strokeWidth * scale;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
  }
}

// Render standard text layer content
function renderTextLayerContent(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  scale: number,
  state: LayerAnimatedState,
  currentTime: number
): void {
  // Text formatting
  const fontSize = layer.fontSize * scale;
  const weight = layer.fontWeight || 700;
  const style = layer.fontStyle || 'normal';
  ctx.font = `${style} ${weight} ${fontSize}px "${layer.fontFamily}", sans-serif`;
  ctx.textAlign = layer.textAlign;
  ctx.textBaseline = 'middle';

  // Format text transform (uppercase, etc.)
  let displayText = state.textToRender;
  if (layer.textTransform === 'uppercase') {
    displayText = displayText.toUpperCase();
  } else if (layer.textTransform === 'lowercase') {
    displayText = displayText.toLowerCase();
  } else if (layer.textTransform === 'capitalize') {
    displayText = displayText.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Measure text dimensions & handle multi-line text
  const lines = displayText.split('\n');
  const lineHeightPx = fontSize * layer.lineHeight;
  const totalBlockHeight = lines.length * lineHeightPx;
  const startY = -(totalBlockHeight / 2) + lineHeightPx / 2;

  // Calculate text bounding box for mask reveal & handwriting tip
  let maxLineWidth = 0;
  for (const line of lines) {
    const w = ctx.measureText(line).width + Math.max(0, line.length - 1) * (layer.letterSpacing * scale);
    if (w > maxLineWidth) maxLineWidth = w;
  }
  const textBlockW = Math.max(fontSize * 2, maxLineWidth + 40 * scale);
  const textBlockH = Math.max(lineHeightPx, totalBlockHeight + 40 * scale);

  // Special Effect 5: Gradual Mask Reveal Clip
  const isMaskRevealing = !!state.maskRevealType && (state.maskRevealProgress ?? 1) < 1;
  const revP = Math.max(0, Math.min(1, state.maskRevealProgress ?? 1));

  if (isMaskRevealing) {
    ctx.save();
    ctx.beginPath();
    if (state.maskRevealType === 'mask-reveal-wipe' || state.maskRevealType === 'mask-reveal-shimmer') {
      const leftX = -textBlockW / 2 - 25;
      const wipeW = (textBlockW + 50) * revP;
      ctx.rect(leftX, -textBlockH / 2 - 30, wipeW, textBlockH + 60);
    } else if (state.maskRevealType === 'mask-reveal-curtain') {
      const halfW = ((textBlockW + 50) / 2) * revP;
      ctx.rect(-halfW, -textBlockH / 2 - 30, halfW * 2, textBlockH + 60);
    } else if (state.maskRevealType === 'mask-reveal-radial') {
      const maxR = Math.hypot(textBlockW / 2, textBlockH / 2) + 25;
      ctx.arc(0, 0, maxR * revP, 0, Math.PI * 2);
    }
    ctx.clip();
  }

  // 3D Extrusion Engine (Real 3D Perspective Extrusion with Vanishing Point Tapering)
  const is3D = layer.threeD.enabled && layer.threeD.depth > 0;
  const maxDepth = layer.threeD.depth * scale * state.depthScale;

  if (is3D && maxDepth > 0.5) {
    const angleRad = (layer.threeD.angle * Math.PI) / 180;
    const stepCount = Math.max(6, Math.min(60, Math.floor(maxDepth)));
    const stepDist = maxDepth / stepCount;

    const lightAngleRad = ((layer.threeD.lightAngle + state.shimmerOffset) * Math.PI) / 180;
    const lightDirX = Math.cos(lightAngleRad);
    const lightDirY = Math.sin(lightAngleRad);

    const camDist = layer.threeD.perspective || 900;
    const isTrue3D = layer.threeD.true3DPerspective !== false;
    const rotXRad = (state.rotX * Math.PI) / 180;
    const rotYRad = (state.rotY * Math.PI) / 180;

    // Render Drop Shadow behind 3D block
    if (layer.shadowEnabled) {
      ctx.save();
      ctx.shadowColor = layer.shadowColor;
      ctx.shadowBlur = layer.shadowBlur * scale;
      ctx.shadowOffsetX = layer.shadowOffsetX * scale + Math.cos(angleRad) * maxDepth * 1.2;
      ctx.shadowOffsetY = layer.shadowOffsetY * scale + Math.sin(angleRad) * maxDepth * 1.2;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      renderTextLines(ctx, lines, startY, lineHeightPx, layer.letterSpacing * scale);
      ctx.restore();
    }

    // Render Extrusion Slices from back (deepest) to front
    for (let s = stepCount; s >= 1; s--) {
      const depth = s * stepDist;
      let sliceX = Math.cos(angleRad) * depth;
      let sliceY = Math.sin(angleRad) * depth;
      let perspFactor = 1.0;

      if (isTrue3D) {
        // True 3D perspective depth: Slices extend into 3D space with vanishing point scaling
        const dispX = Math.cos(angleRad) * depth + Math.sin(rotYRad) * depth * 0.75;
        const dispY = Math.sin(angleRad) * depth - Math.sin(rotXRad) * depth * 0.75;
        const dispZ = depth * Math.cos(rotXRad) * Math.cos(rotYRad);

        perspFactor = Math.max(0.2, camDist / (camDist + dispZ));
        sliceX = dispX * perspFactor;
        sliceY = dispY * perspFactor;
      }

      const stepProgress = s / stepCount;

      const normalX = Math.cos(angleRad + Math.PI / 2);
      const normalY = Math.sin(angleRad + Math.PI / 2);
      const lightDot = normalX * lightDirX + normalY * lightDirY;

      ctx.save();
      ctx.translate(sliceX, sliceY);
      if (isTrue3D) {
        ctx.scale(perspFactor, perspFactor);
      }

      const depthColor = getMaterialDepthColors(layer.threeD.material, layer, stepProgress, lightDot);
      ctx.fillStyle = depthColor;
      renderTextLines(ctx, lines, startY, lineHeightPx, layer.letterSpacing * scale);

      if (layer.threeD.bevelSize > 0 && s % 2 === 0) {
        ctx.strokeStyle = layer.threeD.bevelColor;
        ctx.lineWidth = layer.threeD.bevelSize * scale * 0.5 * perspFactor;
        renderTextStrokeLines(ctx, lines, startY, lineHeightPx, layer.letterSpacing * scale);
      }

      ctx.restore();
    }
  } else if (layer.shadowEnabled) {
    ctx.save();
    ctx.shadowColor = layer.shadowColor;
    ctx.shadowBlur = layer.shadowBlur * scale;
    ctx.shadowOffsetX = layer.shadowOffsetX * scale;
    ctx.shadowOffsetY = layer.shadowOffsetY * scale;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    renderTextLines(ctx, lines, startY, lineHeightPx, layer.letterSpacing * scale);
    ctx.restore();
  }

  // Glow
  if (layer.glowEnabled) {
    ctx.save();
    ctx.shadowColor = layer.glowColor;
    ctx.shadowBlur = layer.glowBlur * scale * 1.5;
    ctx.fillStyle = layer.glowColor;
    renderTextLines(ctx, lines, startY, lineHeightPx, layer.letterSpacing * scale);
    ctx.restore();
  }

  // Front Face Fill
  if (layer.fillType === 'solid') {
    ctx.fillStyle = layer.fillColor;
  } else {
    const gradAngleRad = (layer.gradientAngle * Math.PI) / 180;
    const r = fontSize * 1.5;
    const gx1 = -Math.cos(gradAngleRad) * r;
    const gy1 = -Math.sin(gradAngleRad) * r;
    const gx2 = Math.cos(gradAngleRad) * r;
    const gy2 = Math.sin(gradAngleRad) * r;
    const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
    grad.addColorStop(0, layer.gradientColors[0]);
    grad.addColorStop(1, layer.gradientColors[1]);
    ctx.fillStyle = grad;
  }

  renderTextLines(ctx, lines, startY, lineHeightPx, layer.letterSpacing * scale);

  // Front Bevel
  if (is3D && layer.threeD.bevelSize > 0) {
    ctx.save();
    ctx.strokeStyle = layer.threeD.bevelColor;
    ctx.lineWidth = layer.threeD.bevelSize * scale;
    ctx.globalAlpha = Math.min(1, layer.threeD.specular * 1.2);
    renderTextStrokeLines(ctx, lines, startY, lineHeightPx, layer.letterSpacing * scale);
    ctx.restore();
  }

  // User Stroke
  if (layer.strokeEnabled && layer.strokeWidth > 0) {
    ctx.strokeStyle = layer.strokeColor;
    ctx.lineWidth = layer.strokeWidth * scale;
    ctx.lineJoin = 'round';
    renderTextStrokeLines(ctx, lines, startY, lineHeightPx, layer.letterSpacing * scale);
  }

  // Advanced VFX 1: Realistic Neon Glass Tube & Phosphor Glow
  if (layer.vfx?.neonTube?.enabled) {
    renderRealisticNeonTube(ctx, layer, lines, startY, lineHeightPx, scale, currentTime);
  }

  // Advanced VFX 2: Texture Overlay clipped to Text / Layer
  if (layer.vfx?.texture?.enabled && layer.vfx.texture.applyToLayerOnly) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    renderTextureOverlay(ctx, layer.vfx.texture, textBlockW, textBlockH, currentTime);
    ctx.restore();
  }

  // Advanced VFX 3: Ice & Frozen Crystal Effects with Icicles
  if (layer.vfx?.ice?.enabled) {
    renderIceCrystalEffect(
      ctx,
      layer.vfx.ice,
      -textBlockW / 2,
      startY - lineHeightPx / 2,
      textBlockW,
      totalBlockHeight,
      scale,
      currentTime
    );
  }

  // Advanced VFX 4: Real Animated Fire Flames & Embers along baseline
  if (layer.vfx?.fire?.enabled) {
    renderRealFireEffect(
      ctx,
      layer.vfx.fire,
      -textBlockW / 2,
      startY + totalBlockHeight - lineHeightPx / 2,
      textBlockW,
      totalBlockHeight,
      scale,
      currentTime
    );
  }

  // Advanced VFX 5: RGB Chromatic Aberration Glitch Split
  if (layer.vfx?.glitch?.enabled) {
    const gState = computeGlitchState(currentTime, layer.vfx.glitch);
    if (gState.rgbSplitX > 0.5) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      // Red channel shifted left
      ctx.fillStyle = 'rgba(239, 68, 68, 0.65)';
      ctx.translate(-gState.rgbSplitX * scale, 0);
      renderTextLines(ctx, lines, startY, lineHeightPx, layer.letterSpacing * scale);
      // Cyan channel shifted right
      ctx.translate(gState.rgbSplitX * 2 * scale, 0);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.65)';
      renderTextLines(ctx, lines, startY, lineHeightPx, layer.letterSpacing * scale);
      ctx.restore();
    }
  }

  // Specular Glint sweep
  if (is3D && (layer.threeD.material === 'gold' || layer.threeD.material === 'chrome')) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glintGrad = ctx.createLinearGradient(-fontSize * 2, -fontSize, fontSize * 2, fontSize);
    const sweep = (currentTime * 0.4) % 1;
    glintGrad.addColorStop(Math.max(0, sweep - 0.1), 'rgba(255,255,255,0)');
    glintGrad.addColorStop(sweep, 'rgba(255,255,255,0.45)');
    glintGrad.addColorStop(Math.min(1, sweep + 0.1), 'rgba(255,255,255,0)');
    ctx.fillStyle = glintGrad;
    renderTextLines(ctx, lines, startY, lineHeightPx, layer.letterSpacing * scale);
    ctx.restore();
  }

  // Close Mask Reveal Clip
  if (isMaskRevealing) {
    ctx.restore();

    // Special Effect 5: Shimmer Reveal Light Beam Sweep
    if (state.maskRevealType === 'mask-reveal-shimmer' && revP > 0.01 && revP < 0.99) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const beamX = -textBlockW / 2 - 25 + (textBlockW + 50) * revP;
      const beamGrad = ctx.createLinearGradient(beamX - 35 * scale, 0, beamX + 35 * scale, 0);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      beamGrad.addColorStop(0.35, 'rgba(250, 204, 21, 0.45)');
      beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
      beamGrad.addColorStop(0.65, 'rgba(250, 204, 21, 0.45)');
      beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(beamX - 35 * scale, -textBlockH / 2 - 35, 70 * scale, textBlockH + 70);
      ctx.restore();
    }
  }

  // Special Effect 3: Handwriting Calligraphy Pen Nib & Ink Sparkle
  if (state.isHandwriting && state.handwritingNib && (state.handwritingProgress ?? 1) < 1.0) {
    const lastLine = lines[lines.length - 1] || '';
    const lastLineW = ctx.measureText(lastLine).width + Math.max(0, lastLine.length - 1) * (layer.letterSpacing * scale);
    let tipX = 0;
    if (ctx.textAlign === 'center') {
      tipX = lastLineW / 2;
    } else if (ctx.textAlign === 'left') {
      tipX = lastLineW;
    } else {
      tipX = 0;
    }
    const tipY = startY + (lines.length - 1) * lineHeightPx;
    drawCalligraphyNib(ctx, tipX, tipY, scale, currentTime);
  }
}

// Helper to draw realistic Calligraphy Fountain Pen Nib and Golden Ink Sparkle
function drawCalligraphyNib(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
): void {
  ctx.save();
  ctx.translate(x, y);

  // Classic calligraphy nib 45-degree writing angle
  ctx.rotate(-Math.PI / 4);

  const nibLen = 30 * scale;
  const nibW = 12 * scale;

  // Nib body
  ctx.beginPath();
  ctx.moveTo(0, 0); // Contact point on writing surface
  ctx.lineTo(-nibW / 2, -nibLen * 0.7);
  ctx.lineTo(-nibW * 0.55, -nibLen);
  ctx.lineTo(nibW * 0.55, -nibLen);
  ctx.lineTo(nibW / 2, -nibLen * 0.7);
  ctx.closePath();

  const goldGrad = ctx.createLinearGradient(-nibW, -nibLen, nibW, 0);
  goldGrad.addColorStop(0, '#fef08a');
  goldGrad.addColorStop(0.5, '#eab308');
  goldGrad.addColorStop(1, '#a16207');
  ctx.fillStyle = goldGrad;
  ctx.fill();

  // Fine central ink slit
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1.2 * scale;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -nibLen * 0.65);
  ctx.stroke();

  // Breather hole
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.arc(0, -nibLen * 0.65, 1.8 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Golden ink sparkle glow at contact point
  ctx.globalCompositeOperation = 'lighter';
  const glowR = (5 + Math.sin(time * 14) * 2) * scale;
  const inkGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
  inkGlow.addColorStop(0, 'rgba(255, 240, 150, 0.95)');
  inkGlow.addColorStop(0.5, 'rgba(234, 179, 8, 0.5)');
  inkGlow.addColorStop(1, 'rgba(234, 179, 8, 0)');
  ctx.fillStyle = inkGlow;
  ctx.beginPath();
  ctx.arc(0, 0, glowR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Helper to render lines with optional letter spacing
function renderTextLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  startY: number,
  lineHeight: number,
  letterSpacing: number
): void {
  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;
    const text = lines[i];

    if (letterSpacing <= 0) {
      ctx.fillText(text, 0, y);
    } else {
      // Draw character by character for kerning / spacing
      drawTextWithSpacing(ctx, text, y, letterSpacing, 'fill');
    }
  }
}

function renderTextStrokeLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  startY: number,
  lineHeight: number,
  letterSpacing: number
): void {
  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;
    const text = lines[i];

    if (letterSpacing <= 0) {
      ctx.strokeText(text, 0, y);
    } else {
      drawTextWithSpacing(ctx, text, y, letterSpacing, 'stroke');
    }
  }
}

function drawTextWithSpacing(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  spacing: number,
  mode: 'fill' | 'stroke'
): void {
  const chars = Array.from(text);
  const totalWidth = chars.reduce((sum, ch) => sum + ctx.measureText(ch).width + spacing, -spacing);

  let curX = 0;
  if (ctx.textAlign === 'center') {
    curX = -totalWidth / 2;
  } else if (ctx.textAlign === 'right') {
    curX = -totalWidth;
  }

  const origAlign = ctx.textAlign;
  ctx.textAlign = 'left';

  for (const ch of chars) {
    const chWidth = ctx.measureText(ch).width;
    if (mode === 'fill') {
      ctx.fillText(ch, curX, y);
    } else {
      ctx.strokeText(ch, curX, y);
    }
    curX += chWidth + spacing;
  }

  ctx.textAlign = origAlign;
}

// Draw checkerboard for transparent canvas preview
function drawCheckerboard(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const size = 16;
  ctx.save();
  ctx.fillStyle = '#1e1e24';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#2b2b36';
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
        ctx.fillRect(x, y, size, size);
      }
    }
  }
  ctx.restore();
}

// Draw Broadcast Safe Areas (Action Safe 90%, Title Safe 80%)
function drawSafeAreas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save();

  // 90% Action Safe
  const asX = width * 0.05;
  const asY = height * 0.05;
  const asW = width * 0.9;
  const asH = height * 0.9;

  ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(asX, asY, asW, asH);

  // 80% Title Safe
  const tsX = width * 0.1;
  const tsY = height * 0.1;
  const tsW = width * 0.8;
  const tsH = height * 0.8;

  ctx.strokeStyle = 'rgba(234, 179, 8, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(tsX, tsY, tsW, tsH);

  // Center crosshair
  const cx = width / 2;
  const cy = height / 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(cx - 15, cy);
  ctx.lineTo(cx + 15, cy);
  ctx.moveTo(cx, cy - 15);
  ctx.lineTo(cx, cy + 15);
  ctx.stroke();

  // Labels
  ctx.font = '10px sans-serif';
  ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
  ctx.fillText('ACTION SAFE 90%', asX + 8, asY + 16);
  ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
  ctx.fillText('TITLE SAFE 80%', tsX + 8, tsY + 16);

  ctx.restore();
}

// Draw selection box with handles for currently selected layer
function drawSelectionBox(
  ctx: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
  layer: TextLayer,
  scale: number,
  state: LayerAnimatedState
): void {
  ctx.save();
  ctx.translate(anchorX, anchorY);
  ctx.rotate((state.rotZ * Math.PI) / 180);

  let boxW = 100 * scale;
  let boxH = 50 * scale;
  let left = -boxW / 2;
  let top = -boxH / 2;

  if (layer.type === 'shape') {
    boxW = (layer.shapeWidth ?? 400) * scale + 20 * scale;
    boxH = (layer.shapeHeight ?? 80) * scale + 20 * scale;
    left = -boxW / 2;
    top = -boxH / 2;
  } else if (layer.type === 'image') {
    boxW = (layer.imageWidth ?? 200) * scale + 20 * scale;
    boxH = (layer.imageHeight ?? 200) * scale + 20 * scale;
    left = -boxW / 2;
    top = -boxH / 2;
  } else {
    // Text layer
    const fontSize = layer.fontSize * scale;
    const lines = (state.textToRender || layer.text || '').split('\n');
    const lineHeightPx = fontSize * layer.lineHeight;

    let maxLineWidth = 0;
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      if (w > maxLineWidth) maxLineWidth = w;
    }

    boxW = maxLineWidth + 30 * scale;
    boxH = Math.max(lines.length * lineHeightPx + 20 * scale, 30 * scale);

    left = -boxW / 2;
    if (layer.textAlign === 'left') left = -15 * scale;
    if (layer.textAlign === 'right') left = -boxW + 15 * scale;
    top = -boxH / 2;
  }

  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(left, top, boxW, boxH);

  // Draw corner drag handles
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);

  const handleRadius = 4;
  const corners = [
    [left, top],
    [left + boxW, top],
    [left, top + boxH],
    [left + boxW, top + boxH],
    [left + boxW / 2, top - 18], // Top rotate handle
  ];

  for (const [hx, hy] of corners) {
    ctx.beginPath();
    ctx.arc(hx, hy, handleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
