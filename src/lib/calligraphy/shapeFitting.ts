import { ShapeType, CalligraphyGlyph, Point } from './types';

/**
 * Procedural Shape Boundary & Fitting Engine.
 * Evaluates contour limits at height Y, morphs glyph baselines,
 * and stretches vertical ascenders so they elegantly kiss the ceiling of the shape.
 */

export interface ShapeBounds {
  cx: number;
  cy: number;
  width: number;
  height: number;
}

/**
 * Returns horizontal minX and maxX available inside the shape at vertical coordinate Y.
 */
export function getShapeWidthAtY(shape: ShapeType, y: number, bounds: ShapeBounds): { minX: number; maxX: number; isValid: boolean } {
  const { cx, cy, width, height } = bounds;
  const halfW = width / 2;
  const halfH = height / 2;

  // Normalized y from -1 (top) to +1 (bottom)
  const ny = (y - cy) / halfH;

  if (ny < -1 || ny > 1) {
    return { minX: cx, maxX: cx, isValid: false };
  }

  switch (shape) {
    case 'circle': {
      // Circle equation: x^2 + y^2 = 1 => x = sqrt(1 - y^2)
      const radW = Math.sqrt(Math.max(0, 1 - ny * ny)) * halfW;
      return { minX: cx - radW, maxX: cx + radW, isValid: true };
    }

    case 'oval': {
      const radW = Math.sqrt(Math.max(0, 1 - ny * ny)) * halfW;
      return { minX: cx - radW, maxX: cx + radW, isValid: true };
    }

    case 'teardrop': {
      // Kumathra: bulbous bottom (0 to 1), tapering pointed top (-1 to 0)
      let factor = 1;
      if (ny <= 0) {
        // Linear taper to apex at ny = -1
        factor = (ny + 1); // 0 at top, 1 at middle
      } else {
        // Circular round bottom
        factor = Math.sqrt(Math.max(0, 1 - ny * ny));
      }
      const curW = halfW * factor;
      return { minX: cx - curW, maxX: cx + curW, isValid: true };
    }

    case 'mihrab': {
      // Pointed arch: straight vertical walls from ny = 0 to 1, pointed ogive arch from ny = -1 to 0
      let factor = 1;
      if (ny <= 0) {
        // Ogive arch
        factor = Math.cos((ny) * (Math.PI / 2));
      } else {
        // Vertical walls
        factor = 1;
      }
      const curW = halfW * factor;
      return { minX: cx - curW, maxX: cx + curW, isValid: true };
    }

    case 'dome': {
      // Bulbous Islamic cupola: widens slightly near ny = 0.2, tapers to pointed pinnacle at ny = -1
      let factor = 1;
      if (ny <= 0) {
        factor = Math.pow(ny + 1, 0.7);
      } else {
        factor = Math.cos(ny * (Math.PI / 2.3));
      }
      const curW = halfW * Math.min(1, Math.max(0, factor));
      return { minX: cx - curW, maxX: cx + curW, isValid: true };
    }

    case 'hexagon': {
      // Regular hexagon
      const factor = 1 - Math.abs(ny) * 0.45;
      const curW = halfW * Math.max(0, factor);
      return { minX: cx - curW, maxX: cx + curW, isValid: true };
    }

    case 'heart': {
      // Interlocking twin-lobe heart
      let factor = 1;
      if (ny <= -0.5) {
        // Lobe dip in center
        factor = 0.85;
      } else if (ny > 0) {
        // Bottom taper to point
        factor = 1 - ny;
      }
      const curW = halfW * Math.max(0.1, factor);
      return { minX: cx - curW, maxX: cx + curW, isValid: true };
    }

    case 'none':
    default:
      return { minX: cx - halfW, maxX: cx + halfW, isValid: true };
  }
}

/**
 * Generates an SVG path representing the boundary outline of the selected shape.
 */
export function getShapeOutlinePath(shape: ShapeType, bounds: ShapeBounds): string {
  const { cx, cy, width, height } = bounds;
  const hw = width / 2;
  const hh = height / 2;

  switch (shape) {
    case 'circle': {
      const r = Math.min(hw, hh);
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 0 ${cx} ${cy + r} A ${r} ${r} 0 1 0 ${cx} ${cy - r} Z`;
    }

    case 'oval': {
      return `M ${cx} ${cy - hh} A ${hw} ${hh} 0 1 0 ${cx} ${cy + hh} A ${hw} ${hh} 0 1 0 ${cx} ${cy - hh} Z`;
    }

    case 'teardrop': {
      // Pointed apex at (cx, cy - hh), circular bottom
      const topY = cy - hh;
      const botY = cy + hh;
      return `M ${cx} ${topY} C ${cx + hw * 0.9} ${cy - hh * 0.3} ${cx + hw} ${cy + hh * 0.4} ${cx} ${botY} C ${cx - hw} ${cy + hh * 0.4} ${cx - hw * 0.9} ${cy - hh * 0.3} ${cx} ${topY} Z`;
    }

    case 'mihrab': {
      const left = cx - hw;
      const right = cx + hw;
      const top = cy - hh;
      const bottom = cy + hh;
      const springY = cy; // Arch springs from midpoint
      return `M ${left} ${bottom} L ${right} ${bottom} L ${right} ${springY} C ${right} ${springY - hh * 0.6} ${cx + hw * 0.3} ${top + hh * 0.1} ${cx} ${top} C ${cx - hw * 0.3} ${top + hh * 0.1} ${left} ${springY - hh * 0.6} ${left} ${springY} Z`;
    }

    case 'dome': {
      const left = cx - hw;
      const right = cx + hw;
      const top = cy - hh;
      const bottom = cy + hh;
      return `M ${left} ${bottom} L ${right} ${bottom} C ${right + 15} ${cy} ${cx + hw * 0.6} ${cy - hh * 0.5} ${cx} ${top} C ${cx - hw * 0.6} ${cy - hh * 0.5} ${left - 15} ${cy} ${left} ${bottom} Z`;
    }

    case 'hexagon': {
      const pts: Point[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (i * 60 - 30) * Math.PI / 180;
        pts.push({ x: cx + hw * Math.cos(a), y: cy + hh * Math.sin(a) });
      }
      return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
    }

    case 'heart': {
      const top = cy - hh;
      const bot = cy + hh;
      return `M ${cx} ${bot} C ${cx - hw * 1.2} ${cy + hh * 0.2} ${cx - hw * 1.1} ${top} ${cx} ${top + hh * 0.4} C ${cx + hw * 1.1} ${top} ${cx + hw * 1.2} ${cy + hh * 0.2} ${cx} ${bot} Z`;
    }

    case 'none':
    default:
      return '';
  }
}

/**
 * Automatically fits and stretches glyphs to balance inside a shape contour:
 * - Arranges glyphs with bottom-up weighting
 * - Stretches tall vertical strokes (Alifs, Lams, Kaffs) to reach the ceiling
 * - Tightens word clusters to fit snugly within the contour
 */
export function fitGlyphsToShape(
  glyphs: CalligraphyGlyph[],
  shape: ShapeType,
  bounds: ShapeBounds,
  strength: number = 0.85
): CalligraphyGlyph[] {
  if (shape === 'none' || glyphs.length === 0 || strength <= 0) {
    return glyphs;
  }

  const { cx, cy, height } = bounds;
  const bottomTargetY = cy + height * 0.28;

  return glyphs.map((glyph, index) => {
    // Current baseline
    const targetY = bottomTargetY - glyph.elevation;
    const { minX, maxX } = getShapeWidthAtY(shape, targetY, bounds);
    const availableWidth = maxX - minX;

    // Distribute horizontally according to order
    const total = glyphs.length;
    const t = total > 1 ? index / (total - 1) : 0.5;
    // Right-to-left layout: index 0 is on the right
    const targetX = maxX - availableWidth * (0.15 + t * 0.7);

    // Compute headroom at this horizontal position for ascender stretching
    const { minX: topMinX, maxX: topMaxX } = getShapeWidthAtY(shape, cy - height * 0.35, bounds);
    const isAscender = ['ا', 'ل', 'لا', 'ك', 'ط'].includes(glyph.char);

    // If letter has tall vertical ascender, scale Y upward to touch shape ceiling
    let scaleY = glyph.scaleY;
    if (isAscender && strength > 0.3) {
      scaleY = glyph.scaleY * (1 + 0.35 * strength);
    }

    return {
      ...glyph,
      x: glyph.x * (1 - strength) + targetX * strength,
      y: glyph.y * (1 - strength) + targetY * strength,
      scaleY,
      dots: glyph.dots.map(d => ({
        ...d,
        x: d.x + (targetX - glyph.x) * strength,
        y: d.y + (targetY - glyph.y) * strength,
      }))
    };
  });
}
