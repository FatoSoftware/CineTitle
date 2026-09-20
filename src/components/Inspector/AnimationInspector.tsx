import React from 'react';
import {
  PlayCircle,
  Repeat,
  ArrowRightCircle,
  Volume2,
  VolumeX,
  Sparkles,
  PenTool,
  Keyboard,
  Eye,
  Eraser,
} from 'lucide-react';
import {
  TextLayer,
  AnimationInType,
  AnimationLoopType,
  AnimationOutType,
} from '../../types';
import { NumberSliderControl } from '../common/NumberSliderControl';
import { typewriterAudio } from '../../utils/typewriterAudio';

interface AnimationInspectorProps {
  layer: TextLayer;
  updateLayer: (updates: Partial<TextLayer>) => void;
  projectDuration: number;
}

const IN_ANIMATIONS: { id: AnimationInType; name: string; tag: string }[] = [
  { id: 'typewriter', name: 'Máquina de Escribir Mecánica (con Sonido)', tag: 'FX Audio' },
  { id: 'handwriting', name: 'Escritura a Mano Caligráfica (con Pluma)', tag: 'Caligrafía' },
  { id: 'mask-reveal-wipe', name: 'Revelado Gradual (Barrido Horizontal)', tag: 'Máscara' },
  { id: 'mask-reveal-curtain', name: 'Revelado Cortina (Centro a Extremos)', tag: 'Máscara' },
  { id: 'mask-reveal-radial', name: 'Revelado Iris Radial (Foco Circular)', tag: 'Máscara' },
  { id: 'mask-reveal-shimmer', name: 'Revelado Luminous (Haz de Luz)', tag: 'Máscara VFX' },
  { id: 'zoom-3d', name: 'Zoom 3D Cinematográfico', tag: '3D' },
  { id: 'zoom-in', name: 'Zoom In Progresivo', tag: '2D' },
  { id: 'fade', name: 'Desvanecimiento Suave', tag: 'Clásico' },
  { id: 'slide-up', name: 'Deslizar desde Abajo', tag: 'Dinámico' },
  { id: 'slide-down', name: 'Deslizar desde Arriba', tag: 'Dinámico' },
  { id: 'slide-left', name: 'Deslizar desde Derecha', tag: 'Dinámico' },
  { id: 'flip-3d-x', name: 'Volteo 3D Pitch (Eje X)', tag: '3D' },
  { id: 'flip-3d-y', name: 'Volteo 3D Yaw (Eje Y)', tag: '3D' },
  { id: 'spin-3d', name: 'Giro 3D Helicoidal', tag: '3D' },
  { id: 'pop-bounce', name: 'Rebote Pop Elástico', tag: 'Física' },
  { id: 'drop-bounce', name: 'Impacto Caída Libre', tag: 'Física' },
  { id: 'glitch-split', name: 'Glitch Cibernético', tag: 'VFX' },
  { id: 'blur-focus', name: 'Desenfoque a Foco', tag: 'Óptico' },
  { id: 'none', name: 'Sin Entrada (Instantáneo)', tag: 'Fijo' },
];

const LOOP_ANIMATIONS: { id: AnimationLoopType; name: string }[] = [
  { id: 'none', name: 'Estático (Sin Movimiento)' },
  { id: 'float-gentle', name: 'Flotación Suave Etérea' },
  { id: 'breathe-3d', name: 'Respiración 3D Pulsante' },
  { id: 'pulse-glow', name: 'Pulso de Resplandor Neón' },
  { id: 'wobble-3d', name: 'Bamboleo Tridimensional' },
  { id: 'continuous-rotate', name: 'Rotación Continua 360°' },
  { id: 'shimmer-light', name: 'Barrido de Destello Shimmer' },
  { id: 'glitch-flicker', name: 'Parpadeo Digital Glitch' },
];

const OUT_ANIMATIONS: { id: AnimationOutType; name: string; tag: string }[] = [
  { id: 'erase-backspace', name: 'Efecto Borrado (Retroceso Letra por Letra)', tag: 'FX Borrado' },
  { id: 'letter-fade-out', name: 'Efecto Borrado (Desvanecimiento Letra por Letra)', tag: 'FX Borrado' },
  { id: 'zoom-out-3d', name: 'Retroceso 3D al Fondo', tag: '3D' },
  { id: 'fade', name: 'Desvanecimiento Gradual', tag: 'Clásico' },
  { id: 'zoom-out', name: 'Zoom Out Expansivo', tag: '2D' },
  { id: 'slide-down', name: 'Caída hacia Abajo', tag: 'Dinámico' },
  { id: 'slide-up', name: 'Ascenso Rápido', tag: 'Dinámico' },
  { id: 'slide-left', name: 'Salida hacia Izquierda', tag: 'Dinámico' },
  { id: 'spin-out-3d', name: 'Giro Centrífugo 3D', tag: '3D' },
  { id: 'shatter-sink', name: 'Hundimiento con Giro', tag: 'Física' },
  { id: 'blur-dissolve', name: 'Disolución en Desenfoque', tag: 'Óptico' },
  { id: 'none', name: 'Sin Salida (Permanece)', tag: 'Fijo' },
];

export const AnimationInspector: React.FC<AnimationInspectorProps> = ({
  layer,
  updateLayer,
  projectDuration,
}) => {
  const anim = layer.animation;

  const updateAnim = (updates: Partial<typeof anim>) => {
    updateLayer({
      animation: { ...anim, ...updates },
    });
  };

  const maxAnimInDuration = Math.max(0.5, Math.min(projectDuration / 2, 6.0));
  const maxAnimOutDuration = Math.max(0.5, Math.min(projectDuration / 2, 4.0));

  // Quick Preset Handlers
  const applyTypewriterPreset = () => {
    updateLayer({
      fontFamily: 'Special Elite',
      animation: {
        ...anim,
        inType: 'typewriter',
        inDuration: 2.5,
        typewriterSound: true,
        typewriterCursor: 'bar',
        typewriterVolume: 1.0,
        outType: 'erase-backspace',
        outDuration: 1.4,
      },
    });
    typewriterAudio.playKeyClick(false, 1.0);
  };

  const applyHandwritingPreset = () => {
    updateLayer({
      fontFamily: 'Dancing Script',
      animation: {
        ...anim,
        inType: 'handwriting',
        inDuration: 2.8,
        handwritingNib: true,
        typewriterSound: true,
        outType: 'letter-fade-out',
        outDuration: 1.2,
      },
    });
    typewriterAudio.playPenScratch(1.0);
  };

  const applyMaskRevealPreset = () => {
    updateLayer({
      animation: {
        ...anim,
        inType: 'mask-reveal-shimmer',
        inDuration: 1.8,
        maskRevealFeather: 40,
        outType: 'fade',
        outDuration: 0.8,
      },
    });
  };

  const apply3DExtrudePreset = () => {
    updateLayer({
      threeD: {
        ...layer.threeD,
        enabled: true,
        depth: 35,
        rotX: -15,
        rotY: 25,
        rotZ: 0,
        material: 'gold',
        true3DPerspective: true,
        perspective: 850,
      },
      animation: {
        ...anim,
        inType: 'zoom-3d',
        inDuration: 1.6,
        loopType: 'breathe-3d',
        loopIntensity: 1.2,
        outType: 'spin-out-3d',
        outDuration: 1.0,
      },
    });
  };

  return (
    <div id="inspector-animation" className="p-4 space-y-4">
      {/* 1-Click Special Effects Quick Presets */}
      <div className="p-3 bg-gradient-to-r from-slate-900 to-indigo-950/40 rounded-xl border border-indigo-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Efectos Especiales de Texto (1-Clic)</span>
          </span>
          <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
            Nuevo
          </span>
        </div>
        <p className="text-[11px] text-slate-300">
          Aplica configuraciones completas de efectos especiales de texto listos para reproducir:
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={applyTypewriterPreset}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left flex items-center gap-2 group transition"
          >
            <Keyboard className="w-4 h-4 text-amber-400 group-hover:scale-110 transition shrink-0" />
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-slate-200">Máquina + Sonido</span>
              <span className="text-[10px] text-slate-400">Clics mecánicos y campana</span>
            </div>
          </button>

          <button
            onClick={applyHandwritingPreset}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left flex items-center gap-2 group transition"
          >
            <PenTool className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition shrink-0" />
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-slate-200">Escritura a Mano</span>
              <span className="text-[10px] text-slate-400">Pluma dorada y caligrafía</span>
            </div>
          </button>

          <button
            onClick={applyMaskRevealPreset}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left flex items-center gap-2 group transition"
          >
            <Eye className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition shrink-0" />
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-slate-200">Revelado Máscara</span>
              <span className="text-[10px] text-slate-400">Haz de luz cinematográfico</span>
            </div>
          </button>

          <button
            onClick={apply3DExtrudePreset}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left flex items-center gap-2 group transition"
          >
            <Sparkles className="w-4 h-4 text-fuchsia-400 group-hover:scale-110 transition shrink-0" />
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-slate-200">Texto 3D Extruido</span>
              <span className="text-[10px] text-slate-400">Perspectiva y oro 24K</span>
            </div>
          </button>
        </div>
      </div>

      {/* 1. Intro Animation */}
      <div className="p-3.5 bg-slate-900/70 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <PlayCircle className="w-4 h-4" />
            <span>Animación de Entrada (Intro)</span>
          </span>
          <span className="text-[10px] text-emerald-400/80 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
            Fase Inicial
          </span>
        </div>

        {/* Type Select */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Efecto de Entrada</label>
          <select
            id="select-anim-in-type"
            value={anim.inType}
            onChange={(e) => updateAnim({ inType: e.target.value as AnimationInType })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
          >
            {IN_ANIMATIONS.map((item) => (
              <option key={item.id} value={item.id}>
                [{item.tag}] {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Special controls for Typewriter */}
        {anim.inType === 'typewriter' && (
          <div className="p-3 bg-amber-950/20 border border-amber-600/30 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-amber-400" />
                <span>Opciones de Máquina de Escribir</span>
              </span>
              <button
                type="button"
                onClick={() => typewriterAudio.playKeyClick(false, anim.typewriterVolume ?? 1.0)}
                className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-medium border border-amber-500/30 flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3" />
                <span>Probar Clic</span>
              </button>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-amber-900/30">
              <span className="text-[11px] text-slate-300">Efectos de Sonido Mecánico (Web Audio)</span>
              <input
                type="checkbox"
                checked={anim.typewriterSound !== false}
                onChange={(e) => updateAnim({ typewriterSound: e.target.checked })}
                className="w-4 h-4 text-amber-500 bg-slate-950 border-slate-700 rounded focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tipo de Cursor</label>
                <select
                  value={anim.typewriterCursor || 'bar'}
                  onChange={(e) => updateAnim({ typewriterCursor: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                >
                  <option value="bar">Barra Vertical (|)</option>
                  <option value="block">Bloque Retro (█)</option>
                  <option value="underscore">Guion Bajo (_)</option>
                  <option value="none">Sin Cursor</option>
                </select>
              </div>

              <div>
                <NumberSliderControl
                  id="typewriter-volume"
                  label="Volumen Audio"
                  value={anim.typewriterVolume ?? 1.0}
                  min={0.1}
                  max={1.5}
                  step={0.1}
                  unit="x"
                  onChange={(typewriterVolume) => updateAnim({ typewriterVolume })}
                  quickResetValue={1.0}
                />
              </div>
            </div>
          </div>
        )}

        {/* Special controls for Handwriting */}
        {anim.inType === 'handwriting' && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-600/30 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                <span>Opciones de Caligrafía</span>
              </span>
              <button
                type="button"
                onClick={() => typewriterAudio.playPenScratch(anim.typewriterVolume ?? 1.0)}
                className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-medium border border-emerald-500/30 flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3" />
                <span>Probar Tinta</span>
              </button>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-emerald-900/30">
              <span className="text-[11px] text-slate-300">Mostrar Pluma Caligráfica Dorada</span>
              <input
                type="checkbox"
                checked={anim.handwritingNib !== false}
                onChange={(e) => updateAnim({ handwritingNib: e.target.checked })}
                className="w-4 h-4 text-emerald-500 bg-slate-950 border-slate-700 rounded focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[11px] text-slate-300">Sonido de Rasgueo de Papel</span>
              <input
                type="checkbox"
                checked={anim.typewriterSound !== false}
                onChange={(e) => updateAnim({ typewriterSound: e.target.checked })}
                className="w-4 h-4 text-emerald-500 bg-slate-950 border-slate-700 rounded focus:ring-emerald-500"
              />
            </div>

            <div className="pt-1">
              <label className="block text-[10px] text-emerald-400 mb-1">Fuentes Recomendadas:</label>
              <div className="flex gap-1.5">
                {['Caveat', 'Dancing Script', 'Great Vibes'].map((font) => (
                  <button
                    key={font}
                    onClick={() => updateLayer({ fontFamily: font })}
                    className={`px-2 py-1 rounded text-[10px] border transition ${
                      layer.fontFamily === font
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Special controls for Mask Reveals */}
        {anim.inType.startsWith('mask-reveal-') && (
          <div className="p-3 bg-cyan-950/20 border border-cyan-600/30 rounded-lg space-y-2.5">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Parámetros de Revelado por Máscara</span>
            </span>

            <NumberSliderControl
              id="mask-reveal-feather"
              label="Suavizado de Borde (Feather)"
              value={anim.maskRevealFeather ?? 35}
              min={0}
              max={100}
              step={5}
              unit="px"
              onChange={(maskRevealFeather) => updateAnim({ maskRevealFeather })}
              quickResetValue={35}
            />
          </div>
        )}

        {anim.inType !== 'none' && (
          <div className="space-y-3 pt-1">
            <NumberSliderControl
              id="anim-in-duration"
              label="Duración de Entrada"
              value={anim.inDuration}
              min={0.2}
              max={maxAnimInDuration}
              step={0.1}
              unit="s"
              onChange={(inDuration) => updateAnim({ inDuration })}
              quickResetValue={1.0}
            />

            <NumberSliderControl
              id="anim-in-delay"
              label="Retardo de Inicio (Delay)"
              value={anim.inDelay}
              min={0}
              max={Math.min(projectDuration / 2, 3.0)}
              step={0.1}
              unit="s"
              onChange={(inDelay) => updateAnim({ inDelay })}
              quickResetValue={0}
            />

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Curva de Aceleración</label>
              <select
                value={anim.inEasing}
                onChange={(e) => updateAnim({ inEasing: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="easeOutCubic">Suave Progresiva (Ease Out Cubic)</option>
                <option value="easeOutBack">Rebote Retroceso (Ease Out Back)</option>
                <option value="easeOutElastic">Elástica Muelle (Ease Out Elastic)</option>
                <option value="easeOutQuad">Lineal Atenuada (Ease Out Quad)</option>
                <option value="easeInOutCubic">Cinematográfica Doble (Ease In Out)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 2. Loop / Idle Animation */}
      <div className="p-3.5 bg-slate-900/70 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
            <Repeat className="w-4 h-4" />
            <span>Movimiento Continuo (Loop / Reposo)</span>
          </span>
          <span className="text-[10px] text-sky-400/80 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/40">
            Fase Central
          </span>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Tipo de Movimiento</label>
          <select
            id="select-anim-loop-type"
            value={anim.loopType}
            onChange={(e) => updateAnim({ loopType: e.target.value as AnimationLoopType })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {LOOP_ANIMATIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {anim.loopType !== 'none' && (
          <div className="pt-1">
            <NumberSliderControl
              id="anim-loop-intensity"
              label="Intensidad de Animación"
              value={anim.loopIntensity}
              min={0.2}
              max={2.5}
              step={0.1}
              unit="x"
              onChange={(loopIntensity) => updateAnim({ loopIntensity })}
              quickResetValue={1.0}
            />
          </div>
        )}
      </div>

      {/* 3. Outro Animation */}
      <div className="p-3.5 bg-slate-900/70 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
            <ArrowRightCircle className="w-4 h-4" />
            <span>Animación de Salida (Outro)</span>
          </span>
          <span className="text-[10px] text-rose-400/80 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/40">
            Fase Final
          </span>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Efecto de Salida</label>
          <select
            id="select-anim-out-type"
            value={anim.outType}
            onChange={(e) => updateAnim({ outType: e.target.value as AnimationOutType })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500 cursor-pointer font-medium"
          >
            {OUT_ANIMATIONS.map((item) => (
              <option key={item.id} value={item.id}>
                [{item.tag}] {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Special controls for Eraser Backspace */}
        {anim.outType === 'erase-backspace' && (
          <div className="p-3 bg-rose-950/20 border border-rose-600/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <Eraser className="w-3.5 h-3.5 text-rose-400" />
                <span>Sonido de Borrado Mecánico</span>
              </span>
              <button
                type="button"
                onClick={() => typewriterAudio.playBackspace(anim.typewriterVolume ?? 1.0)}
                className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-medium border border-rose-500/30 flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3" />
                <span>Probar Borrado</span>
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[11px] text-slate-300">Activar Sonido de Tecla Retroceso</span>
              <input
                type="checkbox"
                checked={anim.typewriterSound !== false}
                onChange={(e) => updateAnim({ typewriterSound: e.target.checked })}
                className="w-4 h-4 text-rose-500 bg-slate-950 border-slate-700 rounded focus:ring-rose-500"
              />
            </div>
          </div>
        )}

        {anim.outType !== 'none' && (
          <div className="space-y-3 pt-1">
            <NumberSliderControl
              id="anim-out-duration"
              label="Duración de Salida"
              value={anim.outDuration}
              min={0.2}
              max={maxAnimOutDuration}
              step={0.1}
              unit="s"
              onChange={(outDuration) => updateAnim({ outDuration })}
              quickResetValue={0.8}
            />

            <NumberSliderControl
              id="anim-out-delay"
              label="Anticipación al Final"
              value={anim.outDelay}
              min={0}
              max={1.5}
              step={0.1}
              unit="s"
              onChange={(outDelay) => updateAnim({ outDelay })}
              quickResetValue={0}
            />

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Curva de Salida</label>
              <select
                value={anim.outEasing}
                onChange={(e) => updateAnim({ outEasing: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="easeInCubic">Acelerada Profunda (Ease In Cubic)</option>
                <option value="easeInBack">Impulso Previo (Ease In Back)</option>
                <option value="easeInQuad">Lineal Gradual (Ease In Quad)</option>
                <option value="easeInOutCubic">Cinematográfica (Ease In Out)</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
