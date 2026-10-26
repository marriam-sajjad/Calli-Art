'use client';

import React, { useState } from 'react';
import { 
  Type, 
  Layers, 
  Palette, 
  Sparkles, 
  Sliders, 
  Trash2, 
  RotateCw, 
  Move, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Maximize,
  Compass,
  Check
} from 'lucide-react';
import { 
  CompositionState, 
  CalligraphyGlyph, 
  TashkeelItem, 
  TashkeelDensity, 
  PaperTextureType, 
  InkColorType, 
  CanvasAspectRatio 
} from '@/lib/calligraphy/types';
import KuficRuleInspector from './KuficRuleInspector';

interface StudioRightSidebarProps {
  composition: CompositionState;
  onTextChange: (newText: string) => void;
  onTashkeelDensityChange: (density: TashkeelDensity) => void;
  onShapeFittingStrengthChange: (strength: number) => void;
  onPaperTextureChange: (paper: PaperTextureType) => void;
  onInkColorChange: (ink: InkColorType) => void;
  onAspectRatioChange: (ratio: CanvasAspectRatio) => void;
  selectedGlyph: CalligraphyGlyph | null;
  onUpdateSelectedGlyph: (glyph: CalligraphyGlyph) => void;
  onDeleteSelectedGlyph: (id: string) => void;
  selectedTashkeel: TashkeelItem | null;
  onUpdateSelectedTashkeel: (item: TashkeelItem) => void;
  onDeleteSelectedTashkeel: (id: string) => void;
  onToggleLayerVisibility: (layerId: string) => void;
  onToggleConcentricRing: () => void;
  onConcentricRingTextChange: (text: string) => void;
  onToggleSacredGeometry: () => void;
  onGeometryPatternChange: (pattern: 'khatam_8' | 'girih_tile' | 'rosette_12') => void;
  // Kufic actions
  onKuficSymmetryChange: (sym: any) => void;
  onKuficLoadPreset: (preset: any) => void;
  onKuficClear: () => void;
}

export default function StudioRightSidebar({
  composition,
  onTextChange,
  onTashkeelDensityChange,
  onShapeFittingStrengthChange,
  onPaperTextureChange,
  onInkColorChange,
  onAspectRatioChange,
  selectedGlyph,
  onUpdateSelectedGlyph,
  onDeleteSelectedGlyph,
  selectedTashkeel,
  onUpdateSelectedTashkeel,
  onDeleteSelectedTashkeel,
  onToggleLayerVisibility,
  onToggleConcentricRing,
  onConcentricRingTextChange,
  onToggleSacredGeometry,
  onGeometryPatternChange,
  onKuficSymmetryChange,
  onKuficLoadPreset,
  onKuficClear
}: StudioRightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'inspector' | 'materials' | 'layers'>('text');

  const paperOptions: { id: PaperTextureType; name: string; color: string; desc: string }[] = [
    { id: 'ahar', name: 'Ahar Cream', color: '#FBF7EE', desc: 'Glossy traditional egg-varnish sizing' },
    { id: 'tea_stained', name: 'Tea-Stained Vellum', color: '#F2E8D5', desc: 'Warm organic antique tone' },
    { id: 'aged_manuscript', name: 'Aged Manuscript', color: '#EAD7BA', desc: 'Historical manuscript with patina' },
    { id: 'dark_obsidian', name: 'Dark Obsidian Slate', color: '#101218', desc: 'Deep black velvet for gold ink' },
    { id: 'royal_silk', name: 'Royal Silk Weave', color: '#FAF6ED', desc: 'Tactile damask texture' },
    { id: 'iznik_tile', name: 'Iznik Glazed Tile', color: '#EAF3F7', desc: 'Ceramic luster background' },
  ];

  const inkOptions: { id: InkColorType; name: string; hex: string }[] = [
    { id: 'liquid_gold', name: 'Liquid Gold Leaf', hex: '#D4AF37' },
    { id: 'iron_gall', name: 'Iron Gall Black', hex: '#141416' },
    { id: 'walnut_sepia', name: 'Walnut Sepia', hex: '#4a2e18' },
    { id: 'burnished_copper', name: 'Burnished Copper', hex: '#b87333' },
    { id: 'lapis_lazuli', name: 'Lapis Lazuli Blue', hex: '#183b6b' },
    { id: 'ruby_crimson', name: 'Ruby Vermilion', hex: '#801824' },
    { id: 'silver_foil', name: 'Platinum Silver Foil', hex: '#c5c8d0' },
  ];

  const aspectRatios: { id: CanvasAspectRatio; label: string }[] = [
    { id: '1:1', label: '1:1 Square' },
    { id: '4:5', label: '4:5 Portrait' },
    { id: '16:9', label: '16:9 Banner' },
    { id: '9:16', label: '9:16 Reel' },
    { id: 'a4', label: 'A4 Art Print' },
  ];

  const diacritics = ['َ', 'ِ', 'ُ', 'ْ', 'ّ', 'ً', 'ٍ', 'ٌ', 'ٰ', 'ٓ'];

  return (
    <aside className="w-80 sm:w-88 bg-[#0c0d10] border-l border-[#222634] flex flex-col h-full select-none z-30 text-stone-200">
      
      {/* Tab Navigation */}
      <div className="flex border-b border-[#222634] bg-[#12141c]">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'text'
              ? 'border-amber-500 text-amber-300 font-semibold bg-[#181b26]'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Composition</span>
        </button>

        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border-b-2 relative ${
            activeTab === 'inspector'
              ? 'border-amber-500 text-amber-300 font-semibold bg-[#181b26]'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Inspector</span>
          {selectedGlyph && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-2 right-3" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'materials'
              ? 'border-amber-500 text-amber-300 font-semibold bg-[#181b26]'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Paper & Ink</span>
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'layers'
              ? 'border-amber-500 text-amber-300 font-semibold bg-[#181b26]'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Layers</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        
        {/* ================= TAB 1: TEXT & COMPOSITION ================= */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            
            {/* If Square Kufic is active, show the Kufic Rule Inspector */}
            {composition.script === 'square_kufic' && composition.kuficGrid && (
              <KuficRuleInspector
                grid={composition.kuficGrid}
                onSymmetryChange={onKuficSymmetryChange}
                onLoadPreset={onKuficLoadPreset}
                onClearGrid={onKuficClear}
              />
            )}

            {/* Arabic Text Input Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Calligraphic Arabic Text
                </label>
                <span className="text-[10px] text-amber-400/80 font-serif">RTL Joining Active</span>
              </div>
              <textarea
                dir="rtl"
                rows={3}
                value={composition.text}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="أدخل النص العربي هنا..."
                className="w-full bg-[#151722] border border-[#2b3044] rounded-xl p-3 text-lg font-serif text-amber-100 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed shadow-inner"
              />

              {/* Quick Arabic Diacritics Pad */}
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {diacritics.map((dia, idx) => (
                  <button
                    key={idx}
                    onClick={() => onTextChange(composition.text + dia)}
                    className="w-6 h-6 rounded bg-[#1a1d29] hover:bg-amber-600 hover:text-stone-950 text-stone-300 text-sm font-serif flex items-center justify-center transition-colors border border-stone-800"
                    title={`Insert ${dia}`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            </div>

            {/* Tashkeel & Harakat Density Slider */}
            <div className="bg-[#141620] p-3 rounded-xl border border-[#252b3d]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Harakat & Tashkeel Density
                </span>
                <span className="text-amber-300 font-mono font-semibold uppercase text-[10px]">
                  {composition.tashkeelDensity}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {(['off', 'sparse', 'balanced', 'dense', 'ornamental'] as TashkeelDensity[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => onTashkeelDensityChange(d)}
                    className={`py-1 text-[10px] rounded-lg font-medium transition-all uppercase ${
                      composition.tashkeelDensity === d
                        ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                        : 'bg-[#1b1e2b] text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {d === 'ornamental' ? 'Rich' : d}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape Fitting Intensity Slider (if shape is active) */}
            {composition.shape !== 'none' && (
              <div className="bg-[#141620] p-3 rounded-xl border border-[#252b3d]">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Contour Fitting Strength
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    {Math.round(composition.shapeFittingStrength * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={composition.shapeFittingStrength}
                  onChange={(e) => onShapeFittingStrengthChange(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Dynamically balances words bottom-up and stretches ascenders to touch contour borders.
                </span>
              </div>
            )}

            {/* Active Script Info Badge */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#171a26] to-[#12141d] border border-amber-900/30">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
                Active Script Rules
              </span>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {composition.script === 'thuluth' && 'Classical Ibn Muqla 7-Rhombic Dot Mizan. Majestically curving vertical ascenders with tarwis finials and interlocking ligatures.'}
                {composition.script === 'jali_diwani' && 'Ottoman chancery script with steep 80° nib, fish-hook crowns, upward wave baselines, and dense diamond jewels.'}
                {composition.script === 'square_kufic' && '2D architectural brick grid calligraphy with live 50/50 black-white balance validation and continuous labyrinth paths.'}
              </p>
            </div>

          </div>
        )}

        {/* ================= TAB 2: INSPECTOR ================= */}
        {activeTab === 'inspector' && (
          <div className="space-y-4">
            
            {/* If a letter glyph is selected */}
            {selectedGlyph ? (
              <div className="space-y-4">
                
                {/* Header info */}
                <div className="bg-[#151722] p-3 rounded-xl border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                      Selected Letter
                    </span>
                    <h4 className="text-base font-serif font-bold text-amber-100 flex items-center gap-2">
                      <span className="text-xl text-amber-300 font-serif">{selectedGlyph.char}</span>
                      <span>{selectedGlyph.arabicName}</span>
                    </h4>
                  </div>
                  <button
                    onClick={() => onDeleteSelectedGlyph(selectedGlyph.id)}
                    className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-900/40 transition-colors"
                    title="Delete letter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Alternate Calligraphic Forms Switcher */}
                {selectedGlyph.availableAlternates.length > 1 && (
                  <div className="bg-[#141620] p-3 rounded-xl border border-[#252b3d]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                      Classical Alternate Glyphs
                    </span>
                    <div className="space-y-1.5">
                      {selectedGlyph.availableAlternates.map((altName, idx) => (
                        <button
                          key={idx}
                          onClick={() => onUpdateSelectedGlyph({
                            ...selectedGlyph,
                            alternateIndex: idx
                          })}
                          className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            selectedGlyph.alternateIndex === idx
                              ? 'bg-amber-600 text-stone-950 font-bold'
                              : 'bg-[#1b1e2b] text-stone-300 hover:bg-[#252a3d]'
                          }`}
                        >
                          <span className="line-clamp-1">{altName}</span>
                          {selectedGlyph.alternateIndex === idx && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transform Sliders */}
                <div className="bg-[#141620] p-3 rounded-xl border border-[#252b3d] space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Letter Transformations
                  </span>

                  {/* Vertical Elevation (Lift / Drop from baseline) */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-stone-400">Baseline Elevation</span>
                      <span className="font-mono text-amber-300 font-bold">{selectedGlyph.elevation}px</span>
                    </div>
                    <input
                      type="range"
                      min="-80"
                      max="80"
                      value={selectedGlyph.elevation}
                      onChange={(e) => onUpdateSelectedGlyph({
                        ...selectedGlyph,
                        elevation: Number(e.target.value)
                      })}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                    />
                  </div>

                  {/* Scale */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-stone-400">Letter Scale</span>
                      <span className="font-mono text-amber-300 font-bold">{Math.round(selectedGlyph.scaleX * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={selectedGlyph.scaleX}
                      onChange={(e) => {
                        const s = Number(e.target.value);
                        onUpdateSelectedGlyph({
                          ...selectedGlyph,
                          scaleX: s,
                          scaleY: s
                        });
                      }}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                    />
                  </div>

                  {/* Rotation */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-stone-400">Angle Tilt</span>
                      <span className="font-mono text-amber-300 font-bold">{Math.round(selectedGlyph.rotation)}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      value={selectedGlyph.rotation}
                      onChange={(e) => onUpdateSelectedGlyph({
                        ...selectedGlyph,
                        rotation: Number(e.target.value)
                      })}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                    />
                  </div>

                  {/* Reverse Tail (e.g. Ya Marduda) */}
                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                    <span className="text-[11px] text-stone-300">Reverse Tail (Ya Marduda)</span>
                    <button
                      onClick={() => onUpdateSelectedGlyph({
                        ...selectedGlyph,
                        reverseTail: !selectedGlyph.reverseTail
                      })}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                        selectedGlyph.reverseTail
                          ? 'bg-amber-600 text-stone-950 font-bold'
                          : 'bg-[#1b1e2a] text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {selectedGlyph.reverseTail ? 'Reversed (مردودة)' : 'Standard'}
                    </button>
                  </div>
                </div>

              </div>
            ) : selectedTashkeel ? (
              
              /* If a Tashkeel mark is selected */
              <div className="space-y-4">
                <div className="bg-[#151722] p-3 rounded-xl border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                      Selected Harakat
                    </span>
                    <h4 className="text-sm font-bold text-amber-100 capitalize">
                      {selectedTashkeel.type.replace('_', ' ')}
                    </h4>
                  </div>
                  <button
                    onClick={() => onDeleteSelectedTashkeel(selectedTashkeel.id)}
                    className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-900/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[#141620] p-3 rounded-xl border border-[#252b3d] space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-stone-400">Scale</span>
                      <span className="font-mono text-amber-300 font-bold">{Math.round(selectedTashkeel.scale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.05"
                      value={selectedTashkeel.scale}
                      onChange={(e) => onUpdateSelectedTashkeel({
                        ...selectedTashkeel,
                        scale: Number(e.target.value)
                      })}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-stone-400">Rotation</span>
                      <span className="font-mono text-amber-300 font-bold">{Math.round(selectedTashkeel.rotation)}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={selectedTashkeel.rotation}
                      onChange={(e) => onUpdateSelectedTashkeel({
                        ...selectedTashkeel,
                        rotation: Number(e.target.value)
                      })}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Nothing selected placeholder */
              <div className="text-center py-12 px-4 border border-dashed border-[#282d3e] rounded-xl text-stone-500">
                <Compass className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                <p className="text-xs font-medium text-stone-400">No element selected</p>
                <p className="text-[11px] mt-1 text-stone-500">
                  Click on any letter, ligature, or floating harakat on the canvas to inspect and sculpt its curves.
                </p>
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 3: PAPER & INK ================= */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            
            {/* Ink Color Selection */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Traditional Calligraphic Inks
              </span>
              <div className="grid grid-cols-1 gap-2">
                {inkOptions.map((ink) => (
                  <button
                    key={ink.id}
                    onClick={() => onInkColorChange(ink.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      composition.inkColor === ink.id
                        ? 'border-amber-500 bg-[#1e2230] shadow-md'
                        : 'border-[#222736] bg-[#141620] hover:bg-[#1a1d28]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full border border-stone-600 shadow-inner"
                        style={{ backgroundColor: ink.hex }}
                      />
                      <span className="text-xs font-medium text-stone-200">{ink.name}</span>
                    </div>
                    {composition.inkColor === ink.id && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Texture Selection */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Paper & Canvas Mediums
              </span>
              <div className="grid grid-cols-1 gap-2">
                {paperOptions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onPaperTextureChange(p.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      composition.paperTexture === p.id
                        ? 'border-amber-500 bg-[#1e2230] shadow-md'
                        : 'border-[#222736] bg-[#141620] hover:bg-[#1a1d28]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-lg border border-stone-700 shadow-sm"
                        style={{ backgroundColor: p.color }}
                      />
                      <div>
                        <span className="text-xs font-medium text-stone-200 block">{p.name}</span>
                        <span className="text-[10px] text-stone-500">{p.desc}</span>
                      </div>
                    </div>
                    {composition.paperTexture === p.id && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Aspect Ratio */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Canvas Dimension Ratio
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => onAspectRatioChange(ar.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs transition-colors ${
                      composition.aspectRatio === ar.id
                        ? 'bg-amber-600 text-stone-950 font-bold'
                        : 'bg-[#181a26] text-stone-300 hover:bg-[#222736]'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 4: LAYERS & GEOMETRY ================= */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            
            {/* Layer Stack */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Multi-Layer Manager
              </span>
              {composition.layers.map((layer) => (
                <div
                  key={layer.id}
                  className="bg-[#141620] border border-[#252b3d] p-2.5 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleLayerVisibility(layer.id)}
                      className="text-stone-400 hover:text-amber-300"
                    >
                      {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-stone-600" />}
                    </button>
                    <span className={`text-xs font-medium ${layer.visible ? 'text-stone-200' : 'text-stone-500'}`}>
                      {layer.name}
                    </span>
                  </div>
                  <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded uppercase">
                    {layer.type.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>

            {/* Concentric Circular Text Ring (Ayat al-Kursi ring style) */}
            <div className="bg-[#141620] p-3 rounded-xl border border-[#252b3d] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Concentric Text Ring
                </span>
                <button
                  onClick={onToggleConcentricRing}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    composition.showConcentricRing
                      ? 'bg-amber-600 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {composition.showConcentricRing ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              {composition.showConcentricRing && (
                <div>
                  <label className="text-[10px] text-stone-500 block mb-1">Ring Text on Path</label>
                  <input
                    dir="rtl"
                    type="text"
                    value={composition.concentricRingText || ''}
                    onChange={(e) => onConcentricRingTextChange(e.target.value)}
                    placeholder="النص الدائري..."
                    className="w-full bg-[#181a26] border border-[#2c3246] rounded-lg px-2.5 py-1.5 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Sacred Geometry Background */}
            <div className="bg-[#141620] p-3 rounded-xl border border-[#252b3d] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Sacred Islamic Geometry
                </span>
                <button
                  onClick={onToggleSacredGeometry}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    composition.showSacredGeometry
                      ? 'bg-amber-600 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {composition.showSacredGeometry ? 'Visible' : 'Hidden'}
                </button>
              </div>

              {composition.showSacredGeometry && (
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <button
                    onClick={() => onGeometryPatternChange('khatam_8')}
                    className={`py-1 px-1.5 text-[10px] rounded text-center transition-colors ${
                      composition.geometryPattern === 'khatam_8'
                        ? 'bg-amber-600 text-stone-950 font-bold'
                        : 'bg-[#1b1e2a] text-stone-300'
                    }`}
                  >
                    8-Point Star
                  </button>
                  <button
                    onClick={() => onGeometryPatternChange('girih_tile')}
                    className={`py-1 px-1.5 text-[10px] rounded text-center transition-colors ${
                      composition.geometryPattern === 'girih_tile'
                        ? 'bg-amber-600 text-stone-950 font-bold'
                        : 'bg-[#1b1e2a] text-stone-300'
                    }`}
                  >
                    Girih Interlace
                  </button>
                  <button
                    onClick={() => onGeometryPatternChange('rosette_12')}
                    className={`py-1 px-1.5 text-[10px] rounded text-center transition-colors ${
                      composition.geometryPattern === 'rosette_12'
                        ? 'bg-amber-600 text-stone-950 font-bold'
                        : 'bg-[#1b1e2a] text-stone-300'
                    }`}
                  >
                    12-Rosette
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </aside>
  );
}
