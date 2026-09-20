import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Maximize2, ZoomIn, ZoomOut, CheckSquare, Square, Eye, Move } from 'lucide-react';
import { ProjectSettings, TextLayer } from '../types';
import { renderFrame } from '../utils/renderer2d3d';

interface CanvasStageProps {
  project: ProjectSettings;
  setProject: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  currentTime: number;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  bgMediaElement: HTMLVideoElement | HTMLImageElement | null;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  project,
  setProject,
  currentTime,
  selectedLayerId,
  setSelectedLayerId,
  bgMediaElement,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'fit' | 0.5 | 0.75 | 1.0>('fit');
  const [containerSize, setContainerSize] = useState({ width: 800, height: 450 });

  // Layer Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; layerX: number; layerY: number } | null>(null);

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

  // Compute display dimensions based on project resolution and zoom
  const targetWidth = project.resolution.width;
  const targetHeight = project.resolution.height;
  const projectAspect = targetWidth / targetHeight;

  let displayWidth = 800;
  let displayHeight = 450;

  if (zoomLevel === 'fit') {
    const padding = 32;
    const maxW = Math.max(200, containerSize.width - padding);
    const maxH = Math.max(150, containerSize.height - padding);

    if (maxW / maxH > projectAspect) {
      displayHeight = maxH;
      displayWidth = maxH * projectAspect;
    } else {
      displayWidth = maxW;
      displayHeight = maxW / projectAspect;
    }
  } else {
    displayWidth = targetWidth * zoomLevel * 0.5;
    displayHeight = targetHeight * zoomLevel * 0.5;
  }

  // Draw current frame on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use internal resolution proportional to target aspect ratio for sharp preview
    const internalW = targetWidth > 1920 ? 1920 : targetWidth;
    const internalH = Math.round(internalW / projectAspect);

    if (canvas.width !== internalW || canvas.height !== internalH) {
      canvas.width = internalW;
      canvas.height = internalH;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    renderFrame(ctx, internalW, internalH, project, currentTime, {
      renderSafeAreas: project.safeAreasEnabled,
      selectedLayerId,
      bgMediaElement,
    });
  }, [project, currentTime, selectedLayerId, bgMediaElement, targetWidth, targetHeight, projectAspect]);

  // Handle Dragging Text Layers on Canvas
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;

      // Find closest unlocked visible layer or current selected layer
      let targetLayer: TextLayer | undefined;
      if (selectedLayerId) {
        targetLayer = project.layers.find((l) => l.id === selectedLayerId && !l.locked && l.visible);
      }

      if (!targetLayer) {
        // Find layer by proximity (within ~15% bounding area)
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
      if (!isDragging || !dragStart || !selectedLayerId) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragStart.mouseX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStart.mouseY) / rect.height) * 100;

      const newX = Math.round(Math.max(5, Math.min(95, dragStart.layerX + deltaXPercent)));
      const newY = Math.round(Math.max(5, Math.min(95, dragStart.layerY + deltaYPercent)));

      setProject((prev) => ({
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === selectedLayerId ? { ...l, x: newX, y: newY } : l
        ),
      }));
    },
    [isDragging, dragStart, selectedLayerId, setProject]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  return (
    <div
      id="canvas-stage-wrapper"
      ref={containerRef}
      className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden select-none"
      onMouseUp={handleMouseUp}
    >
      {/* Background checkerboard for entire viewport if transparent */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Canvas Viewport Box */}
      <div
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
        }}
        className="relative shadow-2xl rounded-sm overflow-hidden border border-slate-700/60 transition-all duration-75 flex items-center justify-center bg-black"
      >
        <canvas
          id="main-render-canvas"
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`w-full h-full object-contain ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        />

        {/* Informative overlay tag */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10 pointer-events-none flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{project.resolution.name}</span>
          <span className="text-slate-500">|</span>
          <span>{project.fps} FPS</span>
        </div>
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
          title="Ver cuadrícula de transparencia alfa"
          className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] transition ${
            project.background.checkerboardInPreview
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 pointer-events-none">
          <Move className="w-3.5 h-3.5 text-amber-400" />
          <span>Arrastra el texto en el lienzo para reposicionar</span>
        </div>
      )}
    </div>
  );
};
