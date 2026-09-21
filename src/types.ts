export type ResolutionPreset = '4k' | '2k' | '1080p' | '720p' | '9:16' | '1:1' | '21:9' | 'tablet' | 'custom';

export interface Resolution {
  id: ResolutionPreset;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export type ExportFormat = 'webm-alpha' | 'mp4' | 'mov-alpha' | 'png-sequence' | 'jpeg-sequence' | 'gif' | 'png-frame';

export type MaterialType = 'matte' | 'metal' | 'chrome' | 'gold' | 'neon' | 'glass' | 'synthwave';

export type AnimationInType =
  | 'none'
  | 'fade'
  | 'zoom-in'
  | 'zoom-3d'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'flip-3d-x'
  | 'flip-3d-y'
  | 'spin-3d'
  | 'pop-bounce'
  | 'typewriter'
  | 'handwriting'
  | 'mask-reveal-wipe'
  | 'mask-reveal-curtain'
  | 'mask-reveal-radial'
  | 'mask-reveal-shimmer'
  | 'glitch-split'
  | 'drop-bounce'
  | 'blur-focus';

export type AnimationLoopType =
  | 'none'
  | 'float-gentle'
  | 'breathe-3d'
  | 'pulse-glow'
  | 'wobble-3d'
  | 'continuous-rotate'
  | 'shimmer-light'
  | 'glitch-flicker';

export type AnimationOutType =
  | 'none'
  | 'fade'
  | 'zoom-out'
  | 'zoom-out-3d'
  | 'slide-down'
  | 'slide-up'
  | 'slide-left'
  | 'slide-right'
  | 'spin-out-3d'
  | 'shatter-sink'
  | 'blur-dissolve'
  | 'erase-backspace'
  | 'letter-fade-out';

export interface Text3DSettings {
  enabled: boolean;
  depth: number; // 0 to 100
  angle: number; // -180 to 180 degrees (extrusion direction)
  bevelSize: number; // 0 to 15
  bevelColor: string;
  rotX: number; // -90 to 90 degrees (tilt)
  rotY: number; // -90 to 90 degrees (pan)
  rotZ: number; // -180 to 180 degrees (roll)
  perspective: number; // 200 to 2500 (focal distance)
  true3DPerspective?: boolean; // True 3D perspective projection with vanishing point
  material: MaterialType;
  lightAngle: number; // 0 to 360
  lightIntensity: number; // 0 to 2
  ambientLight: number; // 0 to 1
  shadowDepth: number; // 0 to 50
  specular: number; // 0 to 1
}

export interface TextAnimationSettings {
  inType: AnimationInType;
  inDuration: number; // in seconds (e.g. 1.0)
  inDelay: number;
  inEasing: 'easeOutQuad' | 'easeOutCubic' | 'easeOutBack' | 'easeOutElastic' | 'easeInOutCubic';

  loopType: AnimationLoopType;
  loopIntensity: number; // 0.1 to 2.0

  outType: AnimationOutType;
  outDuration: number; // in seconds
  outDelay: number; // when before the end does out-animation start
  outEasing: 'easeInQuad' | 'easeInCubic' | 'easeInBack' | 'easeInOutCubic';

  // Special Text Effect Customizations
  typewriterSound?: boolean;
  typewriterVolume?: number; // 0 to 1
  typewriterCursor?: 'bar' | 'block' | 'underscore' | 'none';
  handwritingNib?: boolean; // Show calligraphy pen nib / gold sparkle
  maskRevealDirection?: 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'radial-center' | 'curtain';
  maskRevealFeather?: number; // Softness in px
}

export type LayerType = 'text' | 'shape' | 'image';

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow' | 'badge' | 'diamond';

export interface Keyframe {
  id: string;
  time: number; // In seconds (0 to project.duration)
  easing?: 'linear' | 'easeOutQuad' | 'easeInOutCubic' | 'easeOutBack';
  properties: {
    x?: number; // 0 to 100 percentage
    y?: number; // 0 to 100 percentage
    scale?: number; // 1 = 100%
    opacity?: number; // 0 to 1
    rotX?: number; // degrees
    rotY?: number; // degrees
    rotZ?: number; // degrees
    depth?: number; // 3D depth in px
  };
}

export interface VisualEffectsSettings {
  // 1. Lens Flare & Light Effects
  lensFlare: {
    enabled: boolean;
    type: 'cinematic-anamorphic' | 'solar-rays' | 'warm-spotlight' | 'starburst' | 'chromatic-ring';
    intensity: number;
    color: string;
    streakWidth: number;
    followLayer: boolean;
    posX?: number;
    posY?: number;
  };

  // 2. Smoke, Fog & Atmospheric Effects
  atmosphere: {
    enabled: boolean;
    type: 'smoke' | 'mystic-fog' | 'ember-particles' | 'dust-motes' | 'cinematic-haze';
    density: number;
    speed: number;
    color: string;
    opacity: number;
  };

  // 3. Textures & Overlays
  texture: {
    enabled: boolean;
    type: 'paper-grunge' | 'brushed-metal' | 'wood-grain' | 'carbon-fiber' | 'film-grain-35mm' | 'crt-scanlines';
    blendMode: 'overlay' | 'multiply' | 'screen' | 'soft-light' | 'color-dodge';
    scale: number;
    opacity: number;
    applyToLayerOnly: boolean;
  };

  // 4. Distortion Effects (Water ripple, refraction, wave)
  distortion: {
    enabled: boolean;
    type: 'water-ripple' | 'refraction-glass' | 'sine-wave' | 'heat-haze';
    speed: number;
    amplitude: number;
    frequency: number;
  };

  // 5. Advanced Glitch
  glitch: {
    enabled: boolean;
    type: 'rgb-split' | 'digital-slice' | 'scanline-jitter' | 'cyber-chaos';
    intensity: number;
    frequency: number;
    colorSplit: number;
  };

  // 6. Fire Effect (Llamas animadas)
  fire: {
    enabled: boolean;
    intensity: number;
    flameHeight: number;
    smokeTrails: boolean;
    embers: boolean;
    wind: number;
  };

  // 7. Ice & Crystal Effect (Texto congelado con reflejos prismáticos)
  ice: {
    enabled: boolean;
    icicles: boolean;
    frostCrackles: boolean;
    frostTint: string;
    prismReflect: number;
  };

  // 8. Realistic Neon with Tube (Tubo físico de gas + fósforo + parpadeo)
  neonTube: {
    enabled: boolean;
    tubeColor: string;
    glowColor: string;
    tubeWidth: number;
    flicker: boolean;
    mountBrackets: boolean;
  };
}

export function getDefaultVisualEffects(): VisualEffectsSettings {
  return {
    lensFlare: {
      enabled: false,
      type: 'cinematic-anamorphic',
      intensity: 1.0,
      color: '#38bdf8',
      streakWidth: 850,
      followLayer: true,
      posX: 50,
      posY: 50,
    },
    atmosphere: {
      enabled: false,
      type: 'smoke',
      density: 1.0,
      speed: 1.0,
      color: '#94a3b8',
      opacity: 0.5,
    },
    texture: {
      enabled: false,
      type: 'paper-grunge',
      blendMode: 'overlay',
      scale: 1.0,
      opacity: 0.65,
      applyToLayerOnly: true,
    },
    distortion: {
      enabled: false,
      type: 'water-ripple',
      speed: 1.0,
      amplitude: 6,
      frequency: 4,
    },
    glitch: {
      enabled: false,
      type: 'rgb-split',
      intensity: 45,
      frequency: 4,
      colorSplit: 8,
    },
    fire: {
      enabled: false,
      intensity: 1.0,
      flameHeight: 38,
      smokeTrails: true,
      embers: true,
      wind: 0,
    },
    ice: {
      enabled: false,
      icicles: true,
      frostCrackles: true,
      frostTint: '#a5f3fc',
      prismReflect: 0.8,
    },
    neonTube: {
      enabled: false,
      tubeColor: '#ffffff',
      glowColor: '#ec4899',
      tubeWidth: 3.5,
      flicker: true,
      mountBrackets: true,
    },
  };
}

export interface LayerMaskSettings {
  enabled: boolean;
  type: 'none' | 'linear-wipe' | 'rectangle' | 'circle';
  x: number; // normalized center/start percentage 0-100
  y: number; // normalized center/start percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  feather: number; // soft blur px
  progress: number; // 0 to 100% for animated wipe reveals
  invert: boolean;
}

// ----------------------------------------------------
// ADVANCED PARTICLE SYSTEMS
// ----------------------------------------------------
export type ParticleEmitterType =
  | 'text-outline'
  | 'point-center'
  | 'bounding-box'
  | 'ring'
  | 'bottom-fountain'
  | 'top-rain';

export type ParticleShapeType = 'circle' | 'star' | 'diamond' | 'spark';

export type ExplosionFragmentStyle =
  | 'geometric-shards'
  | 'glass-splinters'
  | 'fire-debris'
  | 'voxel-cubes';

export type ConfettiPalette = 'festive' | 'gold-silver' | 'neon' | 'pastel' | 'cyberpunk';
export type ConfettiShape = 'mixed' | 'rectangles' | 'ribbons' | 'circles' | 'stars';

export type TrailType =
  | 'comet-orbit'
  | 'motion-ghost'
  | 'sparkle-ribbon'
  | 'plasma-stream'
  | 'laser-contour';

export type MagicTheme =
  | 'arcane-runes'
  | 'celestial-stars'
  | 'alchemical-glyphs'
  | 'sakura-petals'
  | 'cyber-hex';

export interface AdvancedParticlesSettings {
  // 1. Sistema de partículas complejo (Emisores, Fuerzas y Colisiones)
  system: {
    enabled: boolean;
    emitterType: ParticleEmitterType;
    rate: number; // partículas por segundo (10 a 300)
    lifetime: number; // segundos (0.5 a 5s)
    speed: number; // velocidad de eyección inicial px/s
    size: number; // tamaño en px (1 a 25)
    shape: ParticleShapeType;
    color: string;
    secondaryColor: string;
    blendMode: 'screen' | 'lighter' | 'source-over';
    // Fuerzas
    gravity: number; // px/s^2 (-500 a 500)
    wind: number; // px/s (-300 a 300)
    turbulence: number; // 0 a 100
    vortexSpeed: number; // -10 a 10 rad/s
    // Colisiones
    collisionFloor: boolean;
    floorHeightPercent: number; // 50 a 100%
    bounceElasticity: number; // 0.1 a 0.9
  };

  // 2. Efecto de Explosión (Fragmentos, Debris y Shockwave)
  explosion: {
    enabled: boolean;
    triggerTime: number; // segundo en el que explota (0 a duración)
    loop: boolean;
    loopInterval: number; // segundos entre explosiones si loop está activo
    fragmentCount: number; // 15 a 120 trozos
    explosionForce: number; // 50 a 500 px/s
    fragmentSize: number; // 3 a 25 px
    fragmentStyle: ExplosionFragmentStyle;
    shockwave: boolean;
    debrisSmoke: boolean;
    gravity: number; // caída de fragmentos tras estallar
    color: string;
    secondaryColor: string;
  };

  // 3. Lluvia de Confeti (Física realista 3D con bamboleo y resistencia aerodinámica)
  confetti: {
    enabled: boolean;
    density: number; // 20 a 250 piezas
    speed: number; // 40 a 300 px/s
    flutterSpeed: number; // 1 a 8 rotación 3D
    airResistance: number; // 0 a 0.8 drag
    windDrift: number; // -100 a 100 px/s
    shapes: ConfettiShape;
    palette: ConfettiPalette;
    floorBounce: boolean;
  };

  // 4. Estelas y Trails (Rastros de luz siguiendo el texto o en órbita)
  trails: {
    enabled: boolean;
    type: TrailType;
    trailLength: number; // 5 a 60
    trailWidth: number; // 1 a 20 px
    glowColor: string;
    speed: number; // 0.5 a 4x
    sparkles: boolean;
    sparkleIntensity: number; // 0 a 100
  };

  // 5. Efectos de Magia (Destellos, chispas y runas místicas)
  magic: {
    enabled: boolean;
    theme: MagicTheme;
    intensity: number; // 0.2 a 2.5
    orbitRadius: number; // 30 a 250 px
    orbitSpeed: number; // 0.2 a 3 rad/s
    runeCount: number; // 3 a 12
    sparkleCount: number; // 10 a 80
    auraGlow: boolean;
    color: string;
    secondaryColor: string;
  };
}

export function getDefaultAdvancedParticles(): AdvancedParticlesSettings {
  return {
    system: {
      enabled: false,
      emitterType: 'text-outline',
      rate: 80,
      lifetime: 2.2,
      speed: 70,
      size: 4,
      shape: 'circle',
      color: '#38bdf8',
      secondaryColor: '#ec4899',
      blendMode: 'screen',
      gravity: 90,
      wind: 0,
      turbulence: 25,
      vortexSpeed: 0,
      collisionFloor: false,
      floorHeightPercent: 92,
      bounceElasticity: 0.65,
    },
    explosion: {
      enabled: false,
      triggerTime: 1.2,
      loop: false,
      loopInterval: 3.5,
      fragmentCount: 50,
      explosionForce: 220,
      fragmentSize: 8,
      fragmentStyle: 'geometric-shards',
      shockwave: true,
      debrisSmoke: true,
      gravity: 180,
      color: '#f97316',
      secondaryColor: '#facc15',
    },
    confetti: {
      enabled: false,
      density: 90,
      speed: 130,
      flutterSpeed: 3.8,
      airResistance: 0.35,
      windDrift: 15,
      shapes: 'mixed',
      palette: 'festive',
      floorBounce: true,
    },
    trails: {
      enabled: false,
      type: 'comet-orbit',
      trailLength: 28,
      trailWidth: 4,
      glowColor: '#38bdf8',
      speed: 1.6,
      sparkles: true,
      sparkleIntensity: 60,
    },
    magic: {
      enabled: false,
      theme: 'arcane-runes',
      intensity: 1.0,
      orbitRadius: 110,
      orbitSpeed: 1.2,
      runeCount: 6,
      sparkleCount: 35,
      auraGlow: true,
      color: '#a855f7',
      secondaryColor: '#38bdf8',
    },
  };
}

export interface TextLayer {
  id: string;
  name: string;
  type?: LayerType; // 'text' | 'shape' | 'image' (defaults to 'text')

  // Text specific
  text: string;
  fontSize: number; // in relative units / px for 1080p
  fontFamily: string;
  fontWeight: string | number;
  fontStyle: 'normal' | 'italic';
  letterSpacing: number; // px
  lineHeight: number; // multiplier
  textAlign: 'left' | 'center' | 'right';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';

  // Shape specific (when type === 'shape')
  shapeType?: ShapeType;
  shapeWidth?: number; // px at 1080p scale
  shapeHeight?: number;
  cornerRadius?: number;

  // Image / Logo specific (when type === 'image')
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;

  // Common Transform & Layout
  x: number; // 0 to 100 (percentage of canvas width)
  y: number; // 0 to 100 (percentage of canvas height)
  scale?: number; // 1 = 100%

  // Fill
  fillType: 'solid' | 'gradient' | 'animated-gradient';
  fillColor: string;
  gradientColors: [string, string];
  gradientAngle: number;
  animatedGradient?: AnimatedGradientSettings;

  // Stroke / Outline
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;

  // 3D Extrusion Engine
  threeD: Text3DSettings;

  // Shadow / Glow
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;

  glowEnabled: boolean;
  glowColor: string;
  glowBlur: number;

  // Mask & Clipping
  mask?: LayerMaskSettings;

  // Animation (Phase-based)
  animation: TextAnimationSettings;

  // Advanced Keyframe Timeline Animation
  keyframes?: Keyframe[];
  useKeyframes?: boolean;

  // Advanced Visual Effects (VFX)
  vfx?: VisualEffectsSettings;

  // Advanced Particle Systems
  particles?: AdvancedParticlesSettings;

  // Camera, 3D Parallax & Title Transitions
  parallaxDepth?: number; // -100 (far background) to +100 (foreground), 0 is focal plane
  sequenceStartTime?: number;
  sequenceEndTime?: number;
  transitionIn?: TitleTransitionType;
  transitionOut?: TitleTransitionType;

  // Visibility & State
  visible: boolean;
  locked: boolean;
  opacity: number; // 0 to 1
}

export type BackgroundType = 'transparent' | 'chroma-green' | 'chroma-blue' | 'color' | 'gradient' | 'video' | 'image';

export interface BackgroundSettings {
  type: BackgroundType;
  color: string;
  gradient: {
    from: string;
    to: string;
    angle: number;
  };
  mediaUrl?: string;
  mediaType?: 'video' | 'image';
  mediaOpacity: number;
  checkerboardInPreview: boolean;
}

// ----------------------------------------------------
// CAMERA & MOTION CONTROL TYPES
// ----------------------------------------------------
export type CameraMovementPreset =
  | 'static'
  | 'slow-push-in'
  | 'dolly-out'
  | 'pan-left-to-right'
  | 'pan-right-to-left'
  | 'orbit-arc'
  | 'crane-up'
  | 'dolly-zoom-vertigo'
  | 'handheld-float'
  | 'custom';

export type ParallaxMode = 'mouse' | 'camera' | 'auto-sway' | 'combined';

export type CameraShakeType =
  | 'handheld'
  | 'earthquake'
  | 'impact'
  | 'rumble'
  | 'micro-jitter'
  | 'chaos-glitch';

export type TitleTransitionType =
  | 'none'
  | 'fade'
  | 'crossfade'
  | 'dip-to-black'
  | 'dip-to-white'
  | 'wipe-horizontal'
  | 'wipe-radial'
  | 'wipe-iris'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'morph-particles'
  | 'zoom-swish'
  | 'glitch-slice'
  | '3d-cube-flip';

export interface CameraShakeSettings {
  enabled: boolean;
  type: CameraShakeType;
  intensity: number; // 0 to 80 px amplitude
  frequency: number; // 1 to 30 Hz
  rotational: boolean;
  rotationIntensity: number; // 0 to 15 degrees
  mode: 'continuous' | 'impact-burst';
  triggerTime: number; // in seconds
  decayTime: number; // in seconds (e.g. 0.8s)
}

export interface ParallaxSettings {
  enabled: boolean;
  mode: ParallaxMode;
  intensity: number; // 0% to 200% (default 100%)
  smoothing: number; // 0 to 1
  depthScale: number; // multiplier (e.g. 1.0)
  autoSwaySpeed: number; // 0.2 to 3.0
  autoSwayAmount: number; // 0 to 40 px
}

export interface TitleTransitionSettings {
  enabled: boolean;
  type: TitleTransitionType;
  duration: number; // 0.2s to 3.0s
  easing: 'easeInOutCubic' | 'easeOutExpo' | 'easeInOutQuad' | 'linear';
  timingMode: 'auto-sequence' | 'layer-bounds' | 'custom-intervals';
  intervalDuration?: number; // e.g. 2.5s per title
  color?: string; // for dip / wipe
  blurStrength?: number; // for zoom-swish / slide
}

export interface CameraSettings {
  enabled: boolean;
  zoom: number; // 0.2 to 3.0 (default 1.0)
  panX: number; // -100 to 100 (% of canvas)
  panY: number; // -100 to 100 (% of canvas)
  rotation: number; // -180 to 180 (degrees)
  movementPreset: CameraMovementPreset;
  movementSpeed: number; // 0.2 to 3.0
  movementRange: number; // 0.1 to 2.5

  parallax: ParallaxSettings;
  shake: CameraShakeSettings;
  transitions: TitleTransitionSettings;
}

export function getDefaultCameraSettings(): CameraSettings {
  return {
    enabled: false,
    zoom: 1.0,
    panX: 0,
    panY: 0,
    rotation: 0,
    movementPreset: 'static',
    movementSpeed: 1.0,
    movementRange: 1.0,
    parallax: {
      enabled: false,
      mode: 'combined',
      intensity: 100,
      smoothing: 0.8,
      depthScale: 1.0,
      autoSwaySpeed: 1.0,
      autoSwayAmount: 18,
    },
    shake: {
      enabled: false,
      type: 'handheld',
      intensity: 15,
      frequency: 8,
      rotational: true,
      rotationIntensity: 1.5,
      mode: 'continuous',
      triggerTime: 1.0,
      decayTime: 0.8,
    },
    transitions: {
      enabled: false,
      type: 'fade',
      duration: 0.8,
      easing: 'easeInOutCubic',
      timingMode: 'auto-sequence',
      intervalDuration: 2.5,
      color: '#000000',
      blurStrength: 8,
    },
  };
}

// ----------------------------------------------------
// COLOR GRADING, LUTS, GRADIENTS & VIGNETTE TYPES
// ----------------------------------------------------
export type LutPreset =
  | 'none'
  | 'teal-orange'
  | 'bleach-bypass'
  | 'vintage-film'
  | 'noir-bw'
  | 'cyber-neon'
  | 'golden-hour'
  | 'sci-fi-matrix'
  | 'western-warm'
  | 'pastel-soft'
  | 'horror-cold';

export type VignetteShape = 'ellipse' | 'circle' | 'rectangle';

export type GradientStyle = 'linear' | 'radial' | 'conic' | 'wave';

export interface AnimatedGradientSettings {
  enabled: boolean;
  colors: string[]; // 2 to 5 hex colors
  style: GradientStyle;
  speed: number; // 0.2 to 4.0
  angle: number; // initial angle 0-360
  rotateWithTime: boolean; // continuous 360 degree spin
  pulseIntensity: number; // 0 to 1
  blendMode: 'normal' | 'overlay' | 'screen' | 'soft-light' | 'color-dodge';
  target: 'layer' | 'scene' | 'background';
  opacity: number; // 0 to 1
}

export interface ColorCorrectionSettings {
  brightness: number; // 50 to 150 (100 is normal)
  contrast: number; // 50 to 200 (100 is normal)
  saturation: number; // 0 to 250 (100 is normal)
  hueRotate: number; // -180 to 180 (0 is normal)
  temperature: number; // -100 (cold blue) to +100 (warm amber)
  tint: number; // -100 (green) to +100 (magenta)
  exposure: number; // -2.0 to +2.0 EV (0 is normal)
  shadows: number; // -50 to +50 (lift or crush darks)
  highlights: number; // -50 to +50 (soften or boost brights)
}

export interface VignetteSettings {
  enabled: boolean;
  shape: VignetteShape;
  posX: number; // 0 to 100 (%)
  posY: number; // 0 to 100 (%)
  radius: number; // 10 to 150 (%)
  feather: number; // 0 to 100 (%)
  roundness: number; // 0 to 100 (%) (for rectangle squircle)
  intensity: number; // 0 to 100 (%)
  color: string; // hex (default '#000000')
  blendMode: 'multiply' | 'normal' | 'soft-light' | 'overlay' | 'screen';
}

export interface ColorGradingSettings {
  enabled: boolean;
  correction: ColorCorrectionSettings;
  lut: {
    preset: LutPreset;
    intensity: number; // 0 to 100 (%)
  };
  animatedGradient: AnimatedGradientSettings;
  vignette: VignetteSettings;
}

export function getDefaultColorGradingSettings(): ColorGradingSettings {
  return {
    enabled: false,
    correction: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hueRotate: 0,
      temperature: 0,
      tint: 0,
      exposure: 0,
      shadows: 0,
      highlights: 0,
    },
    lut: {
      preset: 'none',
      intensity: 100,
    },
    animatedGradient: {
      enabled: false,
      colors: ['#ff007f', '#7928ca', '#00f0ff'],
      style: 'linear',
      speed: 1.0,
      angle: 45,
      rotateWithTime: true,
      pulseIntensity: 0.35,
      blendMode: 'overlay',
      target: 'scene',
      opacity: 0.5,
    },
    vignette: {
      enabled: false,
      shape: 'ellipse',
      posX: 50,
      posY: 50,
      radius: 75,
      feather: 60,
      roundness: 30,
      intensity: 70,
      color: '#000000',
      blendMode: 'multiply',
    },
  };
}

export interface WatermarkSettings {
  enabled: boolean;
  type: 'text' | 'image';
  text: string;
  imageUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'mosaic';
  opacity: number; // 0.1 to 1
  scale: number; // 0.2 to 2
  color: string;
  fontSize: number;
}

export interface VideoMetadataSettings {
  title: string;
  author: string;
  description: string;
  copyright: string;
  year: number;
}

export interface UserPreset {
  id: string;
  name: string;
  description: string;
  author: string;
  createdAt: string;
  tags?: string[];
  thumbnailGradient?: string;
  duration: number;
  background: BackgroundSettings;
  layers: Omit<TextLayer, 'id'>[];
  camera?: CameraSettings;
  colorGrading?: ColorGradingSettings;
}

export interface BatchExportVariation {
  id: string;
  name: string;
  format: ExportFormat;
  resolution: Resolution;
  fps: number;
  textOverride?: string;
  enabled: boolean;
}

export function getDefaultWatermarkSettings(): WatermarkSettings {
  return {
    enabled: false,
    type: 'text',
    text: '© CINETITLE 3D STUDIO',
    position: 'bottom-right',
    opacity: 0.7,
    scale: 1,
    color: '#ffffff',
    fontSize: 22,
  };
}

export function getDefaultVideoMetadataSettings(): VideoMetadataSettings {
  return {
    title: 'Mi Título Cinemático 3D',
    author: 'CineTitle Studio Creator',
    description: 'Animación de título 3D para cine, televisión y redes sociales.',
    copyright: `© ${new Date().getFullYear()} Todos los derechos reservados`,
    year: new Date().getFullYear(),
  };
}

export interface ProjectSettings {
  id: string;
  name: string;
  resolution: Resolution;
  customWidth?: number;
  customHeight?: number;
  duration: number; // 1 to 60 seconds
  fps: 24 | 30 | 60;
  background: BackgroundSettings;
  safeAreasEnabled: boolean;
  camera?: CameraSettings;
  colorGrading?: ColorGradingSettings;
  watermark?: WatermarkSettings;
  metadata?: VideoMetadataSettings;
  layers: TextLayer[];
}

export interface TitlePreset {
  id: string;
  name: string;
  category: 'Cinematic' | 'Cyberpunk' | 'Broadcast' | 'Luxury' | 'Retro' | 'Minimal';
  description: string;
  thumbnailColor: string;
  duration: number;
  background: BackgroundSettings;
  layers: Omit<TextLayer, 'id'>[];
  camera?: CameraSettings;
  colorGrading?: ColorGradingSettings;
}
