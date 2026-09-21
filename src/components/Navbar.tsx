import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Download,
  Film,
  Camera,
  RotateCcw,
  Grid,
  Sun,
  Moon,
  Keyboard,
  Undo2,
  Redo2,
  Save,
  FolderOpen,
  History,
  Clock,
  Check,
} from 'lucide-react';
import { ProjectSettings } from '../types';
import { RESOLUTION_PRESETS } from '../data/resolutions';
import { useTheme } from '../context/ThemeContext';
import { saveProjectToFile, loadProjectFromFile } from '../utils/projectStorage';

interface NavbarProps {
  project: ProjectSettings;
  setProject: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  onOpenPresets: () => void;
  onOpenExport: () => void;
  onTakeSnapshot: () => void;
  onResetProject: () => void;
  onOpenShortcuts?: () => void;
  onLoadProject?: (loaded: ProjectSettings) => void;
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  undoCount?: number;
  redoCount?: number;
  pastSteps?: { name: string; time: string; layersCount: number }[];
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  setProject,
  onOpenPresets,
  onOpenExport,
  onTakeSnapshot,
  onResetProject,
  onOpenShortcuts,
  onLoadProject,
  undo,
  redo,
  canUndo = false,
  canRedo = false,
  undoCount = 0,
  redoCount = 0,
  pastSteps = [],
}) => {
  const { toggleTheme, isDark } = useTheme();
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProject = () => {
    saveProjectToFile(project);
    showNotice(`Proyecto "${project.name}" guardado exitosamente (.cinetitle)`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const loaded = await loadProjectFromFile(file);
      if (onLoadProject) {
        onLoadProject(loaded);
      } else {
        setProject(loaded);
      }
      showNotice(`Proyecto "${loaded.name}" cargado exitosamente.`);
    } catch (err: any) {
      alert(err.message || 'Error al cargar archivo del proyecto');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <header
      id="app-navbar"
      className={`h-14 px-4 flex items-center justify-between select-none z-30 shrink-0 border-b transition-colors duration-200 relative ${
        isDark
          ? 'bg-slate-950 border-slate-800/80 text-slate-100'
          : 'bg-white border-slate-300 text-slate-900 shadow-xs'
      }`}
    >
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 mt-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Left: Brand, Presets, Project Save/Load, Undo/Redo, Resolution */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                CineTitle
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold tracking-wider">
                3D STUDIO
              </span>
            </div>
          </div>
        </div>

        <div className={`h-5 w-px mx-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* Project Management: Save & Load Buttons */}
        <div className="flex items-center gap-1">
          <button
            id="btn-save-project"
            onClick={handleSaveProject}
            title="Guardar Proyecto (.cinetitle) para continuar después o compartirlo"
            className={`px-2.5 py-1.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Save className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Guardar</span>
          </button>

          <button
            id="btn-load-project"
            onClick={() => fileInputRef.current?.click()}
            title="Cargar Proyecto existente (.cinetitle)"
            className={`px-2.5 py-1.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline">Cargar</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".cinetitle,.json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Undo / Redo & History Popover */}
        {undo && redo && (
          <div className="flex items-center gap-0.5 relative">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Deshacer (Ctrl+Z)"
              className={`p-1.5 rounded transition ${
                canUndo
                  ? isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={redo}
              disabled={!canRedo}
              title="Rehacer (Ctrl+Shift+Z)"
              className={`p-1.5 rounded transition ${
                canRedo
                  ? isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            {/* Quick History Log button */}
            <button
              onClick={() => setShowHistoryMenu((prev) => !prev)}
              title="Ver Historial de Cambios"
              className={`px-1.5 py-1 rounded text-[10px] font-mono flex items-center gap-1 transition ${
                undoCount > 0
                  ? isDark
                    ? 'text-amber-400 bg-slate-900 border border-slate-800'
                    : 'text-amber-700 bg-amber-50 border border-amber-200'
                  : 'text-slate-400 opacity-60'
              }`}
            >
              <History className="w-3 h-3" />
              <span>{undoCount}</span>
            </button>

            {/* History Dropdown */}
            {showHistoryMenu && (
              <div
                className={`absolute top-10 left-0 w-64 border rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Historial de Cambios</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {undoCount} pasos disponibles
                  </span>
                </div>

                {pastSteps.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    Aún no hay acciones en el historial
                  </p>
                ) : (
                  <div className="max-h-52 overflow-y-auto space-y-1">
                    {pastSteps
                      .slice(-8)
                      .reverse()
                      .map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-900"
                        >
                          <span className="truncate font-medium">{step.name}</span>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono ml-2">
                            {step.time}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2 flex justify-end">
                  <button
                    onClick={() => setShowHistoryMenu(false)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Presets Button */}
        <button
          id="btn-open-presets"
          onClick={onOpenPresets}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Plantillas & Presets</span>
        </button>

        {/* Quick Resolution Selector */}
        <div
          className={`hidden md:flex items-center gap-1 border rounded-md px-2 py-1 text-xs transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-300 text-slate-800'
          }`}
        >
          <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Formato:
          </span>
          <select
            id="select-resolution"
            value={project.resolution.id}
            onChange={(e) => {
              const res = RESOLUTION_PRESETS.find((r) => r.id === e.target.value);
              if (res) {
                setProject((prev) => ({ ...prev, resolution: res }));
              }
            }}
            className={`bg-transparent font-medium text-xs focus:outline-none cursor-pointer ${
              isDark ? 'text-slate-200' : 'text-slate-900'
            }`}
          >
            {RESOLUTION_PRESETS.map((res) => (
              <option
                key={res.id}
                value={res.id}
                className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-900'}
              >
                {res.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Duration Stepper */}
        <div
          className={`hidden lg:flex items-center gap-1.5 border rounded-md px-2 py-1 text-xs transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-300 text-slate-800'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
          <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Duración:
          </span>
          <input
            id="input-navbar-duration"
            type="number"
            min={1}
            max={60}
            step={0.5}
            value={project.duration}
            onChange={(e) => {
              const val = Math.max(1, Math.min(60, parseFloat(e.target.value) || 5));
              setProject((prev) => ({ ...prev, duration: val }));
            }}
            className={`w-11 border rounded text-center text-xs font-semibold focus:outline-none focus:border-amber-500 ${
              isDark
                ? 'bg-slate-950 border-slate-700 text-amber-300'
                : 'bg-white border-slate-300 text-amber-600'
            }`}
          />
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>seg</span>
        </div>
      </div>

      {/* Right: Actions, Theme Toggle, Shortcuts, Snapshot, Export */}
      <div className="flex items-center gap-2">
        {/* Toggle Safe Areas */}
        <button
          id="btn-toggle-safe-areas"
          onClick={() =>
            setProject((prev) => ({ ...prev, safeAreasEnabled: !prev.safeAreasEnabled }))
          }
          title={
            project.safeAreasEnabled
              ? 'Ocultar márgenes seguros de TV/Cine (S)'
              : 'Mostrar márgenes seguros 90% Action / 80% Title (S)'
          }
          className={`px-2.5 py-1.5 rounded text-xs flex items-center gap-1.5 transition border ${
            project.safeAreasEnabled
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 font-semibold'
              : isDark
              ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:text-slate-950'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[11px]">Márgenes Seguros</span>
        </button>

        {/* Snapshot PNG */}
        <button
          id="btn-snapshot-png"
          onClick={onTakeSnapshot}
          title="Guardar fotograma actual en PNG con transparencia alfa"
          className={`px-2.5 py-1.5 rounded text-xs flex items-center gap-1.5 border transition cursor-pointer ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border-slate-800'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 border-slate-300'
          }`}
        >
          <Camera className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
          <span className="hidden sm:inline text-[11px]">Captura PNG</span>
        </button>

        {/* Keyboard Shortcuts Trigger Button */}
        {onOpenShortcuts && (
          <button
            id="btn-keyboard-shortcuts"
            onClick={onOpenShortcuts}
            title="Ver atajos de teclado (?)"
            className={`p-1.5 rounded border transition flex items-center justify-center ${
              isDark
                ? 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Keyboard className="w-4 h-4" />
          </button>
        )}

        {/* Dark / Light Theme Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={toggleTheme}
          title={isDark ? 'Cambiar a Modo Claro (M)' : 'Cambiar a Modo Oscuro (M)'}
          className={`p-1.5 rounded border transition flex items-center justify-center ${
            isDark
              ? 'bg-slate-900 text-amber-300 hover:text-amber-200 border-slate-800 hover:bg-slate-800'
              : 'bg-slate-100 text-indigo-600 hover:text-indigo-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Reset */}
        <button
          id="btn-reset-project"
          onClick={onResetProject}
          title="Restablecer proyecto"
          className={`p-1.5 rounded transition ${
            isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Main Export CTA */}
        <button
          id="btn-open-export"
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-amber-500/20 transition transform active:scale-98 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Video</span>
        </button>
      </div>
    </header>
  );
};
