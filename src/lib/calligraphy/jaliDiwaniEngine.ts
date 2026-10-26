import { CalligraphyGlyph, StrokeSegment } from './types';
import { createRhombicDotPath } from './bezierUtils';

/**
 * Procedural Jali Diwani Engine.
 * Characterized by:
 * - Steep pen angle (80°-85°)
 * - Fish-hook finials, ornate crowns, cascading ascenders
 * - Upward curving wave baselines (Safinah boat geometry)
 * - Tightly interlocking letters with multi-size variations
 */

export const JALI_DIWANI_TEMPLATES: Record<string, {
  name: string;
  defaultPath: string;
  alternates: { name: string; path: string }[];
  width: number;
  height: number;
  baseline: number;
  dotsDefault?: { type: string; x: number; y: number }[];
}> = {
  'ا': {
    name: 'Alif',
    defaultPath: `M 14 -90 C 22 -75 25 -40 22 5 C 20 20 16 26 10 26 C 6 26 4 20 6 10 C 10 -25 10 -60 6 -80 C 4 -88 10 -95 14 -90 Z M 16 -88 C 22 -95 18 -100 12 -98 C 8 -96 10 -90 16 -88 Z`,
    alternates: [
      {
        name: 'Fish-hook Crowned Alif',
        path: `M 14 -90 C 22 -75 25 -40 22 5 C 20 20 16 26 10 26 C 6 26 4 20 6 10 C 10 -25 10 -60 6 -80 C 4 -88 10 -95 14 -90 Z M 16 -88 C 22 -95 18 -100 12 -98 C 8 -96 10 -90 16 -88 Z`
      },
      {
        name: 'Curling S-Curve Alif',
        path: `M 18 -95 C 10 -85 24 -50 20 0 C 18 18 12 28 6 28 C 0 28 2 18 6 6 C 12 -30 6 -70 14 -90 L 18 -95 Z`
      }
    ],
    width: 30,
    height: 130,
    baseline: 25
  },
  'ب': {
    name: 'Ba',
    defaultPath: `M 48 8 C 44 20 30 28 8 28 C -14 28 -34 20 -46 8 C -52 0 -50 -8 -44 -6 C -38 -4 -32 4 -22 10 C -8 18 10 18 24 14 C 36 10 42 2 44 -4 C 46 -4 48 0 48 8 Z`,
    alternates: [
      {
        name: 'Deep Boat Diwani Ba',
        path: `M 48 8 C 44 20 30 28 8 28 C -14 28 -34 20 -46 8 C -52 0 -50 -8 -44 -6 C -38 -4 -32 4 -22 10 C -8 18 10 18 24 14 C 36 10 42 2 44 -4 C 46 -4 48 0 48 8 Z`
      }
    ],
    width: 90,
    height: 45,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: 0, y: 40 }]
  },
  'ت': {
    name: 'Ta',
    defaultPath: `M 48 8 C 44 20 30 28 8 28 C -14 28 -34 20 -46 8 C -52 0 -50 -8 -44 -6 C -38 -4 -32 4 -22 10 C -8 18 10 18 24 14 C 36 10 42 2 44 -4 C 46 -4 48 0 48 8 Z`,
    alternates: [
      {
        name: 'Diwani Ta',
        path: `M 48 8 C 44 20 30 28 8 28 C -14 28 -34 20 -46 8 C -52 0 -50 -8 -44 -6 C -38 -4 -32 4 -22 10 C -8 18 10 18 24 14 C 36 10 42 2 44 -4 C 46 -4 48 0 48 8 Z`
      }
    ],
    width: 90,
    height: 45,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_double_horiz', x: 0, y: -8 }]
  },
  'ث': {
    name: 'Tha',
    defaultPath: `M 48 8 C 44 20 30 28 8 28 C -14 28 -34 20 -46 8 C -52 0 -50 -8 -44 -6 C -38 -4 -32 4 -22 10 C -8 18 10 18 24 14 C 36 10 42 2 44 -4 C 46 -4 48 0 48 8 Z`,
    alternates: [{ name: 'Diwani Tha', path: `M 48 8 C 44 20 30 28 8 28 C -14 28 -34 20 -46 8 C -52 0 -50 -8 -44 -6 C -38 -4 -32 4 -22 10 C -8 18 10 18 24 14 C 36 10 42 2 44 -4 C 46 -4 48 0 48 8 Z` }],
    width: 90,
    height: 45,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_triple', x: 0, y: -12 }]
  },
  'ج': {
    name: 'Jim',
    defaultPath: `M 32 -25 C 28 -32 15 -32 0 -30 C -15 -28 -28 -20 -32 -10 C -34 -4 -30 2 -20 2 C -6 2 12 -4 20 -10 C 14 0 2 16 -8 30 C -20 48 -35 56 -42 56 C -46 56 -46 48 -40 44 C -28 36 -16 22 -6 8 C 12 -16 24 -18 32 -25 Z`,
    alternates: [{ name: 'Diwani Curved Jim', path: `M 32 -25 C 28 -32 15 -32 0 -30 C -15 -28 -28 -20 -32 -10 C -34 -4 -30 2 -20 2 C -6 2 12 -4 20 -10 C 14 0 2 16 -8 30 C -20 48 -35 56 -42 56 C -46 56 -46 48 -40 44 C -28 36 -16 22 -6 8 C 12 -16 24 -18 32 -25 Z` }],
    width: 85,
    height: 85,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: -12, y: 25 }]
  },
  'ح': {
    name: 'Haa',
    defaultPath: `M 32 -25 C 28 -32 15 -32 0 -30 C -15 -28 -28 -20 -32 -10 C -34 -4 -30 2 -20 2 C -6 2 12 -4 20 -10 C 14 0 2 16 -8 30 C -20 48 -35 56 -42 56 C -46 56 -46 48 -40 44 C -28 36 -16 22 -6 8 C 12 -16 24 -18 32 -25 Z`,
    alternates: [{ name: 'Diwani Haa', path: `M 32 -25 C 28 -32 15 -32 0 -30 C -15 -28 -28 -20 -32 -10 C -34 -4 -30 2 -20 2 C -6 2 12 -4 20 -10 C 14 0 2 16 -8 30 C -20 48 -35 56 -42 56 C -46 56 -46 48 -40 44 C -28 36 -16 22 -6 8 C 12 -16 24 -18 32 -25 Z` }],
    width: 85,
    height: 85,
    baseline: 20
  },
  'خ': {
    name: 'Kha',
    defaultPath: `M 32 -25 C 28 -32 15 -32 0 -30 C -15 -28 -28 -20 -32 -10 C -34 -4 -30 2 -20 2 C -6 2 12 -4 20 -10 C 14 0 2 16 -8 30 C -20 48 -35 56 -42 56 C -46 56 -46 48 -40 44 C -28 36 -16 22 -6 8 C 12 -16 24 -18 32 -25 Z`,
    alternates: [{ name: 'Diwani Kha', path: `M 32 -25 C 28 -32 15 -32 0 -30 C -15 -28 -28 -20 -32 -10 C -34 -4 -30 2 -20 2 C -6 2 12 -4 20 -10 C 14 0 2 16 -8 30 C -20 48 -35 56 -42 56 C -46 56 -46 48 -40 44 C -28 36 -16 22 -6 8 C 12 -16 24 -18 32 -25 Z` }],
    width: 85,
    height: 85,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: 0, y: -42 }]
  },
  'د': {
    name: 'Dal',
    defaultPath: `M 18 -40 C 22 -35 22 -20 12 -8 C 4 2 -4 8 -12 12 C -20 14 -28 16 -36 16 C -40 16 -40 12 -34 10 C -22 8 -12 4 -4 -2 C 4 -8 10 -20 12 -36 L 18 -40 Z`,
    alternates: [{ name: 'Diwani Dal', path: `M 18 -40 C 22 -35 22 -20 12 -8 C 4 2 -4 8 -12 12 C -20 14 -28 16 -36 16 C -40 16 -40 12 -34 10 C -22 8 -12 4 -4 -2 C 4 -8 10 -20 12 -36 L 18 -40 Z` }],
    width: 55,
    height: 60,
    baseline: 20
  },
  'ذ': {
    name: 'Dhal',
    defaultPath: `M 18 -40 C 22 -35 22 -20 12 -8 C 4 2 -4 8 -12 12 C -20 14 -28 16 -36 16 C -40 16 -40 12 -34 10 C -22 8 -12 4 -4 -2 C 4 -8 10 -20 12 -36 L 18 -40 Z`,
    alternates: [{ name: 'Diwani Dhal', path: `M 18 -40 C 22 -35 22 -20 12 -8 C 4 2 -4 8 -12 12 C -20 14 -28 16 -36 16 C -40 16 -40 12 -34 10 C -22 8 -12 4 -4 -2 C 4 -8 10 -20 12 -36 L 18 -40 Z` }],
    width: 55,
    height: 60,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: 8, y: -52 }]
  },
  'ر': {
    name: 'Ra',
    defaultPath: `M 16 2 C 18 10 12 20 -2 32 C -18 44 -38 52 -55 52 C -62 52 -64 46 -58 42 C -42 40 -25 32 -14 22 C -6 14 0 4 4 -6 C 8 -6 12 -2 16 2 Z`,
    alternates: [
      {
        name: 'Sweeping Diwani Crescent Ra',
        path: `M 16 2 C 18 10 12 20 -2 32 C -18 44 -38 52 -55 52 C -62 52 -64 46 -58 42 C -42 40 -25 32 -14 22 C -6 14 0 4 4 -6 C 8 -6 12 -2 16 2 Z`
      }
    ],
    width: 65,
    height: 60,
    baseline: 15
  },
  'ز': {
    name: 'Zay',
    defaultPath: `M 16 2 C 18 10 12 20 -2 32 C -18 44 -38 52 -55 52 C -62 52 -64 46 -58 42 C -42 40 -25 32 -14 22 C -6 14 0 4 4 -6 C 8 -6 12 -2 16 2 Z`,
    alternates: [{ name: 'Diwani Zay', path: `M 16 2 C 18 10 12 20 -2 32 C -18 44 -38 52 -55 52 C -62 52 -64 46 -58 42 C -42 40 -25 32 -14 22 C -6 14 0 4 4 -6 C 8 -6 12 -2 16 2 Z` }],
    width: 65,
    height: 60,
    baseline: 15,
    dotsDefault: [{ type: 'nuqta_single', x: 6, y: -18 }]
  },
  'س': {
    name: 'Sin',
    defaultPath: `M 38 4 C 36 12 30 14 24 14 C 18 14 14 8 12 2 C 10 8 6 12 0 12 C -6 12 -10 6 -12 0 C -16 12 -28 26 -44 26 C -54 26 -60 16 -54 4 C -48 -4 -40 4 -32 10 C -22 14 -14 10 -10 2 L -10 -6 L -4 -6 L -4 4 C 0 8 4 6 8 0 L 8 -6 L 14 -6 L 14 4 C 18 8 22 6 28 0 L 28 -6 L 38 -6 L 38 4 Z`,
    alternates: [{ name: 'Diwani 3-Teeth Sin', path: `M 38 4 C 36 12 30 14 24 14 C 18 14 14 8 12 2 C 10 8 6 12 0 12 C -6 12 -10 6 -12 0 C -16 12 -28 26 -44 26 C -54 26 -60 16 -54 4 C -48 -4 -40 4 -32 10 C -22 14 -14 10 -10 2 L -10 -6 L -4 -6 L -4 4 C 0 8 4 6 8 0 L 8 -6 L 14 -6 L 14 4 C 18 8 22 6 28 0 L 28 -6 L 38 -6 L 38 4 Z` }],
    width: 90,
    height: 55,
    baseline: 15
  },
  'ش': {
    name: 'Shin',
    defaultPath: `M 38 4 C 36 12 30 14 24 14 C 18 14 14 8 12 2 C 10 8 6 12 0 12 C -6 12 -10 6 -12 0 C -16 12 -28 26 -44 26 C -54 26 -60 16 -54 4 C -48 -4 -40 4 -32 10 C -22 14 -14 10 -10 2 L -10 -6 L -4 -6 L -4 4 C 0 8 4 6 8 0 L 8 -6 L 14 -6 L 14 4 C 18 8 22 6 28 0 L 28 -6 L 38 -6 L 38 4 Z`,
    alternates: [{ name: 'Diwani Shin', path: `M 38 4 C 36 12 30 14 24 14 C 18 14 14 8 12 2 C 10 8 6 12 0 12 C -6 12 -10 6 -12 0 C -16 12 -28 26 -44 26 C -54 26 -60 16 -54 4 C -48 -4 -40 4 -32 10 C -22 14 -14 10 -10 2 L -10 -6 L -4 -6 L -4 4 C 0 8 4 6 8 0 L 8 -6 L 14 -6 L 14 4 C 18 8 22 6 28 0 L 28 -6 L 38 -6 L 38 4 Z` }],
    width: 90,
    height: 55,
    baseline: 15,
    dotsDefault: [{ type: 'nuqta_triple', x: 15, y: -20 }]
  },
  'ص': {
    name: 'Sad',
    defaultPath: `M 42 6 C 38 16 26 20 6 20 C -14 20 -24 14 -28 8 C -30 14 -40 28 -52 28 C -64 28 -70 18 -66 6 C -62 -2 -56 6 -48 12 C -38 18 -32 14 -28 8 L -28 -4 L -20 -4 L -20 8 C -8 10 6 10 18 8 C 30 6 38 0 40 -4 L 42 6 Z`,
    alternates: [{ name: 'Diwani Sad', path: `M 42 6 C 38 16 26 20 6 20 C -14 20 -24 14 -28 8 C -30 14 -40 28 -52 28 C -64 28 -70 18 -66 6 C -62 -2 -56 6 -48 12 C -38 18 -32 14 -28 8 L -28 -4 L -20 -4 L -20 8 C -8 10 6 10 18 8 C 30 6 38 0 40 -4 L 42 6 Z` }],
    width: 95,
    height: 55,
    baseline: 15
  },
  'ض': {
    name: 'Dad',
    defaultPath: `M 42 6 C 38 16 26 20 6 20 C -14 20 -24 14 -28 8 C -30 14 -40 28 -52 28 C -64 28 -70 18 -66 6 C -62 -2 -56 6 -48 12 C -38 18 -32 14 -28 8 L -28 -4 L -20 -4 L -20 8 C -8 10 6 10 18 8 C 30 6 38 0 40 -4 L 42 6 Z`,
    alternates: [{ name: 'Diwani Dad', path: `M 42 6 C 38 16 26 20 6 20 C -14 20 -24 14 -28 8 C -30 14 -40 28 -52 28 C -64 28 -70 18 -66 6 C -62 -2 -56 6 -48 12 C -38 18 -32 14 -28 8 L -28 -4 L -20 -4 L -20 8 C -8 10 6 10 18 8 C 30 6 38 0 40 -4 L 42 6 Z` }],
    width: 95,
    height: 55,
    baseline: 15,
    dotsDefault: [{ type: 'nuqta_single', x: -24, y: -22 }]
  },
  'ط': {
    name: 'Taa',
    defaultPath: `M 18 -85 C 24 -70 24 -35 22 10 C 32 14 42 20 42 24 C 42 28 28 28 10 28 C -12 28 -32 22 -38 16 C -40 12 -38 8 -30 6 C -16 10 2 10 16 6 C 18 -15 20 -55 18 -85 Z M 16 -82 C 22 -88 18 -92 12 -90 C 8 -88 10 -84 16 -82 Z`,
    alternates: [{ name: 'Diwani Taa Crown', path: `M 18 -85 C 24 -70 24 -35 22 10 C 32 14 42 20 42 24 C 42 28 28 28 10 28 C -12 28 -32 22 -38 16 C -40 12 -38 8 -30 6 C -16 10 2 10 16 6 C 18 -15 20 -55 18 -85 Z M 16 -82 C 22 -88 18 -92 12 -90 C 8 -88 10 -84 16 -82 Z` }],
    width: 85,
    height: 120,
    baseline: 20
  },
  'ظ': {
    name: 'Zaa',
    defaultPath: `M 18 -85 C 24 -70 24 -35 22 10 C 32 14 42 20 42 24 C 42 28 28 28 10 28 C -12 28 -32 22 -38 16 C -40 12 -38 8 -30 6 C -16 10 2 10 16 6 C 18 -15 20 -55 18 -85 Z M 16 -82 C 22 -88 18 -92 12 -90 C 8 -88 10 -84 16 -82 Z`,
    alternates: [{ name: 'Diwani Zaa', path: `M 18 -85 C 24 -70 24 -35 22 10 C 32 14 42 20 42 24 C 42 28 28 28 10 28 C -12 28 -32 22 -38 16 C -40 12 -38 8 -30 6 C -16 10 2 10 16 6 C 18 -15 20 -55 18 -85 Z M 16 -82 C 22 -88 18 -92 12 -90 C 8 -88 10 -84 16 -82 Z` }],
    width: 85,
    height: 120,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: 32, y: -16 }]
  },
  'ع': {
    name: 'Ayn',
    defaultPath: `M 24 -20 C 20 -28 8 -30 -2 -28 C -12 -24 -18 -16 -16 -6 C -14 2 -6 6 2 6 C 12 6 18 2 24 -8 C 16 4 2 20 -10 32 C -24 44 -40 48 -46 42 C -48 38 -44 34 -34 30 C -18 22 -4 8 6 -8 L 24 -20 Z`,
    alternates: [{ name: 'Diwani Ayn', path: `M 24 -20 C 20 -28 8 -30 -2 -28 C -12 -24 -18 -16 -16 -6 C -14 2 -6 6 2 6 C 12 6 18 2 24 -8 C 16 4 2 20 -10 32 C -24 44 -40 48 -46 42 C -48 38 -44 34 -34 30 C -18 22 -4 8 6 -8 L 24 -20 Z` }],
    width: 75,
    height: 80,
    baseline: 20
  },
  'غ': {
    name: 'Ghayn',
    defaultPath: `M 24 -20 C 20 -28 8 -30 -2 -28 C -12 -24 -18 -16 -16 -6 C -14 2 -6 6 2 6 C 12 6 18 2 24 -8 C 16 4 2 20 -10 32 C -24 44 -40 48 -46 42 C -48 38 -44 34 -34 30 C -18 22 -4 8 6 -8 L 24 -20 Z`,
    alternates: [{ name: 'Diwani Ghayn', path: `M 24 -20 C 20 -28 8 -30 -2 -28 C -12 -24 -18 -16 -16 -6 C -14 2 -6 6 2 6 C 12 6 18 2 24 -8 C 16 4 2 20 -10 32 C -24 44 -40 48 -46 42 C -48 38 -44 34 -34 30 C -18 22 -4 8 6 -8 L 24 -20 Z` }],
    width: 75,
    height: 80,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: 0, y: -42 }]
  },
  'ف': {
    name: 'Fa',
    defaultPath: `M 45 10 C 40 18 28 22 12 22 C -6 22 -22 18 -32 8 C -36 4 -34 -4 -28 -8 C -20 -14 -10 -16 2 -16 C 12 -16 20 -10 20 -2 C 20 6 16 10 10 12 L 32 12 C 40 12 44 6 45 10 Z`,
    alternates: [{ name: 'Diwani Fa', path: `M 45 10 C 40 18 28 22 12 22 C -6 22 -22 18 -32 8 C -36 4 -34 -4 -28 -8 C -20 -14 -10 -16 2 -16 C 12 -16 20 -10 20 -2 C 20 6 16 10 10 12 L 32 12 C 40 12 44 6 45 10 Z` }],
    width: 85,
    height: 45,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_single', x: 4, y: -26 }]
  },
  'ق': {
    name: 'Qaf',
    defaultPath: `M 22 -4 C 26 -12 18 -18 6 -18 C -6 -18 -14 -10 -12 0 C -10 8 -2 12 6 14 C -4 18 -16 24 -28 24 C -38 22 -44 14 -40 4 C -34 -4 -26 2 -18 6 C -8 10 4 10 12 4 C 18 0 20 -2 22 -4 Z`,
    alternates: [{ name: 'Diwani Qaf', path: `M 22 -4 C 26 -12 18 -18 6 -18 C -6 -18 -14 -10 -12 0 C -10 8 -2 12 6 14 C -4 18 -16 24 -28 24 C -38 22 -44 14 -40 4 C -34 -4 -26 2 -18 6 C -8 10 4 10 12 4 C 18 0 20 -2 22 -4 Z` }],
    width: 70,
    height: 55,
    baseline: 18,
    dotsDefault: [{ type: 'nuqta_double_horiz', x: 6, y: -28 }]
  },
  'ك': {
    name: 'Kaf',
    defaultPath: `M 22 -88 C 26 -70 26 -35 24 0 C 22 14 12 20 0 20 C -20 20 -42 16 -54 10 C -60 6 -60 0 -54 -2 C -46 2 -30 6 -15 6 C 4 6 14 4 16 -2 C 18 -15 18 -55 20 -75 L 22 -88 Z`,
    alternates: [{ name: 'Diwani Crowned Kaf', path: `M 22 -88 C 26 -70 26 -35 24 0 C 22 14 12 20 0 20 C -20 20 -42 16 -54 10 C -60 6 -60 0 -54 -2 C -46 2 -30 6 -15 6 C 4 6 14 4 16 -2 C 18 -15 18 -55 20 -75 L 22 -88 Z` }],
    width: 80,
    height: 115,
    baseline: 20
  },
  'ل': {
    name: 'Lam',
    defaultPath: `M 18 -92 C 24 -75 24 -35 22 10 C 20 26 12 36 -2 36 C -18 36 -32 24 -32 10 C -32 0 -24 -2 -18 4 C -12 12 -4 16 6 12 C 12 8 14 -8 15 -35 C 15 -65 12 -85 18 -92 Z M 20 -90 C 26 -96 22 -100 15 -98 C 12 -96 14 -90 20 -90 Z`,
    alternates: [
      {
        name: 'Ornate Crowned Lam',
        path: `M 18 -92 C 24 -75 24 -35 22 10 C 20 26 12 36 -2 36 C -18 36 -32 24 -32 10 C -32 0 -24 -2 -18 4 C -12 12 -4 16 6 12 C 12 8 14 -8 15 -35 C 15 -65 12 -85 18 -92 Z M 20 -90 C 26 -96 22 -100 15 -98 C 12 -96 14 -90 20 -90 Z`
      }
    ],
    width: 60,
    height: 135,
    baseline: 25
  },
  'لا': {
    name: 'Lam-Alif',
    defaultPath: `M 24 -92 C 28 -70 20 -30 8 -4 C -2 15 -18 28 -34 28 C -44 28 -50 18 -44 8 C -38 0 -32 8 -22 12 C -10 16 2 10 8 -4 C 14 -20 18 -60 16 -88 L 24 -92 Z M -16 -92 C -12 -75 -4 -40 8 -4 C 18 20 32 30 48 30 C 58 30 62 20 56 8 C 50 0 44 8 34 12 C 22 16 12 6 4 -12 C -4 -30 -8 -68 -10 -88 L -16 -92 Z`,
    alternates: [
      {
        name: 'Royal Diwani Intertwined Lam-Alif',
        path: `M 24 -92 C 28 -70 20 -30 8 -4 C -2 15 -18 28 -34 28 C -44 28 -50 18 -44 8 C -38 0 -32 8 -22 12 C -10 16 2 10 8 -4 C 14 -20 18 -60 16 -88 L 24 -92 Z M -16 -92 C -12 -75 -4 -40 8 -4 C 18 20 32 30 48 30 C 58 30 62 20 56 8 C 50 0 44 8 34 12 C 22 16 12 6 4 -12 C -4 -30 -8 -68 -10 -88 L -16 -92 Z`
      }
    ],
    width: 85,
    height: 130,
    baseline: 25
  },
  'م': {
    name: 'Meem',
    defaultPath: `M 20 0 C 26 -2 30 -8 26 -16 C 22 -22 12 -24 4 -20 C -6 -16 -12 -8 -10 4 C -8 12 0 16 8 16 L 8 45 C 8 52 4 56 0 52 C -2 50 -2 40 -2 25 L -2 6 C -10 6 -16 -2 -14 -10 C -12 -18 0 -22 12 -20 C 24 -18 32 -8 30 4 C 28 14 22 18 14 18 L 20 0 Z`,
    alternates: [
      {
        name: 'Descending Finial Diwani Meem',
        path: `M 20 0 C 26 -2 30 -8 26 -16 C 22 -22 12 -24 4 -20 C -6 -16 -12 -8 -10 4 C -8 12 0 16 8 16 L 8 45 C 8 52 4 56 0 52 C -2 50 -2 40 -2 25 L -2 6 C -10 6 -16 -2 -14 -10 C -12 -18 0 -22 12 -20 C 24 -18 32 -8 30 4 C 28 14 22 18 14 18 L 20 0 Z`
      }
    ],
    width: 48,
    height: 80,
    baseline: 18
  },
  'ن': {
    name: 'Nun',
    defaultPath: `M 28 4 C 24 16 12 26 -2 26 C -18 26 -30 14 -32 0 C -34 -8 -28 -14 -22 -14 C -18 -14 -16 -8 -20 0 C -18 8 -8 16 2 16 C 12 16 20 8 22 0 C 24 -6 28 -6 28 4 Z`,
    alternates: [{ name: 'Diwani Circular Nun', path: `M 28 4 C 24 16 12 26 -2 26 C -18 26 -30 14 -32 0 C -34 -8 -28 -14 -22 -14 C -18 -14 -16 -8 -20 0 C -18 8 -8 16 2 16 C 12 16 20 8 22 0 C 24 -6 28 -6 28 4 Z` }],
    width: 65,
    height: 50,
    baseline: 15,
    dotsDefault: [{ type: 'nuqta_single', x: 0, y: -4 }]
  },
  'ه': {
    name: 'Ha',
    defaultPath: `M 20 -4 C 24 4 20 12 10 16 C -2 20 -14 18 -22 10 C -28 4 -30 -4 -26 -10 C -20 -18 -6 -18 4 -14 C 12 -10 18 -12 20 -4 Z`,
    alternates: [{ name: 'Diwani Ha', path: `M 20 -4 C 24 4 20 12 10 16 C -2 20 -14 18 -22 10 C -28 4 -30 -4 -26 -10 C -20 -18 -6 -18 4 -14 C 12 -10 18 -12 20 -4 Z` }],
    width: 55,
    height: 40,
    baseline: 15
  },
  'و': {
    name: 'Waw',
    defaultPath: `M 22 -6 C 28 -8 30 -2 28 6 C 24 16 12 30 -2 40 C -18 50 -36 54 -50 54 C -56 54 -58 48 -52 44 C -40 40 -24 32 -14 22 C -6 14 -2 4 2 -4 C -2 -12 6 -16 16 -16 L 22 -6 Z`,
    alternates: [
      {
        name: 'Ornate Diwani Waw',
        path: `M 22 -6 C 28 -8 30 -2 28 6 C 24 16 12 30 -2 40 C -18 50 -36 54 -50 54 C -56 54 -58 48 -52 44 C -40 40 -24 32 -14 22 C -6 14 -2 4 2 -4 C -2 -12 6 -16 16 -16 L 22 -6 Z`
      }
    ],
    width: 70,
    height: 70,
    baseline: 18
  },
  'ي': {
    name: 'Ya',
    defaultPath: `M 28 -12 C 32 -4 28 6 16 16 C 0 28 -22 34 -44 30 C -60 26 -70 12 -62 0 C -55 -8 -40 2 -26 6 C -8 10 10 8 22 -2 C 28 -8 30 -14 28 -12 Z M 20 -28 C 25 -22 20 -14 8 -10 C -4 -6 -16 -8 -20 -15 C -24 -22 -18 -30 -6 -34 C 6 -36 16 -34 20 -28 Z`,
    alternates: [
      {
        name: 'Graceful Diwani Ya',
        path: `M 28 -12 C 32 -4 28 6 16 16 C 0 28 -22 34 -44 30 C -60 26 -70 12 -62 0 C -55 -8 -40 2 -26 6 C -8 10 10 8 22 -2 C 28 -8 30 -14 28 -12 Z M 20 -28 C 25 -22 20 -14 8 -10 C -4 -6 -16 -8 -20 -15 C -24 -22 -18 -30 -6 -34 C 6 -36 16 -34 20 -28 Z`
      }
    ],
    width: 85,
    height: 70,
    baseline: 20,
    dotsDefault: [{ type: 'nuqta_double_horiz', x: 0, y: 45 }]
  }
};

// Aliases
JALI_DIWANI_TEMPLATES['ة'] = { ...JALI_DIWANI_TEMPLATES['ه'], name: 'Ta Marbuta', dotsDefault: [{ type: 'nuqta_double_horiz', x: 0, y: -22 }] };
JALI_DIWANI_TEMPLATES['ى'] = { ...JALI_DIWANI_TEMPLATES['ي'], name: 'Alif Maqsura', dotsDefault: [] };
JALI_DIWANI_TEMPLATES['آ'] = { ...JALI_DIWANI_TEMPLATES['ا'], name: 'Alif Maddah' };
JALI_DIWANI_TEMPLATES['أ'] = { ...JALI_DIWANI_TEMPLATES['ا'], name: 'Alif Hamza' };
JALI_DIWANI_TEMPLATES['إ'] = { ...JALI_DIWANI_TEMPLATES['ا'], name: 'Alif Hamza' };
JALI_DIWANI_TEMPLATES['ء'] = {
  name: 'Hamza',
  defaultPath: `M 8 -12 C 6 -18 0 -20 -6 -18 C -12 -15 -14 -8 -8 -4 C -4 0 2 2 6 0 L -8 10 L -4 12 L 10 0 Z`,
  alternates: [{ name: 'Hamza', path: `M 8 -12 C 6 -18 0 -20 -6 -18 C -12 -15 -14 -8 -8 -4 C -4 0 2 2 6 0 L -8 10 L -4 12 L 10 0 Z` }],
  width: 30,
  height: 30,
  baseline: 15
};

export function generateJaliDiwaniComposition(
  text: string,
  startX: number = 500,
  baselineY: number = 350,
  scale: number = 1.0
): CalligraphyGlyph[] {
  const glyphs: CalligraphyGlyph[] = [];
  const rawChars = Array.from(text.replace(/[\u064B-\u065F\u0670]/g, ''));
  if (rawChars.length === 0) return [];

  let currentX = startX + 160;
  const totalChars = rawChars.length;

  for (let i = 0; i < rawChars.length; i++) {
    const char = rawChars[i];
    if (char === ' ') {
      currentX -= 30 * scale;
      continue;
    }

    let targetChar = char;
    if (char === 'ل' && i + 1 < rawChars.length && (rawChars[i + 1] === 'ا' || rawChars[i + 1] === 'أ' || rawChars[i + 1] === 'إ' || rawChars[i + 1] === 'آ')) {
      targetChar = 'لا';
      i++;
    }

    const template = JALI_DIWANI_TEMPLATES[targetChar] || JALI_DIWANI_TEMPLATES['ا'];
    const glyphWidth = template.width * scale;

    // Jali Diwani curved wave baseline (safinah boat shape)
    const normalizedPos = i / Math.max(totalChars - 1, 1);
    const waveY = baselineY - Math.sin(normalizedPos * Math.PI) * 25 * scale - (1 - normalizedPos) * 20 * scale;

    const glyphX = currentX - glyphWidth / 2;
    const glyphId = `glyph-diwani-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;

    const stroke: StrokeSegment = {
      id: `stroke-${glyphId}-0`,
      pathData: template.defaultPath,
      order: i,
      type: 'letter'
    };

    const dots = (template.dotsDefault || []).map((dot, dIdx) => ({
      id: `dot-${glyphId}-${dIdx}`,
      type: dot.type as any,
      x: glyphX + dot.x * scale,
      y: waveY + dot.y * scale,
      scale: scale,
      rotation: 0,
      pathData: createRhombicDotPath(0, 0, 14 * scale, 82),
      parentGlyphId: glyphId,
    }));

    glyphs.push({
      id: glyphId,
      char: targetChar,
      arabicName: template.name,
      script: 'jali_diwani',
      position: i === 0 ? 'final' : (i === rawChars.length - 1 ? 'initial' : 'medial'),
      x: glyphX,
      y: waveY,
      scaleX: scale,
      scaleY: scale,
      rotation: (normalizedPos - 0.5) * -12,
      elevation: 0,
      kashida: 0,
      alternateIndex: 0,
      availableAlternates: template.alternates.map(a => a.name),
      pathData: template.defaultPath,
      strokes: [stroke],
      dots,
      vowels: [],
    });

    currentX -= glyphWidth * 0.75;
  }

  return glyphs;
}
