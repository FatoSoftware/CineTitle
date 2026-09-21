import React, { useState } from 'react';
import {
  Video,
  Layers,
  Sparkles,
  Zap,
  RotateCcw,
  Sliders,
  Move,
  Eye,
  Crosshair,
  Shuffle,
  Compass,
  Maximize2,
  Minimize2,
  Film,
  Play,
  Flame,
  ArrowRight,
  ArrowUp,
  Split,
  Box,
  Radio,
} from 'lucide-react';
import {
  ProjectSettings,
  TextLayer,
  CameraSettings,
  getDefaultCameraSettings,
  CameraMovementPreset,
  CameraShakeType,
  ParallaxMode,
  TitleTransitionType,
} from '../../types';
import { NumberSliderControl } from '../common/NumberSliderControl';

interface CameraInspectorProps {
  project: ProjectSettings;
  setProject: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  selectedLayer: TextLayer | null;
  updateLayer?: (updates: Partial<TextLayer>) => void;
  currentTime: number;
}

type CameraSubSection = 'camera' | 'parallax' | 'transitions' | 'shake';

export const CameraInspector: React.FC<CameraInspectorProps> = ({
  project,
  setProject,
  selectedLayer,
  updateLayer,
  currentTime,
}) => {
  const [activeSection, setActiveSection] = useState<CameraSubSection>('camera');

  const camera: CameraSettings = project.camera || getDefaultCameraSettings();

  const updateCamera = (updates: Partial<CameraSettings>) => {
    setProject((prev) => ({
      ...prev,
      camera: {
        ...(prev.camera || getDefaultCameraSettings()),
        ...updates,
      },
    }));
  };

  const updateParallax = (updates: Partial<CameraSettings['parallax']>) => {
    setProject((prev) => ({
      ...prev,
      camera: {
        ...(prev.camera || getDefaultCameraSettings()),
        parallax: {
          ...(prev.camera?.parallax || getDefaultCameraSettings().parallax),
          ...updates,
        },
      },
    }));
  };

  const updateShake = (updates: Partial<CameraSettings['shake']>) => {
    setProject((prev) => ({
      ...prev,
      camera: {
        ...(prev.camera || getDefaultCameraSettings()),
        shake: {
          ...(prev.camera?.shake || getDefaultCameraSettings().shake),
          ...updates,
        },
      },
    }));
  };

  const updateTransitions = (updates: Partial<CameraSettings['transitions']>) => {
    setProject((prev) => ({
      ...prev,
      camera: {
        ...(prev.camera || getDefaultCameraSettings()),
        transitions: {
          ...(prev.camera?.transitions || getDefaultCameraSettings().transitions),
          ...updates,
        },
      },
    }));
  };

  // 1-Click Camera Presets
  const applyPreset = (presetKey: string) => {
    switch (presetKey) {
      case 'blockbuster':
        setProject((prev) => ({
          ...prev,
          camera: {
            ...getDefaultCameraSettings(),
            enabled: true,
            movementPreset: 'slow-push-in',
            zoom: 1.0,
            movementSpeed: 1.0,
            movementRange: 1.2,
            parallax: {
              enabled: true,
              mode: 'combined',
              intensity: 120,
              smoothing: 0.8,
              depthScale: 1.2,
              autoSwaySpeed: 0.8,
              autoSwayAmount: 22,
            },
            shake: {
              enabled: true,
              type: 'handheld',
              intensity: 12,
              frequency: 6,
              rotational: true,
              rotationIntensity: 1.2,
              mode: 'continuous',
              triggerTime: 1.0,
              decayTime: 0.8,
            },
            transitions: {
              enabled: true,
              type: 'fade',
              duration: 0.9,
              easing: 'easeInOutCubic',
              timingMode: 'auto-sequence',
              intervalDuration: 2.5,
              color: '#000000',
              blurStrength: 8,
            },
          },
        }));
        break;

      case 'action-trailer':
        setProject((prev) => ({
          ...prev,
          camera: {
            ...getDefaultCameraSettings(),
            enabled: true,
            movementPreset: 'dolly-zoom-vertigo',
            zoom: 1.05,
            movementSpeed: 1.4,
            movementRange: 1.5,
            parallax: {
              enabled: true,
              mode: 'combined',
              intensity: 150,
              smoothing: 0.7,
              depthScale: 1.5,
              autoSwaySpeed: 1.5,
              autoSwayAmount: 30,
            },
            shake: {
              enabled: true,
              type: 'impact',
              intensity: 38,
              frequency: 18,
              rotational: true,
              rotationIntensity: 4.5,
              mode: 'impact-burst',
              triggerTime: Math.max(0.5, currentTime),
              decayTime: 0.9,
            },
            transitions: {
              enabled: true,
              type: 'zoom-swish',
              duration: 0.7,
              easing: 'easeOutExpo',
              timingMode: 'auto-sequence',
              intervalDuration: 2.0,
              color: '#ffffff',
              blurStrength: 12,
            },
          },
        }));
        break;

      case 'documentary':
        setProject((prev) => ({
          ...prev,
          camera: {
            ...getDefaultCameraSettings(),
            enabled: true,
            movementPreset: 'handheld-float',
            zoom: 1.02,
            movementSpeed: 0.9,
            movementRange: 1.0,
            parallax: {
              enabled: true,
              mode: 'mouse',
              intensity: 110,
              smoothing: 0.85,
              depthScale: 1.1,
              autoSwaySpeed: 0.7,
              autoSwayAmount: 15,
            },
            shake: {
              enabled: true,
              type: 'handheld',
              intensity: 16,
              frequency: 7,
              rotational: true,
              rotationIntensity: 1.8,
              mode: 'continuous',
              triggerTime: 1.0,
              decayTime: 0.8,
            },
            transitions: {
              enabled: true,
              type: 'wipe-horizontal',
              duration: 0.8,
              easing: 'easeInOutQuad',
              timingMode: 'auto-sequence',
              intervalDuration: 2.5,
              color: '#000000',
              blurStrength: 6,
            },
          },
        }));
        break;

      case 'cyberpunk-orbit':
        setProject((prev) => ({
          ...prev,
          camera: {
            ...getDefaultCameraSettings(),
            enabled: true,
            movementPreset: 'orbit-arc',
            zoom: 1.08,
            movementSpeed: 1.2,
            movementRange: 1.3,
            parallax: {
              enabled: true,
              mode: 'combined',
              intensity: 140,
              smoothing: 0.75,
              depthScale: 1.3,
              autoSwaySpeed: 1.2,
              autoSwayAmount: 25,
            },
            shake: {
              enabled: true,
              type: 'chaos-glitch',
              intensity: 22,
              frequency: 14,
              rotational: true,
              rotationIntensity: 3.2,
              mode: 'continuous',
              triggerTime: 1.0,
              decayTime: 0.8,
            },
            transitions: {
              enabled: true,
              type: 'glitch-slice',
              duration: 0.6,
              easing: 'easeInOutQuad',
              timingMode: 'auto-sequence',
              intervalDuration: 2.2,
              color: '#00f0ff',
              blurStrength: 10,
            },
          },
        }));
        break;

      case 'apple-minimal':
        setProject((prev) => ({
          ...prev,
          camera: {
            ...getDefaultCameraSettings(),
            enabled: true,
            movementPreset: 'slow-push-in',
            zoom: 0.98,
            movementSpeed: 0.7,
            movementRange: 0.7,
            parallax: {
              enabled: true,
              mode: 'auto-sway',
              intensity: 90,
              smoothing: 0.9,
              depthScale: 1.0,
              autoSwaySpeed: 0.6,
              autoSwayAmount: 14,
            },
            shake: {
              enabled: false,
              type: 'handheld',
              intensity: 0,
              frequency: 5,
              rotational: false,
              rotationIntensity: 0,
              mode: 'continuous',
              triggerTime: 1.0,
              decayTime: 0.8,
            },
            transitions: {
              enabled: true,
              type: 'crossfade',
              duration: 1.0,
              easing: 'easeInOutCubic',
              timingMode: 'auto-sequence',
              intervalDuration: 2.8,
              color: '#000000',
              blurStrength: 4,
            },
          },
        }));
        break;
    }
  };

  // Trigger Immediate Test Shake
  const triggerTestShake = () => {
    updateShake({
      enabled: true,
      mode: 'impact-burst',
      triggerTime: currentTime,
      decayTime: Math.max(0.6, camera.shake.decayTime || 0.8),
    });
  };

  // Distribute All Layers Evenly Across Timeline
  const autoSequenceLayers = () => {
    const totalDuration = project.duration;
    const count = project.layers.length;
    if (count === 0) return;

    const slot = totalDuration / count;
    setProject((prev) => ({
      ...prev,
      camera: {
        ...(prev.camera || getDefaultCameraSettings()),
        transitions: {
          ...(prev.camera?.transitions || getDefaultCameraSettings().transitions),
          enabled: true,
          timingMode: 'auto-sequence',
        },
      },
      layers: prev.layers.map((l, idx) => ({
        ...l,
        sequenceStartTime: idx * slot,
        sequenceEndTime: (idx + 1) * slot,
        parallaxDepth: idx === 0 ? 40 : idx === 1 ? 0 : -35,
      })),
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950 text-slate-200">
      {/* Top Header & Presets */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Video className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Cámara y Movimiento
              </h2>
              <p className="text-[10px] text-slate-400">
                Zoom, paneo, parallax 3D, transiciones y temblor
              </p>
            </div>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <span className="text-[10px] text-slate-400 font-medium">Activar</span>
            <input
              type="checkbox"
              id="toggle-master-camera"
              checked={camera.enabled}
              onChange={(e) => updateCamera({ enabled: e.target.checked })}
              className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
          </label>
        </div>

        {/* 1-Click Presets Bar */}
        <div>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1.5">
            Presets Cinematográficos
          </span>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => applyPreset('blockbuster')}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] font-medium text-slate-300 text-left flex items-center gap-1.5 transition cursor-pointer"
            >
              <Film className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">Blockbuster 3D</span>
            </button>
            <button
              onClick={() => applyPreset('action-trailer')}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] font-medium text-slate-300 text-left flex items-center gap-1.5 transition cursor-pointer"
            >
              <Zap className="w-3 h-3 text-rose-400 shrink-0" />
              <span className="truncate">Tráiler Acción</span>
            </button>
            <button
              onClick={() => applyPreset('documentary')}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] font-medium text-slate-300 text-left flex items-center gap-1.5 transition cursor-pointer"
            >
              <Compass className="w-3 h-3 text-sky-400 shrink-0" />
              <span className="truncate">Documental Cámara</span>
            </button>
            <button
              onClick={() => applyPreset('cyberpunk-orbit')}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] font-medium text-slate-300 text-left flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="truncate">Cyberpunk Órbita</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-4 border-b border-slate-800/80 bg-slate-950 p-1 gap-0.5 shrink-0">
        <button
          onClick={() => setActiveSection('camera')}
          className={`py-1.5 px-1 rounded text-[10px] font-semibold flex flex-col items-center gap-0.5 transition cursor-pointer ${
            activeSection === 'camera'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Video className="w-3 h-3" />
          <span>Cámara</span>
        </button>

        <button
          onClick={() => setActiveSection('parallax')}
          className={`py-1.5 px-1 rounded text-[10px] font-semibold flex flex-col items-center gap-0.5 transition cursor-pointer relative ${
            activeSection === 'parallax'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>Parallax 3D</span>
          {camera.parallax.enabled && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveSection('transitions')}
          className={`py-1.5 px-1 rounded text-[10px] font-semibold flex flex-col items-center gap-0.5 transition cursor-pointer relative ${
            activeSection === 'transitions'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Split className="w-3 h-3" />
          <span>Transiciones</span>
          {camera.transitions.enabled && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveSection('shake')}
          className={`py-1.5 px-1 rounded text-[10px] font-semibold flex flex-col items-center gap-0.5 transition cursor-pointer relative ${
            activeSection === 'shake'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>Shake</span>
          {camera.shake.enabled && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      {/* Main Section Content */}
      <div className="p-3 space-y-4 flex-1">
        {/* ========================================================
            1. MOVIMIENTO DE CÁMARA (ZOOM, PANEO, ROTACIÓN)
            ======================================================== */}
        {activeSection === 'camera' && (
          <div className="space-y-3.5">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-amber-400" />
                  Movimiento de Cámara
                </span>
                <button
                  onClick={() =>
                    updateCamera({
                      zoom: 1.0,
                      panX: 0,
                      panY: 0,
                      rotation: 0,
                      movementPreset: 'static',
                    })
                  }
                  className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition cursor-pointer"
                  title="Restablecer posición de cámara"
                >
                  <RotateCcw className="w-3 h-3" />
                  Resetear
                </button>
              </div>

              {/* Movement Preset Selectors */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-medium block mb-1">
                  Movimiento Cinematográfico
                </label>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {[
                    { id: 'static', label: 'Estático' },
                    { id: 'slow-push-in', label: 'Dolly In (Push-In)' },
                    { id: 'dolly-out', label: 'Dolly Out (Alejar)' },
                    { id: 'pan-left-to-right', label: 'Paneo (Izq a Der)' },
                    { id: 'pan-right-to-left', label: 'Paneo (Der a Izq)' },
                    { id: 'orbit-arc', label: 'Órbita 3D' },
                    { id: 'crane-up', label: 'Crane (Elevación)' },
                    { id: 'dolly-zoom-vertigo', label: 'Dolly Zoom (Vértigo)' },
                    { id: 'handheld-float', label: 'Cámara Flotante' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        updateCamera({
                          movementPreset: preset.id as CameraMovementPreset,
                          enabled: true,
                        });
                      }}
                      className={`px-2 py-1.5 rounded text-left border transition cursor-pointer truncate ${
                        camera.movementPreset === preset.id
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {camera.movementPreset !== 'static' && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                  <NumberSliderControl
                    label="Velocidad"
                    value={camera.movementSpeed ?? 1.0}
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    onChange={(val) => updateCamera({ movementSpeed: val })}
                  />
                  <NumberSliderControl
                    label="Amplitud"
                    value={camera.movementRange ?? 1.0}
                    min={0.1}
                    max={2.5}
                    step={0.1}
                    onChange={(val) => updateCamera({ movementRange: val })}
                  />
                </div>
              )}
            </div>

            {/* Manual Camera Viewport Controls */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-200 block">
                Ajuste Manual de Vista Completa
              </span>

              <NumberSliderControl
                label="Zoom de Escena"
                value={camera.zoom ?? 1.0}
                min={0.3}
                max={3.0}
                step={0.05}
                unit="x"
                quickResetValue={1.0}
                onChange={(val) => updateCamera({ zoom: val, enabled: true })}
              />

              <div className="grid grid-cols-2 gap-2">
                <NumberSliderControl
                  label="Paneo X"
                  value={camera.panX ?? 0}
                  min={-100}
                  max={100}
                  step={1}
                  unit="%"
                  quickResetValue={0}
                  onChange={(val) => updateCamera({ panX: val, enabled: true })}
                />
                <NumberSliderControl
                  label="Paneo Y"
                  value={camera.panY ?? 0}
                  min={-100}
                  max={100}
                  step={1}
                  unit="%"
                  quickResetValue={0}
                  onChange={(val) => updateCamera({ panY: val, enabled: true })}
                />
              </div>

              <NumberSliderControl
                label="Rotación de Cámara (Roll)"
                value={camera.rotation ?? 0}
                min={-180}
                max={180}
                step={1}
                unit="°"
                quickResetValue={0}
                onChange={(val) => updateCamera({ rotation: val, enabled: true })}
              />
            </div>
          </div>
        )}

        {/* ========================================================
            2. EFECTO PARALLAX (MOVIMIENTO 3D CON PROFUNDIDAD)
            ======================================================== */}
        {activeSection === 'parallax' && (
          <div className="space-y-3.5">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Efecto Parallax 3D
                </span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <span className="text-[10px] text-slate-400">Activar</span>
                  <input
                    type="checkbox"
                    checked={camera.parallax.enabled}
                    onChange={(e) =>
                      updateParallax({ enabled: e.target.checked })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                </label>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                Genera ilusión óptica de profundidad 3D moviendo las capas en
                diferentes planos Z según su distancia a la cámara.
              </p>

              {/* Mode Selection */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-medium block mb-1">
                  Modo de Interacción Parallax
                </label>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {[
                    { id: 'combined', label: '✨ Combinado (Todos)' },
                    { id: 'mouse', label: '🖱️ Cursor del Ratón' },
                    { id: 'auto-sway', label: '🔄 Auto-Balanceo 3D' },
                    { id: 'camera', label: '📹 Paneo de Cámara' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() =>
                        updateParallax({
                          mode: mode.id as ParallaxMode,
                          enabled: true,
                        })
                      }
                      className={`px-2 py-1.5 rounded text-left border transition cursor-pointer truncate ${
                        camera.parallax.mode === mode.id
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <NumberSliderControl
                label="Intensidad de Parallax"
                value={camera.parallax.intensity}
                min={0}
                max={200}
                step={5}
                unit="%"
                quickResetValue={100}
                onChange={(val) => updateParallax({ intensity: val, enabled: true })}
              />

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                <NumberSliderControl
                  label="Velocidad Balanceo"
                  value={camera.parallax.autoSwaySpeed ?? 1.0}
                  min={0.2}
                  max={3.0}
                  step={0.1}
                  onChange={(val) => updateParallax({ autoSwaySpeed: val })}
                />
                <NumberSliderControl
                  label="Rango Balanceo"
                  value={camera.parallax.autoSwayAmount ?? 18}
                  min={5}
                  max={50}
                  step={1}
                  unit="px"
                  onChange={(val) => updateParallax({ autoSwayAmount: val })}
                />
              </div>
            </div>

            {/* Depth Planes for Current Selected Layer */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-200">
                  Profundidad Z de la Capa Seleccionada
                </span>
                {selectedLayer && (
                  <span className="text-[10px] text-amber-400 truncate max-w-28">
                    {selectedLayer.text || selectedLayer.id}
                  </span>
                )}
              </div>

              {selectedLayer && updateLayer ? (
                <>
                  <NumberSliderControl
                    label="Profundidad Z"
                    value={selectedLayer.parallaxDepth ?? 0}
                    min={-100}
                    max={100}
                    step={5}
                    unit=""
                    quickResetValue={0}
                    onChange={(val) =>
                      updateLayer({
                        parallaxDepth: val,
                      })
                    }
                  />

                  {/* Quick Depth Presets */}
                  <div className="flex gap-1 pt-1">
                    {[
                      { label: 'Fondo Lejano', val: -60 },
                      { label: 'Fondo', val: -30 },
                      { label: 'Neutro (0)', val: 0 },
                      { label: 'Primer Plano', val: 35 },
                      { label: 'Frente', val: 70 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => updateLayer({ parallaxDepth: p.val })}
                        className={`flex-1 py-1 rounded text-[9px] border transition cursor-pointer text-center ${
                          (selectedLayer.parallaxDepth ?? 0) === p.val
                            ? 'bg-amber-500/25 border-amber-500/50 text-amber-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[10px] text-slate-500 italic">
                  Selecciona una capa en el panel o lienzo para asignarle profundidad Z.
                </p>
              )}

              {/* Multi-layer Depth Overview */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1.5">
                  Planos Z de Todas las Capas ({project.layers.length})
                </span>
                <div className="space-y-1">
                  {project.layers.map((l, idx) => {
                    const depth = l.parallaxDepth ?? 0;
                    return (
                      <div
                        key={l.id}
                        className="flex items-center justify-between text-[10px] bg-slate-950 px-2 py-1 rounded border border-slate-800/60"
                      >
                        <span className="truncate max-w-36 text-slate-300">
                          {l.text || `Capa ${idx + 1}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
                              depth > 10
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : depth < -10
                                ? 'bg-sky-500/20 text-sky-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {depth > 0 ? `+${depth}` : depth}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            3. TRANSICIONES ENTRE TÍTULOS
            ======================================================== */}
        {activeSection === 'transitions' && (
          <div className="space-y-3.5">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                  <Split className="w-3.5 h-3.5 text-amber-400" />
                  Transiciones entre Títulos
                </span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <span className="text-[10px] text-slate-400">Activar</span>
                  <input
                    type="checkbox"
                    checked={camera.transitions.enabled}
                    onChange={(e) =>
                      updateTransitions({ enabled: e.target.checked })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                </label>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                Transiciones cinemáticas fluidas al cambiar entre múltiples títulos y textos en la línea de tiempo.
              </p>

              {/* 1-Click Auto Sequence Button */}
              <button
                onClick={autoSequenceLayers}
                className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 rounded-md text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Secuenciar Capas en Línea de Tiempo (1 Clic)
              </button>

              {/* Transition Style Selector */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-medium block mb-1">
                  Estilo de Transición
                </label>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {[
                    { id: 'fade', label: 'Disolución (Crossfade)' },
                    { id: 'dip-to-black', label: 'Fundido a Negro' },
                    { id: 'dip-to-white', label: 'Destello a Blanco' },
                    { id: 'wipe-horizontal', label: 'Barrido Lineal (Wipe)' },
                    { id: 'wipe-iris', label: 'Apertura Iris Circular' },
                    { id: 'slide-left', label: 'Deslizamiento Lateral' },
                    { id: 'slide-up', label: 'Deslizamiento Vertical' },
                    { id: 'morph-particles', label: 'Morph de Partículas' },
                    { id: 'zoom-swish', label: 'Zoom-Swish Veloz' },
                    { id: 'glitch-slice', label: 'Glitch Slice Matrix' },
                    { id: '3d-cube-flip', label: 'Giro Cubo 3D' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() =>
                        updateTransitions({
                          type: style.id as TitleTransitionType,
                          enabled: true,
                        })
                      }
                      className={`px-2 py-1.5 rounded text-left border transition cursor-pointer truncate ${
                        camera.transitions.type === style.id
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <NumberSliderControl
                  label="Duración Transición"
                  value={camera.transitions.duration ?? 0.8}
                  min={0.2}
                  max={2.5}
                  step={0.1}
                  unit="s"
                  quickResetValue={0.8}
                  onChange={(val) => updateTransitions({ duration: val })}
                />

                {/* Easing Curve */}
                <div>
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">
                    Curva Easing
                  </label>
                  <select
                    value={camera.transitions.easing}
                    onChange={(e) =>
                      updateTransitions({
                        easing: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="easeInOutCubic">Ease In-Out Cubic</option>
                    <option value="easeOutExpo">Ease Out Expo (Punch)</option>
                    <option value="easeInOutQuad">Ease In-Out Quad</option>
                    <option value="linear">Lineal Suave</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            4. EFECTO DE SHAKE DE CÁMARA (TEMBLOR CONTROLADO)
            ======================================================== */}
        {activeSection === 'shake' && (
          <div className="space-y-3.5">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Efecto de Shake de Cámara
                </span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <span className="text-[10px] text-slate-400">Activar</span>
                  <input
                    type="checkbox"
                    checked={camera.shake.enabled}
                    onChange={(e) => updateShake({ enabled: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                </label>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                Temblor controlado de toda la escena para impactos, detonaciones,
                cámara en mano cinematográfica y terremotos.
              </p>

              {/* Test Live Trigger Button */}
              <button
                onClick={triggerTestShake}
                className="w-full py-1.5 px-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-md text-[11px] font-bold text-rose-300 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                ¡Disparar Shake de Prueba Ahora!
              </button>

              {/* Shake Types */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-medium block mb-1">
                  Estilo de Temblor
                </label>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {[
                    { id: 'handheld', label: 'Cámara en Mano' },
                    { id: 'earthquake', label: 'Terremoto Masivo' },
                    { id: 'impact', label: 'Impacto / Explosión' },
                    { id: 'rumble', label: 'Rumble (Motor/Sub)' },
                    { id: 'micro-jitter', label: 'Micro-Jitter Tenso' },
                    { id: 'chaos-glitch', label: 'Caos Glitch' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() =>
                        updateShake({
                          type: st.id as CameraShakeType,
                          enabled: true,
                        })
                      }
                      className={`px-2 py-1.5 rounded text-left border transition cursor-pointer truncate ${
                        camera.shake.type === st.id
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode: Continuous vs Impact-burst */}
              <div className="flex gap-2">
                <button
                  onClick={() => updateShake({ mode: 'continuous', enabled: true })}
                  className={`flex-1 py-1 px-2 rounded text-[10px] font-medium border transition cursor-pointer text-center ${
                    camera.shake.mode === 'continuous'
                      ? 'bg-amber-500/25 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Modo Continuo
                </button>
                <button
                  onClick={() => updateShake({ mode: 'impact-burst', enabled: true })}
                  className={`flex-1 py-1 px-2 rounded text-[10px] font-medium border transition cursor-pointer text-center ${
                    camera.shake.mode === 'impact-burst'
                      ? 'bg-amber-500/25 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Modo Impacto (Cue)
                </button>
              </div>

              <NumberSliderControl
                label="Intensidad de Temblor"
                value={camera.shake.intensity}
                min={0}
                max={70}
                step={1}
                unit="px"
                quickResetValue={15}
                onChange={(val) => updateShake({ intensity: val, enabled: true })}
              />

              <NumberSliderControl
                label="Frecuencia / Rapidez"
                value={camera.shake.frequency}
                min={2}
                max={28}
                step={1}
                unit="Hz"
                quickResetValue={8}
                onChange={(val) => updateShake({ frequency: val })}
              />

              {/* Rotational Shake Toggle */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-300">
                    Temblor Rotacional (Roll)
                  </span>
                  <input
                    type="checkbox"
                    checked={camera.shake.rotational}
                    onChange={(e) => updateShake({ rotational: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                </div>

                {camera.shake.rotational && (
                  <NumberSliderControl
                    label="Amplitud Angular"
                    value={camera.shake.rotationIntensity ?? 2.0}
                    min={0.5}
                    max={12.0}
                    step={0.5}
                    unit="°"
                    quickResetValue={2.0}
                    onChange={(val) => updateShake({ rotationIntensity: val })}
                  />
                )}
              </div>

              {camera.shake.mode === 'impact-burst' && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <NumberSliderControl
                    label="Tiempo Impacto"
                    value={camera.shake.triggerTime ?? 1.0}
                    min={0}
                    max={project.duration}
                    step={0.1}
                    unit="s"
                    onChange={(val) => updateShake({ triggerTime: val })}
                  />
                  <NumberSliderControl
                    label="Decay (Amortiguación)"
                    value={camera.shake.decayTime ?? 0.8}
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    unit="s"
                    onChange={(val) => updateShake({ decayTime: val })}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
