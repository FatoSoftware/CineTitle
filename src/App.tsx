import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectSettings, TextLayer, TitlePreset, getDefaultVisualEffects } from './types';
import { RESOLUTION_PRESETS } from './data/resolutions';
import { TITLE_PRESETS } from './data/presets';
import { Navbar } from './components/Navbar';
import { LayersPanel } from './components/LayersPanel';
import { CanvasStage } from './components/CanvasStage';
import { InspectorTabs } from './components/Inspector/InspectorTabs';
import { Timeline } from './components/Timeline';
import { PresetsModal } from './components/PresetsModal';
import { ExportModal } from './components/ExportModal';
import { exportVideo } from './utils/exporter';

export default function App() {
  // Initialize project with default Cinematic Epic 3D Preset
  const [project, setProject] = useState<ProjectSettings>(() => {
    const defaultPreset = TITLE_PRESETS[0];
    return {
      id: 'cinetitle-project',
      name: 'Mi Título 3D',
      resolution: RESOLUTION_PRESETS[0], // 1080p
      duration: defaultPreset.duration,
      fps: 30,
      background: { ...defaultPreset.background },
      safeAreasEnabled: false,
      layers: defaultPreset.layers.map((l, idx) => ({
        ...l,
        vfx: l.vfx || getDefaultVisualEffects(),
        id: `layer-${idx + 1}-${Date.now()}`,
      })),
    };
  });

  // Playback & Timeline State
  const [currentTime, setCurrentTime] = useState<number>(1.5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(() => project.layers[0]?.id || null);

  // Modals
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Background Media Element (Video or Image)
  const [bgMediaElement, setBgMediaElement] = useState<HTMLVideoElement | HTMLImageElement | null>(null);

  // Playback animation loop using requestAnimationFrame
  const lastFrameTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    let animationFrameId: number;

    const loop = (now: number) => {
      if (isPlaying) {
        const deltaSec = (now - lastFrameTimeRef.current) / 1000;
        setCurrentTime((prevTime) => {
          let nextTime = prevTime + deltaSec;
          if (nextTime >= project.duration) {
            if (isLooping) {
              nextTime = 0;
            } else {
              setIsPlaying(false);
              return project.duration;
            }
          }
          return nextTime;
        });
      }
      lastFrameTimeRef.current = now;
      animationFrameId = requestAnimationFrame(loop);
    };

    lastFrameTimeRef.current = performance.now();
    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, isLooping, project.duration]);

  // Synchronize background video currentTime with timeline playhead
  useEffect(() => {
    if (bgMediaElement instanceof HTMLVideoElement) {
      if (Math.abs(bgMediaElement.currentTime - currentTime) > 0.15) {
        bgMediaElement.currentTime = currentTime % (bgMediaElement.duration || project.duration);
      }
      if (isPlaying && bgMediaElement.paused) {
        bgMediaElement.play().catch(() => {});
      } else if (!isPlaying && !bgMediaElement.paused) {
        bgMediaElement.pause();
      }
    }
  }, [currentTime, isPlaying, bgMediaElement, project.duration]);

  // Handle Setting Background Media (Video or Image)
  const handleSetBgMedia = useCallback(
    (file: File | null, mediaType?: 'video' | 'image', sampleUrl?: string) => {
      if (sampleUrl) {
        const video = document.createElement('video');
        video.src = sampleUrl;
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.load();
        setBgMediaElement(video);
        return;
      }

      if (!file) {
        setBgMediaElement(null);
        return;
      }

      const url = URL.createObjectURL(file);
      if (mediaType === 'video') {
        const video = document.createElement('video');
        video.src = url;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.load();
        setBgMediaElement(video);
      } else {
        const img = new Image();
        img.src = url;
        setBgMediaElement(img);
      }
    },
    []
  );

  // Apply Title Preset
  const handleApplyPreset = (preset: TitlePreset) => {
    setProject((prev) => ({
      ...prev,
      duration: preset.duration,
      background: { ...preset.background },
      layers: preset.layers.map((l, idx) => ({
        ...l,
        vfx: l.vfx || getDefaultVisualEffects(),
        id: `layer-${idx + 1}-${Date.now()}`,
      })),
    }));
    setCurrentTime(preset.duration * 0.4);
    setTimeout(() => {
      setSelectedLayerId(null);
    }, 50);
  };

  // Reset Project
  const handleResetProject = () => {
    if (confirm('¿Deseas reiniciar el proyecto al título predeterminado?')) {
      handleApplyPreset(TITLE_PRESETS[0]);
    }
  };

  // Take Snapshot PNG with Alpha
  const handleTakeSnapshot = async () => {
    try {
      const blob = await exportVideo(project, {
        format: 'png-frame',
        width: project.resolution.width,
        height: project.resolution.height,
        fps: 30,
        onProgress: () => {},
        bgMediaElement,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cinetitle_snapshot_${project.resolution.width}x${project.resolution.height}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Snapshot error:', err);
      alert('Error al capturar la imagen.');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <Navbar
        project={project}
        setProject={setProject}
        onOpenPresets={() => setIsPresetsModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onTakeSnapshot={handleTakeSnapshot}
        onResetProject={handleResetProject}
      />

      {/* Main Studio Area: Layers Panel (Left) | Canvas Stage (Center) | Inspector (Right) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Layers Panel */}
        <LayersPanel
          project={project}
          setProject={setProject}
          selectedLayerId={selectedLayerId}
          setSelectedLayerId={setSelectedLayerId}
        />

        {/* Center: Canvas Viewport & Interactive Stage */}
        <CanvasStage
          project={project}
          setProject={setProject}
          currentTime={currentTime}
          selectedLayerId={selectedLayerId}
          setSelectedLayerId={setSelectedLayerId}
          bgMediaElement={bgMediaElement}
        />

        {/* Right: Inspector Tabs (Text, 3D, Style, Animation, Background) */}
        <InspectorTabs
          project={project}
          setProject={setProject}
          selectedLayerId={selectedLayerId}
          onSetBgMedia={handleSetBgMedia}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
        />
      </div>

      {/* Bottom: Timeline & Transport Controls */}
      <Timeline
        project={project}
        setProject={setProject}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        isLooping={isLooping}
        setIsLooping={setIsLooping}
        selectedLayerId={selectedLayerId}
      />

      {/* Presets Modal */}
      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onApplyPreset={handleApplyPreset}
      />

      {/* Export Modal (WebM Alpha, MP4, MOV, PNG Sequence, Resolutions) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        bgMediaElement={bgMediaElement}
      />
    </div>
  );
}
