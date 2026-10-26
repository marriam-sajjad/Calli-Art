'use client';

import React from 'react';
import { 
  MousePointer, 
  PenTool, 
  Shapes, 
  Sparkles, 
  Grid, 
  Compass, 
  Sliders, 
  Circle, 
  Heart, 
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { ToolMode, ShapeType, HarakatType } from '@/lib/calligraphy/types';
import { getHarakatPath } from '@/lib/calligraphy/tashkeelEngine';

interface StudioLeftToolbarProps {
  toolMode: ToolMode;
  onSelectToolMode: (mode: ToolMode) => void;
  activeShape: ShapeType;
  onSelectShape: (shape: ShapeType) => void;
  nibAngle: number;
  onNibAngleChange: (angle: number) => void;
  nibWidth: number;
  onNibWidthChange: (width: number) => void;
  kashida: number;
  onKashidaChange: (kashida: number) => void;
  showMizanGuides: boolean;
  onToggleMizanGuides: () => void;
  showShapeGuide: boolean;
  onToggleShapeGuide: () => void;
  onAddTashkeel: (type: HarakatType) => void;
}

export default function StudioLeftToolbar({
  toolMode,
  onSelectToolMode,
  activeShape,
  onSelectShape,
  nibAngle,
  onNibAngleChange,
  nibWidth,
  onNibWidthChange,
  kashida,
  onKashidaChange,
  showMizanGuides,
  onToggleMizanGuides,
  showShapeGuide,
  onToggleShapeGuide,
  onAddTashkeel
}: StudioLeftToolbarProps) {
  const tools: { id: ToolMode; label: string; icon: React.FC<{ className?: string }>; shortcut: string }[] = [
    { id: 'select', label: 'Select & Move', icon: MousePointer, shortcut: 'V' },
    { id: 'sculpt', label: 'Letter Sculptor', icon: Compass, shortcut: 'A' },
    { id: 'tashkeel', label: 'Tashkeel Placer', icon: Sparkles, shortcut: 'T' },
    { id: 'shape', label: 'Shape Fitter', icon: Shapes, shortcut: 'S' },
    { id: 'pen', label: 'Reed Qalam', icon: PenTool, shortcut: 'P' },
    { id: 'guidelines', label: 'Mizan Rulers', icon: Grid, shortcut: 'M' },
  ];

  const shapes: { id: ShapeType; label: string; iconName: string }[] = [
    { id: 'none', label: 'Freeform (No Contour)', iconName: '◻' },
    { id: 'circle', label: 'Circle Medallion', iconName: '◯' },
    { id: 'teardrop', label: 'Teardrop (Kumathra)', iconName: '💧' },
    { id: 'mihrab', label: 'Mihrab Prayer Arch', iconName: '🏛' },
    { id: 'dome', label: 'Mosque Dome', iconName: '🕌' },
    { id: 'oval', label: 'Oval Cartouche', iconName: '⬭' },
    { id: 'hexagon', label: 'Sacred Hexagon', iconName: '⬡' },
    { id: 'heart', label: 'Interlocking Heart', iconName: '♥' },
  ];

  const quickHarakatList: { type: HarakatType; label: string }[] = [
    { type: 'fatha', label: 'ـَ Fatha' },
    { type: 'kasra', label: 'ـِ Kasra' },
    { type: 'damma', label: 'ـُ Damma' },
    { type: 'sukun', label: 'ـْ Sukun' },
    { type: 'shaddah', label: 'ـّ Shaddah' },
    { type: 'nuqta_single', label: '♦ Nuqta' },
    { type: 'nuqta_double_vert', label: '♦♦ Vert' },
    { type: 'nuqta_triple', label: '∴ Triple' },
    { type: 'star_rosette', label: '۞ Rosette' },
    { type: 'floral_flourish', label: '✤ Flower' },
  ];

  return (
    <aside className="w-14 sm:w-16 bg-[#0c0d10] border-r border-[#222634] flex flex-col items-center py-3 select-none z-30 justify-between">
      
      {/* Top Section: Primary Tool Buttons */}
      <div className="flex flex-col items-center gap-1.5 w-full px-2">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = toolMode === t.id;
          return (
            <div key={t.id} className="relative group w-full flex justify-center">
              <button
                onClick={() => onSelectToolMode(t.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 shadow-lg shadow-amber-900/40 font-bold'
                    : 'text-stone-400 hover:text-amber-200 hover:bg-[#1a1d29]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>

              {/* Hover Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#161822] text-stone-200 text-xs px-2.5 py-1 rounded-md border border-[#2b3042] shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center gap-1.5">
                <span>{t.label}</span>
                <span className="text-[10px] bg-stone-800 text-stone-400 px-1 py-0.5 rounded">
                  {t.shortcut}
                </span>
              </div>
            </div>
          );
        })}

        <div className="w-8 h-px bg-stone-800 my-2" />

        {/* Shape Fitting Flyout */}
        <div className="relative group w-full flex justify-center">
          <button
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              activeShape !== 'none'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                : 'border-[#222634] text-stone-400 hover:text-stone-200 hover:bg-[#181a24]'
            }`}
            title="Choose Shape Contour"
          >
            <Shapes className="w-4 h-4" />
          </button>

          {/* Shapes Flyout Menu */}
          <div className="absolute left-full ml-3 top-0 bg-[#14161f] border border-[#2c3245] rounded-xl shadow-2xl p-2 w-52 hidden group-hover:block z-50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 py-1 border-b border-stone-800 mb-1">
              Shape Fitting Contour
            </div>
            {shapes.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectShape(s.id)}
                className={`w-full text-left px-2 py-1.5 text-xs rounded-lg flex items-center gap-2 transition-colors ${
                  activeShape === s.id
                    ? 'bg-amber-600 text-stone-950 font-bold'
                    : 'text-stone-300 hover:bg-[#1f2332] hover:text-amber-200'
                }`}
              >
                <span className="text-base">{s.iconName}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Tashkeel / Harakat Dropper */}
        <div className="relative group w-full flex justify-center">
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#222634] text-amber-400 hover:bg-[#181a24] transition-all"
            title="Add Calligraphic Harakat or Nuqta"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Harakat Flyout Palette */}
          <div className="absolute left-full ml-3 top-0 bg-[#14161f] border border-[#2c3245] rounded-xl shadow-2xl p-2 w-48 hidden group-hover:block z-50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80 px-2 py-1 border-b border-stone-800 mb-1">
              Insert Harakat & Nuqtas
            </div>
            <div className="grid grid-cols-2 gap-1">
              {quickHarakatList.map((item) => (
                <button
                  key={item.type}
                  onClick={() => onAddTashkeel(item.type)}
                  className="px-2 py-1.5 text-left text-xs bg-[#1a1d2a] hover:bg-amber-600 hover:text-stone-950 text-stone-200 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{item.label}</span>
                  <span className="text-[10px] text-amber-400 group-hover:text-stone-950 font-bold">+</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Qalam Parameters & Guideline Rulers */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        
        {/* Qalam Reed Pen Settings Flyout */}
        <div className="relative group w-full flex justify-center">
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#222634] text-stone-400 hover:text-amber-300 hover:bg-[#181a24] transition-all"
            title="Qalam Pen Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Slider Drawer */}
          <div className="absolute left-full ml-3 bottom-0 bg-[#14161f] border border-[#2c3245] rounded-xl shadow-2xl p-3 w-60 hidden group-hover:block z-50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-800 pb-1 mb-2">
              Reed Qalam Mechanics
            </div>

            {/* Nib Angle */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-stone-300 mb-1">
                <span>Nib Angle</span>
                <span className="font-mono text-amber-300 font-bold">{nibAngle}°</span>
              </div>
              <input
                type="range"
                min="45"
                max="90"
                value={nibAngle}
                onChange={(e) => onNibAngleChange(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-stone-500 mt-0.5">
                <span>45° Maghribi</span>
                <span>70° Thuluth</span>
                <span>90° Kufic</span>
              </div>
            </div>

            {/* Nib Width */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-stone-300 mb-1">
                <span>Nib Width</span>
                <span className="font-mono text-amber-300 font-bold">{nibWidth}px</span>
              </div>
              <input
                type="range"
                min="6"
                max="40"
                value={nibWidth}
                onChange={(e) => onNibWidthChange(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
            </div>

            {/* Kashida Stretch */}
            <div>
              <div className="flex justify-between text-xs text-stone-300 mb-1">
                <span>Kashida Elongation</span>
                <span className="font-mono text-amber-300 font-bold">{Math.round(kashida * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={kashida}
                onChange={(e) => onKashidaChange(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Mizan Rulers Toggle */}
        <button
          onClick={onToggleMizanGuides}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
            showMizanGuides
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
              : 'border-[#222634] text-stone-500 hover:text-stone-300 hover:bg-[#181a24]'
          }`}
          title={showMizanGuides ? 'Hide Mizan Proportional Guides' : 'Show Mizan Proportional Guides (7-Nuqta Alif)'}
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Shape Guide Outline Toggle */}
        {activeShape !== 'none' && (
          <button
            onClick={onToggleShapeGuide}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              showShapeGuide
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'border-[#222634] text-stone-500 hover:text-stone-300 hover:bg-[#181a24]'
            }`}
            title={showShapeGuide ? 'Hide Shape Contour' : 'Show Shape Contour'}
          >
            {showShapeGuide ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        )}

      </div>
    </aside>
  );
}
