import React from 'react';
import {
  Sparkles,
  Flame,
  Snowflake,
  Sun,
  CloudFog,
  Layers,
  Waves,
  Radio,
  Zap,
  Volume2,
  Check,
  RotateCcw,
} from 'lucide-react';
import { TextLayer, VisualEffectsSettings, getDefaultVisualEffects } from '../../types';
import { NumberSliderControl } from '../common/NumberSliderControl';

interface VisualEffectsInspectorProps {
  layer: TextLayer;
  updateLayer: (updates: Partial<TextLayer>) => void;
}

export const VisualEffectsInspector: React.FC<VisualEffectsInspectorProps> = ({
  layer,
  updateLayer,
}) => {
  // Ensure layer has vfx object initialized with defaults
  const vfx: VisualEffectsSettings = layer.vfx || getDefaultVisualEffects();

  const updateVFX = (section: keyof VisualEffectsSettings, updates: any) => {
    const newVfx: VisualEffectsSettings = {
      ...vfx,
      [section]: {
        ...(vfx[section] as any),
        ...updates,
      },
    };
    updateLayer({ vfx: newVfx });
  };

  // 1-Click VFX Presets
  const applyPreset = (presetName: string) => {
    const base = getDefaultVisualEffects();

    switch (presetName) {
      case 'inferno':
        base.fire = {
          enabled: true,
          intensity: 1.2,
          flameHeight: 48,
          smokeTrails: true,
          embers: true,
          wind: 4,
        };
        base.atmosphere = {
          enabled: true,
          type: 'ember-particles',
          density: 1.2,
          speed: 1.4,
          color: '#f97316',
          opacity: 0.7,
        };
        updateLayer({
          fillType: 'gradient',
          gradientColors: ['#fef08a', '#ea580c'],
          glowEnabled: true,
          glowColor: '#ea580c',
          glowBlur: 25,
          vfx: base,
        });
        break;

      case 'frozen':
        base.ice = {
          enabled: true,
          icicles: true,
          frostCrackles: true,
          frostTint: '#7dd3fc',
          prismReflect: 0.9,
        };
        base.lensFlare = {
          enabled: true,
          type: 'starburst',
          intensity: 1.1,
          color: '#bae6fd',
          streakWidth: 700,
          followLayer: true,
        };
        updateLayer({
          fillType: 'gradient',
          gradientColors: ['#f0f9ff', '#0284c7'],
          strokeEnabled: true,
          strokeColor: '#e0f2fe',
          strokeWidth: 2,
          glowEnabled: true,
          glowColor: '#38bdf8',
          glowBlur: 18,
          vfx: base,
        });
        break;

      case 'neon-tokyo':
        base.neonTube = {
          enabled: true,
          tubeColor: '#ffffff',
          glowColor: '#ec4899',
          tubeWidth: 4,
          flicker: true,
          mountBrackets: true,
        };
        base.lensFlare = {
          enabled: true,
          type: 'cinematic-anamorphic',
          intensity: 0.85,
          color: '#ec4899',
          streakWidth: 950,
          followLayer: true,
        };
        updateLayer({
          fillColor: '#030712',
          glowEnabled: true,
          glowColor: '#ec4899',
          glowBlur: 35,
          vfx: base,
        });
        break;

      case 'anamorphic-cinema':
        base.lensFlare = {
          enabled: true,
          type: 'cinematic-anamorphic',
          intensity: 1.3,
          color: '#38bdf8',
          streakWidth: 1200,
          followLayer: true,
        };
        base.atmosphere = {
          enabled: true,
          type: 'dust-motes',
          density: 0.9,
          speed: 0.8,
          color: '#e2e8f0',
          opacity: 0.45,
        };
        base.texture = {
          enabled: true,
          type: 'film-grain-35mm',
          blendMode: 'overlay',
          scale: 1,
          opacity: 0.4,
          applyToLayerOnly: false,
        };
        updateLayer({ vfx: base });
        break;

      case 'cyber-glitch':
        base.glitch = {
          enabled: true,
          type: 'cyber-chaos',
          intensity: 65,
          frequency: 5,
          colorSplit: 14,
        };
        base.texture = {
          enabled: true,
          type: 'crt-scanlines',
          blendMode: 'overlay',
          scale: 1,
          opacity: 0.6,
          applyToLayerOnly: false,
        };
        updateLayer({ vfx: base });
        break;

      case 'mystic-smoke':
        base.atmosphere = {
          enabled: true,
          type: 'mystic-fog',
          density: 1.3,
          speed: 0.9,
          color: '#94a3b8',
          opacity: 0.65,
        };
        base.distortion = {
          enabled: true,
          type: 'heat-haze',
          speed: 0.8,
          amplitude: 7,
          frequency: 3,
        };
        updateLayer({ vfx: base });
        break;

      case 'vintage-paper':
        base.texture = {
          enabled: true,
          type: 'paper-grunge',
          blendMode: 'multiply',
          scale: 1.2,
          opacity: 0.75,
          applyToLayerOnly: false,
        };
        base.atmosphere = {
          enabled: true,
          type: 'dust-motes',
          density: 0.6,
          speed: 0.5,
          color: '#d4d4d8',
          opacity: 0.35,
        };
        updateLayer({ vfx: base });
        break;

      case 'reset':
        updateLayer({ vfx: base });
        break;
    }
  };

  return (
    <div id="visual-effects-inspector" className="p-3.5 space-y-4 text-xs text-slate-300">
      {/* 1-Click Quick VFX Presets */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Presets Rápidos de Efectos</span>
          </div>
          <button
            type="button"
            onClick={() => applyPreset('reset')}
            className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
            title="Desactivar todos los efectos"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset('neon-tokyo')}
            className="py-1.5 px-2 bg-slate-950 hover:bg-pink-950/40 border border-pink-500/30 hover:border-pink-500 rounded text-[11px] font-medium text-pink-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Zap className="w-3 h-3 text-pink-400" />
            <span>Neón Tubo Tokyo</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('inferno')}
            className="py-1.5 px-2 bg-slate-950 hover:bg-orange-950/40 border border-orange-500/30 hover:border-orange-500 rounded text-[11px] font-medium text-orange-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Flame className="w-3 h-3 text-orange-400" />
            <span>Fuego Infierno</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('frozen')}
            className="py-1.5 px-2 bg-slate-950 hover:bg-sky-950/40 border border-sky-500/30 hover:border-sky-500 rounded text-[11px] font-medium text-sky-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Snowflake className="w-3 h-3 text-sky-400" />
            <span>Hielo y Cristal</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('anamorphic-cinema')}
            className="py-1.5 px-2 bg-slate-950 hover:bg-amber-950/40 border border-amber-500/30 hover:border-amber-500 rounded text-[11px] font-medium text-amber-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sun className="w-3 h-3 text-amber-400" />
            <span>Lens Flare Cinema</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('cyber-glitch')}
            className="py-1.5 px-2 bg-slate-950 hover:bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-500 rounded text-[11px] font-medium text-cyan-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Radio className="w-3 h-3 text-cyan-400" />
            <span>Glitch CRT Cyber</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('mystic-smoke')}
            className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 rounded text-[11px] font-medium text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <CloudFog className="w-3 h-3 text-slate-400" />
            <span>Humo & Niebla</span>
          </button>
        </div>
      </div>

      {/* 1. LENS FLARE & LUZ CINEMATOGRÁFICA */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200">1. Luz & Lens Flare</span>
          </div>
          <input
            type="checkbox"
            checked={vfx.lensFlare.enabled}
            onChange={(e) => updateVFX('lensFlare', { enabled: e.target.checked })}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </div>

        {vfx.lensFlare.enabled && (
          <div className="space-y-2.5 pt-1 border-t border-slate-800/60">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Tipo de Destello</label>
              <select
                value={vfx.lensFlare.type}
                onChange={(e) => updateVFX('lensFlare', { type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              >
                <option value="cinematic-anamorphic">Anamórfico Cinematográfico (Haz láser + Orbes)</option>
                <option value="solar-rays">Rayos Solares / God Rays Volumétricos</option>
                <option value="warm-spotlight">Foco Spotlight Teatral Cálido</option>
                <option value="starburst">Destello Estrellado (Starburst Cross)</option>
                <option value="chromatic-ring">Anillo Difracción Cromática</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">Color del Destello</span>
              <div className="flex items-center gap-1.5">
                {['#38bdf8', '#fbbf24', '#ffffff', '#ec4899', '#a855f7'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => updateVFX('lensFlare', { color: col })}
                    className={`w-5 h-5 rounded-full border cursor-pointer ${
                      vfx.lensFlare.color === col ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
                <input
                  type="color"
                  value={vfx.lensFlare.color}
                  onChange={(e) => updateVFX('lensFlare', { color: e.target.value })}
                  className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <NumberSliderControl
              label="Intensidad del Destello"
              value={vfx.lensFlare.intensity}
              min={0.1}
              max={2.5}
              step={0.05}
              isPercent={true}
              colorAccent="amber"
              onChange={(val) => updateVFX('lensFlare', { intensity: val })}
            />

            <NumberSliderControl
              label="Ancho del Haz Láser (px)"
              value={vfx.lensFlare.streakWidth}
              min={200}
              max={2000}
              step={20}
              unit="px"
              colorAccent="amber"
              onChange={(val) => updateVFX('lensFlare', { streakWidth: val })}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Seguir posición de la capa</span>
              <input
                type="checkbox"
                checked={vfx.lensFlare.followLayer}
                onChange={(e) => updateVFX('lensFlare', { followLayer: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. HUMO, NIEBLA Y EFECTOS ATMOSFÉRICOS */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudFog className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-200">2. Humo, Niebla & Atmósfera</span>
          </div>
          <input
            type="checkbox"
            checked={vfx.atmosphere.enabled}
            onChange={(e) => updateVFX('atmosphere', { enabled: e.target.checked })}
            className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
          />
        </div>

        {vfx.atmosphere.enabled && (
          <div className="space-y-2.5 pt-1 border-t border-slate-800/60">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Tipo de Atmósfera</label>
              <select
                value={vfx.atmosphere.type}
                onChange={(e) => updateVFX('atmosphere', { type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              >
                <option value="smoke">Plumas de Humo Volumétrico Ascendente</option>
                <option value="mystic-fog">Niebla Ondulante y Bruma Mística</option>
                <option value="ember-particles">Chispas y Ascuas Incandescentes</option>
                <option value="dust-motes">Motas de Polvo Shimmer en Suspensión</option>
                <option value="cinematic-haze">Neblina Atmosférica de Cine</option>
              </select>
            </div>

            <NumberSliderControl
              label="Densidad de Partículas"
              value={vfx.atmosphere.density}
              min={0.2}
              max={2.5}
              step={0.1}
              isPercent={true}
              colorAccent="sky"
              onChange={(val) => updateVFX('atmosphere', { density: val })}
            />

            <NumberSliderControl
              label="Velocidad del Movimiento"
              value={vfx.atmosphere.speed}
              min={0.2}
              max={3.0}
              step={0.1}
              unit="x"
              colorAccent="sky"
              onChange={(val) => updateVFX('atmosphere', { speed: val })}
            />

            <NumberSliderControl
              label="Opacidad / Transparencia"
              value={vfx.atmosphere.opacity}
              min={0.05}
              max={1.0}
              step={0.05}
              isPercent={true}
              colorAccent="sky"
              onChange={(val) => updateVFX('atmosphere', { opacity: val })}
            />
          </div>
        )}
      </div>

      {/* 3. TEXTURAS Y OVERLAYS */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">3. Texturas & Overlays</span>
          </div>
          <input
            type="checkbox"
            checked={vfx.texture.enabled}
            onChange={(e) => updateVFX('texture', { enabled: e.target.checked })}
            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
          />
        </div>

        {vfx.texture.enabled && (
          <div className="space-y-2.5 pt-1 border-t border-slate-800/60">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Patrón de Textura</label>
              <select
                value={vfx.texture.type}
                onChange={(e) => updateVFX('texture', { type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              >
                <option value="paper-grunge">Papel Grunge Vintage con Fibras</option>
                <option value="brushed-metal">Metal Cepillado con Vetas Reflejadas</option>
                <option value="wood-grain">Madera Noble con Anillos Orgánicos</option>
                <option value="carbon-fiber">Fibra de Carbono Tejido 2x2</option>
                <option value="film-grain-35mm">Grano de Película 35mm Cinematográfico</option>
                <option value="crt-scanlines">Líneas de Escaneo CRT Retro</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Modo de Fusión</label>
                <select
                  value={vfx.texture.blendMode}
                  onChange={(e) => updateVFX('texture', { blendMode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="overlay">Overlay</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="soft-light">Soft Light</option>
                  <option value="color-dodge">Color Dodge</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Alcance</label>
                <select
                  value={vfx.texture.applyToLayerOnly ? 'layer' : 'scene'}
                  onChange={(e) => updateVFX('texture', { applyToLayerOnly: e.target.value === 'layer' })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="layer">Solo en el Texto</option>
                  <option value="scene">Toda la Escena</option>
                </select>
              </div>
            </div>

            <NumberSliderControl
              label="Opacidad de Textura"
              value={vfx.texture.opacity}
              min={0.1}
              max={1.0}
              step={0.05}
              isPercent={true}
              colorAccent="emerald"
              onChange={(val) => updateVFX('texture', { opacity: val })}
            />

            <NumberSliderControl
              label="Escala de Grano / Relieve"
              value={vfx.texture.scale}
              min={0.5}
              max={3.0}
              step={0.1}
              unit="x"
              colorAccent="emerald"
              onChange={(val) => updateVFX('texture', { scale: val })}
            />
          </div>
        )}
      </div>

      {/* 4. EFECTOS DE DISTORSIÓN (AGUA / REFRACCIÓN) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-200">4. Ondulación & Refracción de Agua</span>
          </div>
          <input
            type="checkbox"
            checked={vfx.distortion.enabled}
            onChange={(e) => updateVFX('distortion', { enabled: e.target.checked })}
            className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
          />
        </div>

        {vfx.distortion.enabled && (
          <div className="space-y-2.5 pt-1 border-t border-slate-800/60">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Tipo de Distorsión</label>
              <select
                value={vfx.distortion.type}
                onChange={(e) => updateVFX('distortion', { type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              >
                <option value="water-ripple">Ondulación de Agua Fluida (Subacuático)</option>
                <option value="refraction-glass">Refracción de Cristal Biselado</option>
                <option value="sine-wave">Onda Senoidal Suave</option>
                <option value="heat-haze">Distorsión Térmica / Espejismo de Calor</option>
              </select>
            </div>

            <NumberSliderControl
              label="Amplitud de Deformación (px)"
              value={vfx.distortion.amplitude}
              min={1}
              max={30}
              step={1}
              unit="px"
              colorAccent="sky"
              onChange={(val) => updateVFX('distortion', { amplitude: val })}
            />

            <NumberSliderControl
              label="Frecuencia de Ondas"
              value={vfx.distortion.frequency}
              min={1}
              max={15}
              step={1}
              colorAccent="sky"
              onChange={(val) => updateVFX('distortion', { frequency: val })}
            />

            <NumberSliderControl
              label="Velocidad de Fluidez"
              value={vfx.distortion.speed}
              min={0.2}
              max={3.0}
              step={0.1}
              unit="x"
              colorAccent="sky"
              onChange={(val) => updateVFX('distortion', { speed: val })}
            />
          </div>
        )}
      </div>

      {/* 5. GLITCH AVANZADO */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400" />
            <span className="font-semibold text-slate-200">5. Glitch Avanzado RGB</span>
          </div>
          <input
            type="checkbox"
            checked={vfx.glitch.enabled}
            onChange={(e) => updateVFX('glitch', { enabled: e.target.checked })}
            className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
          />
        </div>

        {vfx.glitch.enabled && (
          <div className="space-y-2.5 pt-1 border-t border-slate-800/60">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Algoritmo de Glitch</label>
              <select
                value={vfx.glitch.type}
                onChange={(e) => updateVFX('glitch', { type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              >
                <option value="rgb-split">Separación Cromática RGB (Rojo / Cian)</option>
                <option value="digital-slice">Corte de Bloques Horizontales (Digital Slice)</option>
                <option value="scanline-jitter">Jitter y Tearing de Sincronismo</option>
                <option value="cyber-chaos">Ciber-Caos Combinado</option>
              </select>
            </div>

            <NumberSliderControl
              label="Intensidad del Glitch"
              value={vfx.glitch.intensity}
              min={5}
              max={100}
              step={5}
              unit="%"
              colorAccent="rose"
              onChange={(val) => updateVFX('glitch', { intensity: val })}
            />

            <NumberSliderControl
              label="Separación Cromática (px)"
              value={vfx.glitch.colorSplit}
              min={2}
              max={30}
              step={1}
              unit="px"
              colorAccent="rose"
              onChange={(val) => updateVFX('glitch', { colorSplit: val })}
            />

            <NumberSliderControl
              label="Frecuencia de Ráfagas"
              value={vfx.glitch.frequency}
              min={1}
              max={10}
              step={1}
              unit="/s"
              colorAccent="rose"
              onChange={(val) => updateVFX('glitch', { frequency: val })}
            />
          </div>
        )}
      </div>

      {/* 6. MÁQUINA DE ESCRIBIR */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200">6. Máquina de Escribir (Typewriter)</span>
          </div>
          <input
            type="checkbox"
            checked={layer.animation.inType === 'typewriter' || !!layer.animation.typewriterSound}
            onChange={(e) => {
              if (e.target.checked) {
                updateLayer({
                  animation: {
                    ...layer.animation,
                    inType: 'typewriter',
                    typewriterSound: true,
                    typewriterCursor: 'underscore',
                  },
                });
              } else {
                updateLayer({
                  animation: {
                    ...layer.animation,
                    typewriterSound: false,
                  },
                });
              }
            }}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </div>

        {(layer.animation.inType === 'typewriter' || layer.animation.typewriterSound) && (
          <div className="space-y-2.5 pt-1 border-t border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Sonido Mecánico Realista</span>
              <input
                type="checkbox"
                checked={layer.animation.typewriterSound !== false}
                onChange={(e) =>
                  updateLayer({
                    animation: { ...layer.animation, typewriterSound: e.target.checked },
                  })
                }
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Cursor Parpadeante</label>
              <select
                value={layer.animation.typewriterCursor || 'underscore'}
                onChange={(e) =>
                  updateLayer({
                    animation: {
                      ...layer.animation,
                      typewriterCursor: e.target.value as 'bar' | 'block' | 'underscore' | 'none',
                    },
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              >
                <option value="underscore">Guion bajo ( _ )</option>
                <option value="bar">Barra vertical ( | )</option>
                <option value="block">Bloque cuadrado ( ■ )</option>
                <option value="none">Sin cursor</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 7. FUEGO REAL ANIMADO */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="font-semibold text-slate-200">7. Fuego Real con Llamas Vivas</span>
          </div>
          <input
            type="checkbox"
            checked={vfx.fire.enabled}
            onChange={(e) => updateVFX('fire', { enabled: e.target.checked })}
            className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
          />
        </div>

        {vfx.fire.enabled && (
          <div className="space-y-2.5 pt-1 border-t border-slate-800/60">
            <NumberSliderControl
              label="Altura de Llamas (px)"
              value={vfx.fire.flameHeight}
              min={15}
              max={90}
              step={2}
              unit="px"
              colorAccent="rose"
              onChange={(val) => updateVFX('fire', { flameHeight: val })}
            />

            <NumberSliderControl
              label="Intensidad Térmica"
              value={vfx.fire.intensity}
              min={0.5}
              max={2.0}
              step={0.05}
              isPercent={true}
              colorAccent="rose"
              onChange={(val) => updateVFX('fire', { intensity: val })}
            />

            <NumberSliderControl
              label="Viento / Inclinación"
              value={vfx.fire.wind}
              min={-15}
              max={15}
              step={1}
              unit="px"
              colorAccent="rose"
              onChange={(val) => updateVFX('fire', { wind: val })}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Trazas de Humo Ascendente</span>
              <input
                type="checkbox"
                checked={vfx.fire.smokeTrails}
                onChange={(e) => updateVFX('fire', { smokeTrails: e.target.checked })}
                className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Chispas Ardientes Flotantes</span>
              <input
                type="checkbox"
                checked={vfx.fire.embers}
                onChange={(e) => updateVFX('fire', { embers: e.target.checked })}
                className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 8. EFECTO DE HIELO Y CRISTAL */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-sky-300" />
            <span className="font-semibold text-slate-200">8. Hielo Congelado & Cristal</span>
          </div>
          <input
            type="checkbox"
            checked={vfx.ice.enabled}
            onChange={(e) => updateVFX('ice', { enabled: e.target.checked })}
            className="w-4 h-4 accent-sky-400 rounded cursor-pointer"
          />
        </div>

        {vfx.ice.enabled && (
          <div className="space-y-2.5 pt-1 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Estalactitas / Carámbanos Colgantes</span>
              <input
                type="checkbox"
                checked={vfx.ice.icicles}
                onChange={(e) => updateVFX('ice', { icicles: e.target.checked })}
                className="w-4 h-4 accent-sky-400 rounded cursor-pointer"
              />
            </div>

            <NumberSliderControl
              label="Reflejos Prismáticos de Diamante"
              value={vfx.ice.prismReflect}
              min={0}
              max={1.0}
              step={0.05}
              isPercent={true}
              colorAccent="sky"
              onChange={(val) => updateVFX('ice', { prismReflect: val })}
            />

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">Tinte Glaciar</span>
              <div className="flex items-center gap-1.5">
                {['#a5f3fc', '#bae6fd', '#e0f2fe', '#67e8f9', '#c4b5fd'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => updateVFX('ice', { frostTint: col })}
                    className={`w-5 h-5 rounded-full border cursor-pointer ${
                      vfx.ice.frostTint === col ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 9. EFECTO NEÓN CON TUBO REALISTA */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-pink-400" />
            <span className="font-semibold text-slate-200">9. Tubo Físico de Neón Realista</span>
          </div>
          <input
            type="checkbox"
            checked={vfx.neonTube.enabled}
            onChange={(e) => updateVFX('neonTube', { enabled: e.target.checked })}
            className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
          />
        </div>

        {vfx.neonTube.enabled && (
          <div className="space-y-2.5 pt-1 border-t border-slate-800/60">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">Color del Gas Ionizado</span>
              <div className="flex items-center gap-1.5">
                {['#ec4899', '#38bdf8', '#22c55e', '#a855f7', '#f59e0b', '#ef4444'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => updateVFX('neonTube', { glowColor: col })}
                    className={`w-5 h-5 rounded-full border cursor-pointer ${
                      vfx.neonTube.glowColor === col ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
                <input
                  type="color"
                  value={vfx.neonTube.glowColor}
                  onChange={(e) => updateVFX('neonTube', { glowColor: e.target.value })}
                  className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <NumberSliderControl
              label="Grosor del Tubo de Vidrio (px)"
              value={vfx.neonTube.tubeWidth}
              min={2}
              max={8}
              step={0.5}
              unit="px"
              colorAccent="rose"
              onChange={(val) => updateVFX('neonTube', { tubeWidth: val })}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Micro-Parpadeo Eléctrico 50/60Hz</span>
              <input
                type="checkbox"
                checked={vfx.neonTube.flicker}
                onChange={(e) => updateVFX('neonTube', { flicker: e.target.checked })}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Soportes y Abrazaderas Metálicas</span>
              <input
                type="checkbox"
                checked={vfx.neonTube.mountBrackets}
                onChange={(e) => updateVFX('neonTube', { mountBrackets: e.target.checked })}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
