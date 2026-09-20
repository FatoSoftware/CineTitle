import React from 'react';
import {
  Box,
  RotateCw,
  Sun,
  Layers,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { TextLayer, MaterialType } from '../../types';
import { NumberSliderControl } from '../common/NumberSliderControl';

interface ThreeDInspectorProps {
  layer: TextLayer;
  updateLayer: (updates: Partial<TextLayer>) => void;
}

const MATERIALS: { id: MaterialType; name: string; iconBg: string; desc: string }[] = [
  { id: 'gold', name: 'Oro Pulido 24K', iconBg: 'from-amber-400 to-amber-600', desc: 'Reflejos dorados con brillo cálido' },
  { id: 'chrome', name: 'Cromo Espejo', iconBg: 'from-slate-200 to-slate-400', desc: 'Acabado plateado de alto contraste' },
  { id: 'neon', name: 'Neón Holográfico', iconBg: 'from-cyan-400 to-fuchsia-500', desc: 'Brillo auto-iluminado con aura de color' },
  { id: 'metal', name: 'Metal Cepillado', iconBg: 'from-slate-500 to-slate-700', desc: 'Acero satinado industrial' },
  { id: 'synthwave', name: 'Synthwave 80s', iconBg: 'from-fuchsia-500 to-amber-500', desc: 'Bicolor retro fucsia-naranja' },
  { id: 'glass', name: 'Cristal Traslúcido', iconBg: 'from-cyan-200/50 to-blue-400/50', desc: 'Bordes transparentes esmerilados' },
  { id: 'matte', name: 'Mate Clásico', iconBg: 'from-slate-700 to-slate-900', desc: 'Sombreado difuso tradicional' },
];

export const ThreeDInspector: React.FC<ThreeDInspectorProps> = ({ layer, updateLayer }) => {
  const threeD = layer.threeD;

  const update3D = (updates: Partial<typeof threeD>) => {
    updateLayer({
      threeD: { ...threeD, ...updates },
    });
  };

  return (
    <div id="inspector-3d" className="p-4 space-y-4">
      {/* 3D Master Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              threeD.enabled
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Box className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-100">
              Motor de Extrusión 3D
            </span>
            <span className="text-[11px] text-slate-400">
              {threeD.enabled ? 'Renderizando texto volumétrico 3D' : 'Modo 2D estándar plano'}
            </span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id="toggle-3d-enabled"
            type="checkbox"
            checked={threeD.enabled}
            onChange={(e) => update3D({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {/* If 3D is disabled, show invitation banner */}
      {!threeD.enabled && (
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
          <p className="text-xs text-slate-300">
            Activa el motor 3D para transformar cualquier fuente 2D en bloques tridimensionales con bisel, iluminación dinámica y rotación en los tres ejes (X, Y, Z).
          </p>
          <button
            onClick={() => update3D({ enabled: true })}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer"
          >
            Activar 3D Ahora
          </button>
        </div>
      )}

      {threeD.enabled && (
        <div className="space-y-4">
          {/* Material Presets Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Material y Acabado 3D</span>
              </span>
              <span className="text-[10px] text-amber-400 font-mono uppercase">
                {threeD.material}
              </span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {MATERIALS.map((mat) => (
                <button
                  key={mat.id}
                  onClick={() => update3D({ material: mat.id })}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition ${
                    threeD.material === mat.id
                      ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-gradient-to-tr ${mat.iconBg} shadow-sm shrink-0`}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-medium truncate">{mat.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Extrusion Depth & Angle with Range Slider + Text Number Box */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Extrusión Volumétrica</span>
            </span>

            <NumberSliderControl
              id="3d-depth"
              label="Profundidad (Grosor 3D)"
              value={threeD.depth}
              min={0}
              max={100}
              step={1}
              unit="px"
              onChange={(depth) => update3D({ depth })}
              quickResetValue={25}
            />

            <NumberSliderControl
              id="3d-angle"
              label="Dirección de Extrusión"
              value={threeD.angle}
              min={-180}
              max={180}
              step={1}
              unit="°"
              onChange={(angle) => update3D({ angle })}
              quickResetValue={90}
            />
          </div>

          {/* 3D Bevel (Biselado) with Slider + Text Number Box */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Biselado y Resalte de Bordes</span>
            </span>

            <div className="grid grid-cols-2 gap-3 items-end">
              <NumberSliderControl
                id="3d-bevel-size"
                label="Grosor de Bisel"
                value={threeD.bevelSize}
                min={0}
                max={15}
                step={1}
                unit="px"
                onChange={(bevelSize) => update3D({ bevelSize })}
                quickResetValue={3}
              />

              <div className="space-y-1">
                <label className="block text-[11px] text-slate-300 font-medium">Color del Bisel</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={threeD.bevelColor.startsWith('#') ? threeD.bevelColor : '#F59E0B'}
                    onChange={(e) => update3D({ bevelColor: e.target.value })}
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={threeD.bevelColor}
                    onChange={(e) => update3D({ bevelColor: e.target.value })}
                    className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3D Rotations (Pitch X, Yaw Y, Roll Z) with Sliders + Text Box */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Perspectiva y Rotación 3D Real</span>
              </span>
              <button
                onClick={() => update3D({ rotX: 0, rotY: 0, rotZ: 0 })}
                className="text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                Resetear Ángulos
              </button>
            </div>

            {/* True 3D Toggle */}
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-[11px] text-slate-300 font-medium">
                Punto de Fuga Real (Perspectiva Cónica)
              </span>
              <input
                type="checkbox"
                checked={threeD.true3DPerspective !== false}
                onChange={(e) => update3D({ true3DPerspective: e.target.checked })}
                className="w-4 h-4 text-amber-500 bg-slate-950 border-slate-700 rounded focus:ring-amber-500"
              />
            </div>

            <NumberSliderControl
              id="3d-perspective-dist"
              label="Distancia Focal de Cámara (FOV / Perspectiva)"
              value={threeD.perspective ?? 900}
              min={300}
              max={2500}
              step={20}
              unit="px"
              onChange={(perspective) => update3D({ perspective })}
              quickResetValue={900}
            />

            {/* Quick Angle Presets */}
            <div className="space-y-1.5">
              <label className="block text-[11px] text-slate-400">Vistas Rápidas 3D:</label>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  onClick={() => update3D({ rotX: 0, rotY: 0, rotZ: 0 })}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  Frontal (0°)
                </button>
                <button
                  onClick={() => update3D({ rotX: 20, rotY: -30, rotZ: 0 })}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  Isométrica
                </button>
                <button
                  onClick={() => update3D({ rotX: -18, rotY: 25, rotZ: -5 })}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  Cine 3D
                </button>
              </div>
            </div>

            <NumberSliderControl
              id="3d-rotx"
              label="Inclinación Vertical (Pitch / Rotación X)"
              value={threeD.rotX}
              min={-90}
              max={90}
              step={1}
              unit="°"
              onChange={(rotX) => update3D({ rotX })}
              quickResetValue={0}
            />

            <NumberSliderControl
              id="3d-roty"
              label="Giro Horizontal (Yaw / Rotación Y)"
              value={threeD.rotY}
              min={-90}
              max={90}
              step={1}
              unit="°"
              onChange={(rotY) => update3D({ rotY })}
              quickResetValue={0}
            />

            <NumberSliderControl
              id="3d-rotz"
              label="Rotación Frontal (Roll / Rotación Z)"
              value={threeD.rotZ}
              min={-180}
              max={180}
              step={1}
              unit="°"
              onChange={(rotZ) => update3D({ rotZ })}
              quickResetValue={0}
            />
          </div>

          {/* 3D Lighting & Shading with % and units */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Iluminación y Brillo</span>
            </span>

            <NumberSliderControl
              id="3d-light-angle"
              label="Ángulo de Luz"
              value={threeD.lightAngle}
              min={0}
              max={360}
              step={1}
              unit="°"
              onChange={(lightAngle) => update3D({ lightAngle })}
              quickResetValue={45}
            />

            <NumberSliderControl
              id="3d-light-intensity"
              label="Intensidad de Luz"
              value={threeD.lightIntensity}
              min={0.2}
              max={2.5}
              step={0.1}
              unit="x"
              onChange={(lightIntensity) => update3D({ lightIntensity })}
              quickResetValue={1.0}
            />

            <NumberSliderControl
              id="3d-specular"
              label="Especularidad (Destello Metálico)"
              value={threeD.specular}
              min={0}
              max={1}
              step={0.01}
              isPercent={true}
              onChange={(specular) => update3D({ specular })}
              quickResetValue={0.6}
            />
          </div>
        </div>
      )}
    </div>
  );
};
