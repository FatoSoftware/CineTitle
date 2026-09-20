import { Resolution } from '../types';

export const RESOLUTION_PRESETS: Resolution[] = [
  { id: '1080p', name: 'Full HD 1080p (16:9)', width: 1920, height: 1080, aspectRatio: '16:9' },
  { id: '4k', name: '4K Ultra HD (16:9)', width: 3840, height: 2160, aspectRatio: '16:9' },
  { id: '2k', name: '2K Quad HD (16:9)', width: 2560, height: 1440, aspectRatio: '16:9' },
  { id: '720p', name: 'HD 720p (16:9)', width: 1280, height: 720, aspectRatio: '16:9' },
  { id: '9:16', name: 'Vertical 9:16 (Reels / TikTok / Shorts)', width: 1080, height: 1920, aspectRatio: '9:16' },
  { id: '1:1', name: 'Cuadrado 1:1 (Instagram Feed)', width: 1080, height: 1080, aspectRatio: '1:1' },
  { id: '21:9', name: 'Cinemascope 21:9 (Ultra-Panorámico)', width: 2560, height: 1080, aspectRatio: '21:9' },
];
