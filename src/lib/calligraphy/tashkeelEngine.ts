import { HarakatType, TashkeelItem } from './types';
import { createRhombicDotPath } from './bezierUtils';

/**
 * Returns authentic vector path data for any calligraphic vowel or ornament.
 */
export function getHarakatPath(type: HarakatType, scale: number = 1): string {
  const s = scale;
  switch (type) {
    case 'fatha':
      // Slanted chisel stroke angled at ~30° relative to horizontal
      return `M ${-14 * s} ${-5 * s} C ${-6 * s} ${-6 * s} ${6 * s} ${-3 * s} ${14 * s} ${4 * s} C ${10 * s} ${6 * s} ${-4 * s} ${3 * s} ${-14 * s} ${-5 * s} Z`;

    case 'kasra':
      // Lower slanted chisel stroke
      return `M ${-14 * s} ${-4 * s} C ${-6 * s} ${-5 * s} ${6 * s} ${-2 * s} ${14 * s} ${5 * s} C ${10 * s} ${7 * s} ${-4 * s} ${4 * s} ${-14 * s} ${-4 * s} Z`;

    case 'damma':
      // Miniature curled waw: round head + swooping tail
      return `M ${-2 * s} ${-10 * s} C ${4 * s} ${-12 * s} ${10 * s} ${-6 * s} ${8 * s} ${1 * s} C ${6 * s} ${7 * s} ${-2 * s} ${12 * s} ${-10 * s} ${14 * s} C ${-4 * s} ${10 * s} ${2 * s} ${6 * s} ${2 * s} ${0 * s} C ${2 * s} ${-4 * s} ${-2 * s} ${-6 * s} ${-6 * s} ${-4 * s} C ${-8 * s} ${-2 * s} ${-8 * s} ${-6 * s} ${-2 * s} ${-10 * s} Z`;

    case 'sukun':
      // Classical horseshoe circular crescent
      return `M ${0 * s} ${-8 * s} C ${6 * s} ${-8 * s} ${10 * s} ${-4 * s} ${10 * s} ${2 * s} C ${10 * s} ${6 * s} ${6 * s} ${10 * s} ${0 * s} ${10 * s} C ${-6 * s} ${10 * s} ${-10 * s} ${6 * s} ${-10 * s} ${2 * s} C ${-10 * s} ${-4 * s} ${-6 * s} ${-8 * s} ${0 * s} ${-8 * s} M ${0 * s} ${-4 * s} C ${-3 * s} ${-4 * s} ${-5 * s} ${-1 * s} ${-5 * s} ${2 * s} C ${-5 * s} ${5 * s} ${-3 * s} ${7 * s} ${0 * s} ${7 * s} C ${3 * s} ${7 * s} ${5 * s} ${5 * s} ${5 * s} ${2 * s} C ${5 * s} ${-1 * s} ${3 * s} ${-4 * s} ${0 * s} ${-4 * s} Z`;

    case 'shaddah':
      // Classical 3-toothed crown
      return `M ${-12 * s} ${4 * s} C ${-10 * s} ${-2 * s} ${-8 * s} ${-6 * s} ${-6 * s} ${-6 * s} C ${-4 * s} ${-6 * s} ${-3 * s} ${-1 * s} ${-1 * s} ${2 * s} C ${1 * s} ${-1 * s} ${2 * s} ${-6 * s} ${4 * s} ${-6 * s} C ${6 * s} ${-6 * s} ${8 * s} ${-2 * s} ${10 * s} ${4 * s} C ${8 * s} ${2 * s} ${6 * s} ${0 * s} ${4 * s} ${-1 * s} C ${2 * s} ${-1 * s} ${1 * s} ${5 * s} ${-1 * s} ${5 * s} C ${-3 * s} ${5 * s} ${-4 * s} ${-1 * s} ${-6 * s} ${-1 * s} C ${-8 * s} ${0 * s} ${-10 * s} ${2 * s} ${-12 * s} ${4 * s} Z`;

    case 'tanween_fath':
      // Double fatha
      return `M ${-14 * s} ${-12 * s} C ${-6 * s} ${-13 * s} ${6 * s} ${-10 * s} ${14 * s} ${-3 * s} C ${10 * s} ${-1 * s} ${-4 * s} ${-4 * s} ${-14 * s} ${-12 * s} Z M ${-14 * s} ${0 * s} C ${-6 * s} ${-1 * s} ${6 * s} ${2 * s} ${14 * s} ${9 * s} C ${10 * s} ${11 * s} ${-4 * s} ${8 * s} ${-14 * s} ${0 * s} Z`;

    case 'tanween_kasr':
      // Double kasra
      return `M ${-14 * s} ${-6 * s} C ${-6 * s} ${-7 * s} ${6 * s} ${-4 * s} ${14 * s} ${3 * s} C ${10 * s} ${5 * s} ${-4 * s} ${2 * s} ${-14 * s} ${-6 * s} Z M ${-14 * s} ${6 * s} C ${-6 * s} ${5 * s} ${6 * s} ${8 * s} ${14 * s} ${15 * s} C ${10 * s} ${17 * s} ${-4 * s} ${14 * s} ${-14 * s} ${6 * s} Z`;

    case 'tanween_damm':
      // Damma + inverted loop
      return `M ${-6 * s} ${-8 * s} C ${0 * s} ${-10 * s} ${6 * s} ${-5 * s} ${5 * s} ${2 * s} C ${3 * s} ${7 * s} ${-4 * s} ${10 * s} ${-10 * s} ${10 * s} C ${-5 * s} ${8 * s} ${0 * s} ${4 * s} ${0 * s} ${0 * s} C ${0 * s} ${-3 * s} ${-4 * s} ${-5 * s} ${-6 * s} ${-8 * s} Z M ${6 * s} ${-10 * s} C ${10 * s} ${-10 * s} ${12 * s} ${-5 * s} ${10 * s} ${-1 * s} C ${8 * s} ${-1 * s} ${8 * s} ${-7 * s} ${6 * s} ${-10 * s} Z`;

    case 'dagger_alif':
      // Standing upright miniature alif with tarwis
      return `M ${-3 * s} ${-14 * s} L ${2 * s} ${-14 * s} L ${1 * s} ${12 * s} L ${-2 * s} ${12 * s} Z M ${-5 * s} ${-12 * s} L ${-2 * s} ${-14 * s} L ${-2 * s} ${-10 * s} Z`;

    case 'maddah':
      // Undulating wave banner
      return `M ${-18 * s} ${0 * s} C ${-12 * s} ${-8 * s} ${-4 * s} ${-8 * s} ${0 * s} ${-2 * s} C ${4 * s} ${4 * s} ${12 * s} ${4 * s} ${18 * s} ${-4 * s} C ${15 * s} ${0 * s} ${8 * s} ${6 * s} ${0 * s} ${4 * s} C ${-6 * s} ${2 * s} ${-12 * s} ${-2 * s} ${-18 * s} ${0 * s} Z`;

    case 'nuqta_single':
      return createRhombicDotPath(0, 0, 16 * s, 70);

    case 'nuqta_double_vert':
      return `${createRhombicDotPath(0, -9 * s, 14 * s, 70)} ${createRhombicDotPath(0, 9 * s, 14 * s, 70)}`;

    case 'nuqta_double_horiz':
      return `${createRhombicDotPath(-9 * s, 0, 14 * s, 70)} ${createRhombicDotPath(9 * s, 0, 14 * s, 70)}`;

    case 'nuqta_triple':
      return `${createRhombicDotPath(0, -10 * s, 13 * s, 70)} ${createRhombicDotPath(-8 * s, 6 * s, 13 * s, 70)} ${createRhombicDotPath(8 * s, 6 * s, 13 * s, 70)}`;

    case 'star_rosette':
      // 8-point Islamic rosette
      return `M ${0 * s} ${-12 * s} L ${3 * s} ${-4 * s} L ${10 * s} ${-10 * s} L ${6 * s} ${-2 * s} L ${14 * s} ${0 * s} L ${6 * s} ${2 * s} L ${10 * s} ${10 * s} L ${3 * s} ${4 * s} L ${0 * s} ${12 * s} L ${-3 * s} ${4 * s} L ${-10 * s} ${10 * s} L ${-6 * s} ${2 * s} L ${-14 * s} ${0 * s} L ${-6 * s} ${-2 * s} L ${-10 * s} ${-10 * s} L ${-3 * s} ${-4 * s} Z`;

    case 'floral_flourish':
      // 4-petal floral filler
      return `M ${0 * s} ${-10 * s} C ${4 * s} ${-6 * s} ${6 * s} ${-4 * s} ${10 * s} ${0 * s} C ${6 * s} ${4 * s} ${4 * s} ${6 * s} ${0 * s} ${10 * s} C ${-4 * s} ${6 * s} ${-6 * s} ${4 * s} ${-10 * s} ${0 * s} C ${-6 * s} ${-4 * s} ${-4 * s} ${-6 * s} ${0 * s} ${-10 * s} Z`;

    case 'meem_filler':
      // Miniature ornamental inverted teardrop meem filler
      return `M ${0 * s} ${-8 * s} C ${5 * s} ${-8 * s} ${8 * s} ${-4 * s} ${6 * s} ${2 * s} C ${4 * s} ${7 * s} ${0 * s} ${12 * s} ${0 * s} ${16 * s} C ${-1 * s} ${11 * s} ${-5 * s} ${6 * s} ${-6 * s} ${1 * s} C ${-8 * s} ${-4 * s} ${-5 * s} ${-8 * s} ${0 * s} ${-8 * s} Z`;

    default:
      return createRhombicDotPath(0, 0, 14 * s, 70);
  }
}

/**
 * Creates a TashkeelItem ready for rendering.
 */
export function createTashkeelItem(
  type: HarakatType,
  x: number,
  y: number,
  scale: number = 1,
  rotation: number = 0,
  parentGlyphId?: string
): TashkeelItem {
  return {
    id: `harakat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    x,
    y,
    scale,
    rotation,
    pathData: getHarakatPath(type, scale),
    parentGlyphId,
  };
}

/**
 * Generates an automatic organic distribution of vowels and ornamental fillers
 * around a bounding box with negative space awareness.
 */
export function generateOrganicTashkeel(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  density: 'off' | 'sparse' | 'balanced' | 'dense' | 'ornamental'
): TashkeelItem[] {
  if (density === 'off') return [];

  const countMap = {
    sparse: 8,
    balanced: 18,
    dense: 32,
    ornamental: 54,
  };

  const count = countMap[density];
  const items: TashkeelItem[] = [];

  const typesPool: HarakatType[] = [
    'fatha', 'kasra', 'damma', 'sukun', 'shaddah',
    'nuqta_single', 'nuqta_double_vert', 'nuqta_triple',
    'star_rosette', 'floral_flourish', 'dagger_alif', 'meem_filler'
  ];

  const halfW = width * 0.44;
  const halfH = height * 0.40;

  // Golden ratio spiral / grid dispersion
  for (let i = 0; i < count; i++) {
    const angle = i * 2.39996; // Golden angle in radians
    const r = Math.sqrt((i + 1) / count);
    const x = centerX + Math.cos(angle) * halfW * r + (Math.random() * 20 - 10);
    const y = centerY + Math.sin(angle) * halfH * r + (Math.random() * 20 - 10);

    const type = typesPool[i % typesPool.length];
    const scale = 0.85 + Math.random() * 0.35;
    const rot = (Math.random() * 20 - 10);

    items.push(createTashkeelItem(type, x, y, scale, rot));
  }

  return items;
}
