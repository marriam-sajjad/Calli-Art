import { CompositionState } from './types';
import { generateThuluthComposition } from './thuluthEngine';
import { generateJaliDiwaniComposition } from './jaliDiwaniEngine';
import { createKuficGrid } from './squareKuficEngine';
import { fitGlyphsToShape } from './shapeFitting';
import { generateOrganicTashkeel } from './tashkeelEngine';

export interface StudioPreset {
  id: string;
  name: string;
  description: string;
  category: 'thuluth' | 'diwani' | 'kufic' | 'ornamental';
  createState: () => CompositionState;
}

export const STUDIO_PRESETS: StudioPreset[] = [
  {
    id: 'bismillah-teardrop',
    name: 'Teardrop Bismillah (Kumathra)',
    description: 'Classical Ottoman teardrop pear composition with soaring vertical ascenders and dense tashkeel.',
    category: 'thuluth',
    createState: () => {
      const bounds = { cx: 500, cy: 480, width: 620, height: 750 };
      const rawGlyphs = generateThuluthComposition('بسم الله الرحمن الرحيم', 500, 520, 1.15, 0.2);
      const fittedGlyphs = fitGlyphsToShape(rawGlyphs, 'teardrop', bounds, 0.75);
      const tashkeel = generateOrganicTashkeel(bounds.cx, bounds.cy, bounds.width * 0.8, bounds.height * 0.7, 'dense');

      return {
        id: 'preset-teardrop-bismillah',
        title: 'Teardrop Bismillah',
        text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        secondaryText: '',
        script: 'thuluth',
        shape: 'teardrop',
        shapeBounds: bounds,
        tashkeelDensity: 'dense',
        paperTexture: 'ahar',
        inkColor: 'liquid_gold',
        aspectRatio: '1:1',
        symmetry: 'none',
        nibAngle: 70,
        nibWidth: 18,
        nuqtaSize: 15,
        kashidaAmount: 0.2,
        shapeFittingStrength: 0.75,
        showConcentricRing: false,
        showArabesqueBorder: true,
        showSacredGeometry: false,
        geometryPattern: 'khatam_8',
        glyphs: fittedGlyphs,
        floatingTashkeel: tashkeel,
        layers: [
          { id: 'layer-text', name: 'Main Calligraphy', type: 'main_text', visible: true, locked: false, opacity: 1, elements: [] },
          { id: 'layer-tashkeel', name: 'Tashkeel & Ornaments', type: 'tashkeel', visible: true, locked: false, opacity: 1, elements: [] },
          { id: 'layer-border', name: 'Border Frame', type: 'border', visible: true, locked: false, opacity: 1, elements: [] }
        ],
        lastModified: Date.now()
      };
    }
  },
  {
    id: 'ayat-kursi-circle',
    name: 'Circular Ayat al-Kursi Medallion',
    description: 'Majestic concentric circular composition with Ayat al-Kursi outer ring and central Allah calligram.',
    category: 'thuluth',
    createState: () => {
      const bounds = { cx: 500, cy: 500, width: 720, height: 720 };
      const rawGlyphs = generateThuluthComposition('الله لا اله الا هو الحي القيوم', 500, 500, 1.1, 0.1);
      const fittedGlyphs = fitGlyphsToShape(rawGlyphs, 'circle', bounds, 0.8);
      const tashkeel = generateOrganicTashkeel(bounds.cx, bounds.cy, bounds.width * 0.75, bounds.height * 0.75, 'ornamental');

      return {
        id: 'preset-kursi-circle',
        title: 'Ayat al-Kursi Medallion',
        text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
        secondaryText: 'لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
        script: 'thuluth',
        shape: 'circle',
        shapeBounds: bounds,
        tashkeelDensity: 'ornamental',
        paperTexture: 'dark_obsidian',
        inkColor: 'liquid_gold',
        aspectRatio: '1:1',
        symmetry: 'none',
        nibAngle: 68,
        nibWidth: 20,
        nuqtaSize: 16,
        kashidaAmount: 0.1,
        shapeFittingStrength: 0.8,
        concentricRingText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
        showConcentricRing: true,
        showArabesqueBorder: true,
        showSacredGeometry: true,
        geometryPattern: 'khatam_8',
        glyphs: fittedGlyphs,
        floatingTashkeel: tashkeel,
        layers: [
          { id: 'layer-text', name: 'Center Calligraphy', type: 'main_text', visible: true, locked: false, opacity: 1, elements: [] },
          { id: 'layer-ring', name: 'Concentric Ring', type: 'border', visible: true, locked: false, opacity: 1, elements: [] },
          { id: 'layer-geometry', name: 'Sacred Star Pattern', type: 'geometry', visible: true, locked: false, opacity: 0.4, elements: [] }
        ],
        lastModified: Date.now()
      };
    }
  },
  {
    id: 'mihrab-shahada',
    name: 'Mihrab Arch Shahada',
    description: 'Pointed Islamic prayer niche arch fitted with the Kalimah Tawheed.',
    category: 'thuluth',
    createState: () => {
      const bounds = { cx: 500, cy: 490, width: 600, height: 780 };
      const rawGlyphs = generateThuluthComposition('لا اله الا الله محمد رسول الله', 500, 520, 1.05, 0.15);
      const fittedGlyphs = fitGlyphsToShape(rawGlyphs, 'mihrab', bounds, 0.8);
      const tashkeel = generateOrganicTashkeel(bounds.cx, bounds.cy, bounds.width * 0.8, bounds.height * 0.75, 'balanced');

      return {
        id: 'preset-mihrab-shahada',
        title: 'Mihrab Shahada',
        text: 'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ',
        secondaryText: '',
        script: 'thuluth',
        shape: 'mihrab',
        shapeBounds: bounds,
        tashkeelDensity: 'balanced',
        paperTexture: 'tea_stained',
        inkColor: 'iron_gall',
        aspectRatio: '4:5',
        symmetry: 'none',
        nibAngle: 70,
        nibWidth: 18,
        nuqtaSize: 15,
        kashidaAmount: 0.15,
        shapeFittingStrength: 0.8,
        showConcentricRing: false,
        showArabesqueBorder: true,
        showSacredGeometry: false,
        geometryPattern: 'girih_tile',
        glyphs: fittedGlyphs,
        floatingTashkeel: tashkeel,
        layers: [
          { id: 'layer-text', name: 'Main Text', type: 'main_text', visible: true, locked: false, opacity: 1, elements: [] },
          { id: 'layer-arch', name: 'Mihrab Frame', type: 'border', visible: true, locked: false, opacity: 1, elements: [] }
        ],
        lastModified: Date.now()
      };
    }
  },
  {
    id: 'kufic-allah-mandala',
    name: 'Square Kufic Allah 4-Fold Rotary Seal',
    description: 'Exact 2D geometric labyrinth seal with 4-fold rotational symmetry and 50/50 balance.',
    category: 'kufic',
    createState: () => {
      const grid = createKuficGrid('allah', 'radial_4');
      return {
        id: 'preset-kufic-allah',
        title: 'Kufic Allah 4-Fold Seal',
        text: 'الله',
        secondaryText: '',
        script: 'square_kufic',
        shape: 'none',
        shapeBounds: { cx: 500, cy: 500, width: 600, height: 600 },
        tashkeelDensity: 'off',
        paperTexture: 'aged_manuscript',
        inkColor: 'iron_gall',
        aspectRatio: '1:1',
        symmetry: 'radial_4',
        nibAngle: 90,
        nibWidth: 22,
        nuqtaSize: 18,
        kashidaAmount: 0,
        shapeFittingStrength: 0,
        showConcentricRing: false,
        showArabesqueBorder: false,
        showSacredGeometry: false,
        geometryPattern: 'khatam_8',
        glyphs: [],
        floatingTashkeel: [],
        kuficGrid: grid,
        layers: [
          { id: 'layer-kufic', name: 'Geometric Grid', type: 'main_text', visible: true, locked: false, opacity: 1, elements: [] }
        ],
        lastModified: Date.now()
      };
    }
  },
  {
    id: 'diwani-alhamdulillah',
    name: 'Jali Diwani Alhamdulillah Wave',
    description: 'Curved Ottoman chancery wave with soaring fish-hook finials and dense diamond jewels.',
    category: 'diwani',
    createState: () => {
      const bounds = { cx: 500, cy: 500, width: 700, height: 500 };
      const rawGlyphs = generateJaliDiwaniComposition('الحمد لله رب العالمين', 500, 480, 1.2);
      const tashkeel = generateOrganicTashkeel(bounds.cx, bounds.cy, bounds.width * 0.85, bounds.height * 0.75, 'ornamental');

      return {
        id: 'preset-diwani-alhamd',
        title: 'Jali Diwani Tahmid',
        text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        secondaryText: '',
        script: 'jali_diwani',
        shape: 'none',
        shapeBounds: bounds,
        tashkeelDensity: 'ornamental',
        paperTexture: 'royal_silk',
        inkColor: 'burnished_copper',
        aspectRatio: '16:9',
        symmetry: 'none',
        nibAngle: 82,
        nibWidth: 22,
        nuqtaSize: 14,
        kashidaAmount: 0,
        shapeFittingStrength: 0,
        showConcentricRing: false,
        showArabesqueBorder: true,
        showSacredGeometry: false,
        geometryPattern: 'rosette_12',
        glyphs: rawGlyphs,
        floatingTashkeel: tashkeel,
        layers: [
          { id: 'layer-text', name: 'Diwani Script', type: 'main_text', visible: true, locked: false, opacity: 1, elements: [] },
          { id: 'layer-jewels', name: 'Ornamental Jewels', type: 'tashkeel', visible: true, locked: false, opacity: 1, elements: [] }
        ],
        lastModified: Date.now()
      };
    }
  },
  {
    id: 'interlocking-heart-flourish',
    name: 'Interlocking Heart Duo',
    description: 'Romantic heart contour for wedding or two-name calligraphic interlocking composition.',
    category: 'thuluth',
    createState: () => {
      const bounds = { cx: 500, cy: 480, width: 650, height: 650 };
      const rawGlyphs = generateThuluthComposition('محمد و خديجة', 500, 500, 1.15, 0.2);
      const fittedGlyphs = fitGlyphsToShape(rawGlyphs, 'heart', bounds, 0.85);
      const tashkeel = generateOrganicTashkeel(bounds.cx, bounds.cy, bounds.width * 0.75, bounds.height * 0.7, 'balanced');

      return {
        id: 'preset-interlocking-heart',
        title: 'Interlocking Heart Calligram',
        text: 'مُحَمَّد وَ خَدِيجَة',
        secondaryText: '',
        script: 'thuluth',
        shape: 'heart',
        shapeBounds: bounds,
        tashkeelDensity: 'balanced',
        paperTexture: 'ahar',
        inkColor: 'ruby_crimson',
        aspectRatio: '1:1',
        symmetry: 'none',
        nibAngle: 70,
        nibWidth: 18,
        nuqtaSize: 15,
        kashidaAmount: 0.2,
        shapeFittingStrength: 0.85,
        showConcentricRing: false,
        showArabesqueBorder: true,
        showSacredGeometry: false,
        geometryPattern: 'khatam_8',
        glyphs: fittedGlyphs,
        floatingTashkeel: tashkeel,
        layers: [
          { id: 'layer-text', name: 'Heart Inscription', type: 'main_text', visible: true, locked: false, opacity: 1, elements: [] },
          { id: 'layer-frame', name: 'Heart Contour', type: 'border', visible: true, locked: false, opacity: 1, elements: [] }
        ],
        lastModified: Date.now()
      };
    }
  }
];
