import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  X,
  Film,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileArchive,
  Layers,
  Sparkles,
  Shield,
  FileText,
  Copy,
  Image as ImageIcon,
  Type,
  Grid,
  Check,
  Upload,
} from 'lucide-react';
import {
  ProjectSettings,
  ExportFormat,
  Resolution,
  WatermarkSettings,
  VideoMetadataSettings,
  BatchExportVariation,
  getDefaultWatermarkSettings,
  getDefaultVideoMetadataSettings,
} from '../types';
import { RESOLUTION_PRESETS } from '../data/resolutions';
import {
  exportVideo,
  exportBatch,
  ExportProgress,
  generateMetadataManifest,
} from '../utils/exporter';
import { useTheme } from '../context/ThemeContext';

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
    id: 'mp4',
    name: 'MP4 Video (H.264 / VP9 / HEVC)',
    badge: 'UNIVERSAL',
    desc: 'Compatible con YouTube, Instagram, Premiere, DaVinci y reproductores estándar.',
    ext: 'mp4',
    isAlphaReady: false,
  },
  {
    id: 'webm-alpha',
    name: 'WebM con Canal Alfa (Transparente)',
    badge: 'ALFA 32-BIT',
    desc: 'Video nativo transparente para superponer en OBS Studio, Premiere, DaVinci y web.',
    ext: 'webm',
    isAlphaReady: true,
  },
  {
    id: 'mov-alpha',
    name: 'QuickTime MOV (Con Canal Alfa)',
    badge: 'PRORES / MOV',
    desc: 'Contenedor QuickTime compatible para composiciones en Final Cut Pro y DaVinci.',
    ext: 'mov',
    isAlphaReady: true,
  },
  {
    id: 'png-sequence',
    name: 'Secuencia de Cuadros PNG (ZIP)',
    badge: 'MÁXIMA CALIDAD',
    desc: 'Secuencia fotograma a fotograma en formato PNG transparente sin compresión destructiva.',
    ext: 'zip',
    isAlphaReady: true,
  },
  {
    id: 'jpeg-sequence',
    name: 'Secuencia JPEG Fotogramas (ZIP)',
    badge: 'FOTOGRAMAS JPG',
    desc: 'Secuencia de fotogramas ultraligeros con compresión ajustable para archivo.',
    ext: 'zip',
    isAlphaReady: false,
  },
  {
    id: 'gif',
    name: 'GIF Animado (Bucle Infinito)',
    badge: 'WEB & CHAT',
    desc: 'Formato GIF89a optimizado para compartir en mensajería, blogs y presentaciones.',
    ext: 'gif',
    isAlphaReady: false,
  },
  {
    id: 'png-frame',
    name: 'Fotograma PNG Estático (Snapshot)',
    badge: 'POSTER / STILL',
    desc: 'Captura estática en resolución maestra con canal alfa transparente.',
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
  const { isDark } = useTheme();

  // Navigation tab inside modal
  const [activeTab, setActiveTab] = useState<'format' | 'watermark' | 'metadata' | 'batch'>('format');

  // Single export state
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('mp4');
  const [selectedResId, setSelectedResId] = useState<string>(project.resolution.id);
  const [fps, setFps] = useState<24 | 30 | 60>(project.fps);
  const [codec, setCodec] = useState<'auto' | 'h264' | 'vp9' | 'hevc'>('auto');
  const [jpegQuality, setJpegQuality] = useState<number>(0.92);
  const [gifFps, setGifFps] = useState<number>(15);

  // Custom dimensions
  const [customWidth, setCustomWidth] = useState<number>(1920);
  const [customHeight, setCustomHeight] = useState<number>(1080);

  // Watermark state
  const [watermark, setWatermark] = useState<WatermarkSettings>(
    project.watermark || getDefaultWatermarkSettings()
  );

  // Metadata state
  const [metadata, setMetadata] = useState<VideoMetadataSettings>(
    project.metadata || getDefaultVideoMetadataSettings()
  );

  // Batch Export state
  const [batchVariations, setBatchVariations] = useState<BatchExportVariation[]>([
    {
      id: 'var-1080p',
      name: 'Master Horizontal 16:9',
      format: 'mp4',
      resolution: { id: '1080p', name: 'Full HD', width: 1920, height: 1080, aspectRatio: '16:9' },
      fps: 30,
      enabled: true,
    },
    {
      id: 'var-reels',
      name: 'Vertical Reels & TikTok 9:16',
      format: 'mp4',
      resolution: { id: '9:16', name: 'Vertical Reels', width: 1080, height: 1920, aspectRatio: '9:16' },
      fps: 30,
      enabled: true,
    },
    {
      id: 'var-square',
      name: 'Cuadrado Feed Instagram 1:1',
      format: 'mp4',
      resolution: { id: '1:1', name: 'Cuadrado', width: 1080, height: 1080, aspectRatio: '1:1' },
      fps: 30,
      enabled: false,
    },
    {
      id: 'var-alpha',
      name: 'Overlay Transparente Alfa',
      format: 'webm-alpha',
      resolution: { id: '1080p', name: 'Full HD Alfa', width: 1920, height: 1080, aspectRatio: '16:9' },
      fps: 30,
      enabled: true,
    },
    {
      id: 'var-gif',
      name: 'Miniatura GIF Animada',
      format: 'gif',
      resolution: { id: '720p', name: 'GIF 720p', width: 1280, height: 720, aspectRatio: '16:9' },
      fps: 15,
      enabled: false,
    },
  ]);

  // Export process state
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [batchStatus, setBatchStatus] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportedFilename, setExportedFilename] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cancelFlagRef = useRef<boolean>(false);
  const watermarkLogoInputRef = useRef<HTMLInputElement>(null);

  // Sync with project on open
  useEffect(() => {
    if (isOpen) {
      if (project.watermark) setWatermark(project.watermark);
      if (project.metadata) setMetadata(project.metadata);
      setDownloadUrl(null);
      setErrorMsg(null);
      setProgress(null);
      setBatchStatus(null);
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const currentResolution =
    selectedResId === 'custom'
      ? {
          id: 'custom' as const,
          name: 'Personalizado',
          width: customWidth,
          height: customHeight,
          aspectRatio: `${customWidth}:${customHeight}`,
        }
      : RESOLUTION_PRESETS.find((r) => r.id === selectedResId) || project.resolution;

  const handleStartSingleExport = async () => {
    setIsExporting(true);
    setProgress({ percentage: 0, currentFrame: 0, totalFrames: 0, status: 'Iniciando pipeline de exportación...' });
    setErrorMsg(null);
    setDownloadUrl(null);
    cancelFlagRef.current = false;

    const exportW = currentResolution.width;
    const exportH = currentResolution.height;
    const cleanName = project.name.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'CineTitle';

    const extMap: Record<ExportFormat, string> = {
      'webm-alpha': 'webm',
      mp4: 'mp4',
      'mov-alpha': 'mov',
      'png-sequence': 'zip',
      'jpeg-sequence': 'zip',
      gif: 'gif',
      'png-frame': 'png',
    };
    const filename = `${cleanName}_${exportW}x${exportH}.${extMap[selectedFormat]}`;
    setExportedFilename(filename);

    try {
      const blob = await exportVideo(project, {
        format: selectedFormat,
        width: exportW,
        height: exportH,
        fps,
        codec,
        jpegQuality,
        gifFps,
        watermark,
        metadata,
        bgMediaElement,
        onProgress: (p) => setProgress(p),
        shouldCancel: () => cancelFlagRef.current,
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al exportar video');
    } finally {
      setIsExporting(false);
    }
  };

  const handleStartBatchExport = async () => {
    const active = batchVariations.filter((v) => v.enabled);
    if (active.length === 0) {
      alert('Por favor activa al menos una variación para la exportación en lote');
      return;
    }

    setIsExporting(true);
    setErrorMsg(null);
    setDownloadUrl(null);
    cancelFlagRef.current = false;

    const cleanName = project.name.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'CineTitle';
    const filename = `${cleanName}_Coleccion_Variaciones.zip`;
    setExportedFilename(filename);

    try {
      const zipBlob = await exportBatch(project, batchVariations, {
        watermark,
        metadata,
        bgMediaElement,
        onBatchProgress: (batchIdx, totalBatches, p) => {
          setBatchStatus(`Procesando variación ${batchIdx} de ${totalBatches}: ${p.status}`);
          setProgress(p);
        },
        shouldCancel: () => cancelFlagRef.current,
      });

      const url = URL.createObjectURL(zipBlob);
      setDownloadUrl(url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error en la exportación por lote');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancelExport = () => {
    cancelFlagRef.current = true;
    setIsExporting(false);
    setProgress(null);
    setBatchStatus(null);
  };

  const handleWatermarkLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setWatermark((prev) => ({
        ...prev,
        type: 'image',
        imageUrl: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      id="export-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        className={`w-full max-w-4xl border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold">Exportación Avanzada de Títulos 3D</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Formatos profesionales, canal alfa transparente, marcas de agua y renderizado en lote.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isExporting) handleCancelExport();
              onClose();
            }}
            className={`p-1.5 rounded-lg transition ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className={`px-4 py-2 border-b flex items-center gap-2 overflow-x-auto ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
          }`}
        >
          <button
            onClick={() => setActiveTab('format')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'format'
                ? 'bg-amber-500 text-slate-950'
                : isDark
                ? 'bg-slate-900 text-slate-300 hover:text-white'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Formatos & Codecs</span>
          </button>

          <button
            onClick={() => setActiveTab('watermark')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'watermark'
                ? 'bg-amber-500 text-slate-950'
                : isDark
                ? 'bg-slate-900 text-slate-300 hover:text-white'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Marca de Agua {watermark.enabled ? '✓' : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'metadata'
                ? 'bg-amber-500 text-slate-950'
                : isDark
                ? 'bg-slate-900 text-slate-300 hover:text-white'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Metadatos del Video</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'batch'
                ? 'bg-indigo-600 text-white'
                : isDark
                ? 'bg-slate-900 text-slate-300 hover:text-white'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Exportación en Lote (Multi-Formato)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: Formats & Codecs */}
          {activeTab === 'format' && (
            <div className="space-y-5">
              {/* Formats Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  1. Formato de Salida
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {FORMAT_OPTIONS.map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                        selectedFormat === fmt.id
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40'
                          : isDark
                          ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {fmt.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            fmt.isAlphaReady
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {fmt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                        {fmt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Codec selection for MP4 */}
              {selectedFormat === 'mp4' && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs">Códec de Compresión MP4</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      H.264 para máxima compatibilidad web o VP9/HEVC para mayor eficiencia.
                    </p>
                  </div>
                  <select
                    value={codec}
                    onChange={(e) => setCodec(e.target.value as any)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="auto">Automático / Detectar Mejor</option>
                    <option value="h264">H.264 / AVC1 (Universal)</option>
                    <option value="vp9">VP9 (Google Chrome / YouTube)</option>
                    <option value="hevc">H.265 / HEVC (Apple & High-End)</option>
                  </select>
                </div>
              )}

              {/* Quality slider for JPEG Sequence */}
              {selectedFormat === 'jpeg-sequence' && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs">Calidad de Compresión JPEG</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Balance entre peso del ZIP y fidelidad visual.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0.6}
                      max={1.0}
                      step={0.05}
                      value={jpegQuality}
                      onChange={(e) => setJpegQuality(parseFloat(e.target.value))}
                      className="w-32 accent-amber-500"
                    />
                    <span className="font-mono text-xs font-bold text-amber-500">
                      {Math.round(jpegQuality * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Framerate for GIF */}
              {selectedFormat === 'gif' && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs">Fotogramas por Segundo (GIF FPS)</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      15 FPS recomendado para archivos ligeros de menos de 10MB.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[10, 15, 20, 24].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setGifFps(f)}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                          gifFps === f
                            ? 'bg-amber-500 text-slate-950'
                            : isDark
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-white border text-slate-700'
                        }`}
                      >
                        {f} FPS
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution & FPS Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                    2. Resolución de Exportación
                  </label>
                  <select
                    value={selectedResId}
                    onChange={(e) => setSelectedResId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {RESOLUTION_PRESETS.map((res) => (
                      <option key={res.id} value={res.id}>
                        {res.name} ({res.width}x{res.height} - {res.aspectRatio})
                      </option>
                    ))}
                    <option value="custom">Personalizado...</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                    3. Cuadros por Segundo (FPS)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[24, 30, 60].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFps(f as any)}
                        className={`py-2 rounded-xl border text-xs font-bold transition ${
                          fps === f
                            ? 'border-amber-500 bg-amber-500 text-slate-950'
                            : isDark
                            ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {f} FPS {f === 24 ? '(Cine)' : f === 60 ? '(Ultra Fluido)' : '(Estándar)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Watermark */}
          {activeTab === 'watermark' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Marca de Agua y Protección de Copyright
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Superpón tu logo o texto de derechos de autor automáticamente en la exportación.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watermark.enabled}
                    onChange={(e) => setWatermark((prev) => ({ ...prev, enabled: e.target.checked }))}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold">Activar Marca de Agua</span>
                </label>
              </div>

              {watermark.enabled && (
                <div
                  className={`p-4 rounded-xl border space-y-4 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Watermark Type */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setWatermark((prev) => ({ ...prev, type: 'text' }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        watermark.type === 'text'
                          ? 'bg-amber-500 text-slate-950'
                          : isDark
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-white border text-slate-700'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Texto de Copyright</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWatermark((prev) => ({ ...prev, type: 'image' }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        watermark.type === 'image'
                          ? 'bg-amber-500 text-slate-950'
                          : isDark
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-white border text-slate-700'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Logo en Imagen</span>
                    </button>
                  </div>

                  {watermark.type === 'text' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Texto de la Marca
                      </label>
                      <input
                        type="text"
                        value={watermark.text}
                        onChange={(e) => setWatermark((prev) => ({ ...prev, text: e.target.value }))}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                          isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="© 2026 CineTitle 3D Studio"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Subir Archivo de Logo (PNG con transparencia recomendado)
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => watermarkLogoInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Seleccionar Logo...</span>
                        </button>
                        <input
                          ref={watermarkLogoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleWatermarkLogoUpload}
                        />
                        {watermark.imageUrl && (
                          <span className="text-xs text-emerald-500 font-medium">✓ Logo cargado</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Position grid */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Posición en Pantalla
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {[
                        { id: 'top-left', name: 'Arriba Izq.' },
                        { id: 'top-right', name: 'Arriba Der.' },
                        { id: 'bottom-left', name: 'Abajo Izq.' },
                        { id: 'bottom-right', name: 'Abajo Der.' },
                        { id: 'center', name: 'Centro' },
                        { id: 'mosaic', name: 'Mosaico Diagonal' },
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setWatermark((prev) => ({ ...prev, position: pos.id as any }))}
                          className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium text-center transition ${
                            watermark.position === pos.id
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-600'
                              : isDark
                              ? 'bg-slate-900 border-slate-700 text-slate-300'
                              : 'bg-white border-slate-300 text-slate-800'
                          }`}
                        >
                          {pos.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sliders: Opacity & Scale */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold">Opacidad</span>
                        <span className="font-mono text-amber-500">{Math.round(watermark.opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={1.0}
                        step={0.05}
                        value={watermark.opacity}
                        onChange={(e) => setWatermark((prev) => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold">Escala / Tamaño</span>
                        <span className="font-mono text-amber-500">{Math.round(watermark.scale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.4}
                        max={2.0}
                        step={0.1}
                        value={watermark.scale}
                        onChange={(e) => setWatermark((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Metadata */}
          {activeTab === 'metadata' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Metadatos Cinematográficos y Ficha Técnica
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Estos metadatos se integran en los manifiestos JSON generados junto a tus videos y secuencias.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Título de la Obra
                    </label>
                    <input
                      type="text"
                      value={metadata.title}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Autor / Creador
                    </label>
                    <input
                      type="text"
                      value={metadata.author}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, author: e.target.value }))}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Descripción / Notas de Producción
                  </label>
                  <textarea
                    rows={2}
                    value={metadata.description}
                    onChange={(e) => setMetadata((prev) => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs resize-none ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Aviso de Copyright
                    </label>
                    <input
                      type="text"
                      value={metadata.copyright}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, copyright: e.target.value }))}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Año de Creación
                    </label>
                    <input
                      type="number"
                      value={metadata.year}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, year: parseInt(e.target.value) || 2026 }))}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Batch Export */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Exportación en Lote Multi-Formato (ZIP)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Genera todas las variaciones de tu título para Cine, YouTube, TikTok/Reels y Overlay Alfa en una sola operación.
                </p>
              </div>

              <div className="space-y-2">
                {batchVariations.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                      item.enabled
                        ? isDark
                          ? 'bg-slate-900/80 border-indigo-500/50'
                          : 'bg-indigo-50/50 border-indigo-300'
                        : isDark
                        ? 'bg-slate-950 border-slate-800 opacity-60'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) => {
                          const updated = [...batchVariations];
                          updated[idx].enabled = e.target.checked;
                          setBatchVariations(updated);
                        }}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="font-bold text-xs">{item.name}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{item.resolution.width}x{item.resolution.height}</span>
                          <span>•</span>
                          <span className="uppercase font-mono font-bold text-amber-500">{item.format}</span>
                          <span>•</span>
                          <span>{item.fps} FPS</span>
                        </div>
                      </div>
                    </div>

                    {/* Text override input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Texto personalizado (opcional)"
                        value={item.textOverride || ''}
                        onChange={(e) => {
                          const updated = [...batchVariations];
                          updated[idx].textOverride = e.target.value;
                          setBatchVariations(updated);
                        }}
                        className={`text-xs px-2 py-1 rounded border w-44 ${
                          isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Progress & Status */}
          {isExporting && progress && (
            <div
              className={`p-4 rounded-xl border space-y-2.5 ${
                isDark ? 'bg-slate-900 border-amber-500/40' : 'bg-amber-50/60 border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>{batchStatus || progress.status}</span>
                </span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {progress.percentage}%
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-indigo-600 h-full transition-all duration-150"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span>
                  Cuadro {progress.currentFrame} de {progress.totalFrames}
                </span>
                <button
                  type="button"
                  onClick={handleCancelExport}
                  className="text-red-500 hover:underline font-bold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Completed State with Direct Download */}
          {downloadUrl && (
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-emerald-50 border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>¡Renderizado completado con éxito!</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                El archivo <strong>{exportedFilename}</strong> está listo para ser guardado en tu equipo.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <a
                  href={downloadUrl}
                  download={exportedFilename}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Archivo ({exportedFilename})</span>
                </a>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {activeTab === 'batch'
              ? `${batchVariations.filter((v) => v.enabled).length} variaciones seleccionadas para compresión ZIP.`
              : `${currentResolution.width}x${currentResolution.height} • ${fps} FPS • ${project.duration}s duración`}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
              }`}
            >
              Cerrar
            </button>

            {activeTab === 'batch' ? (
              <button
                type="button"
                disabled={isExporting}
                onClick={handleStartBatchExport}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                <span>Iniciar Exportación en Lote (ZIP)</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isExporting}
                onClick={handleStartSingleExport}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Renderizar y Exportar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
