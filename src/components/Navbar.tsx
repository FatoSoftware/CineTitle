import React from 'react';
import {
  Sparkles,
  Download,
  Film,
  Camera,
  Play,
  Clock,
  RotateCcw,
  Sliders,
  Eye,
  Grid,
} from 'lucide-react';
import { ProjectSettings } from '../types';
import { RESOLUTION_PRESETS } from '../data/resolutions';

interface NavbarProps {
  project: ProjectSettings;
  setProject: React.Dispatch<React.SetStateAction<ProjectSettings>>;
  onOpenPresets: () => void;
  onOpenExport: () => void;
  onTakeSnapshot: () => void;
  onResetProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  setProject,
  onOpenPresets,
  onOpenExport,
  onTakeSnapshot,
  onResetProject,
}) => {
  return (
    <header
      id="app-navbar"
      className="h-14 bg-slate-950 border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-30 shrink-0"
    >
      {/* Left: Brand & Presets */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm tracking-tight">CineTitle</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold tracking-wider">
                3D STUDIO
              </span>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* Presets Button */}
        <button
          id="btn-open-presets"
          onClick={onOpenPresets}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Plantillas 3D</span>
        </button>

        {/* Quick Resolution Selector */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md px-2 py-1 text-xs">
          <span className="text-slate-400 text-[11px]">Formato:</span>
          <select
            id="select-resolution"
            value={project.resolution.id}
            onChange={(e) => {
              const res = RESOLUTION_PRESETS.find((r) => r.id === e.target.value);
              if (res) {
                setProject((prev) => ({ ...prev, resolution: res }));
              }
            }}
            className="bg-transparent text-slate-200 font-medium text-xs focus:outline-none cursor-pointer"
          >
            {RESOLUTION_PRESETS.map((res) => (
              <option key={res.id} value={res.id} className="bg-slate-900 text-slate-200">
                {res.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Duration Stepper */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-md px-2 py-1 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 text-[11px]">Duración:</span>
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
            className="w-11 bg-slate-950 border border-slate-700/60 rounded text-center text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
          />
          <span className="text-slate-400 text-[11px]">seg</span>
        </div>
      </div>

      {/* Right: Actions & Export */}
      <div className="flex items-center gap-2">
        {/* Toggle Safe Areas */}
        <button
          id="btn-toggle-safe-areas"
          onClick={() =>
            setProject((prev) => ({ ...prev, safeAreasEnabled: !prev.safeAreasEnabled }))
          }
          title={project.safeAreasEnabled ? 'Ocultar márgenes seguros de TV/Cine' : 'Mostrar márgenes seguros (90% Action / 80% Title)'}
          className={`px-2.5 py-1.5 rounded text-xs flex items-center gap-1.5 transition border ${
            project.safeAreasEnabled
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Márgenes Seguros</span>
        </button>

        {/* Snapshot PNG */}
        <button
          id="btn-snapshot-png"
          onClick={onTakeSnapshot}
          title="Guardar fotograma actual en PNG con transparencia alfa"
          className="px-2.5 py-1.5 rounded text-xs flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline text-[11px]">Captura PNG Alfa</span>
        </button>

        {/* Reset */}
        <button
          id="btn-reset-project"
          onClick={onResetProject}
          title="Restablecer proyecto"
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition"
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
          <span>Exportar Video (MP4 / WebM / MOV)</span>
        </button>
      </div>
    </header>
  );
};
