import React from 'react';
import { Palette, Sparkles, Moon } from 'lucide-react';
import { TextLayer } from '../../types';
import { NumberSliderControl } from '../common/NumberSliderControl';

interface StyleInspectorProps {
  layer: TextLayer;
  updateLayer: (updates: Partial<TextLayer>) => void;
}

const GRADIENT_PALETTES: { name: string; colors: [string, string] }[] = [
  { name: 'Oro Real', colors: ['#FFFBEB', '#F59E0B'] },
  { name: 'Fuego Volcánico', colors: ['#FEF08A', '#EF4444'] },
  { name: 'Ciber Neón', colors: ['#00F0FF', '#FF007F'] },
  { name: 'Plata Espejo', colors: ['#FFFFFF', '#94A3B8'] },
  { name: 'Atardecer 80s', colors: ['#FF61D2', '#FE9000'] },
  { name: 'Amatista Mágica', colors: ['#E879F9', '#6366F1'] },
  { name: 'Esmeralda', colors: ['#A7F3D0', '#059669'] },
  { name: 'Glaciar Ártico', colors: ['#E0F2FE', '#0284C7'] },
];

export const StyleInspector: React.FC<StyleInspectorProps> = ({ layer, updateLayer }) => {
  return (
    <div id="inspector-style" className="p-4 space-y-4">
      {/* Fill Type: Solid vs Gradient */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Relleno de Color Frontal</span>
          </span>
          <div className="flex bg-slate-900 border border-slate-700/80 rounded-md p-0.5 text-[11px]">
            <button
              onClick={() => updateLayer({ fillType: 'solid' })}
              className={`px-2 py-0.5 rounded transition ${
                layer.fillType === 'solid'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sólido
            </button>
            <button
              onClick={() => updateLayer({ fillType: 'gradient' })}
              className={`px-2 py-0.5 rounded transition ${
                layer.fillType === 'gradient'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Degradado
            </button>
            <button
              onClick={() =>
                updateLayer({
                  fillType: 'animated-gradient',
                  animatedGradient: layer.animatedGradient || {
                    enabled: true,
                    colors: [layer.gradientColors?.[0] || '#ff007f', '#7928ca', '#00f0ff'],
                    style: 'linear',
                    speed: 1.0,
                    angle: layer.gradientAngle || 45,
                    rotateWithTime: true,
                    pulseIntensity: 0.35,
                    blendMode: 'normal',
                    target: 'layer',
                    opacity: 1,
                  },
                })
              }
              className={`px-2 py-0.5 rounded transition flex items-center gap-1 ${
                layer.fillType === 'animated-gradient'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Animado</span>
            </button>
          </div>
        </label>

        {layer.fillType === 'solid' ? (
          <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <input
              type="color"
              value={layer.fillColor.startsWith('#') ? layer.fillColor : '#FFFFFF'}
              onChange={(e) => updateLayer({ fillColor: e.target.value })}
              className="w-10 h-10 rounded-lg border border-slate-700 bg-transparent cursor-pointer shrink-0"
            />
            <div className="flex-1">
              <span className="text-[11px] text-slate-400 block mb-0.5">Color Hexadecimal</span>
              <input
                type="text"
                value={layer.fillColor}
                onChange={(e) => updateLayer({ fillColor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>
        ) : layer.fillType === 'gradient' ? (
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            {/* Quick Palette Pills */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">Paletas Rápidas</span>
              <div className="grid grid-cols-4 gap-1.5">
                {GRADIENT_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    onClick={() =>
                      updateLayer({
                        gradientColors: pal.colors,
                      })
                    }
                    title={pal.name}
                    className="h-7 rounded-md border border-slate-700/80 p-0.5 hover:scale-105 transition cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, ${pal.colors[0]}, ${pal.colors[1]})`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Custom From / To */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Color Inicio</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={layer.gradientColors[0]}
                    onChange={(e) =>
                      updateLayer({
                        gradientColors: [e.target.value, layer.gradientColors[1]],
                      })
                    }
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={layer.gradientColors[0]}
                    onChange={(e) =>
                      updateLayer({
                        gradientColors: [e.target.value, layer.gradientColors[1]],
                      })
                    }
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Color Fin</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={layer.gradientColors[1]}
                    onChange={(e) =>
                      updateLayer({
                        gradientColors: [layer.gradientColors[0], e.target.value],
                      })
                    }
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={layer.gradientColors[1]}
                    onChange={(e) =>
                      updateLayer({
                        gradientColors: [layer.gradientColors[0], e.target.value],
                      })
                    }
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Gradient Angle with NumberSliderControl */}
            <NumberSliderControl
              id="style-gradient-angle"
              label="Ángulo del Degradado"
              value={layer.gradientAngle}
              min={-180}
              max={180}
              step={1}
              unit="°"
              onChange={(gradientAngle) => updateLayer({ gradientAngle })}
              quickResetValue={0}
            />
          </div>
        ) : (
          /* Animated Gradient Controls */
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Degradado Animado Activo</span>
              </span>
              <span className="text-[10px] text-slate-400">Flujo Continuo</span>
            </div>

            {/* Color stops */}
            <div className="flex items-center gap-2 flex-wrap">
              {(layer.animatedGradient?.colors || ['#ff007f', '#7928ca', '#00f0ff']).map((col, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <input
                    type="color"
                    value={col.startsWith('#') ? col : '#ff007f'}
                    onChange={(e) => {
                      const currentColors = layer.animatedGradient?.colors || ['#ff007f', '#7928ca', '#00f0ff'];
                      const nextColors = [...currentColors];
                      nextColors[idx] = e.target.value;
                      updateLayer({
                        animatedGradient: {
                          ...(layer.animatedGradient || {
                            enabled: true,
                            colors: nextColors,
                            style: 'linear',
                            speed: 1.0,
                            angle: 45,
                            rotateWithTime: true,
                            pulseIntensity: 0.35,
                            blendMode: 'normal',
                            target: 'layer',
                            opacity: 1,
                          }),
                          colors: nextColors,
                        },
                      });
                    }}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[9px] font-mono text-slate-300">{col}</span>
                </div>
              ))}
            </div>

            <NumberSliderControl
              id="style-anim-grad-speed"
              label="Velocidad de Animación"
              value={layer.animatedGradient?.speed ?? 1.0}
              min={0.2}
              max={3.0}
              step={0.1}
              unit="x"
              onChange={(speed) =>
                updateLayer({
                  animatedGradient: {
                    ...(layer.animatedGradient || {
                      enabled: true,
                      colors: ['#ff007f', '#7928ca', '#00f0ff'],
                      style: 'linear',
                      speed: 1.0,
                      angle: 45,
                      rotateWithTime: true,
                      pulseIntensity: 0.35,
                      blendMode: 'normal',
                      target: 'layer',
                      opacity: 1,
                    }),
                    speed,
                  },
                })
              }
            />

            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Rotar Ángulo 360° en Continuo</span>
              <input
                type="checkbox"
                checked={layer.animatedGradient?.rotateWithTime ?? true}
                onChange={(e) =>
                  updateLayer({
                    animatedGradient: {
                      ...(layer.animatedGradient || {
                        enabled: true,
                        colors: ['#ff007f', '#7928ca', '#00f0ff'],
                        style: 'linear',
                        speed: 1.0,
                        angle: 45,
                        rotateWithTime: true,
                        pulseIntensity: 0.35,
                        blendMode: 'normal',
                        target: 'layer',
                        opacity: 1,
                      }),
                      rotateWithTime: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stroke / Outline */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200">Trazo / Borde Exterior</span>
          <input
            type="checkbox"
            checked={layer.strokeEnabled}
            onChange={(e) => updateLayer({ strokeEnabled: e.target.checked })}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
        </div>

        {layer.strokeEnabled && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-300 w-24">Color de Trazo:</span>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="color"
                  value={layer.strokeColor.startsWith('#') ? layer.strokeColor : '#000000'}
                  onChange={(e) => updateLayer({ strokeColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={layer.strokeColor}
                  onChange={(e) => updateLayer({ strokeColor: e.target.value })}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <NumberSliderControl
              id="style-stroke-width"
              label="Grosor de Trazo"
              value={layer.strokeWidth}
              min={1}
              max={30}
              step={1}
              unit="px"
              onChange={(strokeWidth) => updateLayer({ strokeWidth })}
              quickResetValue={2}
            />
          </div>
        )}
      </div>

      {/* Glow / Neon Bloom */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Resplandor Neón (Glow / Bloom)</span>
          </span>
          <input
            type="checkbox"
            checked={layer.glowEnabled}
            onChange={(e) => updateLayer({ glowEnabled: e.target.checked })}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
        </div>

        {layer.glowEnabled && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-300 w-24">Color Neón:</span>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="color"
                  value={layer.glowColor.startsWith('#') ? layer.glowColor : '#00F0FF'}
                  onChange={(e) => updateLayer({ glowColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={layer.glowColor}
                  onChange={(e) => updateLayer({ glowColor: e.target.value })}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <NumberSliderControl
              id="style-glow-blur"
              label="Radio de Resplandor Neón"
              value={layer.glowBlur}
              min={2}
              max={80}
              step={1}
              unit="px"
              onChange={(glowBlur) => updateLayer({ glowBlur })}
              quickResetValue={15}
            />
          </div>
        )}
      </div>

      {/* Drop Shadow */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-slate-400" />
            <span>Sombra Proyectada</span>
          </span>
          <input
            type="checkbox"
            checked={layer.shadowEnabled}
            onChange={(e) => updateLayer({ shadowEnabled: e.target.checked })}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
        </div>

        {layer.shadowEnabled && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-300 w-24">Color Sombra:</span>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="color"
                  value={layer.shadowColor.startsWith('#') ? layer.shadowColor : '#000000'}
                  onChange={(e) => updateLayer({ shadowColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={layer.shadowColor}
                  onChange={(e) => updateLayer({ shadowColor: e.target.value })}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <NumberSliderControl
              id="style-shadow-blur"
              label="Difuminado (Blur) de Sombra"
              value={layer.shadowBlur}
              min={0}
              max={60}
              step={1}
              unit="px"
              onChange={(shadowBlur) => updateLayer({ shadowBlur })}
              quickResetValue={12}
            />

            <div className="grid grid-cols-2 gap-3">
              <NumberSliderControl
                id="style-shadow-offset-x"
                label="Desplazamiento X"
                value={layer.shadowOffsetX}
                min={-50}
                max={50}
                step={1}
                unit="px"
                onChange={(shadowOffsetX) => updateLayer({ shadowOffsetX })}
                quickResetValue={0}
              />

              <NumberSliderControl
                id="style-shadow-offset-y"
                label="Desplazamiento Y"
                value={layer.shadowOffsetY}
                min={-50}
                max={50}
                step={1}
                unit="px"
                onChange={(shadowOffsetY) => updateLayer({ shadowOffsetY })}
                quickResetValue={10}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
