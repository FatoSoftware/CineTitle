import React from 'react';
import {
  Square,
  Circle,
  Minus,
  MoveRight,
  Shield,
  Diamond,
  Shapes,
  Palette,
} from 'lucide-react';
import { TextLayer, ShapeType } from '../../types';
import { NumberSliderControl } from '../common/NumberSliderControl';

interface ShapeInspectorProps {
  layer: TextLayer;
  updateLayer: (updates: Partial<TextLayer>) => void;
}

const SHAPE_TYPES: { id: ShapeType; label: string; icon: React.ReactNode }[] = [
  { id: 'rectangle', label: 'Rectángulo', icon: <Square className="w-4 h-4" /> },
  { id: 'circle', label: 'Círculo / Óvalo', icon: <Circle className="w-4 h-4" /> },
  { id: 'line', label: 'Línea Divisoria', icon: <Minus className="w-4 h-4" /> },
  { id: 'arrow', label: 'Flecha Decorativa', icon: <MoveRight className="w-4 h-4" /> },
  { id: 'badge', label: 'Insignia / Placa', icon: <Shield className="w-4 h-4" /> },
  { id: 'diamond', label: 'Diamante / Rombo', icon: <Diamond className="w-4 h-4" /> },
];

export const ShapeInspector: React.FC<ShapeInspectorProps> = ({ layer, updateLayer }) => {
  const shapeType = layer.shapeType || 'rectangle';

  return (
    <div id="inspector-shape" className="p-4 space-y-4">
      {/* Shape Type Grid */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Shapes className="w-3.5 h-3.5 text-amber-400" />
          <span>Tipo de Elemento Gráfico</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {SHAPE_TYPES.map((st) => {
            const isSelected = shapeType === st.id;
            return (
              <button
                key={st.id}
                onClick={() => updateLayer({ shapeType: st.id })}
                className={`p-2 rounded-lg border flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {st.icon}
                <span className="text-[10px] leading-tight">{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dimensions: Width, Height, Corner Radius */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-200 block">Dimensiones de la Forma</span>

        <NumberSliderControl
          id="shape-width"
          label="Ancho de la Forma"
          value={layer.shapeWidth ?? 400}
          min={20}
          max={1600}
          step={10}
          unit="px"
          onChange={(shapeWidth) => updateLayer({ shapeWidth })}
          quickResetValue={400}
        />

        {shapeType !== 'line' && (
          <NumberSliderControl
            id="shape-height"
            label="Alto de la Forma"
            value={layer.shapeHeight ?? 80}
            min={10}
            max={900}
            step={5}
            unit="px"
            onChange={(shapeHeight) => updateLayer({ shapeHeight })}
            quickResetValue={80}
          />
        )}

        {shapeType === 'rectangle' && (
          <NumberSliderControl
            id="shape-corner-radius"
            label="Redondeo de Esquinas"
            value={layer.cornerRadius ?? 12}
            min={0}
            max={100}
            step={2}
            unit="px"
            onChange={(cornerRadius) => updateLayer({ cornerRadius })}
            quickResetValue={12}
          />
        )}

        <NumberSliderControl
          id="shape-opacity"
          label="Opacidad del Elemento"
          value={layer.opacity ?? 1}
          min={0}
          max={1}
          step={0.01}
          isPercent={true}
          onChange={(opacity) => updateLayer({ opacity })}
          quickResetValue={1}
        />
      </div>

      {/* Fill & Colors */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Color y Relleno</span>
          </span>
          <div className="flex bg-slate-950 border border-slate-700/80 rounded-md p-0.5 text-[11px]">
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
          </div>
        </div>

        {layer.fillType === 'solid' ? (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={layer.fillColor.startsWith('#') ? layer.fillColor : '#F59E0B'}
              onChange={(e) => updateLayer({ fillColor: e.target.value })}
              className="w-9 h-9 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={layer.fillColor}
              onChange={(e) => updateLayer({ fillColor: e.target.value })}
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 font-mono"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Color 1</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={layer.gradientColors[0]}
                  onChange={(e) =>
                    updateLayer({
                      gradientColors: [e.target.value, layer.gradientColors[1]],
                    })
                  }
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
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
              <span className="text-[11px] text-slate-400 block mb-1">Color 2</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={layer.gradientColors[1]}
                  onChange={(e) =>
                    updateLayer({
                      gradientColors: [layer.gradientColors[0], e.target.value],
                    })
                  }
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
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
        )}
      </div>

      {/* Position X / Y Dual Controls */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Posición en Pantalla (%)</span>
          <button
            onClick={() => updateLayer({ x: 50, y: 50 })}
            className="text-[11px] text-amber-400 hover:underline cursor-pointer"
          >
            Centrar Total (50%, 50%)
          </button>
        </div>

        <NumberSliderControl
          id="shape-pos-x"
          label="Posición Horizontal X"
          value={layer.x}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(x) => updateLayer({ x })}
          quickResetValue={50}
        />

        <NumberSliderControl
          id="shape-pos-y"
          label="Posición Vertical Y"
          value={layer.y}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(y) => updateLayer({ y })}
          quickResetValue={50}
        />
      </div>
    </div>
  );
};
