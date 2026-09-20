export interface FontOption {
  family: string;
  category: 'system' | 'custom' | 'google';
  displayName: string;
  sampleWeight?: string;
  is3DFriendly?: boolean;
}

export const POPULAR_GOOGLE_FONTS: FontOption[] = [
  { family: 'Montserrat', category: 'google', displayName: 'Montserrat (Modern Bold)', is3DFriendly: true },
  { family: 'Cinzel', category: 'google', displayName: 'Cinzel (Epic Cinematic)', is3DFriendly: true },
  { family: 'Bebas Neue', category: 'google', displayName: 'Bebas Neue (Condensed Impact)', is3DFriendly: true },
  { family: 'Orbitron', category: 'google', displayName: 'Orbitron (Cyber / Sci-Fi)', is3DFriendly: true },
  { family: 'Playfair Display', category: 'google', displayName: 'Playfair Display (Luxury Serif)', is3DFriendly: true },
  { family: 'Anton', category: 'google', displayName: 'Anton (Heavy Block)', is3DFriendly: true },
  { family: 'Russo One', category: 'google', displayName: 'Russo One (Geometric 3D)', is3DFriendly: true },
  { family: 'Righteous', category: 'google', displayName: 'Righteous (Retro Neon)', is3DFriendly: true },
  { family: 'Black Ops One', category: 'google', displayName: 'Black Ops One (Military Stencil)', is3DFriendly: true },
  { family: 'Alfa Slab One', category: 'google', displayName: 'Alfa Slab One (Ultra Heavy)', is3DFriendly: true },
  { family: 'Bungee', category: 'google', displayName: 'Bungee (Urban 3D Signage)', is3DFriendly: true },
  { family: 'Oswald', category: 'google', displayName: 'Oswald (Clean Headline)', is3DFriendly: true },
  { family: 'Poppins', category: 'google', displayName: 'Poppins (Geometric Clean)', is3DFriendly: true },
  { family: 'Bangers', category: 'google', displayName: 'Bangers (Comic Action)', is3DFriendly: true },
  { family: 'Permanent Marker', category: 'google', displayName: 'Permanent Marker (Street Graffiti)', is3DFriendly: false },
  { family: 'Pacifico', category: 'google', displayName: 'Pacifico (Retro Brush Script)', is3DFriendly: false },
  { family: 'Caveat', category: 'google', displayName: 'Caveat (Caligrafía a Mano)', is3DFriendly: false },
  { family: 'Dancing Script', category: 'google', displayName: 'Dancing Script (Caligrafía Cursiva)', is3DFriendly: false },
  { family: 'Great Vibes', category: 'google', displayName: 'Great Vibes (Caligrafía Elegante)', is3DFriendly: false },
  { family: 'Special Elite', category: 'google', displayName: 'Special Elite (Máquina de Escribir Vintage)', is3DFriendly: false },
];

export const STANDARD_SYSTEM_FONTS: FontOption[] = [
  { family: 'Impact', category: 'system', displayName: 'Impact (Extrusion Classic)', is3DFriendly: true },
  { family: 'Arial Black', category: 'system', displayName: 'Arial Black (Heavy)', is3DFriendly: true },
  { family: 'Trebuchet MS', category: 'system', displayName: 'Trebuchet MS', is3DFriendly: true },
  { family: 'Georgia', category: 'system', displayName: 'Georgia (Editorial Serif)', is3DFriendly: true },
  { family: 'Verdana', category: 'system', displayName: 'Verdana', is3DFriendly: true },
  { family: 'Courier New', category: 'system', displayName: 'Courier New (Monospace)', is3DFriendly: true },
  { family: 'Segoe UI', category: 'system', displayName: 'Segoe UI (Clean Windows)', is3DFriendly: true },
  { family: 'Helvetica', category: 'system', displayName: 'Helvetica (Neutral Sans)', is3DFriendly: true },
];

// Helper to check if Font Access API is available in current browser
export const isLocalFontAccessSupported = (): boolean => {
  return typeof window !== 'undefined' && 'queryLocalFonts' in window;
};

// Query local system fonts using the browser Local Font Access API
export async function querySystemFonts(): Promise<FontOption[]> {
  if (!isLocalFontAccessSupported()) {
    return STANDARD_SYSTEM_FONTS;
  }

  try {
    // @ts-expect-error - queryLocalFonts is an experimental Chromium API
    const localFonts = await window.queryLocalFonts();
    const uniqueFamilies = new Map<string, FontOption>();

    for (const font of localFonts) {
      if (!uniqueFamilies.has(font.family)) {
        uniqueFamilies.set(font.family, {
          family: font.family,
          category: 'system',
          displayName: `${font.family} (Sistema)`,
          is3DFriendly: true,
        });
      }
    }

    const result = Array.from(uniqueFamilies.values()).sort((a, b) =>
      a.family.localeCompare(b.family)
    );

    return result.length > 0 ? result : STANDARD_SYSTEM_FONTS;
  } catch (err) {
    console.warn('Local font query permission was denied or failed:', err);
    return STANDARD_SYSTEM_FONTS;
  }
}

// Dynamically load Google Font if needed
const loadedFonts = new Set<string>();

export function ensureFontLoaded(family: string) {
  if (loadedFonts.has(family)) return;

  // Check if it's in our Google Fonts list
  const isGoogle = POPULAR_GOOGLE_FONTS.some((f) => f.family.toLowerCase() === family.toLowerCase());
  if (isGoogle) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    const formattedFamily = family.replace(/\s+/g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFamily}:wght@400;700;900&display=swap`;
    document.head.appendChild(link);
    loadedFonts.add(family);
  }
}

// Load custom font file uploaded by user
export async function loadCustomFontFile(file: File): Promise<FontOption> {
  const fontName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const buffer = await file.arrayBuffer();
  const fontFace = new FontFace(fontName, buffer);
  
  await fontFace.load();
  document.fonts.add(fontFace);
  loadedFonts.add(fontName);

  return {
    family: fontName,
    category: 'custom',
    displayName: `${fontName} (Archivo subido)`,
    is3DFriendly: true,
  };
}
