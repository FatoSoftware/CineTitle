import { ProjectSettings, UserPreset, TitlePreset } from '../types';

const USER_PRESETS_STORAGE_KEY = 'cinetitle_3d_user_presets_v1';

// 1. Save Full Project Configuration to .cinetitle File
export function saveProjectToFile(project: ProjectSettings): void {
  const exportData = {
    app: 'CineTitle 3D Studio',
    fileVersion: '1.2.0',
    savedAt: new Date().toISOString(),
    project,
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cleanName = project.name.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '') || 'Proyecto';
  a.download = `${cleanName}.cinetitle`;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 2. Load Project Configuration from .cinetitle File
export async function loadProjectFromFile(file: File): Promise<ProjectSettings> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Supports direct ProjectSettings or wrapped container
        const rawProject = parsed.project || parsed;

        if (!rawProject || !Array.isArray(rawProject.layers)) {
          throw new Error('El archivo no contiene un proyecto válido de CineTitle 3D (.cinetitle)');
        }

        // Validate and provide fallbacks
        const project: ProjectSettings = {
          id: rawProject.id || `proj-${Date.now()}`,
          name: rawProject.name || 'Proyecto Importado',
          resolution: rawProject.resolution || {
            id: '1080p',
            name: 'Full HD 1080p',
            width: 1920,
            height: 1080,
            aspectRatio: '16:9',
          },
          duration: typeof rawProject.duration === 'number' ? rawProject.duration : 5,
          fps: rawProject.fps || 30,
          background: rawProject.background || { type: 'transparent', checkerboardInPreview: true },
          safeAreasEnabled: Boolean(rawProject.safeAreasEnabled),
          camera: rawProject.camera,
          colorGrading: rawProject.colorGrading,
          watermark: rawProject.watermark,
          metadata: rawProject.metadata,
          layers: rawProject.layers,
        };

        resolve(project);
      } catch (err: any) {
        reject(new Error(err.message || 'Error al procesar el archivo del proyecto'));
      }
    };
    reader.onerror = () => reject(new Error('Error de lectura de archivo'));
    reader.readAsText(file);
  });
}

// 3. User Custom Presets Library (Local Storage)
export function getUserPresets(): UserPreset[] {
  try {
    const raw = localStorage.getItem(USER_PRESETS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load user presets from localStorage', err);
    return [];
  }
}

export function saveUserPreset(presetData: {
  name: string;
  description: string;
  author?: string;
  project: ProjectSettings;
}): UserPreset {
  const presets = getUserPresets();

  const newPreset: UserPreset = {
    id: `custom-preset-${Date.now()}`,
    name: presetData.name.trim() || 'Mi Preset 3D',
    description: presetData.description.trim() || 'Preset personalizado guardado por el usuario',
    author: presetData.author?.trim() || 'Usuario CineTitle',
    createdAt: new Date().toISOString(),
    thumbnailGradient: 'linear-gradient(135deg, #f59e0b, #6366f1)',
    duration: presetData.project.duration,
    background: presetData.project.background,
    layers: presetData.project.layers.map((l) => {
      // Omit ID to allow fresh ID generation when applied
      const { id: _, ...rest } = l;
      return rest;
    }),
    camera: presetData.project.camera,
    colorGrading: presetData.project.colorGrading,
  };

  const updated = [newPreset, ...presets];
  localStorage.setItem(USER_PRESETS_STORAGE_KEY, JSON.stringify(updated));
  return newPreset;
}

export function deleteUserPreset(id: string): void {
  const presets = getUserPresets();
  const updated = presets.filter((p) => p.id !== id);
  localStorage.setItem(USER_PRESETS_STORAGE_KEY, JSON.stringify(updated));
}

// 4. Export Preset to .cinetitle-preset File
export function exportPresetToFile(preset: UserPreset | TitlePreset): void {
  const exportData = {
    app: 'CineTitle 3D Studio',
    fileType: 'preset',
    version: '1.2.0',
    exportedAt: new Date().toISOString(),
    preset,
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cleanName = preset.name.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '') || 'Preset';
  a.download = `${cleanName}.cinetitle-preset`;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 5. Import Preset from .cinetitle-preset File
export async function importPresetFromFile(file: File): Promise<UserPreset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        const rawPreset = parsed.preset || parsed;
        if (!rawPreset || !rawPreset.name || !Array.isArray(rawPreset.layers)) {
          throw new Error('El archivo no contiene un preset válido de CineTitle 3D (.cinetitle-preset)');
        }

        const imported: UserPreset = {
          id: `custom-preset-${Date.now()}`,
          name: `${rawPreset.name} (Importado)`,
          description: rawPreset.description || 'Preset importado de otro usuario',
          author: rawPreset.author || 'Colaborador CineTitle',
          createdAt: new Date().toISOString(),
          thumbnailGradient: rawPreset.thumbnailGradient || 'linear-gradient(135deg, #10b981, #06b6d4)',
          duration: rawPreset.duration || 5,
          background: rawPreset.background || { type: 'transparent', checkerboardInPreview: true },
          layers: rawPreset.layers,
          camera: rawPreset.camera,
          colorGrading: rawPreset.colorGrading,
        };

        // Save into user presets library
        const existing = getUserPresets();
        localStorage.setItem(USER_PRESETS_STORAGE_KEY, JSON.stringify([imported, ...existing]));

        resolve(imported);
      } catch (err: any) {
        reject(new Error(err.message || 'Error al importar preset'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo de preset'));
    reader.readAsText(file);
  });
}
