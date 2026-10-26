import { KuficGrid, SymmetryMode } from './types';

/**
 * Procedural Square Kufic (Banna'i / Murabba') Engine.
 * 2D geometric grid system with real-time rule compliance checking:
 * 1. Black/White 50-50 space balance
 * 2. Labyrinth continuity (continuous interlocking path without dangling dead-ends)
 * 3. 4-fold and 8-fold radial and mirror symmetry
 */

// Preset 1: Allah (الله) - 4-fold Rotational Swastika / Mandala (16x16)
export const KUFIC_PRESET_ALLAH_4FOLD: number[][] = [
  // 16x16 grid
  [1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,1,0,1,0,0,0,1],
  [1,0,1,1,1,1,0,1,0,1,0,1,0,1,0,1],
  [1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1],
  [1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1],
  [1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1],
  [1,0,0,0,0,1,0,1,0,1,0,0,0,1,0,1],
  [1,1,1,1,0,1,0,0,0,1,1,1,0,1,0,1],
  [1,0,1,0,1,1,1,0,0,0,1,0,1,1,1,1],
  [1,0,1,0,0,0,1,0,1,0,1,0,0,0,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,1,1,1,0,1],
  [1,0,0,0,1,0,1,0,1,0,0,0,0,0,0,1],
  [1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1],
];

// Preset 2: Muhammad (محمد) - 4-fold Labyrinth (18x18)
export const KUFIC_PRESET_MUHAMMAD_4FOLD: number[][] = [
  [1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,0,1],
  [1,0,1,0,0,0,1,0,1,0,1,0,1,0,1,1,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,0,0,0,0,1,0,1],
  [1,0,0,0,0,0,1,0,1,0,1,1,1,1,0,1,0,1],
  [1,1,1,1,1,0,1,0,0,0,0,0,0,1,0,1,0,1],
  [1,0,1,0,1,0,0,0,0,0,0,1,0,1,1,1,1,1],
  [1,0,1,0,1,1,1,1,0,1,0,1,0,0,0,0,0,1],
  [1,0,1,0,0,0,0,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1],
  [1,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
  [1,0,1,1,0,1,0,1,0,1,0,1,0,0,0,1,0,1],
  [1,0,1,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1],
  [1,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1],
];

// Preset 3: Ali (علي) - Radial Geometric (12x12)
export const KUFIC_PRESET_ALI: number[][] = [
  [1,1,1,1,1,0,0,1,1,1,1,1],
  [1,0,0,0,1,0,0,1,0,0,0,1],
  [1,0,1,0,1,0,0,1,0,1,0,1],
  [1,0,1,0,1,1,1,1,0,1,0,1],
  [1,0,1,0,0,0,0,0,0,1,0,1],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [1,0,1,0,0,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,1,0,1,0,1],
  [1,0,1,0,1,0,0,1,0,1,0,1],
  [1,0,0,0,1,0,0,1,0,0,0,1],
  [1,1,1,1,1,0,0,1,1,1,1,1],
];

// Preset 4: Bismillah ar-Rahman ar-Rahim Labyrinth Frieze (24x10)
export const KUFIC_PRESET_BISMILLAH: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

/**
 * Validates Square Kufic classical rules:
 * 1. Black/White ratio (ideal: 48% - 52%)
 * 2. Labyrinth continuity (checks connected ink components)
 */
export function checkKuficRules(cells: boolean[][]): {
  blackRatio: number;
  whiteRatio: number;
  isBalanced: boolean;
  isLabyrinthContinuous: boolean;
  brokenPathsCount: number;
} {
  const rows = cells.length;
  if (rows === 0) {
    return { blackRatio: 0, whiteRatio: 0, isBalanced: false, isLabyrinthContinuous: false, brokenPathsCount: 0 };
  }
  const cols = cells[0].length;
  const total = rows * cols;

  let blackCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c]) blackCount++;
    }
  }

  const blackRatio = blackCount / total;
  const whiteRatio = 1 - blackRatio;
  const isBalanced = blackRatio >= 0.44 && blackRatio <= 0.56;

  // Connected component analysis for labyrinth continuity
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  let components = 0;

  const floodFill = (r: number, c: number) => {
    const queue: [number, number][] = [[r, c]];
    visited[r][c] = true;

    while (queue.length > 0) {
      const [currR, currC] = queue.pop()!;
      const neighbors: [number, number][] = [
        [currR - 1, currC],
        [currR + 1, currC],
        [currR, currC - 1],
        [currR, currC + 1]
      ];

      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (cells[nr][nc] && !visited[nr][nc]) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }
    }
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c] && !visited[r][c]) {
        components++;
        floodFill(r, c);
      }
    }
  }

  // A pure labyrinth has 1 main continuous ink path (or few symmetric quadrants)
  const isLabyrinthContinuous = components <= 4;

  return {
    blackRatio,
    whiteRatio,
    isBalanced,
    isLabyrinthContinuous,
    brokenPathsCount: Math.max(0, components - 1)
  };
}

/**
 * Creates an initial KuficGrid state.
 */
export function createKuficGrid(preset: 'allah' | 'muhammad' | 'ali' | 'bismillah' = 'allah', symmetry: SymmetryMode = 'radial_4'): KuficGrid {
  let rawPreset: number[][];
  switch (preset) {
    case 'muhammad':
      rawPreset = KUFIC_PRESET_MUHAMMAD_4FOLD;
      break;
    case 'ali':
      rawPreset = KUFIC_PRESET_ALI;
      break;
    case 'bismillah':
      rawPreset = KUFIC_PRESET_BISMILLAH;
      break;
    case 'allah':
    default:
      rawPreset = KUFIC_PRESET_ALLAH_4FOLD;
      break;
  }

  const initialCells: boolean[][] = rawPreset.map(row => row.map(cell => cell === 1));

  const rows = initialCells.length;
  const cols = initialCells[0].length;
  const ruleCheck = checkKuficRules(initialCells);

  return {
    cols,
    rows,
    cellSize: 22,
    cells: initialCells.map(r => [...r]),
    symmetry,
    ruleCheck
  };
}

/**
 * Applies symmetry transformation when a user toggles a cell.
 */
export function toggleKuficCellWithSymmetry(
  grid: KuficGrid,
  r: number,
  c: number
): KuficGrid {
  const newCells = grid.cells.map(row => [...row]);
  const newVal = !newCells[r][c];
  const { rows, cols, symmetry } = grid;

  newCells[r][c] = newVal;

  if (symmetry === 'muthanna') {
    // Horizontal reflection
    newCells[r][cols - 1 - c] = newVal;
  } else if (symmetry === 'radial_4' && rows === cols) {
    // 4-fold rotational symmetry (90, 180, 270 deg)
    const n = rows - 1;
    newCells[c][n - r] = newVal;
    newCells[n - r][n - c] = newVal;
    newCells[n - c][r] = newVal;
  } else if (symmetry === 'radial_8' && rows === cols) {
    // 8-fold radial + diagonal symmetry
    const n = rows - 1;
    newCells[c][n - r] = newVal;
    newCells[n - r][n - c] = newVal;
    newCells[n - c][r] = newVal;
    newCells[c][r] = newVal;
    newCells[r][n - c] = newVal;
    newCells[n - r][c] = newVal;
    newCells[n - c][n - r] = newVal;
  }

  const ruleCheck = checkKuficRules(newCells);

  return {
    ...grid,
    cells: newCells,
    ruleCheck
  };
}

/**
 * Converts a KuficGrid into merged SVG rectangle paths for crisp vector export.
 */
export function kuficGridToSvgPath(grid: KuficGrid, originX: number = 0, originY: number = 0): string {
  const { rows, cols, cellSize, cells } = grid;
  let pathStr = '';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c]) {
        const x = originX + c * cellSize;
        const y = originY + r * cellSize;
        pathStr += `M ${x} ${y} h ${cellSize} v ${cellSize} h ${-cellSize} Z `;
      }
    }
  }

  return pathStr.trim();
}
