import React, { useRef } from 'react';
import {
  Square,
  Sparkles,
  Video,
  Upload,
  Image as ImageIcon,
  Palette,
  Sliders,
  Check,
} from 'lucide-react';
import { BackgroundSettings, BackgroundType } from '../../types';
import { NumberSliderControl } from '../common/NumberSliderControl';

interface BackgroundInspectorProps {
  background: BackgroundSettings;
  updateBackground: (updates: Partial<BackgroundSettings>) => void;
  onSetBgMedia: (file: File | null, mediaType?: 'video' | 'image', sampleUrl?: string) => void;
}

const SAMPLE_VIDEOS = [
  {
    name: 'Ciudad Cyberpunk Nocturna',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-at-night-42283-large.mp4',
    type: 'video' as const,
  },
  {
    name: 'Partículas de Luz Abstractas',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-golden-dust-particles-flowing-in-the-dark-40011-large.mp4',
    type: 'video' as const,
  },
  {
    name: 'Paisaje Natural Aéreo',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-mountain-valley-with-a-river-42777-large.mp4',
    type: 'video' as const,
  },
];

export const BackgroundInspector: React.FC<BackgroundInspectorProps> = ({
  background,
  updateBackground,
  onSetBgMedia,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert('Por favor selecciona un archivo de video (MP4/WebM) o imagen (PNG/JPG).');
      return;
    }

    const type = isVideo ? 'video' : 'image';
    updateBackground({ type, mediaType: type });
    onSetBgMedia(file, type);
  };

  return (
    <div id="inspector-background" className="p-4 space-y-4">
      {/* Background Types */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Tipo de Fondo del Video
        </label>

        <div className="grid grid-cols-2 gap-2">
          {/* Transparent (Alpha) */}
          <button
            id="btn-bg-transparent"
            onClick={() => updateBackground({ type: 'transparent' })}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
              background.type === 'transparent'
                ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="w-6 h-6 rounded bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:6px_6px] border border-slate-700 flex items-center justify-center shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold">Transparente</span>
              <span className="text-[10px] text-slate-400 block truncate">Canal Alfa (Sin fondo)</span>
            </div>
          </button>

          {/* Chroma Green */}
          <button
            onClick={() => updateBackground({ type: 'chroma-green' })}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
              background.type === 'chroma-green'
                ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/30 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="w-6 h-6 rounded bg-[#00FF00] border border-emerald-400 shadow-sm shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold">Croma Verde</span>
              <span className="text-[10px] text-slate-400 block truncate">Para incrustación (#00FF00)</span>
            </div>
          </button>

          {/* Chroma Blue */}
          <button
            onClick={() => updateBackground({ type: 'chroma-blue' })}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
              background.type === 'chroma-blue'
                ? 'bg-blue-500/15 border-blue-500/60 ring-1 ring-blue-500/30 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="w-6 h-6 rounded bg-[#0000FF] border border-blue-400 shadow-sm shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold">Croma Azul</span>
              <span className="text-[10px] text-slate-400 block truncate">Chroma Key Clásico</span>
            </div>
          </button>

          {/* Gradient */}
          <button
            onClick={() => updateBackground({ type: 'gradient' })}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
              background.type === 'gradient'
                ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-indigo-900 to-slate-900 border border-slate-700 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold">Degradado</span>
              <span className="text-[10px] text-slate-400 block truncate">Estudio cinematográfico</span>
            </div>
          </button>

          {/* Solid Color */}
          <button
            onClick={() => updateBackground({ type: 'color' })}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
              background.type === 'color'
                ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="w-6 h-6 rounded bg-slate-950 border border-slate-700 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold">Color Sólido</span>
              <span className="text-[10px] text-slate-400 block truncate">Negro / Personalizado</span>
            </div>
          </button>

          {/* Video / Photo Overlay */}
          <button
            onClick={() => {
              if (background.mediaUrl) {
                updateBackground({ type: background.mediaType || 'video' });
              } else {
                fileInputRef.current?.click();
              }
            }}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
              background.type === 'video' || background.type === 'image'
                ? 'bg-indigo-500/15 border-indigo-500/60 ring-1 ring-indigo-500/30 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="w-6 h-6 rounded bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Video className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold">Sobre Video</span>
              <span className="text-[10px] text-slate-400 block truncate">Subir clip propio</span>
            </div>
          </button>
        </div>
      </div>

      {/* Detail options depending on selected background type */}

      {/* Transparent Detail */}
      {background.type === 'transparent' && (
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300">Modo Canal Alfa Activado</span>
            <span className="px-1.5 py-0.2 bg-amber-500/20 rounded text-[10px] font-mono text-amber-400">
              ALPHA 32-BIT
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            El video se exportará sin fondo para que puedas colocarlo directamente como capa sobre cualquier video en DaVinci Resolve, Premiere Pro, OBS Studio o Final Cut Pro.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="cb-checkerboard"
              checked={background.checkerboardInPreview}
              onChange={(e) => updateBackground({ checkerboardInPreview: e.target.checked })}
              className="accent-amber-500 cursor-pointer"
            />
            <label htmlFor="cb-checkerboard" className="text-slate-300 text-xs cursor-pointer">
              Mostrar patrón de ajedrez en la pantalla de previsualización
            </label>
          </div>
        </div>
      )}

      {/* Solid Color Picker */}
      {background.type === 'color' && (
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
          <label className="block text-xs text-slate-300 font-semibold">Color de Fondo</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={background.color}
              onChange={(e) => updateBackground({ color: e.target.value })}
              className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={background.color}
              onChange={(e) => updateBackground({ color: e.target.value })}
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 font-mono"
            />
          </div>
        </div>
      )}

      {/* Gradient Picker */}
      {background.type === 'gradient' && (
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
          <label className="block text-xs text-slate-300 font-semibold">Colores del Degradado</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Color Inicio</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={background.gradient.from}
                  onChange={(e) =>
                    updateBackground({
                      gradient: { ...background.gradient, from: e.target.value },
                    })
                  }
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={background.gradient.from}
                  onChange={(e) =>
                    updateBackground({
                      gradient: { ...background.gradient, from: e.target.value },
                    })
                  }
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Color Fin</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={background.gradient.to}
                  onChange={(e) =>
                    updateBackground({
                      gradient: { ...background.gradient, to: e.target.value },
                    })
                  }
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={background.gradient.to}
                  onChange={(e) =>
                    updateBackground({
                      gradient: { ...background.gradient, to: e.target.value },
                    })
                  }
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          <NumberSliderControl
            id="bg-gradient-angle"
            label="Ángulo del Degradado"
            value={background.gradient.angle}
            min={0}
            max={360}
            step={1}
            unit="°"
            onChange={(angle) =>
              updateBackground({
                gradient: { ...background.gradient, angle },
              })
            }
            quickResetValue={135}
          />
        </div>
      )}

      {/* Video / Photo Overlay Upload & Samples */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            <span>Video o Imagen de Fondo Propia</span>
          </span>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
          >
            <Upload className="w-3 h-3" />
            <span>Subir Video / Foto</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,image/png,image/jpeg"
            onChange={handleMediaUpload}
            className="hidden"
          />
        </div>

        {/* Media Opacity */}
        {(background.type === 'video' || background.type === 'image') && (
          <div className="pt-1">
            <NumberSliderControl
              id="bg-media-opacity"
              label="Opacidad del Fondo"
              value={background.mediaOpacity}
              min={0.05}
              max={1.0}
              step={0.01}
              isPercent={true}
              onChange={(mediaOpacity) => updateBackground({ mediaOpacity })}
              quickResetValue={1.0}
            />
          </div>
        )}

        {/* Sample video test buttons */}
        <div>
          <span className="text-[11px] text-slate-400 block mb-1.5">
            O prueba con clips de muestra:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {SAMPLE_VIDEOS.map((sample) => (
              <button
                key={sample.name}
                onClick={() => {
                  updateBackground({ type: 'video', mediaType: 'video' });
                  onSetBgMedia(null, 'video', sample.url);
                }}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-[10px] text-slate-300 truncate text-left transition cursor-pointer"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
