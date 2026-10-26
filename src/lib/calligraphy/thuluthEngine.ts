import { CalligraphyGlyph, StrokeSegment, ScriptType } from './types';
import { createRhombicDotPath } from './bezierUtils';

/**
 * Procedural Thuluth Calligraphic Engine.
 * Implements Ibn Muqla's al-Khatt al-Mansub (Proportioned Script):
 * - Unit of proportion: Rhombic dot (Nuqta) = ~14-16px.
 * - Alif height: exactly 7 rhombic dots high with leftward inclination and top tarwis crown.
 * - Semicircular letters (Nun, Sin, Sad, Ya) circumscribed by the Alif diameter circle.
 */

export interface ThuluthOptions {
  fontSize?: number;
  nibAngle?: number;
  kashida?: number;
  baselineY?: number;
}

// Classical Thuluth master vector glyph definitions (normalized to 100-unit Alif)
const THULUTH_GLYPH_TEMPLATES: Record<string, {
  name: string;
  defaultPath: string;
  alternates: { name: string; path: string; hasReverseTail?: boolean }[];
  width: number;
  height: number;
  baseline: number;
  dotsDefault?: { type: string; x: number; y: number }[];
}> = {
  'ا': {
    name: 'Alif',
    defaultPath: `M 8 -82 C 12 -80 14 -70 14 -50 C 13 -20 12 10 11 18 C 9 20 6 20 4 18 C 5 10 6 -20 6 -50 C 6 -70 5 -80 8 -82 Z M 2 -78 C 0 -82 6 -86 9 -82 C 7 -80 4 -78 2 -78 Z`,
    alternates: [
      { 
        name: 'Classical Alif (7-dot Mizan with Tarwis)', 
        path: `M 8 -84 C 12 -80 14 -70 14 -50 C 13 -20 12 10 11 18 C 9 20 6 20 4 18 C 5 10 6 -20 6 -50 C 6 -70 5 -80 8 -84 Z M 1 -80 C -2 -85 5 -88 9 -84 C 7 -82 4 -80 1 -80 Z` 
      },
      { 
        name: 'Swash Royal Alif (Extended Finial)', 
        path: `M 8 -94 C 13 -90 15 -75 14 -50 C 13 -15 11 15 10 24 C 7 28 3 24 4 18 C 5 8 6 -20 7 -55 C 7 -80 5 -90 8 -94 Z M 1 -90 C -4 -96 6 -98 10 -94 C 7 -92 3 -90 1 -90 Z` 
      },
      { 
        name: 'Curved Connecting Alif', 
        path: `M 10 -80 C 13 -60 13 -30 12 10 C 12 18 10 20 6 20 C 6 10 7 -30 8 -60 C 8 -75 8 -80 10 -80 Z` 
      }
    ],
    width: 24,
    height: 110,
    baseline: 20,
  },
  'ب': {
    name: 'Ba',
    defaultPath: `M 56 12 C 54 18 45 22 28 22 C 10 22 -15 20 -28 10 C -34 6 -38 -2 -38 -8 C -34 -8 -30 0 -24 6 C -12 14 8 16 26 16 C 42 16 50 12 52 8 C 54 4 56 6 56 12 Z`,
    alternates: [
      { 
        name: 'Standard 5-dot Boat Ba', 
        path: `M 56 12 C 54 18 45 22 28 22 C 10 22 -15 20 -28 10 C -34 6 -38 -2 -38 -8 C -34 -8 -30 0 -24 6 C -12 14 8 16 26 16 C 42 16 50 12 52 8 C 54 4 56 6 56 12 Z` 
      },
      { 
        name: 'Extended Kashida Ba (Swooping Base)', 
        path: `M 88 12 C 84 20 65 24 35 24 C -5 24 -40 22 -65 10 C -74 5 -78 -2 -78 -8 C -74 -8 -68 2 -58 7 C -35 15 0 17 35 17 C 68 17 80 12 84 7 C 86 4 88 6 88 12 Z` 
      }
    ],
    width: 100,
    height: 40,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: 0, y: 38 }]
  },
  'ل': {
    name: 'Lam',
    defaultPath: `M 12 -82 C 16 -80 17 -60 16 -20 C 15 10 13 22 5 28 C -5 34 -22 36 -32 26 C -40 18 -42 4 -38 -6 C -34 -8 -32 2 -26 10 C -18 18 -5 18 2 12 C 6 6 7 -10 8 -40 C 8 -65 7 -80 12 -82 Z M 6 -78 C 3 -82 9 -86 13 -82 C 11 -80 8 -78 6 -78 Z`,
    alternates: [
      {
        name: 'Classical Thuluth Lam with Deep Bowl',
        path: `M 12 -82 C 16 -80 17 -60 16 -20 C 15 10 13 22 5 28 C -5 34 -22 36 -32 26 C -40 18 -42 4 -38 -6 C -34 -8 -32 2 -26 10 C -18 18 -5 18 2 12 C 6 6 7 -10 8 -40 C 8 -65 7 -80 12 -82 Z M 6 -78 C 3 -82 9 -86 13 -82 C 11 -80 8 -78 6 -78 Z`
      },
      {
        name: 'Connecting Ascender Lam',
        path: `M 12 -82 C 16 -80 16 -50 15 0 C 14 16 12 20 6 20 C -10 20 -30 20 -40 20 C -42 16 -38 14 -30 14 C -10 14 4 14 6 10 C 7 0 8 -50 12 -82 Z M 6 -78 C 3 -82 9 -86 13 -82 C 11 -80 8 -78 6 -78 Z`
      }
    ],
    width: 60,
    height: 125,
    baseline: 20
  },
  'لا': {
    name: 'Lam-Alif',
    defaultPath: `M 22 -82 C 25 -75 22 -40 12 -15 C 2 10 -15 22 -32 22 C -42 22 -48 14 -44 4 C -40 -2 -34 6 -24 10 C -14 14 0 10 8 -5 C 14 -18 16 -50 16 -80 L 22 -82 Z M -22 -82 C -18 -80 -14 -50 -4 -15 C 4 10 18 22 34 22 C 44 22 48 14 44 4 C 40 -2 34 6 24 10 C 14 14 2 8 -6 -8 C -14 -24 -16 -60 -18 -80 L -22 -82 Z M 16 -78 C 13 -82 19 -86 23 -82 C 21 -80 18 -78 16 -78 Z M -26 -78 C -29 -82 -23 -86 -19 -82 C -21 -80 -24 -78 -26 -78 Z`,
    alternates: [
      {
        name: 'Symmetric Scissors Lam-Alif with Dual Tarwis',
        path: `M 22 -82 C 25 -75 22 -40 12 -15 C 2 10 -15 22 -32 22 C -42 22 -48 14 -44 4 C -40 -2 -34 6 -24 10 C -14 14 0 10 8 -5 C 14 -18 16 -50 16 -80 L 22 -82 Z M -22 -82 C -18 -80 -14 -50 -4 -15 C 4 10 18 22 34 22 C 44 22 48 14 44 4 C 40 -2 34 6 24 10 C 14 14 2 8 -6 -8 C -14 -24 -16 -60 -18 -80 L -22 -82 Z M 16 -78 C 13 -82 19 -86 23 -82 C 21 -80 18 -78 16 -78 Z M -26 -78 C -29 -82 -23 -86 -19 -82 C -21 -80 -24 -78 -26 -78 Z`
      },
      {
        name: 'Interlocking Loop Lam-Alif (Muhaqqaq style)',
        path: `M 24 -84 C 28 -70 20 -30 6 -8 C -6 12 -22 24 -36 24 C -45 24 -50 15 -44 5 C -38 -2 -32 6 -22 10 C -10 14 4 8 10 -5 C 16 -20 18 -60 18 -82 Z M -18 -84 C -14 -80 -8 -45 4 -8 C 14 15 26 24 40 24 C 48 24 50 14 45 4 C 38 -2 32 6 22 10 C 10 14 0 6 -6 -10 C -12 -28 -14 -65 -14 -82 Z`
      }
    ],
    width: 85,
    height: 120,
    baseline: 20
  },
  'م': {
    name: 'Meem',
    defaultPath: `M 18 6 C 24 4 28 0 26 -6 C 24 -12 16 -14 8 -12 C 0 -10 -8 -4 -12 4 C -10 8 -4 10 2 10 L 2 54 C 2 62 0 65 -3 62 C -5 60 -5 50 -5 35 L -5 10 C -12 8 -18 2 -18 -6 C -18 -14 -6 -18 6 -16 C 18 -14 30 -6 30 4 C 30 12 24 16 18 16 L 18 6 Z`,
    alternates: [
      {
        name: 'Plummeting Tail Meem (Thuluth Classical)',
        path: `M 18 6 C 24 4 28 0 26 -6 C 24 -12 16 -14 8 -12 C 0 -10 -8 -4 -12 4 C -10 8 -4 10 2 10 L 2 54 C 2 62 0 65 -3 62 C -5 60 -5 50 -5 35 L -5 10 C -12 8 -18 2 -18 -6 C -18 -14 -6 -18 6 -16 C 18 -14 30 -6 30 4 C 30 12 24 16 18 16 L 18 6 Z`
      },
      {
        name: 'Horizontal Foot Meem (Compact)',
        path: `M 18 6 C 24 4 28 0 26 -6 C 24 -12 16 -14 8 -12 C 0 -10 -8 -4 -12 4 C -10 8 -4 10 2 10 L -25 10 C -32 10 -35 6 -32 4 C -30 2 -24 4 -15 4 L 4 4 C 18 -4 26 2 18 6 Z`
      }
    ],
    width: 50,
    height: 85,
    baseline: 15
  },
  'ر': {
    name: 'Ra',
    defaultPath: `M 14 4 C 16 10 14 16 6 25 C -6 36 -22 45 -36 46 C -42 46 -45 42 -40 38 C -30 36 -16 30 -8 20 C -2 12 2 4 4 -6 C 8 -6 12 -2 14 4 Z`,
    alternates: [
      {
        name: 'Dagger Plunge Ra',
        path: `M 14 4 C 16 10 14 16 6 25 C -6 36 -22 45 -36 46 C -42 46 -45 42 -40 38 C -30 36 -16 30 -8 20 C -2 12 2 4 4 -6 C 8 -6 12 -2 14 4 Z`
      },
      {
        name: 'Extended Gliding Ra (Kashida Tail)',
        path: `M 18 4 C 20 12 14 20 2 28 C -15 38 -45 45 -70 46 C -80 46 -85 40 -78 36 C -55 35 -30 28 -14 20 C -4 14 4 4 8 -6 C 12 -6 16 -2 18 4 Z`
      }
    ],
    width: 60,
    height: 55,
    baseline: 15
  },
  'ي': {
    name: 'Ya',
    defaultPath: `M 24 -15 C 28 -8 25 2 14 8 C 4 14 -4 16 -14 16 C -26 16 -38 8 -38 -6 C -38 -22 -20 -32 5 -32 C 16 -32 26 -28 32 -20 C 35 -15 32 -10 28 -12 C 20 -18 10 -22 0 -22 C -18 -22 -26 -14 -24 -2 C -22 10 -10 12 2 8 C 12 4 18 -2 24 -15 Z`,
    alternates: [
      {
        name: 'Flying Swan Ya (Forward Flow)',
        path: `M 32 -10 C 35 -4 30 6 18 14 C 4 24 -15 28 -32 26 C -45 24 -52 12 -46 2 C -40 -6 -28 2 -18 6 C -4 10 10 8 20 0 C 26 -6 28 -12 32 -10 Z M 18 -25 C 22 -20 18 -12 8 -8 C -2 -4 -12 -6 -16 -12 C -20 -18 -15 -25 -5 -28 C 5 -30 14 -28 18 -25 Z`
      },
      {
        name: 'Ya Marduda (Sacred Backwards Returning Bowl)',
        path: `M -15 -20 C -12 -12 -15 0 -25 8 C -38 18 -55 24 -72 24 C -84 24 -90 15 -84 6 C -75 -2 -55 2 -40 4 C 20 4 85 4 110 4 C 118 4 122 0 118 -4 C 110 -8 75 -6 30 -6 C -20 -6 -50 -12 -38 -24 C -28 -30 -18 -26 -15 -20 Z`,
        hasReverseTail: true
      }
    ],
    width: 80,
    height: 60,
    baseline: 15,
    dotsDefault: [{ type: 'nuqta_double_horiz', x: 0, y: 35 }]
  },
  'س': {
    name: 'Sin',
    defaultPath: `M 42 2 C 40 10 36 12 30 12 C 24 12 20 6 18 0 C 16 8 12 12 6 12 C 0 12 -4 6 -6 0 C -8 10 -18 25 -32 25 C -44 25 -52 14 -48 2 C -44 -6 -38 2 -30 8 C -20 14 -12 12 -6 4 L -6 -6 L 0 -6 L 0 4 C 4 8 8 6 12 0 L 12 -6 L 18 -6 L 18 4 C 22 8 28 6 34 0 L 34 -6 L 42 -6 L 42 2 Z`,
    alternates: [
      {
        name: '3-Teeth Classical Sin with Deep Bowl',
        path: `M 42 2 C 40 10 36 12 30 12 C 24 12 20 6 18 0 C 16 8 12 12 6 12 C 0 12 -4 6 -6 0 C -8 10 -18 25 -32 25 C -44 25 -52 14 -48 2 C -44 -6 -38 2 -30 8 C -20 14 -12 12 -6 4 L -6 -6 L 0 -6 L 0 4 C 4 8 8 6 12 0 L 12 -6 L 18 -6 L 18 4 C 22 8 28 6 34 0 L 34 -6 L 42 -6 L 42 2 Z`
      },
      {
        name: 'Toothless Kashida Sin (Swooping Blade)',
        path: `M 55 4 C 40 6 15 8 -15 8 C -35 8 -50 4 -65 0 C -70 -2 -72 4 -68 8 C -52 16 -30 22 -5 22 C 25 22 48 18 60 10 C 65 6 62 2 55 4 Z`
      }
    ],
    width: 95,
    height: 55,
    baseline: 15
  },
  'و': {
    name: 'Waw',
    defaultPath: `M 18 -8 C 24 -10 28 -4 26 4 C 24 14 14 26 2 34 C -12 44 -28 48 -40 48 C -46 48 -48 42 -42 38 C -32 35 -20 28 -12 20 C -6 12 -2 4 0 -4 C -2 -12 6 -16 14 -16 L 18 -8 Z M 12 -8 C 8 -8 6 -4 6 0 C 6 4 10 6 14 6 C 18 6 20 2 20 -2 C 20 -6 16 -8 12 -8 Z`,
    alternates: [
      {
        name: 'Crescent Moon Waw',
        path: `M 18 -8 C 24 -10 28 -4 26 4 C 24 14 14 26 2 34 C -12 44 -28 48 -40 48 C -46 48 -48 42 -42 38 C -32 35 -20 28 -12 20 C -6 12 -2 4 0 -4 C -2 -12 6 -16 14 -16 L 18 -8 Z M 12 -8 C 8 -8 6 -4 6 0 C 6 4 10 6 14 6 C 18 6 20 2 20 -2 C 20 -6 16 -8 12 -8 Z`
      }
    ],
    width: 65,
    height: 65,
    baseline: 15
  },
  'ن': {
    name: 'Nun',
    defaultPath: `M 32 6 C 28 18 15 28 0 28 C -18 28 -32 16 -34 0 C -35 -10 -30 -16 -24 -16 C -20 -16 -18 -8 -22 0 C -20 10 -10 18 2 18 C 14 18 22 10 24 2 C 26 -6 30 -6 32 6 Z`,
    alternates: [
      {
        name: 'Classical Mizan Nun (Circle of Alif)',
        path: `M 32 6 C 28 18 15 28 0 28 C -18 28 -32 16 -34 0 C -35 -10 -30 -16 -24 -16 C -20 -16 -18 -8 -22 0 C -20 10 -10 18 2 18 C 14 18 22 10 24 2 C 26 -6 30 -6 32 6 Z`
      }
    ],
    width: 70,
    height: 55,
    baseline: 15,
    dotsDefault: [{ type: 'nuqta_single', x: 0, y: -4 }]
  },
  'ه': {
    name: 'Ha',
    defaultPath: `M 22 -6 C 26 4 22 14 12 18 C 0 22 -14 20 -24 12 C -32 6 -34 -4 -30 -12 C -24 -22 -8 -22 4 -16 C 14 -10 20 -14 22 -6 Z M 4 -4 C -4 -4 -12 0 -14 6 C -14 10 -8 14 0 14 C 8 14 14 8 14 2 C 14 -2 10 -4 4 -4 Z`,
    alternates: [
      {
        name: 'Looped Spectacles Ha (Two Eyes)',
        path: `M 22 -6 C 26 4 22 14 12 18 C 0 22 -14 20 -24 12 C -32 6 -34 -4 -30 -12 C -24 -22 -8 -22 4 -16 C 14 -10 20 -14 22 -6 Z M 4 -4 C -4 -4 -12 0 -14 6 C -14 10 -8 14 0 14 C 8 14 14 8 14 2 C 14 -2 10 -4 4 -4 Z`
      }
    ],
    width: 60,
    height: 45,
    baseline: 15
  },
  'ك': {
    name: 'Kaf',
    defaultPath: `M 25 -82 C 28 -70 28 -40 26 0 C 24 14 15 20 0 20 C -25 20 -50 18 -65 10 C -72 6 -74 -2 -68 -6 C -60 0 -40 6 -20 6 C 5 6 16 4 18 -4 C 20 -20 20 -60 22 -80 L 25 -82 Z M -10 -25 C -15 -25 -20 -20 -18 -15 C -15 -10 -5 -10 0 -15 C 2 -18 -4 -25 -10 -25 Z`,
    alternates: [
      {
        name: 'Towering Royal Kaf with Tarwis and Inner Emblem',
        path: `M 25 -82 C 28 -70 28 -40 26 0 C 24 14 15 20 0 20 C -25 20 -50 18 -65 10 C -72 6 -74 -2 -68 -6 C -60 0 -40 6 -20 6 C 5 6 16 4 18 -4 C 20 -20 20 -60 22 -80 L 25 -82 Z M -10 -25 C -15 -25 -20 -20 -18 -15 C -15 -10 -5 -10 0 -15 C 2 -18 -4 -25 -10 -25 Z`
      },
      {
        name: 'Sword Kashida Kaf (Horizontally Stretched Arm)',
        path: `M 30 -82 C 34 -65 30 -30 28 0 C 26 14 15 20 0 20 C -40 20 -85 18 -110 10 C -118 6 -120 -2 -114 -6 C -100 0 -60 8 -30 8 C 5 8 18 4 20 -4 C 22 -20 24 -60 26 -80 L 30 -82 Z`
      }
    ],
    width: 90,
    height: 110,
    baseline: 20
  }
};

/**
 * Parses Arabic text and maps to Thuluth procedural glyphs.
 */
export function generateThuluthComposition(
  text: string,
  startX: number = 500,
  baselineY: number = 350,
  scale: number = 1.0,
  kashida: number = 0
): CalligraphyGlyph[] {
  const glyphs: CalligraphyGlyph[] = [];
  
  // Clean input text of diacritics for glyph layout
  const rawChars = Array.from(text.replace(/[\u064B-\u065F\u0670]/g, ''));
  if (rawChars.length === 0) return [];

  // Calligraphic Arabic lays out right-to-left
  let currentX = startX + 180;

  for (let i = 0; i < rawChars.length; i++) {
    const char = rawChars[i];
    if (char === ' ') {
      currentX -= 40 * scale;
      continue;
    }

    // Check for Lam-Alif ligature
    let targetChar = char;
    if (char === 'ل' && i + 1 < rawChars.length && rawChars[i + 1] === 'ا') {
      targetChar = 'لا';
      i++; // consume alif
    }

    const template = THULUTH_GLYPH_TEMPLATES[targetChar] || THULUTH_GLYPH_TEMPLATES['ا'];
    const glyphWidth = (template.width + kashida * 20) * scale;
    const glyphX = currentX - glyphWidth / 2;
    const glyphY = baselineY;

    const glyphId = `glyph-thuluth-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;

    // Prepare stroke segments for video recording & laser pathing
    const stroke: StrokeSegment = {
      id: `stroke-${glyphId}-0`,
      pathData: template.defaultPath,
      order: i,
      type: 'letter'
    };

    // Prepare default dots
    const dots = (template.dotsDefault || []).map((dot, dIdx) => ({
      id: `dot-${glyphId}-${dIdx}`,
      type: dot.type as any,
      x: glyphX + dot.x * scale,
      y: glyphY + dot.y * scale,
      scale: scale,
      rotation: 0,
      pathData: createRhombicDotPath(0, 0, 15 * scale, 70),
      parentGlyphId: glyphId,
    }));

    glyphs.push({
      id: glyphId,
      char: targetChar,
      arabicName: template.name,
      script: 'thuluth',
      position: i === 0 ? 'final' : (i === rawChars.length - 1 ? 'initial' : 'medial'),
      x: glyphX,
      y: glyphY,
      scaleX: scale,
      scaleY: scale,
      rotation: 0,
      elevation: 0,
      kashida: kashida,
      alternateIndex: 0,
      availableAlternates: template.alternates.map(a => a.name),
      pathData: template.defaultPath,
      strokes: [stroke],
      dots,
      vowels: [],
    });

    currentX -= glyphWidth * 0.85; // Natural interlocking letter overlap
  }

  return glyphs;
}

/**
 * Toggles or cycles through calligraphic alternate forms for a selected glyph.
 */
export function setGlyphAlternate(glyph: CalligraphyGlyph, altIndex: number): CalligraphyGlyph {
  const template = THULUTH_GLYPH_TEMPLATES[glyph.char];
  if (!template || !template.alternates[altIndex]) return glyph;

  const alt = template.alternates[altIndex];
  return {
    ...glyph,
    alternateIndex: altIndex,
    pathData: alt.path,
    reverseTail: alt.hasReverseTail ?? false,
    strokes: [{
      ...glyph.strokes[0],
      pathData: alt.path
    }]
  };
}
