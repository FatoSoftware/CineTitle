import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ProjectSettings,
  TextLayer,
  TitlePreset,
  UserPreset,
  getDefaultVisualEffects,
  getDefaultCameraSettings,
  getDefaultColorGradingSettings,
} from './types';
import { RESOLUTION_PRESETS } from './data/resolutions';
import { TITLE_PRESETS } from './data/presets';
import { Navbar } from './components/Navbar';
import { LayersPanel } from './components/LayersPanel';
import { CanvasStage, DevicePreviewMode } from './components/CanvasStage';
import { InspectorTabs } from './components/Inspector/InspectorTabs';
import { Timeline } from './components/Timeline';
import { PresetsModal } from './components/PresetsModal';
import { ExportModal } from './components/ExportModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { exportVideo } from './utils/exporter';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useProjectHistory } from './hooks/useProjectHistory';

function AppStudio() {
  const { theme, toggleTheme, isDark } = useTheme();

  // Initialize initial project with default Cinematic Epic 3D Preset
  const initialProject: ProjectSettings = (() => {
    const defaultPreset = TITLE_PRESETS[0];
    return {
      id: 'cinetitle-project',
      name: 'Mi Título 3D',
      resolution: RESOLUTION_PRESETS[0], // 1080p
      duration: defaultPreset.duration,
      fps: 30,
      background: { ...defaultPreset.background },
      safeAreasEnabled: false,
      camera: getDefaultCameraSettings(),
      colorGrading: getDefaultColorGradingSettings(),
      layers: defaultPreset.layers.map((l, idx) => ({
        ...l,
        vfx: l.vfx || getDefaultVisualEffects(),
        parallaxDepth: idx === 0 ? 35 : -20,
        id: `layer-${idx + 1}-${Date.now()}`,
      })),
    };
  })();

  // Use history hook for instant Undo / Redo
  const {
    project,
    setProject,
    loadProjectDirect,
    undo,
    redo,
    canUndo,
    canRedo,
    undoCount,
    redoCount,
    pastSteps,
  } = useProjectHistory(initialProject);

  // Playback & Timeline State
  const [currentTime, setCurrentTime] = useState<number>(1.5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    () => project.layers[0]?.id || null
  );

  // Device simulation mode: 'canvas' (Lienzo Libre), 'mobile' (9:16), 'tablet' (4:3), 'tv' (16:9)
  const [deviceMode, setDeviceMode] = useState<DevicePreviewMode>('canvas');

  // Modals
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

  // Background Media Element (Video or Image)
  const [bgMediaElement, setBgMediaElement] = useState<HTMLVideoElement | HTMLImageElement | null>(
    null
  );

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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // 1. Undo / Redo (works even when typing or in canvas)
      if (cmdOrCtrl && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        undo();
        return;
      }
      if (
        (cmdOrCtrl && e.shiftKey && (e.key === 'z' || e.key === 'Z')) ||
        (cmdOrCtrl && (e.key === 'y' || e.key === 'Y'))
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // 2. Duplicate Selected Layer (Ctrl+D / Cmd+D)
      if (cmdOrCtrl && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (selectedLayerId) {
          const orig = project.layers.find((l) => l.id === selectedLayerId);
          if (orig) {
            const newLayer: TextLayer = {
              ...orig,
              id: `layer-${Date.now()}`,
              name: `${orig.name} (Copia)`,
              x: Math.min(90, orig.x + 4),
              y: Math.min(90, orig.y + 4),
            };
            setProject((prev) => ({
              ...prev,
              layers: [...prev.layers, newLayer],
            }));
            setSelectedLayerId(newLayer.id);
          }
        }
        return;
      }

      // 3. Escape key: close modals or deselect
      if (e.key === 'Escape') {
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (isPresetsModalOpen) {
          setIsPresetsModalOpen(false);
          return;
        }
        if (isExportModalOpen) {
          setIsExportModalOpen(false);
          return;
        }
        setSelectedLayerId(null);
        return;
      }

      // If user is currently focused on an input/textarea, do not trigger single letter hotkeys
      if (isTyping) return;

      // 4. Play / Pause (Space)
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
        return;
      }

      // 5. Arrow keys: frame stepping
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const step = e.shiftKey ? 1.0 : 1 / (project.fps || 30);
        setCurrentTime((prev) => Math.max(0, prev - step));
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const step = e.shiftKey ? 1.0 : 1 / (project.fps || 30);
        setCurrentTime((prev) => Math.min(project.duration, prev + step));
        return;
      }

      // 6. Home / End or 0
      if (e.key === 'Home' || e.key === '0') {
        e.preventDefault();
        setCurrentTime(0);
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        setCurrentTime(project.duration);
        return;
      }

      // 7. J / K / L Shuttle Controls
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setCurrentTime((prev) => Math.max(0, prev - 0.5));
        return;
      }
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setIsPlaying(false);
        return;
      }
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setIsPlaying(true);
        return;
      }

      // 8. Delete / Backspace: delete active layer
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerId) {
          e.preventDefault();
          setProject((prev) => ({
            ...prev,
            layers: prev.layers.filter((l) => l.id !== selectedLayerId),
          }));
          setSelectedLayerId(null);
        }
        return;
      }

      // 9. Quick Add Text Layer (T)
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        const newLayer: TextLayer = {
          id: `layer-${Date.now()}`,
          name: `Texto ${project.layers.length + 1}`,
          type: 'text',
          text: 'NUEVO TÍTULO 3D',
          fontFamily: 'Montserrat',
          fontSize: 64,
          fontWeight: 800,
          fontStyle: 'normal',
          letterSpacing: 4,
          lineHeight: 1.1,
          textAlign: 'center',
          textTransform: 'uppercase',
          fillType: 'solid',
          fillColor: '#FFFFFF',
          gradientColors: ['#F59E0B', '#EF4444'],
          gradientAngle: 90,
          strokeEnabled: true,
          strokeColor: '#000000',
          strokeWidth: 2,
          shadowEnabled: true,
          shadowColor: 'rgba(0,0,0,0.8)',
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowOffsetY: 8,
          glowEnabled: false,
          glowColor: '#F59E0B',
          glowBlur: 10,
          threeD: {
            enabled: true,
            depth: 25,
            angle: 90,
            bevelSize: 2,
            bevelColor: '#F59E0B',
            rotX: 10,
            rotY: -10,
            rotZ: 0,
            perspective: 1000,
            material: 'gold',
            lightAngle: 45,
            lightIntensity: 1.2,
            ambientLight: 0.3,
            shadowDepth: 15,
            specular: 0.8,
            true3DPerspective: true,
          },
          animation: {
            inType: 'zoom-in',
            inDuration: 0.8,
            inDelay: 0.2,
            inEasing: 'easeOutBack',
            loopType: 'breathe-3d',
            loopIntensity: 1,
            outType: 'fade',
            outDuration: 0.6,
            outDelay: 0.2,
            outEasing: 'easeInQuad',
          },
          keyframes: [],
          useKeyframes: false,
          x: 50,
          y: 50,
          opacity: 1,
          visible: true,
          locked: false,
          vfx: getDefaultVisualEffects(),
        };
        setProject((prev) => ({ ...prev, layers: [...prev.layers, newLayer] }));
        setSelectedLayerId(newLayer.id);
        return;
      }

      // 10. Cycle Device Preview Simulation (D)
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setDeviceMode((prev) => {
          if (prev === 'canvas') return 'mobile';
          if (prev === 'mobile') return 'tablet';
          if (prev === 'tablet') return 'tv';
          return 'canvas';
        });
        return;
      }

      // 11. Toggle Safe Areas (S)
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setProject((prev) => ({ ...prev, safeAreasEnabled: !prev.safeAreasEnabled }));
        return;
      }

      // 12. Toggle Alpha Checkerboard (A)
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setProject((prev) => ({
          ...prev,
          background: {
            ...prev.background,
            checkerboardInPreview: !prev.background.checkerboardInPreview,
          },
        }));
        return;
      }

      // 13. Toggle Dark / Light Theme (M)
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // 14. Open Shortcuts Modal (?)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    selectedLayerId,
    project.layers,
    project.fps,
    project.duration,
    isShortcutsModalOpen,
    isPresetsModalOpen,
    isExportModalOpen,
    setProject,
    toggleTheme,
  ]);

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

  // Apply Title Preset or User Preset
  const handleApplyPreset = (preset: TitlePreset | UserPreset) => {
    setProject((prev) => ({
      ...prev,
      duration: preset.duration,
      background: { ...preset.background },
      camera: preset.camera || prev.camera,
      colorGrading: preset.colorGrading || prev.colorGrading,
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
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden font-sans select-none transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        project={project}
        setProject={setProject}
        onOpenPresets={() => setIsPresetsModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onTakeSnapshot={handleTakeSnapshot}
        onResetProject={handleResetProject}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onLoadProject={(loaded) => {
          loadProjectDirect(loaded);
          setSelectedLayerId(loaded.layers[0]?.id || null);
        }}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        undoCount={undoCount}
        redoCount={redoCount}
        pastSteps={pastSteps}
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
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
        />

        {/* Right: Inspector Tabs (Text, 3D, Camera, Color, Style, VFX, Particles, Animation, Mask, Background) */}
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
        project={project}
        onApplyPreset={handleApplyPreset}
      />

      {/* Export Modal (WebM Alpha, MP4, MOV, PNG Sequence, Resolutions) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        bgMediaElement={bgMediaElement}
      />

      {/* Keyboard Shortcuts Guide Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppStudio />
    </ThemeProvider>
  );
}
