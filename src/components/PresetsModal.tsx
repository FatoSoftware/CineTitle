import React, { useState } from 'react';
import { Sparkles, X, Check, Box, Film, Clock } from 'lucide-react';
import { TitlePreset, ProjectSettings } from '../types';
import { TITLE_PRESETS } from '../data/presets';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset: (preset: TitlePreset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onApplyPreset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = ['all', 'Cinematic', 'Cyberpunk', 'Broadcast', 'Luxury', 'Retro'];

  const filteredPresets =
    selectedCategory === 'all'
      ? TITLE_PRESETS
      : TITLE_PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <div
      id="presets-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Plantillas de Títulos Predefinidos</h2>
              <p className="text-[11px] text-slate-400">
                Diseños 3D de alta gama listos para usar o personalizar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'Todos los Estilos' : cat}
            </button>
          ))}
        </div>

        {/* Presets Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              className="group p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-3 cursor-pointer relative overflow-hidden"
              onClick={() => {
                onApplyPreset(preset);
                onClose();
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: preset.thumbnailColor }}
                    />
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition">
                      {preset.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 shrink-0">
                  {preset.category}
                </span>
              </div>

              {/* Footer info & Apply button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {preset.duration}s
                  </span>
                  <span className="flex items-center gap-1">
                    <Box className="w-3 h-3 text-slate-500" />
                    {preset.layers.length} {preset.layers.length === 1 ? 'capa' : 'capas'}
                  </span>
                </div>

                <button className="px-3 py-1 rounded-md bg-amber-500/15 group-hover:bg-amber-500 text-amber-300 group-hover:text-slate-950 font-semibold text-xs transition">
                  Cargar Plantilla
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
