import React, { useState, useRef } from 'react';
import {
  Plus,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Box,
  Type,
  Shapes,
  Image as ImageIcon,
  Scissors,
  Diamond,
  Square,
  Circle,
  Minus,
  MoveRight,
} from 'lucide-react';
import { ProjectSettings, TextLayer, ShapeType, getDefaultVisualEffects, getDefaultAdvancedParticles } from '../types';

interface LayersPanelProps {
  project: ProjectSettings;
  setProject: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  project,
  setProject,
  selectedLayerId,
  setSelectedLayerId,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Default base 3D & animation config
  const createBaseSettings = () => ({
    threeD: {
      enabled: false,
      depth: 25,
      angle: 90,
      bevelSize: 2,
      bevelColor: '#F59E0B',
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      perspective: 900,
      material: 'gold' as const,
      lightAngle: 60,
      lightIntensity: 1.2,
      ambientLight: 0.4,
      shadowDepth: 15,
      specular: 0.6,
    },
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.7)',
    shadowBlur: 15,
    shadowOffsetX: 0,
    shadowOffsetY: 8,
    glowEnabled: false,
    glowColor: '#F59E0B',
    glowBlur: 15,
    animation: {
      inType: 'fade' as const,
      inDuration: 0.8,
      inDelay: 0,
      inEasing: 'easeOutCubic' as const,
      loopType: 'none' as const,
      loopIntensity: 0.5,
      outType: 'fade' as const,
      outDuration: 0.6,
      outDelay: 0,
      outEasing: 'easeInOutCubic' as const,
    },
    vfx: getDefaultVisualEffects(),
    particles: getDefaultAdvancedParticles(),
    visible: true,
    locked: false,
    opacity: 1,
  });

  // Add new Text Layer
  const handleAddTextLayer = (isSubtitle = false) => {
    const newId = `layer-${Date.now()}`;
    const newLayer: TextLayer = {
      id: newId,
      name: isSubtitle ? `Subtítulo ${project.layers.length + 1}` : `Título ${project.layers.length + 1}`,
      type: 'text',
      text: isSubtitle ? 'SUBTÍTULO DESCRIPTIVO DEL VIDEO' : 'NUEVO TÍTULO 3D',
      x: 50,
      y: isSubtitle ? 80 : 50,
      fontSize: isSubtitle ? 42 : 80,
      fontFamily: isSubtitle ? 'Inter' : 'Montserrat',
      fontWeight: isSubtitle ? 600 : 900,
      fontStyle: 'normal',
      letterSpacing: isSubtitle ? 2 : 4,
      lineHeight: 1.1,
      textAlign: 'center',
      textTransform: 'uppercase',
      fillType: 'solid',
      fillColor: '#FFFFFF',
      gradientColors: ['#FFFFFF', '#F59E0B'],
      gradientAngle: 90,
      strokeEnabled: true,
      strokeColor: '#000000',
      strokeWidth: isSubtitle ? 1.5 : 2,
      ...createBaseSettings(),
    };

    if (!isSubtitle) {
      newLayer.threeD.enabled = true;
      newLayer.animation.inType = 'zoom-3d';
    }

    setProject((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
    }));
    setSelectedLayerId(newId);
    setShowAddMenu(false);
  };

  // Add new Graphic Element / Shape
  const handleAddShapeLayer = (shapeType: ShapeType = 'rectangle') => {
    const newId = `layer-shape-${Date.now()}`;
    const newLayer: TextLayer = {
      id: newId,
      name: `Forma (${shapeType})`,
      type: 'shape',
      shapeType,
      shapeWidth: shapeType === 'line' ? 600 : 400,
      shapeHeight: shapeType === 'line' ? 8 : 70,
      cornerRadius: 12,
      text: '',
      x: 50,
      y: shapeType === 'line' ? 65 : 50,
      fontSize: 20,
      fontFamily: 'sans-serif',
      fontWeight: 400,
      fontStyle: 'normal',
      letterSpacing: 0,
      lineHeight: 1,
      textAlign: 'center',
      textTransform: 'none',
      fillType: 'gradient',
      fillColor: '#F59E0B',
      gradientColors: ['#F59E0B', '#EF4444'],
      gradientAngle: 90,
      strokeEnabled: true,
      strokeColor: '#000000',
      strokeWidth: 2,
      ...createBaseSettings(),
    };

    setProject((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
    }));
    setSelectedLayerId(newId);
    setShowAddMenu(false);
  };

  // Add new Image / Logo Layer
  const handleAddImageLayer = (imageUrl?: string, name?: string) => {
    const newId = `layer-img-${Date.now()}`;
    const newLayer: TextLayer = {
      id: newId,
      name: name || `Logo / Imagen`,
      type: 'image',
      imageUrl: imageUrl || 'https://api.iconify.design/heroicons:check-badge-solid.svg?color=%2338bdf8',
      imageWidth: 160,
      imageHeight: 160,
      text: '',
      x: 50,
      y: 35,
      fontSize: 20,
      fontFamily: 'sans-serif',
      fontWeight: 400,
      fontStyle: 'normal',
      letterSpacing: 0,
      lineHeight: 1,
      textAlign: 'center',
      textTransform: 'none',
      fillType: 'solid',
      fillColor: '#FFFFFF',
      gradientColors: ['#FFFFFF', '#F59E0B'],
      gradientAngle: 90,
      strokeEnabled: false,
      strokeColor: '#000000',
      strokeWidth: 0,
      ...createBaseSettings(),
    };

    setProject((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
    }));
    setSelectedLayerId(newId);
    setShowAddMenu(false);
  };

  // Upload file for new image layer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      handleAddImageLayer(dataUrl, file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  // Duplicate layer
  const handleDuplicateLayer = (layer: TextLayer, e: React.MouseEvent) => {
    e.stopPropagation();
    const newId = `layer-${Date.now()}`;
    const duplicated: TextLayer = {
      ...layer,
      id: newId,
      name: `${layer.name} (Copia)`,
      x: Math.min(90, layer.x + 3),
      y: Math.min(90, layer.y + 3),
    };

    setProject((prev) => ({
      ...prev,
      layers: [...prev.layers, duplicated],
    }));
    setSelectedLayerId(newId);
  };

  // Delete layer
  const handleDeleteLayer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.layers.length <= 1) {
      alert('El proyecto debe tener al menos una capa.');
      return;
    }

    setProject((prev) => ({
      ...prev,
      layers: prev.layers.filter((l) => l.id !== id),
    }));

    if (selectedLayerId === id) {
      const remaining = project.layers.filter((l) => l.id !== id);
      setSelectedLayerId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  // Toggle visibility
  const handleToggleVisible = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    }));
  };

  // Toggle lock
  const handleToggleLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)),
    }));
  };

  // Move layer up / down in stack
  const handleMoveLayer = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= project.layers.length) return;

    const updated = [...project.layers];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setProject((prev) => ({ ...prev, layers: updated }));
  };

  // Get Layer Type Icon
  const getLayerTypeIcon = (layer: TextLayer) => {
    if (layer.type === 'shape') {
      return <Shapes className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    }
    if (layer.type === 'image') {
      return <ImageIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    }
    return <Type className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  };

  return (
    <div
      id="layers-panel"
      className="w-76 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0 overflow-hidden relative"
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Capas ({project.layers.length})
          </span>
        </div>

        <div className="relative">
          <button
            id="btn-add-layer"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir</span>
          </button>

          {/* Add Layer Popover Dropdown */}
          {showAddMenu && (
            <div
              className="absolute right-0 top-full mt-1.5 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 space-y-1 text-xs"
              onMouseLeave={() => setShowAddMenu(false)}
            >
              <button
                onClick={() => handleAddTextLayer(false)}
                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-slate-200 text-left cursor-pointer transition"
              >
                <Type className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="block font-semibold">Capa de Texto 3D</span>
                  <span className="text-[10px] text-slate-400 block">Título principal con relieve</span>
                </div>
              </button>

              <button
                onClick={() => handleAddTextLayer(true)}
                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-slate-200 text-left cursor-pointer transition"
              >
                <Type className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="block font-semibold">Subtítulo / Texto 2D</span>
                  <span className="text-[10px] text-slate-400 block">Alineado inferior o libre</span>
                </div>
              </button>

              <div className="pt-1 border-t border-slate-800">
                <span className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase block">
                  Formas y Gráficos
                </span>
                <div className="grid grid-cols-2 gap-1 px-1">
                  <button
                    onClick={() => handleAddShapeLayer('rectangle')}
                    className="p-1 rounded hover:bg-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 text-rose-400" />
                    <span>Rectángulo</span>
                  </button>
                  <button
                    onClick={() => handleAddShapeLayer('line')}
                    className="p-1 rounded hover:bg-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Línea</span>
                  </button>
                  <button
                    onClick={() => handleAddShapeLayer('circle')}
                    className="p-1 rounded hover:bg-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Circle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Círculo</span>
                  </button>
                  <button
                    onClick={() => handleAddShapeLayer('arrow')}
                    className="p-1 rounded hover:bg-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <MoveRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Flecha</span>
                  </button>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-slate-200 text-left cursor-pointer transition"
                >
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="block font-semibold">Subir Logo / Imagen</span>
                    <span className="text-[10px] text-slate-400 block">PNG con canal alfa</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Layers List (Rendered top-to-bottom as front-to-back in UI) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {[...project.layers]
          .map((layer, index) => ({ layer, index }))
          .reverse()
          .map(({ layer, index }) => {
            const isSelected = layer.id === selectedLayerId;

            return (
              <div
                key={layer.id}
                id={`layer-item-${layer.id}`}
                onClick={() => setSelectedLayerId(layer.id)}
                className={`group rounded-lg border px-2.5 py-2 transition cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500/60 shadow-sm shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                } ${!layer.visible ? 'opacity-50' : ''}`}
              >
                {/* Top: Icon, Name & Badges */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {getLayerTypeIcon(layer)}
                    <input
                      type="text"
                      value={layer.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setProject((prev) => ({
                          ...prev,
                          layers: prev.layers.map((l) =>
                            l.id === layer.id ? { ...l, name: newName } : l
                          ),
                        }));
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none focus:bg-slate-950 focus:px-1 rounded truncate w-full"
                    />

                    {/* Feature badges */}
                    <div className="flex items-center gap-1 shrink-0">
                      {layer.threeD?.enabled && (
                        <span className="px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold flex items-center gap-0.5">
                          <Box className="w-2.5 h-2.5" />
                          3D
                        </span>
                      )}
                      {layer.useKeyframes && (
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold flex items-center gap-0.5">
                          <Diamond className="w-2.5 h-2.5 fill-current" />
                          KF
                        </span>
                      )}
                      {layer.mask?.enabled && (
                        <span className="px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold flex items-center gap-0.5">
                          <Scissors className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Reorder */}
                  <div className="flex items-center opacity-70 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => handleMoveLayer(index, 'up', e)}
                      disabled={index === project.layers.length - 1}
                      title="Traer al frente"
                      className="p-1 hover:text-white text-slate-400 disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleMoveLayer(index, 'down', e)}
                      disabled={index === 0}
                      title="Enviar al fondo"
                      className="p-1 hover:text-white text-slate-400 disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub: Content Preview & Action Buttons */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[130px] font-mono text-slate-500 text-[10px]">
                    {layer.type === 'shape'
                      ? `Forma: ${layer.shapeType || 'rect'}`
                      : layer.type === 'image'
                      ? 'Logo / Imagen'
                      : `"${layer.text.split('\n')[0]}"`}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Visibility */}
                    <button
                      onClick={(e) => handleToggleVisible(layer.id, e)}
                      title={layer.visible ? 'Ocultar capa' : 'Mostrar capa'}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {layer.visible ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </button>

                    {/* Lock */}
                    <button
                      onClick={(e) => handleToggleLock(layer.id, e)}
                      title={layer.locked ? 'Desbloquear capa' : 'Bloquear posición'}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {layer.locked ? (
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={(e) => handleDuplicateLayer(layer, e)}
                      title="Duplicar capa"
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDeleteLayer(layer.id, e)}
                      title="Eliminar capa"
                      className="p-1 rounded hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
