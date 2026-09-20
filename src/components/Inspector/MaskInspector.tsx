import React from 'react';
import {
  Scissors,
  Eye,
  Sliders,
  Sparkles,
  Square,
  Circle,
  SplitSquareVertical,
  FlipHorizontal,
} from 'lucide-react';
import { TextLayer, LayerMaskSettings } from '../../types';
import { NumberSliderControl } from '../common/NumberSliderControl';

interface MaskInspectorProps {
  layer: TextLayer;
  updateLayer: (updates: Partial<TextLayer>) => void;
}

const DEFAULT_MASK: LayerMaskSettings = {
  enabled: false,
  type: 'linear-wipe',
  x: 50,
  y: 50,
  width: 100,
  height: 100,
  feather: 10,
  progress: 100,
  invert: false,
};

export const MaskInspector: React.FC<MaskInspectorProps> = ({ layer, updateLayer }) => {
  const mask = layer.mask || DEFAULT_MASK;

  const updateMask = (updates: Partial<LayerMaskSettings>) => {
    updateLayer({
      mask: { ...mask, ...updates },
    });
  };

  return (
    <div id="inspector-mask" className="p-4 space-y-4">
      {/* Enable Mask Switch */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              mask.enabled
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-100">
              Máscara de Recorte y Revelado
            </span>
            <span className="text-[11px] text-slate-400">
              {mask.enabled ? 'Recorte activo sobre esta capa' : 'Sin máscara (completamente visible)'}
            </span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id="toggle-mask-enabled"
            type="checkbox"
            checked={mask.enabled}
            onChange={(e) => updateMask({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {!mask.enabled ? (
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
          <p className="text-xs text-slate-300">
            Las máscaras te permiten recortar la capa con formas (rectángulo, círculo o barrido lineal), ideal para revelar textos emergiendo de una línea o limitar la visibilidad de elementos 3D.
          </p>
          <button
            onClick={() => updateMask({ enabled: true })}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer"
          >
            Activar Máscara
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mask Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Forma de la Máscara
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'linear-wipe',
                  label: 'Barrido Lineal',
                  desc: 'Revelado lateral',
                  icon: <SplitSquareVertical className="w-4 h-4" />,
                },
                {
                  id: 'rectangle',
                  label: 'Ventana Rectangular',
                  desc: 'Caja de recorte',
                  icon: <Square className="w-4 h-4" />,
                },
                {
                  id: 'circle',
                  label: 'Iris Circular',
                  desc: 'Apertura circular',
                  icon: <Circle className="w-4 h-4" />,
                },
              ].map((m) => {
                const isSelected = mask.type === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => updateMask({ type: m.id as any })}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {m.icon}
                    <span className="text-[10px] leading-tight">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress / Reveal Slider */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                {mask.type === 'linear-wipe' ? 'Progreso del Barrido' : 'Escala de la Máscara'}
              </span>
              <button
                onClick={() => updateMask({ progress: 100 })}
                className="text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                100% (Total)
              </button>
            </div>

            <NumberSliderControl
              id="mask-progress"
              label="Visibilidad / Apertura de Máscara"
              value={mask.progress}
              min={0}
              max={100}
              step={1}
              unit="%"
              onChange={(progress) => updateMask({ progress })}
              quickResetValue={100}
            />

            {/* Invert mask toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <FlipHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Invertir Máscara (Ocultar interior)</span>
              </span>
              <input
                type="checkbox"
                checked={mask.invert}
                onChange={(e) => updateMask({ invert: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Dimensions / Bounding Box (for Rectangle & Circle) */}
          {mask.type !== 'linear-wipe' && (
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 block">
                Dimensiones y Centrado
              </span>

              <NumberSliderControl
                id="mask-width"
                label="Ancho de la Ventana"
                value={mask.width}
                min={10}
                max={100}
                step={1}
                unit="%"
                onChange={(width) => updateMask({ width })}
                quickResetValue={80}
              />

              <NumberSliderControl
                id="mask-height"
                label="Alto de la Ventana"
                value={mask.height}
                min={10}
                max={100}
                step={1}
                unit="%"
                onChange={(height) => updateMask({ height })}
                quickResetValue={80}
              />

              <div className="grid grid-cols-2 gap-3">
                <NumberSliderControl
                  id="mask-pos-x"
                  label="Centro X"
                  value={mask.x}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  onChange={(x) => updateMask({ x })}
                  quickResetValue={50}
                />

                <NumberSliderControl
                  id="mask-pos-y"
                  label="Centro Y"
                  value={mask.y}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  onChange={(y) => updateMask({ y })}
                  quickResetValue={50}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
