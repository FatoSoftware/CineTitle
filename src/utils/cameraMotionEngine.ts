import {
  CameraSettings,
  CameraMovementPreset,
  CameraShakeSettings,
  ParallaxSettings,
  TitleTransitionSettings,
  ProjectSettings,
  TextLayer,
  TitleTransitionType,
} from '../types';

export interface CameraState {
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
  shakeX: number;
  shakeY: number;
  shakeRot: number;
}

export interface LayerParallaxState {
  offsetX: number;
  offsetY: number;
  tiltX: number;
  tiltY: number;
  depthScale: number;
}

export interface LayerTransitionState {
  visible: boolean;
  opacity: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  rotY: number;
  clipRect?: { x: number; y: number; width: number; height: number };
  clipCircle?: { cx: number; cy: number; radius: number };
  flashColor?: string;
  flashAlpha?: number;
  morphAlpha?: number;
}

// Pseudo-harmonic smooth noise for natural cinema shake (no erratic jagged jumps)
function harmonicNoise(t: number, seed: number = 0): number {
  const s1 = Math.sin(t * 1.0 + seed);
  const s2 = Math.sin(t * 2.31 + seed * 1.7);
  const s3 = Math.sin(t * 4.73 + seed * 3.1);
  const s4 = Math.cos(t * 7.19 + seed * 4.9);
  return (s1 * 0.45 + s2 * 0.3 + s3 * 0.15 + s4 * 0.1);
}

/**
 * 1. COMPUTE MASTER CAMERA TRANSFORM & SHAKE
 */
export function computeCameraState(
  camera: CameraSettings | undefined,
  currentTime: number,
  duration: number,
  canvasWidth: number,
  canvasHeight: number
): CameraState {
  if (!camera || !camera.enabled) {
    return {
      zoom: 1.0,
      panX: 0,
      panY: 0,
      rotation: 0,
      shakeX: 0,
      shakeY: 0,
      shakeRot: 0,
    };
  }

  const dur = Math.max(0.1, duration);
  const progress = Math.max(0, Math.min(1, currentTime / dur));

  let zoom = camera.zoom ?? 1.0;
  let panX = ((camera.panX ?? 0) / 100) * canvasWidth;
  let panY = ((camera.panY ?? 0) / 100) * canvasHeight;
  let rotation = camera.rotation ?? 0;

  const range = camera.movementRange ?? 1.0;
  const speed = camera.movementSpeed ?? 1.0;
  const t = currentTime * speed;

  // Camera Dynamic Movement Presets
  switch (camera.movementPreset) {
    case 'slow-push-in': {
      // Smooth dolly in (zoom 1.0 -> 1.25)
      const ease = Math.sin((progress * Math.PI) / 2);
      zoom *= 1.0 + 0.25 * range * ease;
      break;
    }

    case 'dolly-out': {
      // Smooth dolly out (zoom 1.28 -> 1.0)
      const ease = 1 - Math.cos((progress * Math.PI) / 2);
      zoom *= 1.0 + 0.28 * range * (1 - ease);
      break;
    }

    case 'pan-left-to-right': {
      // Sweeps left to right
      const sweep = Math.sin(progress * Math.PI - Math.PI / 2) * 0.5 + 0.5;
      panX += (-0.12 + 0.24 * sweep) * canvasWidth * range;
      break;
    }

    case 'pan-right-to-left': {
      // Sweeps right to left
      const sweep = Math.sin(progress * Math.PI - Math.PI / 2) * 0.5 + 0.5;
      panX += (0.12 - 0.24 * sweep) * canvasWidth * range;
      break;
    }

    case 'orbit-arc': {
      // Arc orbit around center with subtle roll
      const angle = progress * Math.PI * 1.5;
      panX += Math.sin(angle) * 0.08 * canvasWidth * range;
      panY += Math.cos(angle * 0.5) * 0.04 * canvasHeight * range;
      rotation += Math.sin(angle) * 3.5 * range;
      zoom *= 1.0 + Math.sin(angle * 2) * 0.05 * range;
      break;
    }

    case 'crane-up': {
      // Vertical ascent like a studio crane
      const ease = Math.sin((progress * Math.PI) / 2);
      panY += (0.10 - 0.20 * ease) * canvasHeight * range;
      zoom *= 1.0 + 0.08 * range * ease;
      break;
    }

    case 'dolly-zoom-vertigo': {
      // Vertigo effect: camera pushes in while focal field compresses
      const vertigoProgress = Math.sin(progress * Math.PI);
      zoom *= 0.88 + 0.45 * range * vertigoProgress;
      panY += Math.sin(progress * Math.PI * 2) * 0.02 * canvasHeight * range;
      break;
    }

    case 'handheld-float': {
      // Organic floating cinema camera
      panX += harmonicNoise(t * 0.8, 12.4) * 18 * range;
      panY += harmonicNoise(t * 0.7, 48.9) * 14 * range;
      rotation += harmonicNoise(t * 0.5, 91.2) * 1.8 * range;
      zoom *= 1.0 + harmonicNoise(t * 0.4, 3.1) * 0.03 * range;
      break;
    }

    case 'static':
    case 'custom':
    default:
      break;
  }

  // ----------------------------------------------------
  // 4. CAMERA SHAKE ENGINE
  // ----------------------------------------------------
  let shakeX = 0;
  let shakeY = 0;
  let shakeRot = 0;

  const shake = camera.shake;
  if (shake && shake.enabled && shake.intensity > 0) {
    const intensity = shake.intensity;
    const freq = shake.frequency;

    let envelope = 1.0;

    if (shake.mode === 'impact-burst') {
      const dt = currentTime - shake.triggerTime;
      const decay = Math.max(0.1, shake.decayTime);
      if (dt >= 0 && dt <= decay * 2) {
        envelope = Math.exp(-dt * (4.2 / decay));
      } else {
        envelope = 0;
      }
    }

    if (envelope > 0.001) {
      const timeSample = currentTime * freq * Math.PI * 2;

      switch (shake.type) {
        case 'earthquake': {
          // Low-frequency intense horizontal and vertical rumble
          const n1 = harmonicNoise(timeSample * 0.4, 5.0);
          const n2 = harmonicNoise(timeSample * 0.5, 15.0);
          shakeX = n1 * intensity * envelope * 1.5;
          shakeY = n2 * intensity * envelope * 0.8;
          if (shake.rotational) {
            shakeRot = harmonicNoise(timeSample * 0.35, 25.0) * (shake.rotationIntensity ?? 3) * envelope;
          }
          break;
        }

        case 'handheld': {
          // Documental organic handheld camera micro-tremor
          shakeX = harmonicNoise(timeSample * 0.7, 10.0) * intensity * 0.5 * envelope;
          shakeY = harmonicNoise(timeSample * 0.85, 20.0) * intensity * 0.4 * envelope;
          if (shake.rotational) {
            shakeRot = harmonicNoise(timeSample * 0.6, 30.0) * (shake.rotationIntensity ?? 1.5) * envelope;
          }
          break;
        }

        case 'impact': {
          // High-velocity sharp shockwave burst
          const pulse = Math.sin(timeSample * 1.5) * Math.cos(timeSample * 0.8);
          shakeX = pulse * intensity * envelope;
          shakeY = -Math.abs(pulse) * intensity * 0.85 * envelope;
          if (shake.rotational) {
            shakeRot = Math.sin(timeSample * 2.0) * (shake.rotationIntensity ?? 4.0) * envelope;
          }
          break;
        }

        case 'rumble': {
          // Continuous high-pitch engine / sub-bass vibration
          shakeX = Math.sin(timeSample * 1.2) * (intensity * 0.45) * envelope;
          shakeY = Math.cos(timeSample * 1.6) * (intensity * 0.55) * envelope;
          break;
        }

        case 'micro-jitter': {
          // Tension micro-jitter
          shakeX = (Math.sin(timeSample * 2.5) + Math.sin(timeSample * 4.1)) * (intensity * 0.25) * envelope;
          shakeY = (Math.cos(timeSample * 2.9) + Math.cos(timeSample * 5.3)) * (intensity * 0.25) * envelope;
          break;
        }

        case 'chaos-glitch': {
          // Violent digital / mechanical snaps
          const step = Math.floor(currentTime * freq);
          const pseudoRand1 = Math.sin(step * 938.1) * 2 - 1;
          const pseudoRand2 = Math.cos(step * 451.7) * 2 - 1;
          shakeX = pseudoRand1 * intensity * envelope;
          shakeY = pseudoRand2 * intensity * 0.7 * envelope;
          if (shake.rotational) {
            shakeRot = (pseudoRand1 - pseudoRand2) * (shake.rotationIntensity ?? 5.0) * envelope;
          }
          break;
        }
      }
    }
  }

  return {
    zoom,
    panX,
    panY,
    rotation,
    shakeX,
    shakeY,
    shakeRot,
  };
}

/**
 * 2. COMPUTE 3D PARALLAX DEPTH EFFECT FOR A LAYER
 */
export function computeLayerParallax(
  layer: TextLayer,
  camera: CameraSettings | undefined,
  mousePos: { x: number; y: number } | undefined,
  cameraState: CameraState,
  currentTime: number,
  canvasWidth: number,
  canvasHeight: number
): LayerParallaxState {
  if (!camera || !camera.parallax || !camera.parallax.enabled) {
    return { offsetX: 0, offsetY: 0, tiltX: 0, tiltY: 0, depthScale: 1.0 };
  }

  const parallax = camera.parallax;
  const depth = layer.parallaxDepth ?? 0; // -100 to +100
  if (depth === 0) {
    return { offsetX: 0, offsetY: 0, tiltX: 0, tiltY: 0, depthScale: 1.0 };
  }

  const normDepth = depth / 100; // -1.0 (far background) to +1.0 (foreground)
  const intensity = (parallax.intensity / 100) * (parallax.depthScale ?? 1.0);

  let offsetX = 0;
  let offsetY = 0;
  let tiltX = 0;
  let tiltY = 0;

  // A. Interactive Mouse Parallax
  if (
    (parallax.mode === 'mouse' || parallax.mode === 'combined') &&
    mousePos &&
    (mousePos.x !== 0 || mousePos.y !== 0)
  ) {
    // Mouse coords are normalized -1.0 to 1.0
    const mMaxPx = 60 * intensity * normDepth;
    offsetX += mousePos.x * mMaxPx;
    offsetY += mousePos.y * (mMaxPx * 0.75);

    // Dynamic 3D tilt perspective from cursor
    tiltX += -mousePos.y * 8.0 * intensity * normDepth;
    tiltY += mousePos.x * 10.0 * intensity * normDepth;
  }

  // B. Auto-Sway Parallax (Harmonic gentle 3D pendulum)
  if (parallax.mode === 'auto-sway' || parallax.mode === 'combined') {
    const swaySpeed = parallax.autoSwaySpeed ?? 1.0;
    const swayAmount = (parallax.autoSwayAmount ?? 18) * intensity * normDepth;
    const t = currentTime * swaySpeed;

    offsetX += Math.sin(t * 1.1) * swayAmount;
    offsetY += Math.cos(t * 0.85) * (swayAmount * 0.6);
    tiltY += Math.sin(t * 1.1) * 3.5 * normDepth;
    tiltX += Math.cos(t * 0.85) * 2.5 * normDepth;
  }

  // C. Camera Motion Parallax (foreground layers move faster than background)
  if (parallax.mode === 'camera' || parallax.mode === 'combined') {
    // Offset proportional to camera pan
    offsetX += (cameraState.panX * 0.35) * normDepth * intensity;
    offsetY += (cameraState.panY * 0.35) * normDepth * intensity;
  }

  // Perspective Depth Scale: Objects closer to camera (+depth) appear slightly larger
  const depthScale = 1.0 + normDepth * 0.12 * intensity;

  return {
    offsetX,
    offsetY,
    tiltX,
    tiltY,
    depthScale,
  };
}

/**
 * 3. COMPUTE TITLE TRANSITIONS (FADE, WIPE, SLIDE, MORPH, CUBE FLIP)
 */
export function computeLayerTransition(
  layer: TextLayer,
  project: ProjectSettings,
  currentTime: number,
  canvasWidth: number,
  canvasHeight: number
): LayerTransitionState {
  const defaultState: LayerTransitionState = {
    visible: true,
    opacity: 1,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    rotY: 0,
  };

  const transitions = project.camera?.transitions;
  if (!transitions || !transitions.enabled) {
    return defaultState;
  }

  // Check if project has multiple layers for sequencing
  const layers = project.layers;
  if (layers.length <= 1) {
    return defaultState;
  }

  const layerIndex = layers.findIndex((l) => l.id === layer.id);
  if (layerIndex === -1) return defaultState;

  const totalDuration = Math.max(1, project.duration);
  const transitionDuration = Math.min(
    transitions.duration ?? 0.8,
    totalDuration / (layers.length * 2)
  );

  // Determine time slot for this title layer
  let startTime = 0;
  let endTime = totalDuration;

  if (transitions.timingMode === 'auto-sequence') {
    const slotDuration = totalDuration / layers.length;
    startTime = layerIndex * slotDuration;
    endTime = (layerIndex + 1) * slotDuration;
  } else if (layer.sequenceStartTime !== undefined && layer.sequenceEndTime !== undefined) {
    startTime = layer.sequenceStartTime;
    endTime = layer.sequenceEndTime;
  } else {
    // If not sequenced, keep standard layer timing
    return defaultState;
  }

  // Extend slot slightly for seamless cross-transition overlap
  const leadIn = layerIndex > 0 ? transitionDuration : 0;
  const leadOut = layerIndex < layers.length - 1 ? transitionDuration : 0;

  const visibleStart = startTime - leadIn * 0.5;
  const visibleEnd = endTime + leadOut * 0.5;

  if (currentTime < visibleStart || currentTime > visibleEnd) {
    return {
      ...defaultState,
      visible: false,
      opacity: 0,
    };
  }

  // Check if we are in Entrance Transition
  const inTransitionTime = startTime;
  const isEntering = currentTime < inTransitionTime + transitionDuration && layerIndex > 0;

  // Check if we are in Exit Transition
  const outTransitionTime = endTime - transitionDuration;
  const isExiting = currentTime > outTransitionTime && layerIndex < layers.length - 1;

  const transitionType = layer.transitionIn || transitions.type || 'fade';

  // Compute easing function
  const applyEasing = (p: number): number => {
    switch (transitions.easing) {
      case 'easeOutExpo':
        return p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      case 'easeInOutQuad':
        return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      case 'linear':
        return p;
      case 'easeInOutCubic':
      default:
        return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    }
  };

  // 1. ENTRANCE TRANSITION
  if (isEntering) {
    const rawP = Math.max(0, Math.min(1, (currentTime - (inTransitionTime - leadIn * 0.5)) / (transitionDuration + leadIn * 0.5)));
    const p = applyEasing(rawP);

    switch (transitionType) {
      case 'fade':
      case 'crossfade':
        return {
          ...defaultState,
          opacity: p,
        };

      case 'dip-to-black':
      case 'dip-to-white': {
        const isWhite = transitionType === 'dip-to-white';
        const flashAlpha = (1 - p) * 0.85;
        return {
          ...defaultState,
          opacity: p,
          flashColor: isWhite ? '#ffffff' : '#000000',
          flashAlpha,
        };
      }

      case 'slide-left':
        return {
          ...defaultState,
          opacity: p,
          offsetX: (1 - p) * canvasWidth * 0.8,
        };

      case 'slide-right':
        return {
          ...defaultState,
          opacity: p,
          offsetX: -(1 - p) * canvasWidth * 0.8,
        };

      case 'slide-up':
        return {
          ...defaultState,
          opacity: p,
          offsetY: (1 - p) * canvasHeight * 0.7,
        };

      case 'slide-down':
        return {
          ...defaultState,
          opacity: p,
          offsetY: -(1 - p) * canvasHeight * 0.7,
        };

      case 'wipe-horizontal':
        return {
          ...defaultState,
          opacity: 1,
          clipRect: {
            x: 0,
            y: 0,
            width: p * canvasWidth,
            height: canvasHeight,
          },
        };

      case 'wipe-iris':
        return {
          ...defaultState,
          opacity: 1,
          clipCircle: {
            cx: canvasWidth / 2,
            cy: canvasHeight / 2,
            radius: p * (Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight) / 2),
          },
        };

      case 'morph-particles':
        return {
          ...defaultState,
          opacity: p,
          scale: 0.85 + 0.15 * p,
          morphAlpha: 1 - p,
        };

      case 'zoom-swish':
        return {
          ...defaultState,
          opacity: p,
          scale: 0.2 + 0.8 * p,
        };

      case 'glitch-slice': {
        const jitterX = Math.sin(currentTime * 45) * (1 - p) * 35;
        return {
          ...defaultState,
          opacity: p,
          offsetX: jitterX,
        };
      }

      case '3d-cube-flip':
        return {
          ...defaultState,
          opacity: p,
          rotY: (1 - p) * 90, // Enters rotating from 90° to 0°
          scale: 0.85 + 0.15 * p,
        };
    }
  }

  // 2. EXIT TRANSITION
  if (isExiting) {
    const rawP = Math.max(0, Math.min(1, (currentTime - outTransitionTime) / transitionDuration));
    const p = applyEasing(rawP);
    const exitType = layer.transitionOut || transitionType;

    switch (exitType) {
      case 'fade':
      case 'crossfade':
        return {
          ...defaultState,
          opacity: 1 - p,
        };

      case 'dip-to-black':
      case 'dip-to-white': {
        const isWhite = exitType === 'dip-to-white';
        const flashAlpha = p * 0.85;
        return {
          ...defaultState,
          opacity: 1 - p,
          flashColor: isWhite ? '#ffffff' : '#000000',
          flashAlpha,
        };
      }

      case 'slide-left':
        return {
          ...defaultState,
          opacity: 1 - p * 0.4,
          offsetX: -p * canvasWidth * 0.8,
        };

      case 'slide-right':
        return {
          ...defaultState,
          opacity: 1 - p * 0.4,
          offsetX: p * canvasWidth * 0.8,
        };

      case 'slide-up':
        return {
          ...defaultState,
          opacity: 1 - p * 0.4,
          offsetY: -p * canvasHeight * 0.7,
        };

      case 'slide-down':
        return {
          ...defaultState,
          opacity: 1 - p * 0.4,
          offsetY: p * canvasHeight * 0.7,
        };

      case 'wipe-horizontal':
        return {
          ...defaultState,
          opacity: 1,
          clipRect: {
            x: p * canvasWidth,
            y: 0,
            width: (1 - p) * canvasWidth,
            height: canvasHeight,
          },
        };

      case 'wipe-iris':
        return {
          ...defaultState,
          opacity: 1,
          clipCircle: {
            cx: canvasWidth / 2,
            cy: canvasHeight / 2,
            radius: (1 - p) * (Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight) / 2),
          },
        };

      case 'morph-particles':
        return {
          ...defaultState,
          opacity: 1 - p,
          scale: 1.0 + 0.2 * p,
          morphAlpha: p,
        };

      case 'zoom-swish':
        return {
          ...defaultState,
          opacity: 1 - p,
          scale: 1.0 + 1.2 * p, // Zooms past camera
        };

      case 'glitch-slice': {
        const jitterX = Math.sin(currentTime * 45) * p * 35;
        return {
          ...defaultState,
          opacity: 1 - p,
          offsetX: jitterX,
        };
      }

      case '3d-cube-flip':
        return {
          ...defaultState,
          opacity: 1 - p * 0.3,
          rotY: -p * 90, // Exits rotating from 0° to -90°
          scale: 1.0 - 0.15 * p,
        };
    }
  }

  return defaultState;
}
