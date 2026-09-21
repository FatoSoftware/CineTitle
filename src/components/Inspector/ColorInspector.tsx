import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Film,
  Sun,
  Eye,
  RotateCcw,
  Palette,
  CircleDot,
  Square,
  Layers,
  Flame,
  Zap,
  Check,
} from 'lucide-react';
import {
  ProjectSettings,
  ColorGradingSettings,
  LutPreset,
  VignetteShape,
  GradientStyle,
  TextLayer,
  getDefaultColorGradingSettings,
} from '../../types';
import { NumberSliderControl } from '../common/NumberSliderControl';

interface ColorInspectorProps {
  project: ProjectSettings;
  setProject: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  selectedLayer: TextLayer | null;
  updateLayer?: (updates: Partial<TextLayer>) => void;
}

type ColorSubTab = 'correction' | 'lut' | 'gradient' | 'vignette';

const LUT_PRESETS: {
  id: LutPreset;
  name: string;
  category: string;
  description: string;
  colors: [string, string, string];
}[] = [
  {
    id: 'none',
    name: 'Natural (Sin LUT)',
    category: 'Estándar',
    description: 'Colores originales sin filtrado',
    colors: ['#64748b', '#94a3b8', '#cbd5e1'],
  },
  {
    id: 'teal-orange',
    name: 'Teal & Orange',
    category: 'Hollywood',
    description: 'Cian profundo en sombras y ámbar cálido en luces',
    colors: ['#083344', '#0284c7', '#f59e0b'],
  },
  {
    id: 'bleach-bypass',
    name: 'Bleach Bypass',
    category: 'Bélico / Drama',
    description: 'Desaturación fría con alto contraste plateado',
    colors: ['#1e293b', '#64748b', '#e2e8f0'],
  },
  {
    id: 'vintage-film',
    name: 'Vintage 35mm',
    category: 'Analógico',
    description: 'Kodak Portra con sombras mate y tonos cálidos',
    colors: ['#292524', '#b45309', '#fde68a'],
  },
  {
    id: 'noir-bw',
    name: 'Noir Monocromo',
    category: 'Cine Clásico',
    description: 'Blanco y negro dramático de alto rango dinámico',
    colors: ['#000000', '#525252', '#ffffff'],
  },
  {
    id: 'cyber-neon',
    name: 'Cyberpunk Neon',
    category: 'Sci-Fi / Synth',
    description: 'Magenta eléctrico, púrpura y cian fluorescente',
    colors: ['#701a75', '#d946ef', '#00f0ff'],
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'Atardecer',
    description: 'Cálido resplandor solar con dorado radiante',
    colors: ['#7c2d12', '#ea580c', '#fbbf24'],
  },
  {
    id: 'sci-fi-matrix',
    name: 'Sci-Fi Matrix',
    category: 'Cibernético',
    description: 'Tinte verde esmeralda con sombras digitales profundas',
    colors: ['#022c22', '#059669', '#34d399'],
  },
  {
    id: 'western-warm',
    name: 'Western Sepia',
    category: 'Vintage',
    description: 'Tonos desérticos terrosos y contraste tostado',
    colors: ['#451a03', '#92400e', '#fcd34d'],
  },
  {
    id: 'pastel-soft',
    name: 'Pastel Luxury',
    category: 'Comercial',
    description: 'Tonos suaves luminosos con negros elevados',
    colors: ['#475569', '#f472b6', '#7dd3fc'],
  },
  {
    id: 'horror-cold',
    name: 'Horror Cold',
    category: 'Suspense',
    description: 'Azul acero gélido desaturado y atmósfera oscura',
    colors: ['#090d16', '#0369a1', '#7dd3fc'],
  },
];

const GRADIENT_PALETTES = [
  { name: 'Aurora Ciber', colors: ['#ff007f', '#7928ca', '#00f0ff'] },
  { name: 'Fuego Solar', colors: ['#ff0000', '#ff7700', '#ffea00'] },
  { name: 'Océano Profundo', colors: ['#0284c7', '#0d9488', '#10b981'] },
  { name: 'Oro Imperial', colors: ['#78350f', '#f59e0b', '#fef08a'] },
  { name: 'Holograma Neón', colors: ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981'] },
  { name: 'Atardecer Miami', colors: ['#f43f5e', '#a855f7', '#38bdf8'] },
];

export const ColorInspector: React.FC<ColorInspectorProps> = ({
  project,
  setProject,
  selectedLayer,
  updateLayer,
}) => {
  const [subTab, setSubTab] = useState<ColorSubTab>('correction');

  const colorGrading: ColorGradingSettings =
    project.colorGrading || getDefaultColorGradingSettings();

  const updateColorGrading = (updates: Partial<ColorGradingSettings>) => {
    setProject((prev) => ({
      ...prev,
      colorGrading: {
        ...(prev.colorGrading || getDefaultColorGradingSettings()),
        ...updates,
      },
    }));
  };

  const updateCorrection = (updates: Partial<ColorGradingSettings['correction']>) => {
    updateColorGrading({
      correction: {
        ...colorGrading.correction,
        ...updates,
      },
    });
  };

  const updateVignette = (updates: Partial<ColorGradingSettings['vignette']>) => {
    updateColorGrading({
      vignette: {
        ...colorGrading.vignette,
        ...updates,
      },
    });
  };

  const updateGradient = (updates: Partial<ColorGradingSettings['animatedGradient']>) => {
    updateColorGrading({
      animatedGradient: {
        ...colorGrading.animatedGradient,
        ...updates,
      },
    });
  };

  const resetAllGrading = () => {
    setProject((prev) => ({
      ...prev,
      colorGrading: getDefaultColorGradingSettings(),
    }));
  };

  return (
    <div id="inspector-color" className="p-4 space-y-4">
      {/* Master Enable & Reset Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Color & Corrección</span>
              {colorGrading.enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <div className="text-[10px] text-slate-400">
              {colorGrading.enabled ? 'Efectos Activos en Escena' : 'Grading Desactivado'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetAllGrading}
            title="Restablecer todos los valores de color"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updateColorGrading({ enabled: !colorGrading.enabled })}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer ${
              colorGrading.enabled
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {colorGrading.enabled ? 'Activado' : 'Activar'}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/90 border border-slate-800/80 rounded-xl">
        <button
          onClick={() => setSubTab('correction')}
          className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 transition ${
            subTab === 'correction'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Ajustes</span>
        </button>
        <button
          onClick={() => setSubTab('lut')}
          className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 transition ${
            subTab === 'lut'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>LUTs</span>
        </button>
        <button
          onClick={() => setSubTab('gradient')}
          className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 transition ${
            subTab === 'gradient'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Degradado</span>
        </button>
        <button
          onClick={() => setSubTab('vignette')}
          className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 transition ${
            subTab === 'vignette'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <CircleDot className="w-3.5 h-3.5" />
          <span>Viñeta</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. CORRECCIÓN DE COLOR AVANZADA */}
      {/* ---------------------------------------------------- */}
      {subTab === 'correction' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Controles Primarios de Corrección</span>
            </span>
            <button
              onClick={() =>
                updateCorrection({
                  brightness: 100,
                  contrast: 100,
                  saturation: 100,
                  hueRotate: 0,
                  temperature: 0,
                  tint: 0,
                  exposure: 0,
                  shadows: 0,
                  highlights: 0,
                })
              }
              className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-3">
            <NumberSliderControl
              label="Brillo"
              value={colorGrading.correction.brightness}
              min={50}
              max={150}
              step={1}
              unit="%"
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateCorrection({ brightness: v });
              }}
            />

            <NumberSliderControl
              label="Contraste"
              value={colorGrading.correction.contrast}
              min={50}
              max={200}
              step={1}
              unit="%"
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateCorrection({ contrast: v });
              }}
            />

            <NumberSliderControl
              label="Saturación"
              value={colorGrading.correction.saturation}
              min={0}
              max={250}
              step={1}
              unit="%"
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateCorrection({ saturation: v });
              }}
            />

            <NumberSliderControl
              label="Tono (Hue-Rotate)"
              value={colorGrading.correction.hueRotate}
              min={-180}
              max={180}
              step={1}
              unit="°"
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateCorrection({ hueRotate: v });
              }}
            />
          </div>

          {/* Temperatura, Tinte & Exposición */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-3">
            <span className="text-[11px] font-bold text-slate-300 block mb-1">
              Balance de Blanco & Exposición
            </span>

            <NumberSliderControl
              label="Temperatura (Frío / Cálido)"
              value={colorGrading.correction.temperature}
              min={-100}
              max={100}
              step={1}
              unit=""
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateCorrection({ temperature: v });
              }}
            />

            <NumberSliderControl
              label="Tinte (Verde / Magenta)"
              value={colorGrading.correction.tint}
              min={-100}
              max={100}
              step={1}
              unit=""
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateCorrection({ tint: v });
              }}
            />

            <NumberSliderControl
              label="Exposición (EV)"
              value={colorGrading.correction.exposure}
              min={-2.0}
              max={2.0}
              step={0.1}
              unit="EV"
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateCorrection({ exposure: v });
              }}
            />

            <NumberSliderControl
              label="Sombras (Darks)"
              value={colorGrading.correction.shadows}
              min={-50}
              max={50}
              step={1}
              unit=""
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateCorrection({ shadows: v });
              }}
            />

            <NumberSliderControl
              label="Altas Luces (Highlights)"
              value={colorGrading.correction.highlights}
              min={-50}
              max={50}
              step={1}
              unit=""
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateCorrection({ highlights: v });
              }}
            />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. LUTS Y FILTROS CINEMATOGRÁFICOS */}
      {/* ---------------------------------------------------- */}
      {subTab === 'lut' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>Looks Cinematográficos Predefinidos</span>
            </span>
            <span className="text-[10px] text-amber-400/90 font-medium">
              10 Estilos Hollywood
            </span>
          </div>

          {/* LUT Intensity Slider */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <NumberSliderControl
              label="Intensidad del LUT"
              value={colorGrading.lut.intensity}
              min={0}
              max={100}
              step={1}
              unit="%"
              onChange={(v) => {
                updateColorGrading({
                  enabled: true,
                  lut: { ...colorGrading.lut, intensity: v },
                });
              }}
            />
          </div>

          {/* LUT Selection Cards */}
          <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {LUT_PRESETS.map((lut) => {
              const isSelected = colorGrading.lut.preset === lut.id;
              return (
                <button
                  key={lut.id}
                  onClick={() => {
                    updateColorGrading({
                      enabled: true,
                      lut: {
                        ...colorGrading.lut,
                        preset: lut.id,
                      },
                    });
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-slate-100 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {/* Swatch gradient preview */}
                  <div
                    className="w-12 h-10 rounded-lg border border-slate-700 shrink-0 shadow-inner flex overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${lut.colors[0]} 0%, ${lut.colors[1]} 50%, ${lut.colors[2]} 100%)`,
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate text-slate-100">
                        {lut.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0 ml-1">
                        {lut.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {lut.description}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. DEGRADADOS DE COLOR ANIMADOS */}
      {/* ---------------------------------------------------- */}
      {subTab === 'gradient' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Degradado de Color Animado</span>
            </span>
            <button
              onClick={() => {
                const nextEnabled = !colorGrading.animatedGradient.enabled;
                if (nextEnabled) updateColorGrading({ enabled: true });
                updateGradient({ enabled: nextEnabled });
              }}
              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md transition ${
                colorGrading.animatedGradient.enabled
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {colorGrading.animatedGradient.enabled ? 'Activado' : 'Desactivado'}
            </button>
          </div>

          {/* Quick Palette Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">
              Paletas Cinematográficas
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {GRADIENT_PALETTES.map((pal) => (
                <button
                  key={pal.name}
                  onClick={() => {
                    updateColorGrading({ enabled: true });
                    updateGradient({
                      enabled: true,
                      colors: pal.colors,
                    });
                  }}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-slate-700 text-left transition flex flex-col gap-1 cursor-pointer"
                >
                  <div
                    className="w-full h-3.5 rounded"
                    style={{
                      background: `linear-gradient(90deg, ${pal.colors.join(', ')})`,
                    }}
                  />
                  <span className="text-[9px] text-slate-300 truncate">{pal.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Stops Pickers */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
              <span>Colores de Parada ({colorGrading.animatedGradient.colors.length})</span>
              {colorGrading.animatedGradient.colors.length < 5 && (
                <button
                  onClick={() => {
                    updateGradient({
                      colors: [...colorGrading.animatedGradient.colors, '#f59e0b'],
                    });
                  }}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  + Añadir Color
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {colorGrading.animatedGradient.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800"
                >
                  <input
                    type="color"
                    value={color.startsWith('#') ? color : '#ff007f'}
                    onChange={(e) => {
                      const newColors = [...colorGrading.animatedGradient.colors];
                      newColors[idx] = e.target.value;
                      updateColorGrading({ enabled: true });
                      updateGradient({ enabled: true, colors: newColors });
                    }}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-slate-300 uppercase">
                    {color}
                  </span>
                  {colorGrading.animatedGradient.colors.length > 2 && (
                    <button
                      onClick={() => {
                        const newColors = colorGrading.animatedGradient.colors.filter(
                          (_, i) => i !== idx
                        );
                        updateGradient({ colors: newColors });
                      }}
                      className="text-slate-500 hover:text-rose-400 text-[10px] ml-1 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Style & Animation Controls */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Forma / Estilo de Flujo
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                {(['linear', 'radial'] as GradientStyle[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateGradient({ style: st })}
                    className={`py-1 rounded font-semibold capitalize transition ${
                      colorGrading.animatedGradient.style === st
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st === 'linear' ? 'Lineal' : 'Radial Ondulado'}
                  </button>
                ))}
              </div>
            </div>

            <NumberSliderControl
              label="Velocidad de Animación"
              value={colorGrading.animatedGradient.speed}
              min={0.2}
              max={3.0}
              step={0.1}
              unit="x"
              onChange={(v) => updateGradient({ speed: v })}
            />

            <NumberSliderControl
              label="Ángulo Inicial"
              value={colorGrading.animatedGradient.angle}
              min={0}
              max={360}
              step={5}
              unit="°"
              onChange={(v) => updateGradient({ angle: v })}
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-300">Rotar Continuamente 360°</span>
              <input
                type="checkbox"
                checked={colorGrading.animatedGradient.rotateWithTime}
                onChange={(e) => updateGradient({ rotateWithTime: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <NumberSliderControl
              label="Opacidad del Degradado"
              value={Math.round((colorGrading.animatedGradient.opacity ?? 0.5) * 100)}
              min={10}
              max={100}
              step={1}
              unit="%"
              onChange={(v) => updateGradient({ opacity: v / 100 })}
            />

            {/* Target application */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Aplicación del Degradado
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => updateGradient({ target: 'scene' })}
                  className={`py-1 rounded font-semibold transition ${
                    colorGrading.animatedGradient.target === 'scene'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Toda la Escena
                </button>
                <button
                  onClick={() => {
                    updateGradient({ target: 'layer' });
                    if (selectedLayer && updateLayer) {
                      updateLayer({
                        fillType: 'animated-gradient',
                        animatedGradient: colorGrading.animatedGradient,
                      });
                    }
                  }}
                  className={`py-1 rounded font-semibold transition ${
                    colorGrading.animatedGradient.target === 'layer'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Capa de Texto
                </button>
              </div>
            </div>

            {/* Direct sync button for selected text layer */}
            {selectedLayer && updateLayer && (
              <button
                onClick={() => {
                  updateLayer({
                    fillType: 'animated-gradient',
                    animatedGradient: {
                      ...colorGrading.animatedGradient,
                      enabled: true,
                    },
                  });
                }}
                className="w-full py-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Aplicar a Texto: "{selectedLayer.name}"</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. EFECTO DE VIÑETA AVANZADO */}
      {/* ---------------------------------------------------- */}
      {subTab === 'vignette' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <CircleDot className="w-3.5 h-3.5 text-amber-400" />
              <span>Viñeta de Enfoque Avanzada</span>
            </span>
            <button
              onClick={() => {
                const nextEnabled = !colorGrading.vignette.enabled;
                if (nextEnabled) updateColorGrading({ enabled: true });
                updateVignette({ enabled: nextEnabled });
              }}
              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md transition ${
                colorGrading.vignette.enabled
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {colorGrading.vignette.enabled ? 'Activada' : 'Desactivada'}
            </button>
          </div>

          {/* Shape Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">
              Forma de la Viñeta
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => {
                  updateColorGrading({ enabled: true });
                  updateVignette({ enabled: true, shape: 'ellipse' });
                }}
                className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
                  colorGrading.vignette.shape === 'ellipse'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CircleDot className="w-3 h-3" />
                <span>Elíptica</span>
              </button>
              <button
                onClick={() => {
                  updateColorGrading({ enabled: true });
                  updateVignette({ enabled: true, shape: 'circle' });
                }}
                className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
                  colorGrading.vignette.shape === 'circle'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full border border-current" />
                <span>Circular</span>
              </button>
              <button
                onClick={() => {
                  updateColorGrading({ enabled: true });
                  updateVignette({ enabled: true, shape: 'rectangle' });
                }}
                className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
                  colorGrading.vignette.shape === 'rectangle'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Square className="w-3 h-3" />
                <span>Caja Squircle</span>
              </button>
            </div>
          </div>

          {/* Position Control (Focal Point X & Y) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">
                Posición del Punto Focal (Centro)
              </span>
              <button
                onClick={() => updateVignette({ posX: 50, posY: 50 })}
                className="text-[10px] text-slate-400 hover:text-amber-400"
              >
                Centrar (50%, 50%)
              </button>
            </div>

            {/* Interactive 2D Crosshair Pad */}
            <div
              className="relative w-full h-28 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden cursor-crosshair flex items-center justify-center"
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.round(
                  Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
                );
                const y = Math.round(
                  Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
                );
                updateColorGrading({ enabled: true });
                updateVignette({ enabled: true, posX: x, posY: y });
              }}
            >
              {/* Grid guide */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-15 pointer-events-none">
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div />
              </div>

              {/* Crosshair Target */}
              <div
                className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-amber-400 bg-amber-500/30 flex items-center justify-center pointer-events-none transition-transform"
                style={{
                  left: `${colorGrading.vignette.posX}%`,
                  top: `${colorGrading.vignette.posY}%`,
                }}
              >
                <div className="w-1 h-1 bg-amber-300 rounded-full" />
              </div>

              <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500 pointer-events-none">
                X: {colorGrading.vignette.posX}% | Y: {colorGrading.vignette.posY}%
              </div>
            </div>

            <NumberSliderControl
              label="Posición X"
              value={colorGrading.vignette.posX}
              min={0}
              max={100}
              step={1}
              unit="%"
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateVignette({ enabled: true, posX: v });
              }}
            />

            <NumberSliderControl
              label="Posición Y"
              value={colorGrading.vignette.posY}
              min={0}
              max={100}
              step={1}
              unit="%"
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateVignette({ enabled: true, posY: v });
              }}
            />
          </div>

          {/* Radius, Feather, Roundness & Intensity */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-3">
            <NumberSliderControl
              label="Radio / Apertura"
              value={colorGrading.vignette.radius}
              min={10}
              max={150}
              step={1}
              unit="%"
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateVignette({ enabled: true, radius: v });
              }}
            />

            <NumberSliderControl
              label="Suavidad (Feather)"
              value={colorGrading.vignette.feather}
              min={5}
              max={100}
              step={1}
              unit="%"
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateVignette({ enabled: true, feather: v });
              }}
            />

            {colorGrading.vignette.shape === 'rectangle' && (
              <NumberSliderControl
                label="Redondez de Esquinas"
                value={colorGrading.vignette.roundness}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={(v) => updateVignette({ roundness: v })}
              />
            )}

            <NumberSliderControl
              label="Intensidad de Viñeta"
              value={colorGrading.vignette.intensity}
              min={0}
              max={100}
              step={1}
              unit="%"
              onChange={(v) => {
                updateColorGrading({ enabled: true });
                updateVignette({ enabled: true, intensity: v });
              }}
            />

            {/* Color & Presets */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <label className="text-[11px] font-semibold text-slate-300 block">
                Color de Viñeta
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorGrading.vignette.color || '#000000'}
                  onChange={(e) => updateVignette({ color: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                />
                <div className="flex items-center gap-1.5 flex-1">
                  <button
                    onClick={() => updateVignette({ color: '#000000', blendMode: 'multiply' })}
                    className="px-2 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded text-[10px] text-slate-300"
                  >
                    Negro Cine
                  </button>
                  <button
                    onClick={() => updateVignette({ color: '#ffffff', blendMode: 'screen' })}
                    className="px-2 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded text-[10px] text-slate-300"
                  >
                    Blanco High-Key
                  </button>
                  <button
                    onClick={() => updateVignette({ color: '#261205', blendMode: 'multiply' })}
                    className="px-2 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded text-[10px] text-slate-300"
                  >
                    Sepia Cálido
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
