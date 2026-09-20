import JSZip from 'jszip';
import { ProjectSettings, ExportFormat } from '../types';
import { renderFrame } from './renderer2d3d';

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
  onProgress: (progress: ExportProgress) => void;
  shouldCancel?: () => boolean;
  bgMediaElement?: HTMLVideoElement | HTMLImageElement | null;
}

export async function exportVideo(
  project: ProjectSettings,
  options: ExportOptions
): Promise<Blob> {
  const { format, width, height, fps, onProgress, shouldCancel, bgMediaElement } = options;
  const totalFrames = Math.floor(project.duration * fps);

  // If PNG Sequence (ZIP)
  if (format === 'png-sequence') {
    return exportPngSequence(project, options, totalFrames);
  }

  // If Single Frame PNG
  if (format === 'png-frame') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Could not get canvas context');

    renderFrame(ctx, width, height, project, project.duration / 2, {
      renderSafeAreas: false,
      selectedLayerId: null,
      bgMediaElement,
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create PNG blob'));
      }, 'image/png');
    });
  }

  // Video recording via Canvas MediaStream & MediaRecorder
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Determine optimal MIME type
  let mimeType = 'video/webm;codecs=vp9';
  if (format === 'mp4') {
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
      mimeType = 'video/mp4;codecs=avc1';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else {
      mimeType = 'video/webm;codecs=vp9'; // Fallback
    }
  } else {
    // webm-alpha or mov-alpha
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
    videoBitsPerSecond: 25_000_000, // 25 Mbps high quality
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
      const outputBlob = new Blob(recordedChunks, { type: mimeType });
      resolve(outputBlob);
    };

    recorder.onerror = (err) => {
      reject(err);
    };

    recorder.start(100); // chunk every 100ms

    // Frame-by-frame rendering loop with precise timing
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
          status: 'Finalizando archivo de video...',
        });
        setTimeout(() => {
          recorder.stop();
        }, 300);
        return;
      }

      const currentTime = frame / fps;
      renderFrame(ctx!, width, height, project, currentTime, {
        renderSafeAreas: false,
        selectedLayerId: null,
        bgMediaElement,
      });

      frame++;
      const percentage = Math.floor((frame / totalFrames) * 98);

      onProgress({
        percentage,
        currentFrame: frame,
        totalFrames,
        status: `Renderizando cuadro ${frame} de ${totalFrames} (${fps} FPS)...`,
      });

      // Request next frame with slight delay to ensure canvas capture buffer updates
      setTimeout(renderNext, intervalMs / 2);
    }

    renderNext();
  });
}

// Lossless Transparent PNG Sequence Export (Packaged in ZIP for Premiere, DaVinci, After Effects, Final Cut)
async function exportPngSequence(
  project: ProjectSettings,
  options: ExportOptions,
  totalFrames: number
): Promise<Blob> {
  const { width, height, fps, onProgress, shouldCancel, bgMediaElement } = options;
  const zip = new JSZip();
  const folder = zip.folder(`title_sequence_${width}x${height}`) || zip;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Could not get canvas context');

  for (let frame = 0; frame < totalFrames; frame++) {
    if (shouldCancel && shouldCancel()) {
      throw new Error('Export cancelado por el usuario');
    }

    const currentTime = frame / fps;
    renderFrame(ctx, width, height, project, currentTime, {
      renderSafeAreas: false,
      selectedLayerId: null,
      bgMediaElement,
    });

    const frameDataUrl = canvas.toDataURL('image/png');
    // Strip "data:image/png;base64," prefix
    const base64Data = frameDataUrl.replace(/^data:image\/png;base64,/, '');
    const filename = `frame_${String(frame).padStart(5, '0')}.png`;
    folder.file(filename, base64Data, { base64: true });

    const percentage = Math.floor(((frame + 1) / totalFrames) * 85);
    onProgress({
      percentage,
      currentFrame: frame + 1,
      totalFrames,
      status: `Generando fotograma transparente ${frame + 1} de ${totalFrames}...`,
    });

    // Yield control so UI remains responsive
    if (frame % 5 === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  onProgress({
    percentage: 90,
    currentFrame: totalFrames,
    totalFrames,
    status: 'Comprimiendo archivo ZIP de fotogramas...',
  });

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress({
        percentage: 85 + Math.floor(metadata.percent * 0.15),
        currentFrame: totalFrames,
        totalFrames,
        status: `Empaquetando ZIP: ${Math.floor(metadata.percent)}%...`,
      });
    }
  );

  return zipBlob;
}
