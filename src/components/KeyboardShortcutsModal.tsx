import React from 'react';
import { X, Keyboard, Play, Undo2, Redo2, Copy, Trash2, Grid, SunMoon, Monitor, Layers, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  icon: React.ReactNode;
  shortcuts: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const sections: ShortcutSection[] = [
    {
      title: 'Reproducción y Tiempo Real',
      icon: <Play className="w-4 h-4 text-emerald-400" />,
      shortcuts: [
        { keys: ['Espacio'], description: 'Reproducir / Pausar en tiempo real' },
        { keys: ['←', '→'], description: 'Retroceder / Avanzar 1 fotograma (1/30s)' },
        { keys: ['Shift', '← / →'], description: 'Saltar 1 segundo atrás / adelante' },
        { keys: ['J', 'K', 'L'], description: 'Controles estándar (Retroceder / Pausa / Avanzar)' },
        { keys: ['Inicio', '0'], description: 'Ir al inicio de la animación (0.0s)' },
        { keys: ['Fin'], description: 'Ir al final de la duración del proyecto' },
      ],
    },
    {
      title: 'Edición y Gestión de Capas',
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      shortcuts: [
        { keys: ['Ctrl / ⌘', 'Z'], description: 'Deshacer última acción (Undo)' },
        { keys: ['Ctrl / ⌘', 'Shift', 'Z'], description: 'Rehacer acción (Redo)' },
        { keys: ['Supr', 'Backspace'], description: 'Eliminar capa seleccionada' },
        { keys: ['Ctrl / ⌘', 'D'], description: 'Duplicar capa seleccionada' },
        { keys: ['T'], description: 'Añadir nueva capa de texto 3D rápida' },
        { keys: ['Esc'], description: 'Deseleccionar capa / Cerrar modal' },
      ],
    },
    {
      title: 'Vistas y Previsualización',
      icon: <Monitor className="w-4 h-4 text-sky-400" />,
      shortcuts: [
        { keys: ['D'], description: 'Cambiar modo de vista (Móvil / Tablet / TV / Libre)' },
        { keys: ['S'], description: 'Mostrar / Ocultar márgenes seguros de TV (Safe Areas)' },
        { keys: ['A'], description: 'Alternar cuadrícula de transparencia (Canal Alfa)' },
        { keys: ['F'], description: 'Ajustar zoom al área visible del lienzo' },
        { keys: ['M'], description: 'Alternar tema de interfaz (Modo Oscuro / Claro)' },
        { keys: ['?'], description: 'Abrir esta guía de atajos de teclado' },
      ],
    },
  ];

  return (
    <div
      id="modal-keyboard-shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Atajos de Teclado</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Controles rápidos para máxima velocidad de edición en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center gap-2">
                {section.icon}
                <h3
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {section.title}
                </h3>
              </div>

              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-2 p-3 rounded-xl border ${
                  isDark
                    ? 'bg-slate-950/50 border-slate-800/80'
                    : 'bg-slate-50/80 border-slate-200/80'
                }`}
              >
                {section.shortcuts.map((sc, sIdx) => (
                  <div
                    key={sIdx}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                      isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'
                    }`}
                  >
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      {sc.description}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {sc.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded shadow-sm border ${
                            isDark
                              ? 'bg-slate-800 text-amber-300 border-slate-700'
                              : 'bg-white text-slate-800 border-slate-300'
                          }`}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
            isDark
              ? 'border-slate-800 bg-slate-950/60 text-slate-400'
              : 'border-slate-100 bg-slate-50 text-slate-500'
          }`}
        >
          <span>Tip: Pulsa <kbd className="font-mono font-bold">?</kbd> en cualquier momento para abrir esta ventana</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
