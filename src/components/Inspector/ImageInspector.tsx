import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Sparkles, Check } from 'lucide-react';
import { TextLayer } from '../../types';
import { NumberSliderControl } from '../common/NumberSliderControl';

interface ImageInspectorProps {
  layer: TextLayer;
  updateLayer: (updates: Partial<TextLayer>) => void;
}

const PRESET_ICONS = [
  {
    name: 'Insignia Verificado',
    url: 'https://api.iconify.design/heroicons:check-badge-solid.svg?color=%2338bdf8',
  },
  {
    name: 'Estrella Dorada',
    url: 'https://api.iconify.design/heroicons:star-solid.svg?color=%23f59e0b',
  },
  {
    name: 'Play Botón',
    url: 'https://api.iconify.design/heroicons:play-circle-solid.svg?color=%23ef4444',
  },
  {
    name: 'Logo Rayo Neón',
    url: 'https://api.iconify.design/heroicons:bolt-solid.svg?color=%23eab308',
  },
  {
    name: 'Insignia 4K Ultra HD',
    url: 'https://api.iconify.design/material-symbols:4k-rounded.svg?color=%23ffffff',
  },
  {
    name: 'Fuego Popular',
    url: 'https://api.iconify.design/heroicons:fire-solid.svg?color=%23f97316',
  },
];

export const ImageInspector: React.FC<ImageInspectorProps> = ({ layer, updateLayer }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (.png, .jpg, .webp, .svg)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateLayer({
        imageUrl: dataUrl,
        name: file.name.replace(/\.[^/.]+$/, ''),
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="inspector-image" className="p-4 space-y-4">
      {/* Upload Box */}
      <div className="p-3.5 bg-slate-900/70 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Logo o Imagen Superpuesta</span>
          </span>
          {layer.imageUrl && (
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Cargada
            </span>
          )}
        </div>

        {/* Current Image Preview */}
        {layer.imageUrl ? (
          <div className="flex items-center gap-3 p-2 bg-slate-950 rounded-lg border border-slate-800">
            <img
              src={layer.imageUrl}
              alt="Logo"
              className="w-14 h-14 object-contain bg-slate-900 rounded p-1 border border-slate-800"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <span className="block text-xs font-medium text-slate-200 truncate">
                {layer.name || 'Imagen superpuesta'}
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-amber-400 hover:underline block cursor-pointer"
              >
                Cambiar imagen
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700/80 hover:border-amber-500/80 rounded-xl p-4 text-center cursor-pointer transition bg-slate-950/40 hover:bg-slate-900/50"
          >
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-slate-200">Subir Logo o Imagen PNG/SVG</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Soporta fondos transparentes y canal alfa
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* URL Input */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
            <LinkIcon className="w-3 h-3" />
            <span>O pegar enlace URL de imagen</span>
          </label>
          <input
            type="text"
            placeholder="https://ejemplo.com/logo.png"
            value={layer.imageUrl || ''}
            onChange={(e) => updateLayer({ imageUrl: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Quick Sample Icons */}
        <div>
          <span className="block text-[11px] text-slate-400 mb-1.5">
            O seleccionar icono / logo rápido:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESET_ICONS.map((icon) => (
              <button
                key={icon.name}
                onClick={() => updateLayer({ imageUrl: icon.url, name: icon.name })}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 text-left flex items-center gap-1.5 transition cursor-pointer"
              >
                <img
                  src={icon.url}
                  alt={icon.name}
                  className="w-4 h-4 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] text-slate-300 truncate">{icon.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dimensions & Opacity */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-200 block">Tamaño y Apariencia</span>

        <NumberSliderControl
          id="img-width"
          label="Ancho del Logo"
          value={layer.imageWidth ?? 200}
          min={30}
          max={1200}
          step={10}
          unit="px"
          onChange={(imageWidth) => updateLayer({ imageWidth })}
          quickResetValue={200}
        />

        <NumberSliderControl
          id="img-height"
          label="Alto del Logo"
          value={layer.imageHeight ?? 200}
          min={30}
          max={1200}
          step={10}
          unit="px"
          onChange={(imageHeight) => updateLayer({ imageHeight })}
          quickResetValue={200}
        />

        <NumberSliderControl
          id="img-opacity"
          label="Opacidad de la Imagen"
          value={layer.opacity ?? 1}
          min={0}
          max={1}
          step={0.01}
          isPercent={true}
          onChange={(opacity) => updateLayer({ opacity })}
          quickResetValue={1}
        />
      </div>

      {/* Position X / Y Dual Controls */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Posición en Pantalla (%)</span>
          <button
            onClick={() => updateLayer({ x: 50, y: 50 })}
            className="text-[11px] text-amber-400 hover:underline cursor-pointer"
          >
            Centrar Total (50%, 50%)
          </button>
        </div>

        <NumberSliderControl
          id="img-pos-x"
          label="Posición Horizontal X"
          value={layer.x}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(x) => updateLayer({ x })}
          quickResetValue={50}
        />

        <NumberSliderControl
          id="img-pos-y"
          label="Posición Vertical Y"
          value={layer.y}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(y) => updateLayer({ y })}
          quickResetValue={50}
        />
      </div>
    </div>
  );
};
