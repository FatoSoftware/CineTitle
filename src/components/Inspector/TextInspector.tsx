import React, { useState, useEffect } from 'react';
import {
  Type,
  Upload,
  HardDrive,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Maximize,
  Minimize,
  Sliders,
} from 'lucide-react';
import { TextLayer } from '../../types';
import { NumberSliderControl } from '../common/NumberSliderControl';
import {
  POPULAR_GOOGLE_FONTS,
  STANDARD_SYSTEM_FONTS,
  FontOption,
  querySystemFonts,
  loadCustomFontFile,
  ensureFontLoaded,
  isLocalFontAccessSupported,
} from '../../data/fonts';

interface TextInspectorProps {
  layer: TextLayer;
  updateLayer: (updates: Partial<TextLayer>) => void;
}

export const TextInspector: React.FC<TextInspectorProps> = ({ layer, updateLayer }) => {
  const [fontsList, setFontsList] = useState<FontOption[]>([
    ...STANDARD_SYSTEM_FONTS,
    ...POPULAR_GOOGLE_FONTS,
  ]);
  const [isLoadingFonts, setIsLoadingFonts] = useState(false);
  const [hasQueriedSystem, setHasQueriedSystem] = useState(false);

  // When layer's font changes, ensure it's loaded if from Google Fonts
  useEffect(() => {
    ensureFontLoaded(layer.fontFamily);
  }, [layer.fontFamily]);

  // Handle Query System Fonts (Local Font Access API)
  const handleQuerySystemFonts = async () => {
    setIsLoadingFonts(true);
    try {
      const sysFonts = await querySystemFonts();
      setFontsList((prev) => {
        // Merge without duplicates
        const map = new Map<string, FontOption>();
        sysFonts.forEach((f) => map.set(f.family.toLowerCase(), f));
        prev.forEach((f) => {
          if (!map.has(f.family.toLowerCase())) {
            map.set(f.family.toLowerCase(), f);
          }
        });
        return Array.from(map.values());
      });
      setHasQueriedSystem(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingFonts(false);
    }
  };

  // Handle Custom Font File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newFont = await loadCustomFontFile(file);
      setFontsList((prev) => [newFont, ...prev]);
      updateLayer({ fontFamily: newFont.family });
    } catch (err) {
      alert('Error al cargar la fuente personalizada. Asegúrate de subir un archivo .ttf, .otf o .woff.');
      console.error(err);
    }
  };

  return (
    <div id="inspector-text" className="p-4 space-y-4">
      {/* Text Content Area */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span>Contenido del Texto / Subtítulo</span>
          <span className="text-[10px] text-slate-500 font-normal">Soporta múltiples líneas (Enter)</span>
        </label>
        <textarea
          id="input-text-content"
          value={layer.text}
          onChange={(e) => updateLayer({ text: e.target.value })}
          rows={3}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-y min-h-[72px] font-medium"
          placeholder="Escribe el texto o subtítulo aquí..."
        />
        {/* Quick alignment / subtitle presets */}
        <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto">
          <button
            onClick={() => updateLayer({ x: 50, y: 85, fontSize: 44, textAlign: 'center' })}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-amber-300 whitespace-nowrap transition cursor-pointer"
          >
            Subtítulo Inferior (85%)
          </button>
          <button
            onClick={() => updateLayer({ x: 30, y: 82, fontSize: 40, textAlign: 'left' })}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-amber-300 whitespace-nowrap transition cursor-pointer"
          >
            Tercio Inferior Izq
          </button>
          <button
            onClick={() => updateLayer({ x: 50, y: 50, textAlign: 'center' })}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-amber-300 whitespace-nowrap transition cursor-pointer"
          >
            Centrado Total
          </button>
        </div>
      </div>

      {/* Typography: Font Picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-amber-400" />
            <span>Tipografía</span>
          </label>

          {/* System Font & Upload Actions */}
          <div className="flex items-center gap-1.5">
            {/* System Fonts Button */}
            <button
              id="btn-detect-system-fonts"
              onClick={handleQuerySystemFonts}
              disabled={isLoadingFonts}
              title={
                isLocalFontAccessSupported()
                  ? 'Escanear fuentes instaladas en tu computadora'
                  : 'Cargar fuentes estándar del sistema'
              }
              className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition ${
                hasQueriedSystem
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
              }`}
            >
              <HardDrive className="w-3 h-3 text-amber-400" />
              <span>{hasQueriedSystem ? 'Fuentes del Sistema ✓' : 'Fuentes del Sistema'}</span>
            </button>

            {/* Upload Font File */}
            <label
              title="Subir archivo .ttf, .otf, .woff"
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-[11px] flex items-center gap-1 cursor-pointer transition"
            >
              <Upload className="w-3 h-3 text-indigo-400" />
              <span>Subir .TTF</span>
              <input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Font Select Dropdown */}
        <select
          id="select-font-family"
          value={layer.fontFamily}
          onChange={(e) => {
            ensureFontLoaded(e.target.value);
            updateLayer({ fontFamily: e.target.value });
          }}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <optgroup label="Fuentes Subidas / Personalizadas">
            {fontsList
              .filter((f) => f.category === 'custom')
              .map((f) => (
                <option key={f.family} value={f.family}>
                  {f.displayName}
                </option>
              ))}
          </optgroup>
          <optgroup label="Fuentes del Sistema">
            {fontsList
              .filter((f) => f.category === 'system')
              .map((f) => (
                <option key={f.family} value={f.family}>
                  {f.displayName}
                </option>
              ))}
          </optgroup>
          <optgroup label="Fuentes de Cine & Títulos (Google Fonts)">
            {fontsList
              .filter((f) => f.category === 'google')
              .map((f) => (
                <option key={f.family} value={f.family}>
                  {f.displayName}
                </option>
              ))}
          </optgroup>
        </select>
      </div>

      {/* Font Size & Weight */}
      <div className="space-y-3">
        <NumberSliderControl
          id="text-font-size"
          label="Tamaño de Fuente"
          value={layer.fontSize}
          min={16}
          max={250}
          step={1}
          unit="px"
          onChange={(fontSize) => updateLayer({ fontSize })}
          quickResetValue={100}
        />

        <div>
          <label className="block text-[11px] text-slate-300 font-medium mb-1">Grosor de Fuente (Peso)</label>
          <select
            value={layer.fontWeight}
            onChange={(e) => updateLayer({ fontWeight: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="400">Regular (400)</option>
            <option value="600">Semibold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extrabold (800)</option>
            <option value="900">Black Heavy (900)</option>
          </select>
        </div>
      </div>

      {/* Letter Spacing & Line Height */}
      <div className="space-y-3">
        <NumberSliderControl
          id="text-letter-spacing"
          label="Espaciado de Caracteres (Kerning)"
          value={layer.letterSpacing}
          min={-5}
          max={60}
          step={1}
          unit="px"
          onChange={(letterSpacing) => updateLayer({ letterSpacing })}
          quickResetValue={4}
        />

        <NumberSliderControl
          id="text-line-height"
          label="Interlineado (Múltiples Líneas)"
          value={layer.lineHeight}
          min={0.7}
          max={2.5}
          step={0.05}
          unit="x"
          onChange={(lineHeight) => updateLayer({ lineHeight })}
          quickResetValue={1.1}
        />

        <NumberSliderControl
          id="text-opacity"
          label="Opacidad de Capa"
          value={layer.opacity}
          min={0}
          max={1}
          step={0.01}
          isPercent={true}
          onChange={(opacity) => updateLayer({ opacity })}
          quickResetValue={1}
        />
      </div>

      {/* Alignment & Transform */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Alineación</label>
          <div className="flex rounded-md bg-slate-900 border border-slate-700/80 p-0.5">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                onClick={() => updateLayer({ textAlign: align })}
                className={`flex-1 py-1 rounded flex items-center justify-center transition ${
                  layer.textAlign === align
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Mayúsculas</label>
          <div className="flex rounded-md bg-slate-900 border border-slate-700/80 p-0.5">
            {[
              { id: 'none', label: 'Aa' },
              { id: 'uppercase', label: 'AA' },
              { id: 'lowercase', label: 'aa' },
              { id: 'capitalize', label: 'Ab' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => updateLayer({ textTransform: t.id as any })}
                className={`flex-1 py-1 rounded text-xs font-mono transition ${
                  layer.textTransform === t.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Position X / Y Quick Centering with Dual Inputs */}
      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-3">
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
          id="layer-pos-x"
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
          id="layer-pos-y"
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
