import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Plus,
  Trash2,
  Download,
  Upload,
  Clock,
  Layers,
  User,
  Share2,
  Check,
  Bookmark,
} from 'lucide-react';
import { TitlePreset, ProjectSettings, UserPreset } from '../types';
import { TITLE_PRESETS } from '../data/presets';
import {
  getUserPresets,
  saveUserPreset,
  deleteUserPreset,
  exportPresetToFile,
  importPresetFromFile,
} from '../utils/projectStorage';
import { useTheme } from '../context/ThemeContext';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectSettings;
  onApplyPreset: (preset: TitlePreset | UserPreset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  project,
  onApplyPreset,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'built-in' | 'custom'>('built-in');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userPresets, setUserPresets] = useState<UserPreset[]>([]);

  // Save new preset dialog state
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [newPresetAuthor, setNewPresetAuthor] = useState('');

  // Status message
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUserPresets(getUserPresets());
      setNewPresetName(`${project.name} Preset`);
      setNewPresetDesc('Combinación personalizada de capas 3D, animación y estilo.');
      setNewPresetAuthor('Creador CineTitle');
      setStatusMsg(null);
    }
  }, [isOpen, project.name]);

  if (!isOpen) return null;

  const categories = ['all', 'Cinematic', 'Cyberpunk', 'Broadcast', 'Luxury', 'Retro'];

  const filteredBuiltIn =
    selectedCategory === 'all'
      ? TITLE_PRESETS
      : TITLE_PRESETS.filter((p) => p.category === selectedCategory);

  const handleSaveCurrentAsPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const saved = saveUserPreset({
      name: newPresetName,
      description: newPresetDesc,
      author: newPresetAuthor,
      project,
    });

    setUserPresets(getUserPresets());
    setIsSavingCustom(false);
    setStatusMsg(`Preset "${saved.name}" guardado exitosamente en tu biblioteca.`);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleDeleteUserPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este preset personalizado?')) {
      deleteUserPreset(id);
      setUserPresets(getUserPresets());
      setStatusMsg('Preset eliminado.');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleExportPreset = (preset: UserPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    exportPresetToFile(preset);
    setStatusMsg(`Preset "${preset.name}" exportado como archivo .cinetitle-preset`);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleImportFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importPresetFromFile(file);
      setUserPresets(getUserPresets());
      setStatusMsg(`Preset "${imported.name}" importado exitosamente.`);
      setActiveTab('custom');
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error al importar preset');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      id="presets-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        className={`w-full max-w-4xl border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transition-colors ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Biblioteca de Presets & Plantillas 3D
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Explora estilos cinematográficos profesionales o crea y comparte tus propias combinaciones.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Built-in vs Custom Presets */}
        <div
          className={`px-4 py-2.5 border-b flex items-center justify-between gap-4 ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('built-in')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'built-in'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : isDark
                  ? 'bg-slate-900 text-slate-300 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plantillas de Estudio ({TITLE_PRESETS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-900 text-slate-300 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Mis Presets Personalizados ({userPresets.length})</span>
            </button>
          </div>

          {/* Action buttons for Custom Presets */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Importar preset compartido (.cinetitle-preset)"
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Importar Preset</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".cinetitle-preset,.json"
              className="hidden"
              onChange={handleImportFileSelect}
            />

            <button
              onClick={() => {
                setActiveTab('custom');
                setIsSavingCustom(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Guardar Diseño Actual</span>
            </button>
          </div>
        </div>

        {/* Status notification toast */}
        {statusMsg && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Sub-Header: Category Pills (Built-in) or Save Form (Custom) */}
        {activeTab === 'built-in' ? (
          <div
            className={`px-4 py-2 border-b flex items-center gap-2 overflow-x-auto ${
              isDark ? 'border-slate-800/80 bg-slate-900/30' : 'border-slate-200 bg-slate-50'
            }`}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                {cat === 'all' ? 'Todos los Estilos' : cat}
              </button>
            ))}
          </div>
        ) : isSavingCustom ? (
          <form
            onSubmit={handleSaveCurrentAsPreset}
            className={`p-4 border-b space-y-3 ${
              isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-indigo-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Guardar Configuración Actual como Preset Personalizado
              </h3>
              <button
                type="button"
                onClick={() => setIsSavingCustom(false)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancelar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Preset
                </label>
                <input
                  type="text"
                  required
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="Ej: Golden Cinematic 3D"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Autor
                </label>
                <input
                  type="text"
                  value={newPresetAuthor}
                  onChange={(e) => setNewPresetAuthor(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="Tu nombre o estudio"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="Detalles sobre el diseño y animación"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsSavingCustom(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Confirmar y Guardar Preset
              </button>
            </div>
          </form>
        ) : null}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'built-in' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredBuiltIn.map((preset) => (
                <div
                  key={preset.id}
                  className={`group p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 cursor-pointer relative overflow-hidden ${
                    isDark
                      ? 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-amber-500/50'
                      : 'bg-white hover:bg-amber-50/40 border-slate-200 hover:border-amber-500/60 shadow-xs'
                  }`}
                  onClick={() => {
                    onApplyPreset(preset);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: preset.thumbnailColor }}
                        />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                          {preset.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300 shrink-0 border border-slate-200 dark:border-slate-700">
                      {preset.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {preset.layers.length} {preset.layers.length === 1 ? 'capa' : 'capas'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {preset.duration}s
                      </span>
                    </div>

                    <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition flex items-center gap-1">
                      Aplicar Plantilla →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {userPresets.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Aún no tienes presets personalizados guardados
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Diseña tus títulos en el editor y haz clic en &ldquo;Guardar Diseño Actual&rdquo; para guardar tus combinaciones de materiales 3D, luces, animaciones y colores.
                  </p>
                  <button
                    onClick={() => setIsSavingCustom(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Guardar Configuración Actual
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`group p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 cursor-pointer relative ${
                        isDark
                          ? 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/50'
                          : 'bg-white hover:bg-indigo-50/40 border-slate-200 hover:border-indigo-500/60 shadow-xs'
                      }`}
                      onClick={() => {
                        onApplyPreset(preset);
                        onClose();
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                              {preset.name}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {preset.description}
                          </p>
                        </div>

                        {/* Export & Delete buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleExportPreset(preset, e)}
                            title="Compartir/Exportar este preset (.cinetitle-preset)"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteUserPreset(preset.id, e)}
                            title="Eliminar preset"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {preset.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {preset.layers.length} capas
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {preset.duration}s
                          </span>
                        </div>

                        <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition">
                          Cargar Preset →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-3 border-t flex items-center justify-between text-xs ${
            isDark ? 'border-slate-800 bg-slate-900/50 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          <span>
            {activeTab === 'built-in'
              ? 'Plantillas optimizadas para renderizado en tiempo real a 60 FPS.'
              : 'Los presets personalizados se guardan localmente y pueden compartirse con otros usuarios.'}
          </span>

          <button
            onClick={onClose}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
