import React, { useState, useEffect } from 'react';
import {
  Type,
  Box,
  Palette,
  PlayCircle,
  Video,
  Scissors,
  Diamond,
  Shapes,
  Image as ImageIcon,
  Sparkles,
  Atom,
} from 'lucide-react';
import { ProjectSettings, TextLayer, BackgroundSettings } from '../../types';
import { TextInspector } from './TextInspector';
import { ShapeInspector } from './ShapeInspector';
import { ImageInspector } from './ImageInspector';
import { ThreeDInspector } from './ThreeDInspector';
import { StyleInspector } from './StyleInspector';
import { AnimationInspector } from './AnimationInspector';
import { KeyframeInspector } from './KeyframeInspector';
import { MaskInspector } from './MaskInspector';
import { BackgroundInspector } from './BackgroundInspector';
import { VisualEffectsInspector } from './VisualEffectsInspector';
import { ParticleInspector } from './ParticleInspector';

interface InspectorTabsProps {
  project: ProjectSettings;
  setProject: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  selectedLayerId: string | null;
  onSetBgMedia: (file: File | null, mediaType?: 'video' | 'image', sampleUrl?: string) => void;
  currentTime?: number;
  setCurrentTime?: (time: number) => void;
}

type TabType = 'content' | '3d' | 'style' | 'vfx' | 'particles' | 'anim' | 'keyframes' | 'mask' | 'bg';

export const InspectorTabs: React.FC<InspectorTabsProps> = ({
  project,
  setProject,
  selectedLayerId,
  onSetBgMedia,
  currentTime = 0,
  setCurrentTime = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('content');

  const selectedLayer = project.layers.find((l) => l.id === selectedLayerId);

  const updateSelectedLayer = (updates: Partial<TextLayer>) => {
    if (!selectedLayerId) return;
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === selectedLayerId ? { ...l, ...updates } : l)),
    }));
  };

  const updateBackground = (updates: Partial<BackgroundSettings>) => {
    setProject((prev) => ({
      ...prev,
      background: { ...prev.background, ...updates },
    }));
  };

  // Determine content tab icon and label based on layer type
  const getContentTabInfo = () => {
    if (!selectedLayer || selectedLayer.type === 'text' || !selectedLayer.type) {
      return { label: 'Texto', icon: <Type className="w-3.5 h-3.5" /> };
    }
    if (selectedLayer.type === 'shape') {
      return { label: 'Forma', icon: <Shapes className="w-3.5 h-3.5" /> };
    }
    if (selectedLayer.type === 'image') {
      return { label: 'Logo', icon: <ImageIcon className="w-3.5 h-3.5" /> };
    }
    return { label: 'Capa', icon: <Type className="w-3.5 h-3.5" /> };
  };

  const contentInfo = getContentTabInfo();

  const tabs: { id: TabType; label: string; icon: React.ReactNode; isGlobal?: boolean }[] = [
    { id: 'content', label: contentInfo.label, icon: contentInfo.icon },
    { id: '3d', label: '3D', icon: <Box className="w-3.5 h-3.5" /> },
    { id: 'style', label: 'Estilo', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'vfx', label: 'Efectos', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'particles', label: 'Partículas', icon: <Atom className="w-3.5 h-3.5" /> },
    { id: 'anim', label: 'Presets', icon: <PlayCircle className="w-3.5 h-3.5" /> },
    { id: 'keyframes', label: 'Keyframes', icon: <Diamond className="w-3.5 h-3.5" /> },
    { id: 'mask', label: 'Máscara', icon: <Scissors className="w-3.5 h-3.5" /> },
    { id: 'bg', label: 'Fondo', icon: <Video className="w-3.5 h-3.5" />, isGlobal: true },
  ];

  return (
    <div
      id="inspector-panel"
      className="w-84 bg-slate-950 border-l border-slate-800/80 flex flex-col shrink-0 overflow-hidden"
    >
      {/* Top Tab Bar */}
      <div className="flex border-b border-slate-800/80 bg-slate-950/80 p-1 gap-0.5 shrink-0 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 transition shrink-0 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'bg' ? (
          <BackgroundInspector
            background={project.background}
            updateBackground={updateBackground}
            onSetBgMedia={onSetBgMedia}
          />
        ) : selectedLayer ? (
          <>
            {activeTab === 'content' && (
              <>
                {(!selectedLayer.type || selectedLayer.type === 'text') && (
                  <TextInspector layer={selectedLayer} updateLayer={updateSelectedLayer} />
                )}
                {selectedLayer.type === 'shape' && (
                  <ShapeInspector layer={selectedLayer} updateLayer={updateSelectedLayer} />
                )}
                {selectedLayer.type === 'image' && (
                  <ImageInspector layer={selectedLayer} updateLayer={updateSelectedLayer} />
                )}
              </>
            )}

            {activeTab === '3d' && (
              <ThreeDInspector layer={selectedLayer} updateLayer={updateSelectedLayer} />
            )}

            {activeTab === 'style' && (
              <StyleInspector layer={selectedLayer} updateLayer={updateSelectedLayer} />
            )}

            {activeTab === 'vfx' && (
              <VisualEffectsInspector layer={selectedLayer} updateLayer={updateSelectedLayer} />
            )}

            {activeTab === 'particles' && (
              <ParticleInspector
                layer={selectedLayer}
                updateLayer={updateSelectedLayer}
                currentTime={currentTime}
              />
            )}

            {activeTab === 'anim' && (
              <AnimationInspector
                layer={selectedLayer}
                updateLayer={updateSelectedLayer}
                projectDuration={project.duration}
              />
            )}

            {activeTab === 'keyframes' && (
              <KeyframeInspector
                layer={selectedLayer}
                updateLayer={updateSelectedLayer}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
                duration={project.duration}
              />
            )}

            {activeTab === 'mask' && (
              <MaskInspector layer={selectedLayer} updateLayer={updateSelectedLayer} />
            )}
          </>
        ) : (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <p className="text-xs">Selecciona o crea una capa de texto, forma o imagen para editar sus propiedades.</p>
          </div>
        )}
      </div>
    </div>
  );
};
