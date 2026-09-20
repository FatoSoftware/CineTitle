import React from 'react';
import {
  Diamond,
  Plus,
  Trash2,
  Clock,
  Play,
  RotateCw,
  Layers,
  ChevronRight,
  Maximize,
} from 'lucide-react';
import { TextLayer, Keyframe } from '../../types';
import { NumberSliderControl } from '../common/NumberSliderControl';

interface KeyframeInspectorProps {
  layer: TextLayer;
  updateLayer: (updates: Partial<TextLayer>) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
}

export const KeyframeInspector: React.FC<KeyframeInspectorProps> = ({
  layer,
  updateLayer,
  currentTime,
  setCurrentTime,
  duration,
}) => {
  const keyframes = layer.keyframes || [];
  const useKeyframes = !!layer.useKeyframes;

  // Toggle keyframe mode
  const handleToggleKeyframes = (enabled: boolean) => {
    if (enabled && keyframes.length === 0) {
      // Initialize with start and end keyframes based on current layer properties
      const kf1: Keyframe = {
        id: `kf-${Date.now()}-1`,
        time: 0,
        properties: {
          x: layer.x,
          y: layer.y,
          scale: 1,
          opacity: 1,
          rotX: layer.threeD.rotX,
          rotY: layer.threeD.rotY,
          rotZ: layer.threeD.rotZ,
          depth: layer.threeD.depth,
        },
      };
      const kf2: Keyframe = {
        id: `kf-${Date.now()}-2`,
        time: Math.min(2.0, duration),
        properties: {
          x: layer.x,
          y: layer.y,
          scale: 1.15,
          opacity: 1,
          rotX: layer.threeD.rotX,
          rotY: layer.threeD.rotY + 15,
          rotZ: layer.threeD.rotZ,
          depth: layer.threeD.depth + 10,
        },
      };
      updateLayer({ useKeyframes: true, keyframes: [kf1, kf2] });
    } else {
      updateLayer({ useKeyframes: enabled });
    }
  };

  // Add Keyframe at currentTime
  const handleAddKeyframe = () => {
    const roundedTime = Math.round(currentTime * 100) / 100;
    // Check if one already exists within 0.05s
    const existingIndex = keyframes.findIndex((k) => Math.abs(k.time - roundedTime) < 0.05);

    const currentProps = {
      x: layer.x,
      y: layer.y,
      scale: 1,
      opacity: layer.opacity ?? 1,
      rotX: layer.threeD.rotX,
      rotY: layer.threeD.rotY,
      rotZ: layer.threeD.rotZ,
      depth: layer.threeD.depth,
    };

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...keyframes];
      updated[existingIndex] = {
        ...updated[existingIndex],
        properties: { ...updated[existingIndex].properties, ...currentProps },
      };
      updateLayer({ keyframes: updated, useKeyframes: true });
    } else {
      // Insert new sorted by time
      const newKf: Keyframe = {
        id: `kf-${Date.now()}`,
        time: roundedTime,
        properties: currentProps,
      };
      const updated = [...keyframes, newKf].sort((a, b) => a.time - b.time);
      updateLayer({ keyframes: updated, useKeyframes: true });
    }
  };

  // Delete keyframe
  const handleDeleteKeyframe = (id: string) => {
    const updated = keyframes.filter((k) => k.id !== id);
    updateLayer({ keyframes: updated });
  };

  // Update specific keyframe property
  const handleUpdateKfProp = (kfId: string, propKey: string, val: number) => {
    const updated = keyframes.map((kf) => {
      if (kf.id !== kfId) return kf;
      return {
        ...kf,
        properties: {
          ...kf.properties,
          [propKey]: val,
        },
      };
    });
    updateLayer({ keyframes: updated });
  };

  // Find active keyframe near currentTime (within 0.15s)
  const activeKf = keyframes.find((k) => Math.abs(k.time - currentTime) < 0.15);

  return (
    <div id="inspector-keyframes" className="p-4 space-y-4">
      {/* Master Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              useKeyframes
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Diamond className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-100">
              Control Preciso por Keyframes
            </span>
            <span className="text-[11px] text-slate-400">
              {useKeyframes
                ? 'Animando posición, rotación 3D y escala por puntos en el tiempo'
                : 'Usando presets automáticos (Entrada, Loop, Salida)'}
            </span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id="toggle-keyframes-enabled"
            type="checkbox"
            checked={useKeyframes}
            onChange={(e) => handleToggleKeyframes(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {!useKeyframes ? (
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
          <p className="text-xs text-slate-300">
            Los keyframes te permiten definir valores exactos de posición, escala, rotación 3D y opacidad en momentos específicos. El motor interpola suavemente los movimientos.
          </p>
          <button
            onClick={() => handleToggleKeyframes(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer"
          >
            Activar Keyframes
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action Bar: Add Keyframe at Current Time */}
          <div className="flex items-center justify-between p-2.5 bg-slate-900/70 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-mono text-slate-200">
                Tiempo actual: <span className="text-amber-400 font-bold">{currentTime.toFixed(2)}s</span>
              </span>
            </div>

            <button
              onClick={handleAddKeyframe}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition shadow-sm cursor-pointer"
            >
              <Diamond className="w-3.5 h-3.5 fill-current" />
              <span>{activeKf ? 'Actualizar KF' : '+ Añadir KF'}</span>
            </button>
          </div>

          {/* Keyframe List Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Puntos Clave ({keyframes.length})</span>
              <span className="text-[10px] text-slate-500">Haz clic para saltar al tiempo</span>
            </label>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {keyframes.map((kf, idx) => {
                const isSelected = activeKf?.id === kf.id;
                return (
                  <div
                    key={kf.id}
                    onClick={() => setCurrentTime(kf.time)}
                    className={`p-2 rounded-lg border flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/60 ring-1 ring-amber-500/30 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-xs transform rotate-45 flex items-center justify-center ${
                          isSelected ? 'bg-amber-400' : 'bg-slate-700'
                        }`}
                      />
                      <span className="text-xs font-mono font-bold">
                        KF #{idx + 1} ({kf.time.toFixed(2)}s)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span>X:{Math.round(kf.properties.x ?? layer.x)}%</span>
                      <span>Y:{Math.round(kf.properties.y ?? layer.y)}%</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteKeyframe(kf.id);
                        }}
                        className="p-1 hover:text-rose-400 text-slate-500 transition"
                        title="Eliminar este Keyframe"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Keyframe Property Editor */}
          {activeKf ? (
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Diamond className="w-3.5 h-3.5 fill-current text-amber-400" />
                  <span>Editando KF en {activeKf.time.toFixed(2)}s</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Interpolando suave
                </span>
              </div>

              {/* Pos X */}
              <NumberSliderControl
                id="kf-prop-x"
                label="Posición X en este Keyframe"
                value={activeKf.properties.x ?? layer.x}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={(val) => handleUpdateKfProp(activeKf.id, 'x', val)}
                quickResetValue={50}
              />

              {/* Pos Y */}
              <NumberSliderControl
                id="kf-prop-y"
                label="Posición Y en este Keyframe"
                value={activeKf.properties.y ?? layer.y}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={(val) => handleUpdateKfProp(activeKf.id, 'y', val)}
                quickResetValue={50}
              />

              {/* Scale */}
              <NumberSliderControl
                id="kf-prop-scale"
                label="Escala en este Keyframe"
                value={activeKf.properties.scale ?? 1}
                min={0.1}
                max={3.0}
                step={0.05}
                unit="x"
                onChange={(val) => handleUpdateKfProp(activeKf.id, 'scale', val)}
                quickResetValue={1.0}
              />

              {/* Opacity */}
              <NumberSliderControl
                id="kf-prop-opacity"
                label="Opacidad en este Keyframe"
                value={activeKf.properties.opacity ?? 1}
                min={0}
                max={1}
                step={0.01}
                isPercent={true}
                onChange={(val) => handleUpdateKfProp(activeKf.id, 'opacity', val)}
                quickResetValue={1}
              />

              {/* 3D Rotations */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                <NumberSliderControl
                  id="kf-prop-rotx"
                  label="Inclinación 3D (X)"
                  value={activeKf.properties.rotX ?? layer.threeD.rotX}
                  min={-60}
                  max={60}
                  step={1}
                  unit="°"
                  onChange={(val) => handleUpdateKfProp(activeKf.id, 'rotX', val)}
                  quickResetValue={0}
                />

                <NumberSliderControl
                  id="kf-prop-roty"
                  label="Giro 3D (Y)"
                  value={activeKf.properties.rotY ?? layer.threeD.rotY}
                  min={-60}
                  max={60}
                  step={1}
                  unit="°"
                  onChange={(val) => handleUpdateKfProp(activeKf.id, 'rotY', val)}
                  quickResetValue={0}
                />
              </div>

              <NumberSliderControl
                id="kf-prop-depth"
                label="Grosor 3D en este Keyframe"
                value={activeKf.properties.depth ?? layer.threeD.depth}
                min={0}
                max={100}
                step={1}
                unit="px"
                onChange={(val) => handleUpdateKfProp(activeKf.id, 'depth', val)}
                quickResetValue={25}
              />
            </div>
          ) : (
            <div className="p-3 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-center space-y-1">
              <p className="text-xs text-slate-400">
                Mueve el cursor temporal o haz clic en uno de los puntos clave para editar sus valores numéricos.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
