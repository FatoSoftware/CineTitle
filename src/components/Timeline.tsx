import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Repeat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Minus,
  Diamond,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ProjectSettings, TextLayer, Keyframe } from '../types';
import { typewriterAudio } from '../utils/typewriterAudio';

interface TimelineProps {
  project: ProjectSettings;
  setProject: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  isLooping: boolean;
  setIsLooping: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLayerId: string | null;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  setProject,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  isLooping,
  setIsLooping,
  selectedLayerId,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Active Layer
  const activeLayer = project.layers.find((l) => l.id === selectedLayerId);
  const activeKeyframes = activeLayer?.keyframes || [];
  const useKeyframes = !!activeLayer?.useKeyframes;

  const [audioFxEnabled, setAudioFxEnabled] = useState(typewriterAudio.getEnabled());

  const toggleAudioFx = () => {
    const next = !audioFxEnabled;
    typewriterAudio.setEnabled(next);
    setAudioFxEnabled(next);
    if (next) {
      typewriterAudio.playKeyClick(false, 0.8);
    }
  };

  // Format seconds to MM:SS.ms
  const formatTimecode = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  // Handle Scrubbing Click & Drag
  const handleScrub = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const progress = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = progress * project.duration;
      setCurrentTime(newTime);
    },
    [project.duration, setCurrentTime]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    handleScrub(e);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleScrub(moveEvent);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Keyboard shortcut: Spacebar to toggle Play/Pause, [ and ] for prev/next keyframe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'Home') {
        e.preventDefault();
        setCurrentTime(0);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((prev) => Math.max(0, prev - 1 / project.fps));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((prev) => Math.min(project.duration, prev + 1 / project.fps));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsPlaying, setCurrentTime, project.fps, project.duration]);

  // Add Keyframe on active layer at current time
  const handleAddKeyframeAtCurrent = () => {
    if (!activeLayer) return;

    const roundedTime = Math.round(currentTime * 100) / 100;
    const currentProps = {
      x: activeLayer.x,
      y: activeLayer.y,
      scale: 1,
      opacity: activeLayer.opacity ?? 1,
      rotX: activeLayer.threeD.rotX,
      rotY: activeLayer.threeD.rotY,
      rotZ: activeLayer.threeD.rotZ,
      depth: activeLayer.threeD.depth,
    };

    const existingIndex = activeKeyframes.findIndex((k) => Math.abs(k.time - roundedTime) < 0.05);
    let updatedKeyframes = [...activeKeyframes];

    if (existingIndex >= 0) {
      updatedKeyframes[existingIndex] = {
        ...updatedKeyframes[existingIndex],
        properties: { ...updatedKeyframes[existingIndex].properties, ...currentProps },
      };
    } else {
      const newKf: Keyframe = {
        id: `kf-${Date.now()}`,
        time: roundedTime,
        properties: currentProps,
      };
      updatedKeyframes.push(newKf);
      updatedKeyframes.sort((a, b) => a.time - b.time);
    }

    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === activeLayer.id
          ? { ...l, useKeyframes: true, keyframes: updatedKeyframes }
          : l
      ),
    }));
  };

  // Jump to prev / next keyframe
  const handlePrevKeyframe = () => {
    if (activeKeyframes.length === 0) return;
    const earlier = activeKeyframes.filter((k) => k.time < currentTime - 0.05);
    if (earlier.length > 0) {
      setCurrentTime(earlier[earlier.length - 1].time);
    } else {
      setCurrentTime(0);
    }
  };

  const handleNextKeyframe = () => {
    if (activeKeyframes.length === 0) return;
    const later = activeKeyframes.filter((k) => k.time > currentTime + 0.05);
    if (later.length > 0) {
      setCurrentTime(later[0].time);
    } else {
      setCurrentTime(project.duration);
    }
  };

  // Generate ruler ticks (every 1s)
  const rulerTicks = [];
  const totalSeconds = Math.ceil(project.duration);
  for (let s = 0; s <= totalSeconds; s++) {
    const percent = (s / project.duration) * 100;
    if (percent <= 100) {
      rulerTicks.push({ sec: s, percent });
    }
  }

  const playheadPercent = (currentTime / project.duration) * 100;
  const isNearKeyframe = activeKeyframes.some((k) => Math.abs(k.time - currentTime) < 0.08);

  return (
    <div
      id="app-timeline"
      className="h-32 bg-slate-950 border-t border-slate-800/80 px-4 py-2.5 flex flex-col justify-between select-none z-20 shrink-0"
    >
      {/* Top row: Transport Controls, Timecode, Keyframe Actions & Duration Extender */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Playback buttons */}
        <div className="flex items-center gap-1.5">
          {/* Rewind to 0 */}
          <button
            id="btn-timeline-rewind"
            onClick={() => setCurrentTime(0)}
            title="Ir al inicio (Home)"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Prev Frame */}
          <button
            id="btn-timeline-prev-frame"
            onClick={() => setCurrentTime((prev) => Math.max(0, prev - 1 / project.fps))}
            title="Cuadro anterior (Flecha Izq)"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            id="btn-timeline-play-pause"
            onClick={() => setIsPlaying(!isPlaying)}
            title="Reproducir / Pausar (Barra espaciadora)"
            className={`px-3.5 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isPlaying ? 'Pausa' : 'Play'}</span>
          </button>

          {/* Next Frame */}
          <button
            id="btn-timeline-next-frame"
            onClick={() =>
              setCurrentTime((prev) => Math.min(project.duration, prev + 1 / project.fps))
            }
            title="Siguiente cuadro (Flecha Der)"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Loop toggle */}
          <button
            id="btn-timeline-loop"
            onClick={() => setIsLooping(!isLooping)}
            title="Bucle continuo (Loop)"
            className={`p-1.5 rounded-md transition cursor-pointer ${
              isLooping
                ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-850'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Audio FX Sound Toggle */}
          <button
            id="btn-timeline-audio-fx"
            onClick={toggleAudioFx}
            title={audioFxEnabled ? 'Sonidos FX Activados (Máquina de escribir, pluma caligráfica)' : 'Sonidos FX Silenciados'}
            className={`p-1.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
              audioFxEnabled
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-600 hover:text-slate-400 hover:bg-slate-850'
            }`}
          >
            {audioFxEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Center: Keyframe Quick Controls & Timecode */}
        <div className="flex items-center gap-3">
          {/* Keyframe fast actions if active layer */}
          {activeLayer && (
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
              <button
                onClick={handlePrevKeyframe}
                title="Keyframe Anterior"
                disabled={activeKeyframes.length === 0}
                className="p-1 rounded text-slate-400 hover:text-amber-300 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleAddKeyframeAtCurrent}
                title={isNearKeyframe ? 'Actualizar Keyframe en este instante' : 'Añadir Keyframe en este instante'}
                className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                  isNearKeyframe
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                <Diamond className="w-3 h-3 fill-current" />
                <span>{isNearKeyframe ? 'KF Activo' : '+ Keyframe'}</span>
              </button>

              <button
                onClick={handleNextKeyframe}
                title="Keyframe Siguiente"
                disabled={activeKeyframes.length === 0}
                className="p-1 rounded text-slate-400 hover:text-amber-300 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Large Timecode */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-amber-400 font-bold tracking-wider text-sm bg-slate-900 border border-slate-800/80 px-2.5 py-1 rounded">
              {formatTimecode(currentTime)}
            </span>
            <span className="text-slate-600 font-bold">/</span>
            <span className="text-slate-400 tracking-wider text-xs">
              {formatTimecode(project.duration)}
            </span>
          </div>
        </div>

        {/* Right: Duration Extender ("ampliar la duracion") */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800/80 rounded-md px-2 py-1 text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 text-[11px]">Duración:</span>

            {/* Quick decrease */}
            <button
              onClick={() =>
                setProject((prev) => ({
                  ...prev,
                  duration: Math.max(1, prev.duration - 1),
                }))
              }
              title="Reducir 1 segundo"
              className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>

            {/* Duration Slider / Input */}
            <input
              id="input-timeline-duration"
              type="number"
              min={1}
              max={60}
              step={0.5}
              value={project.duration}
              onChange={(e) => {
                const val = Math.max(1, Math.min(60, parseFloat(e.target.value) || 5));
                setProject((prev) => ({ ...prev, duration: val }));
              }}
              className="w-12 bg-slate-950 border border-slate-700/60 rounded px-1 text-center text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
            />
            <span className="text-slate-400 text-[11px]">seg</span>

            {/* Quick increase */}
            <button
              onClick={() =>
                setProject((prev) => ({
                  ...prev,
                  duration: Math.min(60, prev.duration + 1),
                }))
              }
              title="Ampliar 1 segundo"
              className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Quick preset duration pills */}
          <div className="hidden xl:flex items-center gap-1">
            {[3, 5, 8, 15].map((dur) => (
              <button
                key={dur}
                onClick={() => setProject((prev) => ({ ...prev, duration: dur }))}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  project.duration === dur
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Interactive Scrubber Track & Animation Phase Bars & Keyframe Diamonds */}
      <div
        id="timeline-track-container"
        ref={trackRef}
        onMouseDown={handleMouseDown}
        className="relative h-14 bg-slate-900/90 rounded-md border border-slate-800 overflow-hidden cursor-pointer"
      >
        {/* Time Ruler Ticks */}
        <div className="absolute inset-0 pointer-events-none">
          {rulerTicks.map((tick) => (
            <div
              key={tick.sec}
              style={{ left: `${tick.percent}%` }}
              className="absolute top-0 bottom-0 border-l border-slate-800/80 flex flex-col justify-between py-0.5 pl-1"
            >
              <span className="text-[9px] font-mono text-slate-500">{tick.sec}s</span>
              <div className="w-1 h-1.5 bg-slate-700/60" />
            </div>
          ))}
        </div>

        {/* Active Layer's Animation Phases Highlight (Intro, Idle, Outro) */}
        {activeLayer && !useKeyframes && (
          <div className="absolute top-4 left-0 right-0 h-5 px-1 flex items-center pointer-events-none">
            {/* Intro Phase */}
            {activeLayer.animation.inType !== 'none' && (
              <div
                style={{
                  left: `${(activeLayer.animation.inDelay / project.duration) * 100}%`,
                  width: `${(activeLayer.animation.inDuration / project.duration) * 100}%`,
                }}
                className="absolute h-4 rounded-l bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center text-[9px] text-emerald-300 font-medium overflow-hidden px-1"
              >
                <span>Entrada ({activeLayer.animation.inType})</span>
              </div>
            )}

            {/* Outro Phase */}
            {activeLayer.animation.outType !== 'none' && (
              <div
                style={{
                  right: `${(activeLayer.animation.outDelay / project.duration) * 100}%`,
                  width: `${(activeLayer.animation.outDuration / project.duration) * 100}%`,
                }}
                className="absolute h-4 rounded-r bg-rose-500/30 border border-rose-500/50 flex items-center justify-center text-[9px] text-rose-300 font-medium overflow-hidden px-1"
              >
                <span>Salida ({activeLayer.animation.outType})</span>
              </div>
            )}
          </div>
        )}

        {/* Keyframe Track & Diamonds */}
        {activeLayer && activeKeyframes.length > 0 && (
          <div className="absolute top-5 left-0 right-0 h-6 flex items-center pointer-events-none">
            {/* Connecting line between keyframes */}
            {activeKeyframes.length >= 2 && (
              <div
                style={{
                  left: `${(activeKeyframes[0].time / project.duration) * 100}%`,
                  width: `${
                    ((activeKeyframes[activeKeyframes.length - 1].time - activeKeyframes[0].time) /
                      project.duration) *
                    100
                  }%`,
                }}
                className="absolute h-1 bg-amber-500/30 border-t border-b border-amber-500/60"
              />
            )}

            {/* Keyframe Diamond Nodes */}
            {activeKeyframes.map((kf, i) => {
              const kfPercent = (kf.time / project.duration) * 100;
              const isCurrent = Math.abs(kf.time - currentTime) < 0.08;

              return (
                <div
                  key={kf.id}
                  style={{ left: `${kfPercent}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentTime(kf.time);
                  }}
                  title={`Keyframe #${i + 1} (${kf.time.toFixed(2)}s)`}
                  className={`absolute -ml-2 w-4 h-4 rounded-xs transform rotate-45 pointer-events-auto cursor-pointer transition shadow-md ${
                    isCurrent
                      ? 'bg-amber-400 border-2 border-white scale-125 z-20 shadow-[0_0_10px_rgba(251,191,36,0.9)]'
                      : 'bg-amber-500/80 border border-amber-300 hover:scale-115 hover:bg-amber-400 z-10'
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Playhead Marker Line */}
        <div
          id="timeline-playhead"
          style={{ left: `${playheadPercent}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-30 pointer-events-none shadow-[0_0_8px_rgba(251,191,36,0.8)]"
        >
          {/* Top playhead indicator arrow */}
          <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-amber-400 transform rotate-45 rounded-xs" />
        </div>
      </div>
    </div>
  );
};
