import { Point } from './types';

/**
 * Creates an authentic chisel-nib rhombic nuqta path string.
 * Traditional qalam nib angle is typically ~65°-70° for Thuluth.
 */
export function createRhombicDotPath(
  cx: number, 
  cy: number, 
  size: number = 14, 
  angleDeg: number = 70
): string {
  const rad = (angleDeg * Math.PI) / 180;
  const half = size / 2;
  const perp = rad + Math.PI / 2;

  // 4 corners of the rhombic dot created by the pen nib
  const dx1 = Math.cos(rad) * half;
  const dy1 = Math.sin(rad) * half;
  const dx2 = Math.cos(perp) * half;
  const dy2 = Math.sin(perp) * half;

  const p1 = { x: cx + dx1 + dx2, y: cy + dy1 + dy2 };
  const p2 = { x: cx - dx1 + dx2, y: cy - dy1 + dy2 };
  const p3 = { x: cx - dx1 - dx2, y: cy - dy1 - dy2 };
  const p4 = { x: cx + dx1 - dx2, y: cy + dy1 - dy2 };

  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)} L ${p4.x.toFixed(2)} ${p4.y.toFixed(2)} Z`;
}

/**
 * Creates a calligraphic ribbon path from a spine curve given nib angle and width.
 * Simulates how a traditional reed pen (Qalam) deposits ink along a gesture.
 */
export function createChiselStrokePath(
  points: { x: number; y: number; cp1?: Point; cp2?: Point }[],
  nibWidth: number = 18,
  nibAngleDeg: number = 68
): string {
  if (points.length < 2) return '';

  const rad = (nibAngleDeg * Math.PI) / 180;
  const halfW = nibWidth / 2;
  const dx = Math.cos(rad) * halfW;
  const dy = Math.sin(rad) * halfW;

  // We build the top edge and bottom edge of the stroke ribbon
  const topEdge: Point[] = [];
  const bottomEdge: Point[] = [];

  for (const pt of points) {
    topEdge.push({ x: pt.x - dx, y: pt.y - dy });
    bottomEdge.push({ x: pt.x + dx, y: pt.y + dy });
  }

  // Generate SVG path: top edge forward, bottom edge backward, closed loop
  let d = `M ${topEdge[0].x.toFixed(2)} ${topEdge[0].y.toFixed(2)}`;
  
  for (let i = 1; i < topEdge.length; i++) {
    const prev = topEdge[i - 1];
    const curr = topEdge[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    d += ` Q ${prev.x.toFixed(2)} ${prev.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }
  const lastTop = topEdge[topEdge.length - 1];
  d += ` L ${lastTop.x.toFixed(2)} ${lastTop.y.toFixed(2)}`;

  // Connect to last bottom
  const lastBottom = bottomEdge[bottomEdge.length - 1];
  d += ` L ${lastBottom.x.toFixed(2)} ${lastBottom.y.toFixed(2)}`;

  for (let i = bottomEdge.length - 2; i >= 0; i--) {
    const prev = bottomEdge[i + 1];
    const curr = bottomEdge[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    d += ` Q ${prev.x.toFixed(2)} ${prev.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }
  d += ' Z';

  return d;
}

/**
 * Transforms an SVG path string by translating, scaling, and rotating.
 */
export function transformPath(
  pathData: string, 
  tx: number, 
  ty: number, 
  sx: number = 1, 
  sy: number = 1, 
  rotDeg: number = 0,
  cx: number = 0,
  cy: number = 0
): string {
  if (!pathData) return '';
  const rad = (rotDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const transformPoint = (x: number, y: number): Point => {
    // Relative to center
    const rx = (x - cx) * sx;
    const ry = (y - cy) * sy;
    // Rotate
    const rotX = rx * cos - ry * sin;
    const rotY = rx * sin + ry * cos;
    // Translate back and apply tx, ty
    return {
      x: rotX + cx + tx,
      y: rotY + cy + ty,
    };
  };

  // Simple SVG path token parser
  return pathData.replace(/([A-DF-Za-df-z])([^A-DF-Za-df-z]*)/g, (_, cmd, rest) => {
    const nums = (rest.trim().match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
    if (nums.length === 0) return cmd;

    const transformedNums: number[] = [];
    const command = cmd.toUpperCase();

    if (command === 'M' || command === 'L' || command === 'T') {
      for (let i = 0; i < nums.length; i += 2) {
        if (i + 1 < nums.length) {
          const pt = transformPoint(nums[i], nums[i + 1]);
          transformedNums.push(Number(pt.x.toFixed(2)), Number(pt.y.toFixed(2)));
        }
      }
    } else if (command === 'C') {
      for (let i = 0; i < nums.length; i += 6) {
        if (i + 5 < nums.length) {
          const cp1 = transformPoint(nums[i], nums[i + 1]);
          const cp2 = transformPoint(nums[i + 2], nums[i + 3]);
          const pt = transformPoint(nums[i + 4], nums[i + 5]);
          transformedNums.push(
            Number(cp1.x.toFixed(2)), Number(cp1.y.toFixed(2)),
            Number(cp2.x.toFixed(2)), Number(cp2.y.toFixed(2)),
            Number(pt.x.toFixed(2)), Number(pt.y.toFixed(2))
          );
        }
      }
    } else if (command === 'Q' || command === 'S') {
      for (let i = 0; i < nums.length; i += 4) {
        if (i + 3 < nums.length) {
          const cp = transformPoint(nums[i], nums[i + 1]);
          const pt = transformPoint(nums[i + 2], nums[i + 3]);
          transformedNums.push(
            Number(cp.x.toFixed(2)), Number(cp.y.toFixed(2)),
            Number(pt.x.toFixed(2)), Number(pt.y.toFixed(2))
          );
        }
      }
    } else if (command === 'H') {
      for (const n of nums) {
        const pt = transformPoint(n, cy);
        transformedNums.push(Number(pt.x.toFixed(2)));
      }
    } else if (command === 'V') {
      for (const n of nums) {
        const pt = transformPoint(cx, n);
        transformedNums.push(Number(pt.y.toFixed(2)));
      }
    } else {
      return cmd + ' ' + rest.trim();
    }

    return `${cmd} ${transformedNums.join(' ')}`;
  });
}

/**
 * Calculates approximate axis-aligned bounding box of an SVG path.
 */
export function getPathBoundingBox(pathData: string): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  const nums = (pathData.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
  if (nums.length < 2) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < nums.length - 1; i += 2) {
    const x = nums[i];
    const y = nums[i + 1];
    if (!isNaN(x) && !isNaN(y)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (minX === Infinity) {
    minX = 0; minY = 0; maxX = 0; maxY = 0;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Samples points along an SVG path for video recording and stroke animation.
 */
export function samplePointsFromPath(pathData: string, sampleCount: number = 60): Point[] {
  const nums = (pathData.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
  const rawPoints: Point[] = [];
  for (let i = 0; i < nums.length - 1; i += 2) {
    rawPoints.push({ x: nums[i], y: nums[i + 1] });
  }

  if (rawPoints.length <= 1) return rawPoints;

  const result: Point[] = [];
  for (let s = 0; s < sampleCount; s++) {
    const t = s / (sampleCount - 1);
    const index = Math.min(Math.floor(t * (rawPoints.length - 1)), rawPoints.length - 2);
    const segT = (t * (rawPoints.length - 1)) - index;
    const p0 = rawPoints[index];
    const p1 = rawPoints[index + 1];
    result.push({
      x: p0.x + (p1.x - p0.x) * segT,
      y: p0.y + (p1.y - p0.y) * segT,
    });
  }
  return result;
}
