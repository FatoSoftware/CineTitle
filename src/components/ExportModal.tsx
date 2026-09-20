import React, { useState, useRef } from 'react';
import {
  Download,
  X,
  Film,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileArchive,
  MonitorPlay,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ProjectSettings, ExportFormat, Resolution } from '../types';
import { RESOLUTION_PRESETS } from '../data/resolutions';
import { exportVideo, ExportProgress } from '../utils/exporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectSettings;
  bgMediaElement: HTMLVideoElement | HTMLImageElement | null;
}

const FORMAT_OPTIONS: {
  id: ExportFormat;
  name: string;
  badge: string;
  desc: string;
  ext: string;
  isAlphaReady: boolean;
}[] = [
  {
    id: 'webm-alpha',
    name: 'WebM con Canal Alfa (Transparente)',
    badge: 'ALFA 32-BIT',
    desc: 'Video nativo transparente para OBS Studio, Premiere Pro, DaVinci y web.',
    ext: 'webm',
    isAlphaReady: true,
  },
  {
    id: 'mp4',
    name: 'MP4 (H.264 Universal)',
    badge: 'UNIVERSAL',
    desc: 'Compatible con todos los reproductores, móviles y editores de video.',
    ext: 'mp4',
    isAlphaReady: false,
  },
  {
    id: 'mov-alpha',
    name: 'QuickTime MOV (Con Canal Alfa)',
    badge: 'PRORES / MOV',
    desc: 'Contenedor QuickTime MOV para flujos de edición profesional.',
    ext: 'mov',
    isAlphaReady: true,
  },
  {
    id: 'png-sequence',
    name: 'Secuencia PNG Transparentes (ZIP)',
    badge: 'CALIDAD MÁXIMA',
    desc: 'La opción predilecta en cine: secuencia de cuadros PNG lossless para DaVinci / Premiere.',
    ext: 'zip',
    isAlphaReady: true,
  },
  {
    id: 'png-frame',
    name: 'Fotograma PNG de Alta Resolución',
    badge: 'IMAGEN ALFA',
    desc: 'Captura estática en resolución completa con fondo transparente.',
    ext: 'png',
    isAlphaReady: true,
  },
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  bgMediaElement,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('webm-alpha');
  const [selectedResId, setSelectedResId] = useState<string>(project.resolution.id);
  const [fps, setFps] = useState<24 | 30 | 60>(project.fps);

  // Custom dimensions if selected
  const [customWidth, setCustomWidth] = useState<number>(1920);
  const [customHeight, setCustomHeight] = useState<number>(1080);

  // Rendering State
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportedFilename, setExportedFilename] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cancelFlagRef = useRef<boolean>(false);

  if (!isOpen) return null;

  const currentResolution =
    RESOLUTION_PRESETS.find((r) => r.id === selectedResId) || {
      id: 'custom' as const,
      name: 'Personalizado',
      width: customWidth,
      height: customHeight,
      aspectRatio: 'custom',
    };

  const currentFormatObj = FORMAT_OPTIONS.find((f) => f.id === selectedFormat)!;

  const handleStartExport = async () => {
    setIsExporting(true);
    setErrorMsg(null);
    setDownloadUrl(null);
    cancelFlagRef.current = false;

    const width = currentResolution.width;
    const height = currentResolution.height;

    try {
      const blob = await exportVideo(project, {
        format: selectedFormat,
        width,
        height,
        fps,
        onProgress: (p) => setProgress(p),
        shouldCancel: () => cancelFlagRef.current,
        bgMediaElement,
      });

      const url = URL.createObjectURL(blob);
      const filename = `cinetitle_${width}x${height}_${Date.now()}.${currentFormatObj.ext}`;
      setDownloadUrl(url);
      setExportedFilename(filename);
      setIsExporting(false);
    } catch (err: any) {
      console.error('Export error:', err);
      setErrorMsg(err.message || 'Error al exportar el video');
      setIsExporting(false);
    }
  };

  const handleCancelExport = () => {
    cancelFlagRef.current = true;
    setIsExporting(false);
    setProgress(null);
  };

  return (
    <div
      id="export-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Exportar Título de Video</h2>
              <p className="text-[11px] text-slate-400">
                Formatos profesionales con soporte para canal alfa y múltiples resoluciones
              </p>
            </div>
          </div>

          {!isExporting && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* If ready to download */}
          {downloadUrl && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¡Video Generado con Éxito!</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Listo para descargar en resolución {currentResolution.width}x{currentResolution.height} a {fps} FPS.
                </p>
              </div>

              {/* Video Player Preview if not ZIP/PNG */}
              {selectedFormat !== 'png-sequence' && selectedFormat !== 'png-frame' && (
                <div className="w-full max-w-sm rounded-lg overflow-hidden border border-slate-700 bg-black">
                  <video src={downloadUrl} controls autoPlay loop className="w-full h-auto" />
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={downloadUrl}
                  download={exportedFilename}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Archivo ({currentFormatObj.ext.toUpperCase()})</span>
                </a>

                <button
                  onClick={() => setDownloadUrl(null)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs hover:text-white transition"
                >
                  Exportar Otro Formato
                </button>
              </div>
            </div>
          )}

          {/* Export in progress */}
          {isExporting && (
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col items-center text-center space-y-4">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>{progress?.status || 'Procesando...'}</span>
                  <span className="font-mono text-amber-400 font-bold">{progress?.percentage || 0}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${progress?.percentage || 0}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-100 rounded-full"
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Fotograma: {progress?.currentFrame || 0} / {progress?.totalFrames || 0}</span>
                  <span>{fps} FPS</span>
                </div>
              </div>

              <button
                onClick={handleCancelExport}
                className="px-4 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition"
              >
                Cancelar Exportación
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Configuration Form (when not exporting and not finished) */}
          {!isExporting && !downloadUrl && (
            <>
              {/* 1. Format Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  1. Formato de Salida
                </label>
                <div className="space-y-2">
                  {FORMAT_OPTIONS.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFormat(f.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                        selectedFormat === f.id
                          ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30 text-amber-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-xs text-slate-100">{f.name}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                              f.isAlphaReady
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {f.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</p>
                      </div>

                      <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center">
                        {selectedFormat === f.id && (
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Resolution & FPS Selection */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    2. Resolución de Video
                  </label>
                  <select
                    value={selectedResId}
                    onChange={(e) => setSelectedResId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {RESOLUTION_PRESETS.map((res) => (
                      <option key={res.id} value={res.id}>
                        {res.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    3. Cuadros por Segundo (FPS)
                  </label>
                  <div className="flex bg-slate-900 border border-slate-700/80 rounded-lg p-1">
                    {([24, 30, 60] as const).map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setFps(rate)}
                        className={`flex-1 py-1 rounded text-xs font-semibold transition ${
                          fps === rate
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {rate} FPS
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transparent Warning / Recommendation note */}
              {project.background.type === 'transparent' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Fondo Transparente activo:</strong> Se recomienda{' '}
                    <strong>WebM con Alfa</strong> o <strong>Secuencia PNG (ZIP)</strong> para mantener la máxima fidelidad de transparencia alfa en tu software de edición.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isExporting && !downloadUrl && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              Duración: <strong className="text-white">{project.duration}s</strong> | Estimado:{' '}
              <strong className="text-white">
                {Math.floor(project.duration * fps)} fotogramas
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-xs transition"
              >
                Cancelar
              </button>

              <button
                id="btn-confirm-export"
                onClick={handleStartExport}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs tracking-wide shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Generar y Exportar Video</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
