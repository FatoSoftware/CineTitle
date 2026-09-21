import JSZip from 'jszip';
import {
  ProjectSettings,
  ExportFormat,
  WatermarkSettings,
  VideoMetadataSettings,
  BatchExportVariation,
} from '../types';
import { renderFrame } from './renderer2d3d';
import { GifEncoder } from './gifEncoder';

export interface ExportProgress {
  percentage: number;
  currentFrame: number;
  totalFrames: number;
  status: string;
}

export interface ExportOptions {
  format: ExportFormat;
  width: number;
  height: number;
  fps: number;
  codec?: 'h264' | 'vp9' | 'hevc' | 'auto';
  jpegQuality?: number; // 0.6 to 1.0 for jpeg-sequence
  gifFps?: number; // 10 to 24 for GIF
  watermark?: WatermarkSettings;
  metadata?: VideoMetadataSettings;
  embedMetadata?: boolean;
  onProgress: (progress: ExportProgress) => void;
  shouldCancel?: () => boolean;
  bgMediaElement?: HTMLVideoElement | HTMLImageElement | null;
}

// Generate Sidecar JSON Metadata Manifest
export function generateMetadataManifest(
  project: ProjectSettings,
  options: {
    format: ExportFormat;
    width: number;
    height: number;
    fps: number;
    codec?: string;
    metadata?: VideoMetadataSettings;
  }
): string {
  const meta = options.metadata || project.metadata;
  const manifest = {
    generator: 'CineTitle 3D Studio Pro',
    exportedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      duration: project.duration,
      fps: options.fps,
      resolution: {
        width: options.width,
        height: options.height,
        aspectRatio: `${options.width}:${options.height}`,
      },
      layersCount: project.layers.length,
      has3D: project.layers.some((l) => l.threeD?.enabled),
      colorGrading: project.colorGrading?.enabled ? project.colorGrading.lut : 'none',
    },
    export: {
      format: options.format,
      codec: options.codec || 'default',
      alphaChannel:
        options.format === 'webm-alpha' ||
        options.format === 'mov-alpha' ||
        options.format === 'png-sequence' ||
        options.format === 'png-frame',
    },
    cinematicMetadata: {
      title: meta?.title || project.name,
      creator: meta?.author || 'CineTitle Studio Creator',
      description: meta?.description || 'Animación de título 3D para cine y broadcast.',
      copyright: meta?.copyright || `© ${new Date().getFullYear()} Todos los derechos reservados`,
      year: meta?.year || new Date().getFullYear(),
    },
  };

  return JSON.stringify(manifest, null, 2);
}

// Main Video / Asset Exporter
export async function exportVideo(
  project: ProjectSettings,
  options: ExportOptions
): Promise<Blob> {
  const {
    format,
    width,
    height,
    fps,
    codec = 'auto',
    jpegQuality = 0.92,
    gifFps = 15,
    watermark,
    metadata,
    onProgress,
    shouldCancel,
    bgMediaElement,
  } = options;

  const totalFrames = Math.floor(project.duration * fps);

  // 1. Lossless PNG Sequence (ZIP)
  if (format === 'png-sequence') {
    return exportPngSequence(project, options, totalFrames);
  }

  // 2. JPEG Sequence (ZIP)
  if (format === 'jpeg-sequence') {
    return exportJpegSequence(project, options, totalFrames, jpegQuality);
  }

  // 3. Animated GIF
  if (format === 'gif') {
    return exportAnimatedGif(project, options, gifFps);
  }

  // 4. Single Snapshot PNG
  if (format === 'png-frame') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('No se pudo inicializar el contexto de Canvas');

    renderFrame(ctx, width, height, project, project.duration / 2, {
      renderSafeAreas: false,
      selectedLayerId: null,
      bgMediaElement,
      overrideWatermark: watermark,
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Fallo al crear imagen PNG'));
      }, 'image/png');
    });
  }

  // 5. Video Recording (WebM Alpha, MP4, MOV) via Canvas Stream
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('No se pudo inicializar el contexto de Canvas');

  // Determine optimal MIME type & codecs
  let mimeType = 'video/webm;codecs=vp9';

  if (format === 'mp4') {
    if (codec === 'h264' && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
      mimeType = 'video/mp4;codecs=avc1';
    } else if (codec === 'hevc' && MediaRecorder.isTypeSupported('video/mp4;codecs=hvc1')) {
      mimeType = 'video/mp4;codecs=hvc1';
    } else if (codec === 'vp9' && MediaRecorder.isTypeSupported('video/mp4;codecs=vp9')) {
      mimeType = 'video/mp4;codecs=vp9';
    } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
      mimeType = 'video/mp4;codecs=avc1';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else {
      // Fallback
      mimeType = 'video/webm;codecs=vp9';
    }
  } else if (format === 'mov-alpha') {
    // Apple QuickTime / ProRes compatible container
    if (MediaRecorder.isTypeSupported('video/quicktime')) {
      mimeType = 'video/quicktime';
    } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
      mimeType = 'video/mp4;codecs=avc1';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
    }
  } else {
    // webm-alpha (VP9 with Alpha Channel)
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      mimeType = 'video/webm;codecs=vp8';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    }
  }

  const stream = canvas.captureStream(fps);
  const recorderOptions: MediaRecorderOptions = {
    mimeType,
    videoBitsPerSecond: width >= 3840 ? 45_000_000 : 25_000_000, // 45 Mbps for 4K, 25 Mbps for 1080p
  };

  const recordedChunks: Blob[] = [];
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, recorderOptions);
  } catch {
    recorder = new MediaRecorder(stream);
  }

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      let outputMime = mimeType;
      if (format === 'mov-alpha') outputMime = 'video/quicktime';
      else if (format === 'mp4') outputMime = 'video/mp4';

      const outputBlob = new Blob(recordedChunks, { type: outputMime });
      resolve(outputBlob);
    };

    recorder.onerror = (err) => {
      reject(err);
    };

    recorder.start(100);

    let frame = 0;
    const intervalMs = 1000 / fps;

    function renderNext() {
      if (shouldCancel && shouldCancel()) {
        recorder.stop();
        reject(new Error('Export cancelado por el usuario'));
        return;
      }

      if (frame >= totalFrames) {
        onProgress({
          percentage: 100,
          currentFrame: totalFrames,
          totalFrames,
          status: 'Finalizando codificación de video...',
        });
        setTimeout(() => {
          recorder.stop();
        }, 350);
        return;
      }

      const currentTime = frame / fps;
      renderFrame(ctx!, width, height, project, currentTime, {
        renderSafeAreas: false,
        selectedLayerId: null,
        bgMediaElement,
        overrideWatermark: watermark,
      });

      frame++;
      const percentage = Math.floor((frame / totalFrames) * 98);

      onProgress({
        percentage,
        currentFrame: frame,
        totalFrames,
        status: `Renderizando cuadro ${frame} de ${totalFrames} (${fps} FPS)...`,
      });

      setTimeout(renderNext, intervalMs / 2);
    }

    renderNext();
  });
}

// Transparent PNG Sequence Export in ZIP
async function exportPngSequence(
  project: ProjectSettings,
  options: ExportOptions,
  totalFrames: number
): Promise<Blob> {
  const { width, height, fps, watermark, metadata, onProgress, shouldCancel, bgMediaElement } =
    options;
  const zip = new JSZip();
  const folder = zip.folder(`sequence_${width}x${height}`) || zip;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('No se pudo inicializar canvas context');

  // Add Sidecar Metadata file
  const metaJson = generateMetadataManifest(project, {
    format: 'png-sequence',
    width,
    height,
    fps,
    metadata,
  });
  folder.file('metadata.json', metaJson);

  for (let frame = 0; frame < totalFrames; frame++) {
    if (shouldCancel && shouldCancel()) {
      throw new Error('Export cancelado por el usuario');
    }

    const currentTime = frame / fps;
    renderFrame(ctx, width, height, project, currentTime, {
      renderSafeAreas: false,
      selectedLayerId: null,
      bgMediaElement,
      overrideWatermark: watermark,
    });

    const frameDataUrl = canvas.toDataURL('image/png');
    const base64Data = frameDataUrl.replace(/^data:image\/png;base64,/, '');
    const filename = `frame_${String(frame + 1).padStart(5, '0')}.png`;
    folder.file(filename, base64Data, { base64: true });

    const percentage = Math.floor(((frame + 1) / totalFrames) * 85);
    onProgress({
      percentage,
      currentFrame: frame + 1,
      totalFrames,
      status: `Generando fotograma PNG ${frame + 1} de ${totalFrames}...`,
    });

    if (frame % 5 === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  onProgress({
    percentage: 88,
    currentFrame: totalFrames,
    totalFrames,
    status: 'Comprimiendo archivo ZIP de fotogramas PNG...',
  });

  return await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (meta) => {
      onProgress({
        percentage: 88 + Math.floor(meta.percent * 0.12),
        currentFrame: totalFrames,
        totalFrames,
        status: `Empaquetando ZIP PNG: ${Math.floor(meta.percent)}%...`,
      });
    }
  );
}

// High-Quality JPEG Sequence Export in ZIP
async function exportJpegSequence(
  project: ProjectSettings,
  options: ExportOptions,
  totalFrames: number,
  quality: number = 0.92
): Promise<Blob> {
  const { width, height, fps, watermark, metadata, onProgress, shouldCancel, bgMediaElement } =
    options;
  const zip = new JSZip();
  const folder = zip.folder(`sequence_jpg_${width}x${height}`) || zip;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo inicializar canvas context');

  // Add Sidecar Metadata
  const metaJson = generateMetadataManifest(project, {
    format: 'jpeg-sequence',
    width,
    height,
    fps,
    metadata,
  });
  folder.file('metadata.json', metaJson);

  for (let frame = 0; frame < totalFrames; frame++) {
    if (shouldCancel && shouldCancel()) {
      throw new Error('Export cancelado por el usuario');
    }

    const currentTime = frame / fps;
    renderFrame(ctx, width, height, project, currentTime, {
      renderSafeAreas: false,
      selectedLayerId: null,
      bgMediaElement,
      overrideWatermark: watermark,
    });

    const frameDataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64Data = frameDataUrl.replace(/^data:image\/jpeg;base64,/, '');
    const filename = `frame_${String(frame + 1).padStart(5, '0')}.jpg`;
    folder.file(filename, base64Data, { base64: true });

    const percentage = Math.floor(((frame + 1) / totalFrames) * 85);
    onProgress({
      percentage,
      currentFrame: frame + 1,
      totalFrames,
      status: `Generando fotograma JPG ${frame + 1} de ${totalFrames}...`,
    });

    if (frame % 5 === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

// High-Performance Animated GIF Export
async function exportAnimatedGif(
  project: ProjectSettings,
  options: ExportOptions,
  gifFps: number = 15
): Promise<Blob> {
  const { width, height, watermark, onProgress, shouldCancel, bgMediaElement } = options;

  // Scale down for GIF if resolution is huge (keep max dimension around 640-800px for optimal speed and size)
  const maxDim = 640;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const gifW = Math.round(width * scale);
  const gifH = Math.round(height * scale);

  const encoder = new GifEncoder(gifW, gifH);
  const canvas = document.createElement('canvas');
  canvas.width = gifW;
  canvas.height = gifH;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('No se pudo inicializar canvas para GIF');

  const totalFrames = Math.max(1, Math.floor(project.duration * gifFps));
  const delayMs = Math.round(1000 / gifFps);

  for (let frame = 0; frame < totalFrames; frame++) {
    if (shouldCancel && shouldCancel()) {
      throw new Error('Export cancelado por el usuario');
    }

    const currentTime = frame / gifFps;
    renderFrame(ctx, gifW, gifH, project, currentTime, {
      renderSafeAreas: false,
      selectedLayerId: null,
      bgMediaElement,
      overrideWatermark: watermark,
    });

    encoder.addFrame(ctx, { delayMs });

    const percentage = Math.floor(((frame + 1) / totalFrames) * 95);
    onProgress({
      percentage,
      currentFrame: frame + 1,
      totalFrames,
      status: `Codificando cuadro GIF animado ${frame + 1} de ${totalFrames}...`,
    });

    if (frame % 3 === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  onProgress({
    percentage: 98,
    currentFrame: totalFrames,
    totalFrames,
    status: 'Finalizando compresión GIF89a...',
  });

  return encoder.finish();
}

// Batch Export: Render multiple variations simultaneously and bundle into a single ZIP package
export async function exportBatch(
  project: ProjectSettings,
  variations: BatchExportVariation[],
  options: {
    watermark?: WatermarkSettings;
    metadata?: VideoMetadataSettings;
    bgMediaElement?: HTMLVideoElement | HTMLImageElement | null;
    onBatchProgress: (batchIdx: number, totalBatches: number, progress: ExportProgress) => void;
    shouldCancel?: () => boolean;
  }
): Promise<Blob> {
  const activeVars = variations.filter((v) => v.enabled);
  if (activeVars.length === 0) {
    throw new Error('No hay variaciones seleccionadas para la exportación en lote');
  }

  const zip = new JSZip();
  const folder = zip.folder(`batch_export_${project.name.replace(/\s+/g, '_')}`) || zip;

  // Add Project Manifest
  const manifest = {
    project: project.name,
    exportedAt: new Date().toISOString(),
    totalVariations: activeVars.length,
    variations: activeVars.map((v) => ({
      name: v.name,
      format: v.format,
      resolution: `${v.resolution.width}x${v.resolution.height}`,
      fps: v.fps,
    })),
  };
  folder.file('batch_manifest.json', JSON.stringify(manifest, null, 2));

  for (let i = 0; i < activeVars.length; i++) {
    if (options.shouldCancel && options.shouldCancel()) {
      throw new Error('Exportación en lote cancelada');
    }

    const currentVar = activeVars[i];

    // Create customized project clone if textOverride is set
    let varProject = project;
    if (currentVar.textOverride && currentVar.textOverride.trim()) {
      varProject = {
        ...project,
        layers: project.layers.map((l) =>
          l.type === 'text' ? { ...l, text: currentVar.textOverride! } : l
        ),
      };
    }

    const blob = await exportVideo(varProject, {
      format: currentVar.format,
      width: currentVar.resolution.width,
      height: currentVar.resolution.height,
      fps: currentVar.fps,
      watermark: options.watermark,
      metadata: options.metadata,
      bgMediaElement: options.bgMediaElement,
      shouldCancel: options.shouldCancel,
      onProgress: (p) => {
        options.onBatchProgress(i + 1, activeVars.length, p);
      },
    });

    const extMap: Record<ExportFormat, string> = {
      'webm-alpha': 'webm',
      mp4: 'mp4',
      'mov-alpha': 'mov',
      'png-sequence': 'zip',
      'jpeg-sequence': 'zip',
      gif: 'gif',
      'png-frame': 'png',
    };

    const ext = extMap[currentVar.format] || 'bin';
    const cleanName = currentVar.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanName}_${currentVar.resolution.width}x${currentVar.resolution.height}.${ext}`;

    folder.file(filename, blob);
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 4 },
  });
}
