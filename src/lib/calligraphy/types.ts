export type ScriptType = 'thuluth' | 'jali_diwani' | 'square_kufic';

export type ShapeType = 
  | 'none'
  | 'circle'
  | 'teardrop'
  | 'mihrab'
  | 'dome'
  | 'oval'
  | 'hexagon'
  | 'heart'
  | 'custom';

export type ToolMode = 
  | 'select'
  | 'sculpt'
  | 'tashkeel'
  | 'shape'
  | 'pen'
  | 'guidelines';

export type TashkeelDensity = 'off' | 'sparse' | 'balanced' | 'dense' | 'ornamental';

export type PaperTextureType = 
  | 'ahar'
  | 'tea_stained'
  | 'aged_manuscript'
  | 'dark_obsidian'
  | 'royal_silk'
  | 'iznik_tile';

export type InkColorType = 
  | 'iron_gall'
  | 'liquid_gold'
  | 'walnut_sepia'
  | 'burnished_copper'
  | 'lapis_lazuli'
  | 'ruby_crimson'
  | 'silver_foil';

export type CanvasAspectRatio = '1:1' | '4:5' | '16:9' | '9:16' | 'a4' | 'custom';

export type SymmetryMode = 'none' | 'muthanna' | 'radial_4' | 'radial_8';

export type VideoStyle = 
  | 'reed_qalam'
  | 'liquid_gold'
  | 'glowing_neon'
  | 'chalkboard'
  | 'oil_canvas';

export type VideoAspectRatio = '9:16' | '1:1' | '16:9';
export type VideoSpeed = 'slow' | 'natural' | 'brisk';

export interface Point {
  x: number;
  y: number;
}

export interface BezierPoint extends Point {
  cp1?: Point;
  cp2?: Point;
}

export interface PathCommand {
  type: 'M' | 'L' | 'C' | 'Q' | 'Z';
  points: number[];
}

export interface StrokeSegment {
  id: string;
  pathData: string;
  width?: number;
  angle?: number;
  order: number;
  type: 'letter' | 'ascender' | 'tail' | 'kashida' | 'nuqta' | 'harakat' | 'border' | 'flourish';
}

export interface CalligraphyGlyph {
  id: string;
  char: string;
  arabicName: string;
  script: ScriptType;
  position: 'isolated' | 'initial' | 'medial' | 'final';
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  elevation: number; // vertical lift/drop from baseline
  kashida: number; // horizontal elongation
  reverseTail?: boolean; // e.g. ya marduda
  alternateIndex: number;
  availableAlternates: string[];
  pathData: string;
  strokes: StrokeSegment[];
  dots: TashkeelItem[];
  vowels: TashkeelItem[];
  colorOverride?: string;
  opacity?: number;
}

export type HarakatType = 
  | 'fatha'
  | 'kasra'
  | 'damma'
  | 'sukun'
  | 'shaddah'
  | 'tanween_fath'
  | 'tanween_damm'
  | 'tanween_kasr'
  | 'dagger_alif'
  | 'maddah'
  | 'nuqta_single'
  | 'nuqta_double_vert'
  | 'nuqta_double_horiz'
  | 'nuqta_triple'
  | 'star_rosette'
  | 'floral_flourish'
  | 'meem_filler';

export interface TashkeelItem {
  id: string;
  type: HarakatType;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  pathData: string;
  parentGlyphId?: string;
}

export interface LayerItem {
  id: string;
  name: string;
  type: 'main_text' | 'secondary_text' | 'tashkeel' | 'border' | 'geometry';
  visible: boolean;
  locked: boolean;
  opacity: number;
  elements: string[]; // ids of contained elements
}

export interface QuranVerse {
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  ayahNumber: number;
  textArabic: string;
  textEnglish: string;
  category: 'fatiha' | 'kursi' | 'ikhlas' | 'muawwidhat' | 'short_surahs' | 'famous_ayahs' | 'duas';
}

export interface DhikrItem {
  id: string;
  title: string;
  textArabic: string;
  transliteration: string;
  meaning: string;
  category: 'daily_dhikr' | 'tasbih' | 'salawat' | 'tahmid' | 'istighfar';
}

export interface AllahName {
  number: number;
  arabic: string;
  transliteration: string;
  meaning: string;
}

export interface KuficCell {
  x: number;
  y: number;
  filled: boolean;
  color?: string;
}

export interface KuficGrid {
  cols: number;
  rows: number;
  cellSize: number;
  cells: boolean[][];
  symmetry: SymmetryMode;
  ruleCheck: {
    blackRatio: number;
    whiteRatio: number;
    isBalanced: boolean;
    isLabyrinthContinuous: boolean;
    brokenPathsCount: number;
  };
}

export interface CompositionState {
  id: string;
  title: string;
  text: string;
  secondaryText: string;
  script: ScriptType;
  shape: ShapeType;
  shapeBounds: {
    cx: number;
    cy: number;
    width: number;
    height: number;
  };
  tashkeelDensity: TashkeelDensity;
  paperTexture: PaperTextureType;
  inkColor: InkColorType;
  customInkHex?: string;
  aspectRatio: CanvasAspectRatio;
  symmetry: SymmetryMode;
  nibAngle: number;
  nibWidth: number;
  nuqtaSize: number;
  kashidaAmount: number;
  shapeFittingStrength: number; // 0 to 1
  concentricRingText?: string;
  showConcentricRing: boolean;
  showArabesqueBorder: boolean;
  showSacredGeometry: boolean;
  geometryPattern: 'khatam_8' | 'girih_tile' | 'rosette_12';
  glyphs: CalligraphyGlyph[];
  floatingTashkeel: TashkeelItem[];
  layers: LayerItem[];
  kuficGrid?: KuficGrid;
  lastModified: number;
}
