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
export const THULUTH_GLYPH_TEMPLATES: Record<string, {
  name: string;
  defaultPath: string;
  alternates: { name: string; path: string; hasReverseTail?: boolean }[];
  width: number;
  height: number;
  baseline: number;
  dotsDefault?: { type: string; x: number; y: number }[];
}> = {
  // 1. Alif
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

  // 2. Ba
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

  // 3. Ta
  'ت': {
    name: 'Ta',
    defaultPath: `M 56 12 C 54 18 45 22 28 22 C 10 22 -15 20 -28 10 C -34 6 -38 -2 -38 -8 C -34 -8 -30 0 -24 6 C -12 14 8 16 26 16 C 42 16 50 12 52 8 C 54 4 56 6 56 12 Z`,
    alternates: [
      { 
        name: 'Classical Boat Ta', 
        path: `M 56 12 C 54 18 45 22 28 22 C 10 22 -15 20 -28 10 C -34 6 -38 -2 -38 -8 C -34 -8 -30 0 -24 6 C -12 14 8 16 26 16 C 42 16 50 12 52 8 C 54 4 56 6 56 12 Z` 
      }
    ],
    width: 100,
    height: 40,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_double_horiz', x: 0, y: -4 }]
  },

  // 4. Tha
  'ث': {
    name: 'Tha',
    defaultPath: `M 56 12 C 54 18 45 22 28 22 C 10 22 -15 20 -28 10 C -34 6 -38 -2 -38 -8 C -34 -8 -30 0 -24 6 C -12 14 8 16 26 16 C 42 16 50 12 52 8 C 54 4 56 6 56 12 Z`,
    alternates: [
      { 
        name: 'Classical Boat Tha', 
        path: `M 56 12 C 54 18 45 22 28 22 C 10 22 -15 20 -28 10 C -34 6 -38 -2 -38 -8 C -34 -8 -30 0 -24 6 C -12 14 8 16 26 16 C 42 16 50 12 52 8 C 54 4 56 6 56 12 Z` 
      }
    ],
    width: 100,
    height: 40,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_triple', x: 0, y: -8 }]
  },

  // 5. Jim
  'ج': {
    name: 'Jim',
    defaultPath: `M 38 -22 C 34 -28 22 -30 6 -30 C -12 -30 -28 -24 -36 -12 C -40 -6 -36 0 -26 0 C -10 0 10 -4 24 -12 C 18 -2 0 14 -12 28 C -26 44 -40 54 -46 54 C -50 54 -52 48 -46 44 C -34 38 -22 25 -10 10 C 12 -16 28 -18 38 -22 Z`,
    alternates: [
      {
        name: 'Classical Sword Jim',
        path: `M 38 -22 C 34 -28 22 -30 6 -30 C -12 -30 -28 -24 -36 -12 C -40 -6 -36 0 -26 0 C -10 0 10 -4 24 -12 C 18 -2 0 14 -12 28 C -26 44 -40 54 -46 54 C -50 54 -52 48 -46 44 C -34 38 -22 25 -10 10 C 12 -16 28 -18 38 -22 Z`
      },
      {
        name: 'Curved Bowl Jim (Muhaqqaq)',
        path: `M 42 -22 C 36 -28 20 -30 2 -30 C -18 -30 -32 -22 -36 -12 C -38 -6 -32 0 -22 0 C -8 0 12 -6 26 -14 C 18 5 0 25 -15 38 C -30 50 -48 52 -55 48 C -58 44 -52 40 -40 36 C -20 28 -5 12 8 -6 C 24 -16 34 -18 42 -22 Z`
      }
    ],
    width: 90,
    height: 90,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: -15, y: 24 }]
  },

  // 6. Ha
  'ح': {
    name: 'Haa',
    defaultPath: `M 38 -22 C 34 -28 22 -30 6 -30 C -12 -30 -28 -24 -36 -12 C -40 -6 -36 0 -26 0 C -10 0 10 -4 24 -12 C 18 -2 0 14 -12 28 C -26 44 -40 54 -46 54 C -50 54 -52 48 -46 44 C -34 38 -22 25 -10 10 C 12 -16 28 -18 38 -22 Z`,
    alternates: [
      {
        name: 'Classical Crescent Haa',
        path: `M 38 -22 C 34 -28 22 -30 6 -30 C -12 -30 -28 -24 -36 -12 C -40 -6 -36 0 -26 0 C -10 0 10 -4 24 -12 C 18 -2 0 14 -12 28 C -26 44 -40 54 -46 54 C -50 54 -52 48 -46 44 C -34 38 -22 25 -10 10 C 12 -16 28 -18 38 -22 Z`
      }
    ],
    width: 90,
    height: 90,
    baseline: 20
  },

  // 7. Kha
  'خ': {
    name: 'Kha',
    defaultPath: `M 38 -22 C 34 -28 22 -30 6 -30 C -12 -30 -28 -24 -36 -12 C -40 -6 -36 0 -26 0 C -10 0 10 -4 24 -12 C 18 -2 0 14 -12 28 C -26 44 -40 54 -46 54 C -50 54 -52 48 -46 44 C -34 38 -22 25 -10 10 C 12 -16 28 -18 38 -22 Z`,
    alternates: [
      {
        name: 'Classical Crescent Kha',
        path: `M 38 -22 C 34 -28 22 -30 6 -30 C -12 -30 -28 -24 -36 -12 C -40 -6 -36 0 -26 0 C -10 0 10 -4 24 -12 C 18 -2 0 14 -12 28 C -26 44 -40 54 -46 54 C -50 54 -52 48 -46 44 C -34 38 -22 25 -10 10 C 12 -16 28 -18 38 -22 Z`
      }
    ],
    width: 90,
    height: 90,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: 0, y: -45 }]
  },

  // 8. Dal
  'د': {
    name: 'Dal',
    defaultPath: `M 22 -45 C 26 -40 25 -25 15 -10 C 6 2 -4 10 -15 14 C -22 16 -30 18 -40 18 C -44 18 -46 14 -40 12 C -28 10 -15 6 -6 -2 C 4 -10 12 -25 14 -40 L 22 -45 Z`,
    alternates: [
      {
        name: 'Classical Thuluth Dal',
        path: `M 22 -45 C 26 -40 25 -25 15 -10 C 6 2 -4 10 -15 14 C -22 16 -30 18 -40 18 C -44 18 -46 14 -40 12 C -28 10 -15 6 -6 -2 C 4 -10 12 -25 14 -40 L 22 -45 Z`
      }
    ],
    width: 65,
    height: 65,
    baseline: 20
  },

  // 9. Dhal
  'ذ': {
    name: 'Dhal',
    defaultPath: `M 22 -45 C 26 -40 25 -25 15 -10 C 6 2 -4 10 -15 14 C -22 16 -30 18 -40 18 C -44 18 -46 14 -40 12 C -28 10 -15 6 -6 -2 C 4 -10 12 -25 14 -40 L 22 -45 Z`,
    alternates: [
      {
        name: 'Classical Thuluth Dhal',
        path: `M 22 -45 C 26 -40 25 -25 15 -10 C 6 2 -4 10 -15 14 C -22 16 -30 18 -40 18 C -44 18 -46 14 -40 12 C -28 10 -15 6 -6 -2 C 4 -10 12 -25 14 -40 L 22 -45 Z`
      }
    ],
    width: 65,
    height: 65,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: 10, y: -58 }]
  },

  // 10. Ra
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

  // 11. Zay
  'ز': {
    name: 'Zay',
    defaultPath: `M 14 4 C 16 10 14 16 6 25 C -6 36 -22 45 -36 46 C -42 46 -45 42 -40 38 C -30 36 -16 30 -8 20 C -2 12 2 4 4 -6 C 8 -6 12 -2 14 4 Z`,
    alternates: [
      {
        name: 'Dagger Plunge Zay',
        path: `M 14 4 C 16 10 14 16 6 25 C -6 36 -22 45 -36 46 C -42 46 -45 42 -40 38 C -30 36 -16 30 -8 20 C -2 12 2 4 4 -6 C 8 -6 12 -2 14 4 Z`
      }
    ],
    width: 60,
    height: 55,
    baseline: 15,
    dotsDefault: [{ type: 'nuqta_single', x: 8, y: -20 }]
  },

  // 12. Sin
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

  // 13. Shin
  'ش': {
    name: 'Shin',
    defaultPath: `M 42 2 C 40 10 36 12 30 12 C 24 12 20 6 18 0 C 16 8 12 12 6 12 C 0 12 -4 6 -6 0 C -8 10 -18 25 -32 25 C -44 25 -52 14 -48 2 C -44 -6 -38 2 -30 8 C -20 14 -12 12 -6 4 L -6 -6 L 0 -6 L 0 4 C 4 8 8 6 12 0 L 12 -6 L 18 -6 L 18 4 C 22 8 28 6 34 0 L 34 -6 L 42 -6 L 42 2 Z`,
    alternates: [
      {
        name: '3-Teeth Classical Shin',
        path: `M 42 2 C 40 10 36 12 30 12 C 24 12 20 6 18 0 C 16 8 12 12 6 12 C 0 12 -4 6 -6 0 C -8 10 -18 25 -32 25 C -44 25 -52 14 -48 2 C -44 -6 -38 2 -30 8 C -20 14 -12 12 -6 4 L -6 -6 L 0 -6 L 0 4 C 4 8 8 6 12 0 L 12 -6 L 18 -6 L 18 4 C 22 8 28 6 34 0 L 34 -6 L 42 -6 L 42 2 Z`
      }
    ],
    width: 95,
    height: 55,
    baseline: 15,
    dotsDefault: [{ type: 'nuqta_triple', x: 18, y: -22 }]
  },

  // 14. Sad
  'ص': {
    name: 'Sad',
    defaultPath: `M 48 4 C 44 14 30 18 8 18 C -14 18 -26 12 -30 6 C -32 12 -42 26 -56 26 C -68 26 -76 16 -72 4 C -68 -4 -62 4 -54 10 C -44 16 -36 14 -32 6 L -32 -6 L -24 -6 L -24 6 C -10 10 6 10 20 8 C 34 6 42 0 44 -4 L 48 4 Z`,
    alternates: [
      {
        name: 'Classical Thuluth Sad with High Tooth and Deep Bowl',
        path: `M 48 4 C 44 14 30 18 8 18 C -14 18 -26 12 -30 6 C -32 12 -42 26 -56 26 C -68 26 -76 16 -72 4 C -68 -4 -62 4 -54 10 C -44 16 -36 14 -32 6 L -32 -6 L -24 -6 L -24 6 C -10 10 6 10 20 8 C 34 6 42 0 44 -4 L 48 4 Z`
      }
    ],
    width: 105,
    height: 55,
    baseline: 15
  },

  // 15. Dad
  'ض': {
    name: 'Dad',
    defaultPath: `M 48 4 C 44 14 30 18 8 18 C -14 18 -26 12 -30 6 C -32 12 -42 26 -56 26 C -68 26 -76 16 -72 4 C -68 -4 -62 4 -54 10 C -44 16 -36 14 -32 6 L -32 -6 L -24 -6 L -24 6 C -10 10 6 10 20 8 C 34 6 42 0 44 -4 L 48 4 Z`,
    alternates: [
      {
        name: 'Classical Thuluth Dad with Nuqta',
        path: `M 48 4 C 44 14 30 18 8 18 C -14 18 -26 12 -30 6 C -32 12 -42 26 -56 26 C -68 26 -76 16 -72 4 C -68 -4 -62 4 -54 10 C -44 16 -36 14 -32 6 L -32 -6 L -24 -6 L -24 6 C -10 10 6 10 20 8 C 34 6 42 0 44 -4 L 48 4 Z`
      }
    ],
    width: 105,
    height: 55,
    baseline: 15,
    dotsDefault: [{ type: 'nuqta_single', x: -28, y: -24 }]
  },

  // 16. Taa (ط)
  'ط': {
    name: 'Taa',
    defaultPath: `M 22 -78 C 26 -76 27 -50 25 -10 C 35 -6 45 4 45 12 C 45 20 30 22 10 22 C -15 22 -38 18 -45 12 C -48 8 -46 2 -38 0 C -22 6 -2 6 15 2 C 16 -20 18 -60 22 -78 Z M 16 -74 C 13 -78 19 -82 23 -78 C 21 -76 18 -74 16 -74 Z`,
    alternates: [
      {
        name: 'Towering Taa with Tarwis Crown',
        path: `M 22 -78 C 26 -76 27 -50 25 -10 C 35 -6 45 4 45 12 C 45 20 30 22 10 22 C -15 22 -38 18 -45 12 C -48 8 -46 2 -38 0 C -22 6 -2 6 15 2 C 16 -20 18 -60 22 -78 Z M 16 -74 C 13 -78 19 -82 23 -78 C 21 -76 18 -74 16 -74 Z`
      }
    ],
    width: 90,
    height: 110,
    baseline: 20
  },

  // 17. Zaa (ظ)
  'ظ': {
    name: 'Zaa',
    defaultPath: `M 22 -78 C 26 -76 27 -50 25 -10 C 35 -6 45 4 45 12 C 45 20 30 22 10 22 C -15 22 -38 18 -45 12 C -48 8 -46 2 -38 0 C -22 6 -2 6 15 2 C 16 -20 18 -60 22 -78 Z M 16 -74 C 13 -78 19 -82 23 -78 C 21 -76 18 -74 16 -74 Z`,
    alternates: [
      {
        name: 'Towering Zaa with Nuqta',
        path: `M 22 -78 C 26 -76 27 -50 25 -10 C 35 -6 45 4 45 12 C 45 20 30 22 10 22 C -15 22 -38 18 -45 12 C -48 8 -46 2 -38 0 C -22 6 -2 6 15 2 C 16 -20 18 -60 22 -78 Z M 16 -74 C 13 -78 19 -82 23 -78 C 21 -76 18 -74 16 -74 Z`
      }
    ],
    width: 90,
    height: 110,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: 38, y: -20 }]
  },

  // 18. Ayn (ع)
  'ع': {
    name: 'Ayn',
    defaultPath: `M 28 -24 C 24 -32 10 -34 -2 -30 C -14 -26 -22 -16 -20 -6 C -18 2 -10 6 0 6 C 12 6 22 0 28 -10 C 20 5 2 24 -12 36 C -28 48 -46 50 -54 44 C -56 40 -50 36 -38 32 C -18 24 -4 10 8 -8 L 28 -24 Z`,
    alternates: [
      {
        name: 'Falcon-Beak Initial Ayn',
        path: `M 28 -24 C 24 -32 10 -34 -2 -30 C -14 -26 -22 -16 -20 -6 C -18 2 -10 6 0 6 C 12 6 22 0 28 -10 C 20 5 2 24 -12 36 C -28 48 -46 50 -54 44 C -56 40 -50 36 -38 32 C -18 24 -4 10 8 -8 L 28 -24 Z`
      }
    ],
    width: 85,
    height: 85,
    baseline: 20
  },

  // 19. Ghayn (غ)
  'غ': {
    name: 'Ghayn',
    defaultPath: `M 28 -24 C 24 -32 10 -34 -2 -30 C -14 -26 -22 -16 -20 -6 C -18 2 -10 6 0 6 C 12 6 22 0 28 -10 C 20 5 2 24 -12 36 C -28 48 -46 50 -54 44 C -56 40 -50 36 -38 32 C -18 24 -4 10 8 -8 L 28 -24 Z`,
    alternates: [
      {
        name: 'Falcon-Beak Ghayn with Top Nuqta',
        path: `M 28 -24 C 24 -32 10 -34 -2 -30 C -14 -26 -22 -16 -20 -6 C -18 2 -10 6 0 6 C 12 6 22 0 28 -10 C 20 5 2 24 -12 36 C -28 48 -46 50 -54 44 C -56 40 -50 36 -38 32 C -18 24 -4 10 8 -8 L 28 -24 Z`
      }
    ],
    width: 85,
    height: 85,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: 0, y: -48 }]
  },

  // 20. Fa (ف)
  'ف': {
    name: 'Fa',
    defaultPath: `M 52 14 C 48 20 38 22 20 22 C 0 22 -20 20 -30 10 C -34 6 -32 -2 -26 -8 C -18 -16 -8 -18 4 -18 C 16 -18 24 -10 24 0 C 24 8 20 12 12 14 L 38 14 C 48 14 52 8 52 14 Z M 0 -12 C -6 -12 -12 -8 -10 -2 C -8 4 0 6 6 4 C 12 2 12 -6 6 -10 C 4 -12 2 -12 0 -12 Z`,
    alternates: [
      {
        name: 'Classical Thuluth Fa with Round Head and Boat Body',
        path: `M 52 14 C 48 20 38 22 20 22 C 0 22 -20 20 -30 10 C -34 6 -32 -2 -26 -8 C -18 -16 -8 -18 4 -18 C 16 -18 24 -10 24 0 C 24 8 20 12 12 14 L 38 14 C 48 14 52 8 52 14 Z M 0 -12 C -6 -12 -12 -8 -10 -2 C -8 4 0 6 6 4 C 12 2 12 -6 6 -10 C 4 -12 2 -12 0 -12 Z`
      }
    ],
    width: 95,
    height: 50,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: 6, y: -30 }]
  },

  // 21. Qaf (ق)
  'ق': {
    name: 'Qaf',
    defaultPath: `M 24 -6 C 28 -14 20 -20 8 -20 C -6 -20 -16 -12 -14 0 C -12 10 -4 14 6 16 C -6 20 -20 28 -34 26 C -46 22 -52 12 -46 2 C -40 -6 -32 2 -24 6 C -12 12 4 12 14 4 C 20 -2 22 -4 24 -6 Z M 4 -14 C 0 -14 -4 -10 -2 -6 C 0 -2 6 0 8 -2 C 10 -4 8 -10 4 -14 Z`,
    alternates: [
      {
        name: 'Classical Thuluth Qaf with Deep Circular Bowl',
        path: `M 24 -6 C 28 -14 20 -20 8 -20 C -6 -20 -16 -12 -14 0 C -12 10 -4 14 6 16 C -6 20 -20 28 -34 26 C -46 22 -52 12 -46 2 C -40 -6 -32 2 -24 6 C -12 12 4 12 14 4 C 20 -2 22 -4 24 -6 Z M 4 -14 C 0 -14 -4 -10 -2 -6 C 0 -2 6 0 8 -2 C 10 -4 8 -10 4 -14 Z`
      }
    ],
    width: 80,
    height: 60,
    baseline: 18,
    dotsDefault: [{ type: 'nuqta_double_horiz', x: 8, y: -34 }]
  },

  // 22. Kaf (ك)
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
  },

  // 23. Lam (ل)
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

  // 24. Lam-Alif Ligature (لا)
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

  // 25. Meem (م)
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

  // 26. Nun (ن)
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

  // 27. Ha (ه / ة)
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

  // 28. Waw (و)
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

  // 29. Ya (ي / ى)
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
  }
};

// Aliases for related forms (Hamza variants, Ta Marbuta, Alif Maqsura)
THULUTH_GLYPH_TEMPLATES['ة'] = { ...THULUTH_GLYPH_TEMPLATES['ه'], name: 'Ta Marbuta', dotsDefault: [{ type: 'nuqta_double_horiz', x: 0, y: -26 }] };
THULUTH_GLYPH_TEMPLATES['ى'] = { ...THULUTH_GLYPH_TEMPLATES['ي'], name: 'Alif Maqsura', dotsDefault: [] };
THULUTH_GLYPH_TEMPLATES['آ'] = { ...THULUTH_GLYPH_TEMPLATES['ا'], name: 'Alif Maddah' };
THULUTH_GLYPH_TEMPLATES['أ'] = { ...THULUTH_GLYPH_TEMPLATES['ا'], name: 'Alif Hamza Above' };
THULUTH_GLYPH_TEMPLATES['إ'] = { ...THULUTH_GLYPH_TEMPLATES['ا'], name: 'Alif Hamza Below' };
THULUTH_GLYPH_TEMPLATES['ء'] = {
  name: 'Hamza',
  defaultPath: `M 10 -15 C 8 -22 0 -25 -8 -22 C -15 -18 -16 -10 -10 -4 C -4 0 4 2 8 0 L -12 12 L -6 14 L 14 0 C 16 -6 14 -12 10 -15 Z`,
  alternates: [{ name: 'Hamza', path: `M 10 -15 C 8 -22 0 -25 -8 -22 C -15 -18 -16 -10 -10 -4 C -4 0 4 2 8 0 L -12 12 L -6 14 L 14 0 C 16 -6 14 -12 10 -15 Z` }],
  width: 35,
  height: 35,
  baseline: 15
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
    if (char === 'ل' && i + 1 < rawChars.length && (rawChars[i + 1] === 'ا' || rawChars[i + 1] === 'أ' || rawChars[i + 1] === 'إ' || rawChars[i + 1] === 'آ')) {
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
