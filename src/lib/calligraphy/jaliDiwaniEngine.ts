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

const JALI_DIWANI_TEMPLATES: Record<string, {
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
    if (char === 'ل' && i + 1 < rawChars.length && rawChars[i + 1] === 'ا') {
      targetChar = 'لا';
      i++;
    }

    const template = JALI_DIWANI_TEMPLATES[targetChar] || JALI_DIWANI_TEMPLATES['ا'];
    const glyphWidth = template.width * scale;

    // Jali Diwani curved wave baseline (safinah boat shape)
    const normalizedPos = i / Math.max(totalChars - 1, 1);
    // Upward swoop towards the left end (end of phrase)
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
      rotation: (normalizedPos - 0.5) * -12, // Dynamic tilt along wave
      elevation: 0,
      kashida: 0,
      alternateIndex: 0,
      availableAlternates: template.alternates.map(a => a.name),
      pathData: template.defaultPath,
      strokes: [stroke],
      dots,
      vowels: [],
    });

    currentX -= glyphWidth * 0.75; // Tighter Diwani interlocking
  }

  return glyphs;
}
