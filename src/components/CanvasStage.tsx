import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  Square,
  Move,
  Smartphone,
  Tablet,
  Tv,
  Monitor,
  Play,
  Pause,
  Zap,
  Activity,
  Compass,
  Sparkles,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { ProjectSettings, TextLayer } from '../types';
import { renderFrame } from '../utils/renderer2d3d';
import { RESOLUTION_PRESETS } from '../data/resolutions';
import { useTheme } from '../context/ThemeContext';

export type DevicePreviewMode = 'canvas' | 'mobile' | 'tablet' | 'tv';

interface CanvasStageProps {
  project: ProjectSettings;
  setProject: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  currentTime: number;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  bgMediaElement: HTMLVideoElement | HTMLImageElement | null;
  isPlaying?: boolean;
  setIsPlaying?: (playing: boolean) => void;
  deviceMode?: DevicePreviewMode;
  setDeviceMode?: (mode: DevicePreviewMode) => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  project,
  setProject,
  currentTime,
  selectedLayerId,
  setSelectedLayerId,
  bgMediaElement,
  isPlaying = false,
  setIsPlaying,
  deviceMode: externalDeviceMode,
  setDeviceMode: externalSetDeviceMode,
}) => {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Local device mode fallback if not controlled externally
  const [internalDeviceMode, setInternalDeviceMode] = useState<DevicePreviewMode>('canvas');
  const deviceMode = externalDeviceMode ?? internalDeviceMode;
  const setDeviceMode = externalSetDeviceMode ?? setInternalDeviceMode;

  // Zoom & Quality Settings
  const [zoomLevel, setZoomLevel] = useState<'fit' | 0.5 | 0.75 | 1.0>('fit');
  const [previewQuality, setPreviewQuality] = useState<'1x' | '0.5x' | '0.25x'>('1x');
  const [socialSafeGuides, setSocialSafeGuides] = useState<boolean>(false);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 450 });

  // FPS & Real-time performance tracking
  const [currentFps, setCurrentFps] = useState<number>(60);
  const lastRenderTimeRef = useRef<number>(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);

  // Layer Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    mouseX: number;
    mouseY: number;
    layerX: number;
    layerY: number;
  } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Measure container for "fit" zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute display dimensions based on project resolution, zoom, and device frame
  const targetWidth = project.resolution.width;
  const targetHeight = project.resolution.height;
  const projectAspect = targetWidth / targetHeight;

  // Determine frame aspect and outer padding for devices
  let deviceAspect = projectAspect;
  let devicePaddingX = 0;
  let devicePaddingY = 0;

  if (deviceMode === 'mobile') {
    // 9:16 mobile frame
    deviceAspect = 9 / 16;
    devicePaddingX = 14;
    devicePaddingY = 32;
  } else if (deviceMode === 'tablet') {
    // 4:3 tablet frame
    deviceAspect = 4 / 3;
    devicePaddingX = 20;
    devicePaddingY = 24;
  } else if (deviceMode === 'tv') {
    // 16:9 TV frame
    deviceAspect = 16 / 9;
    devicePaddingX = 8;
    devicePaddingY = 8;
  }

  let displayWidth = 800;
  let displayHeight = 450;

  if (zoomLevel === 'fit') {
    const padding = deviceMode !== 'canvas' ? 70 : 40;
    const maxW = Math.max(200, containerSize.width - padding);
    const maxH = Math.max(150, containerSize.height - padding);

    const fitAspect = deviceMode !== 'canvas' ? deviceAspect : projectAspect;

    if (maxW / maxH > fitAspect) {
      displayHeight = maxH;
      displayWidth = maxH * fitAspect;
    } else {
      displayWidth = maxW;
      displayHeight = maxW / fitAspect;
    }
  } else {
    displayWidth = targetWidth * zoomLevel * 0.5;
    displayHeight = targetHeight * zoomLevel * 0.5;
  }

  // Draw current frame on canvas in real-time
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Quality downsampling factor for ultra-fluid real-time performance
    const qualityScale = previewQuality === '1x' ? 1.0 : previewQuality === '0.5x' ? 0.5 : 0.25;

    let baseW = targetWidth > 1920 ? 1920 : targetWidth;
    baseW = Math.round(baseW * qualityScale);
    const internalW = Math.max(320, baseW);
    const internalH = Math.round(internalW / projectAspect);

    if (canvas.width !== internalW || canvas.height !== internalH) {
      canvas.width = internalW;
      canvas.height = internalH;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    renderFrame(ctx, internalW, internalH, project, currentTime, {
      renderSafeAreas: project.safeAreasEnabled,
      socialSafeGuides: socialSafeGuides || (deviceMode === 'mobile' && socialSafeGuides),
      selectedLayerId,
      bgMediaElement,
      mousePos,
    });

    // FPS estimation
    const now = performance.now();
    const delta = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;
    if (delta > 0 && delta < 250) {
      const instantFps = 1000 / delta;
      fpsHistoryRef.current = [...fpsHistoryRef.current.slice(-14), instantFps];
      const avgFps = Math.round(
        fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
      );
      setCurrentFps(Math.min(60, Math.max(15, avgFps)));
    }
  }, [
    project,
    currentTime,
    selectedLayerId,
    bgMediaElement,
    targetWidth,
    targetHeight,
    projectAspect,
    mousePos,
    previewQuality,
    socialSafeGuides,
    deviceMode,
  ]);

  // Handle Dragging Text Layers on Canvas
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;

      let targetLayer: TextLayer | undefined;
      if (selectedLayerId) {
        targetLayer = project.layers.find((l) => l.id === selectedLayerId && !l.locked && l.visible);
      }

      if (!targetLayer) {
        targetLayer = [...project.layers]
          .reverse()
          .find((l) => !l.locked && l.visible && Math.abs(l.x - clickXPercent) < 20 && Math.abs(l.y - clickYPercent) < 15);
      }

      if (targetLayer) {
        setSelectedLayerId(targetLayer.id);
        setIsDragging(true);
        setDragStart({
          mouseX: e.clientX,
          mouseY: e.clientY,
          layerX: targetLayer.x,
          layerY: targetLayer.y,
        });
      } else {
        setSelectedLayerId(null);
      }
    },
    [project.layers, selectedLayerId, setSelectedLayerId]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const normX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
      const normY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1));
      setMousePos({ x: normX, y: normY });

      if (!isDragging || !dragStart || !selectedLayerId) return;

      const deltaXPercent = ((e.clientX - dragStart.mouseX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStart.mouseY) / rect.height) * 100;

      const newX = Math.round(Math.max(5, Math.min(95, dragStart.layerX + deltaXPercent)));
      const newY = Math.round(Math.max(5, Math.min(95, dragStart.layerY + deltaYPercent)));

      setProject((prev) => ({
        ...prev,
        layers: prev.layers.map((l) => (l.id === selectedLayerId ? { ...l, x: newX, y: newY } : l)),
      }));
    },
    [isDragging, dragStart, selectedLayerId, setProject]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  // Quick switch project resolution to match device
  const handleAdoptDeviceResolution = (mode: DevicePreviewMode) => {
    let matchedRes = RESOLUTION_PRESETS[0]; // 1080p
    if (mode === 'mobile') {
      matchedRes = RESOLUTION_PRESETS.find((r) => r.id === '9:16') || RESOLUTION_PRESETS[4];
    } else if (mode === 'tablet') {
      matchedRes = RESOLUTION_PRESETS.find((r) => r.id === 'tablet') || {
        id: 'tablet',
        name: 'Tablet iPad 4:3 (2048x1536)',
        width: 2048,
        height: 1536,
        aspectRatio: '4:3',
      };
    } else if (mode === 'tv') {
      matchedRes = RESOLUTION_PRESETS.find((r) => r.id === '1080p') || RESOLUTION_PRESETS[0];
    }
    setProject((prev) => ({ ...prev, resolution: matchedRes }));
  };

  return (
    <div
      id="canvas-stage-wrapper"
      ref={containerRef}
      className={`relative flex-1 flex flex-col items-center justify-center overflow-hidden select-none transition-colors duration-200 ${
        isDark ? 'bg-slate-950' : 'bg-slate-100'
      }`}
      onMouseUp={handleMouseUp}
    >
      {/* Subtle Studio Background Pattern */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark
            ? 'opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]'
            : 'opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]'
        }`}
      />

      {/* Top Floating Control Bar: Device Selector & Real-Time Performance Badge */}
      <div className="absolute top-3 inset-x-0 mx-auto w-fit max-w-[95%] z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-lg backdrop-blur-md text-xs transition-colors bg-slate-900/90 border-slate-800 text-slate-200">
        {/* Device Switcher */}
        <div className="flex items-center gap-0.5 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
          <button
            id="btn-preview-mode-canvas"
            onClick={() => setDeviceMode('canvas')}
            title="Lienzo Libre de Edición (Estudio)"
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition ${
              deviceMode === 'canvas'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lienzo Libre</span>
          </button>

          <button
            id="btn-preview-mode-mobile"
            onClick={() => setDeviceMode('mobile')}
            title="Previsualizar en Móvil (9:16 Vertical / Smartphone)"
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition ${
              deviceMode === 'mobile'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Móvil</span>
          </button>

          <button
            id="btn-preview-mode-tablet"
            onClick={() => setDeviceMode('tablet')}
            title="Previsualizar en Tablet (4:3 / iPad)"
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition ${
              deviceMode === 'tablet'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>

          <button
            id="btn-preview-mode-tv"
            onClick={() => setDeviceMode('tv')}
            title="Previsualizar en TV / Monitor Grande (16:9)"
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition ${
              deviceMode === 'tv'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Smart TV</span>
          </button>
        </div>

        <div className="w-px h-4 bg-slate-800 mx-0.5" />

        {/* Real-time Indicator & FPS Counter */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-500" />
          <span className="font-mono">{currentFps} FPS</span>
          <span className="text-emerald-500/60 font-normal">|</span>
          <span className="hidden md:inline font-mono">TIEMPO REAL</span>
        </div>

        {/* Preview Quality Selector (Real-Time Performance) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-950/80 px-1.5 py-0.5 rounded-lg border border-slate-800 text-[10px]">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-slate-400">Calidad:</span>
          {(['1x', '0.5x', '0.25x'] as const).map((q) => (
            <button
              key={q}
              onClick={() => setPreviewQuality(q)}
              title={
                q === '1x'
                  ? 'Resolución nativa completa'
                  : q === '0.5x'
                  ? '50% renderizado para 60 FPS ultra fluidos'
                  : 'Modo borrador súper rápido'
              }
              className={`px-1.5 py-0.5 rounded font-mono transition ${
                previewQuality === q
                  ? 'bg-slate-800 text-amber-300 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Social Safe Guidelines toggle when mobile */}
        {deviceMode === 'mobile' && (
          <button
            onClick={() => setSocialSafeGuides(!socialSafeGuides)}
            title="Mostrar u ocultar guías de botones de TikTok / Reels"
            className={`px-2 py-1 rounded-lg text-[10px] font-medium border flex items-center gap-1 transition ${
              socialSafeGuides
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3 h-3 text-rose-400" />
            <span>Guías Reels/TikTok</span>
          </button>
        )}

        {/* Quick Adopt Resolution Button if mismatch */}
        {deviceMode === 'mobile' && project.resolution.aspectRatio !== '9:16' && (
          <button
            onClick={() => handleAdoptDeviceResolution('mobile')}
            className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
          >
            <span>Ajustar a 9:16</span>
          </button>
        )}
      </div>

      {/* Main Canvas Container with Optional Device Bezel Mockups */}
      <div className="relative flex items-center justify-center transition-all duration-300">
        {/* Device Wrapper */}
        <div
          className={`relative transition-all duration-300 flex items-center justify-center ${
            deviceMode === 'mobile'
              ? 'rounded-[38px] p-[10px] bg-gradient-to-b from-slate-700 via-slate-900 to-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-2 border-slate-700/80 ring-1 ring-white/10'
              : deviceMode === 'tablet'
              ? 'rounded-[26px] p-[14px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-2 border-slate-600/70 ring-1 ring-white/10'
              : deviceMode === 'tv'
              ? 'rounded-[8px] p-[6px] bg-gradient-to-b from-slate-800 to-slate-950 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.9)] border border-slate-700 relative'
              : 'rounded-sm shadow-2xl border border-slate-700/60'
          }`}
          style={{
            width: `${displayWidth + devicePaddingX * 2}px`,
            height: `${displayHeight + devicePaddingY * 2}px`,
          }}
        >
          {/* Smart TV Ambilight Atmospheric Glow Effect */}
          {deviceMode === 'tv' && (
            <div
              className="absolute -inset-10 rounded-2xl opacity-40 blur-2xl pointer-events-none -z-10 transition-all duration-700"
              style={{
                background: `radial-gradient(ellipse at center, ${
                  project.background.type === 'color'
                    ? project.background.color
                    : project.background.type === 'gradient'
                    ? project.background.gradient.from
                    : '#f59e0b'
                } 0%, transparent 70%)`,
              }}
            />
          )}

          {/* Smartphone Dynamic Island / Speaker Pill */}
          {deviceMode === 'mobile' && (
            <div className="absolute top-2 inset-x-0 mx-auto w-24 h-4 bg-black rounded-full border border-white/15 z-30 pointer-events-none flex items-center justify-end px-2">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
            </div>
          )}

          {/* Tablet Front Camera Dot */}
          {deviceMode === 'tablet' && (
            <div className="absolute top-2 inset-x-0 mx-auto w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-600/70 z-30 pointer-events-none" />
          )}

          {/* Actual Canvas Frame */}
          <div
            style={{
              width: `${displayWidth}px`,
              height: `${displayHeight}px`,
            }}
            className="relative rounded-sm overflow-hidden bg-black flex items-center justify-center"
          >
            <canvas
              id="main-render-canvas"
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className={`w-full h-full object-contain ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            />

            {/* Quick Play/Pause Floating Hover Overlay */}
            {setIsPlaying && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir en tiempo real (Espacio)'}
                className="absolute bottom-3 left-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-lg transition opacity-80 hover:opacity-100 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />}
              </button>
            )}

            {/* Resolution & FPS Tag */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10 pointer-events-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{project.resolution.name}</span>
              <span className="text-slate-500">|</span>
              <span>{project.fps} FPS</span>
            </div>
          </div>

          {/* Smartphone Home Indicator Bar */}
          {deviceMode === 'mobile' && (
            <div className="absolute bottom-1 inset-x-0 mx-auto w-28 h-1 bg-white/40 rounded-full z-30 pointer-events-none" />
          )}
        </div>

        {/* TV Desktop Stand Legs */}
        {deviceMode === 'tv' && (
          <div className="absolute -bottom-3 inset-x-0 mx-auto w-36 h-2 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 rounded-sm shadow-md border-t border-white/20 pointer-events-none" />
        )}
      </div>

      {/* Floating Canvas Controls (Zoom & Alpha Grid Toggle) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-1 shadow-lg text-xs z-10">
        {/* Toggle Checkerboard */}
        <button
          id="btn-toggle-checkerboard"
          onClick={() =>
            setProject((prev) => ({
              ...prev,
              background: {
                ...prev.background,
                checkerboardInPreview: !prev.background.checkerboardInPreview,
              },
            }))
          }
          title="Ver cuadrícula de transparencia alfa (A)"
          className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] transition ${
            project.background.checkerboardInPreview
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Square className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Canal Alfa</span>
        </button>

        <div className="w-px h-3 bg-slate-800" />

        {/* Zoom Selector */}
        <button
          onClick={() => setZoomLevel('fit')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition ${
            zoomLevel === 'fit'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ajustar
        </button>
        <button
          onClick={() => setZoomLevel(0.5)}
          className={`px-1.5 py-1 rounded text-[11px] font-medium transition ${
            zoomLevel === 0.5 ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          50%
        </button>
        <button
          onClick={() => setZoomLevel(0.75)}
          className={`px-1.5 py-1 rounded text-[11px] font-medium transition ${
            zoomLevel === 0.75 ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          75%
        </button>
        <button
          onClick={() => setZoomLevel(1.0)}
          className={`px-1.5 py-1 rounded text-[11px] font-medium transition ${
            zoomLevel === 1.0 ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          100%
        </button>
      </div>

      {/* Layer Position Drag Helper Hint */}
      {selectedLayerId && (
        <div className="absolute top-16 left-4 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 pointer-events-none shadow-md">
          <Move className="w-3.5 h-3.5 text-amber-400" />
          <span>Arrastra el texto en el lienzo para reposicionar</span>
        </div>
      )}
    </div>
  );
};
