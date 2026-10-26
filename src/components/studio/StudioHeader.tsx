'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Undo2, 
  Redo2, 
  Sparkles, 
  BookOpen, 
  Download, 
  Video, 
  Maximize2, 
  Minimize2, 
  FolderDown, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Feather,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { ScriptType } from '@/lib/calligraphy/types';
import { STUDIO_PRESETS } from '@/lib/calligraphy/presets';

interface StudioHeaderProps {
  currentScript: ScriptType;
  onSelectScript: (script: ScriptType) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onOpenQuranModal: () => void;
  onOpenVideoModal: () => void;
  onOpenExportModal: () => void;
  onOpenProjectModal: () => void;
  onSelectPreset: (presetId: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function StudioHeader({
  currentScript,
  onSelectScript,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  zoom,
  onZoomChange,
  onOpenQuranModal,
  onOpenVideoModal,
  onOpenExportModal,
  onOpenProjectModal,
  onSelectPreset,
  isFullscreen,
  onToggleFullscreen
}: StudioHeaderProps) {
  return (
    <header className="h-14 bg-[#0c0d10] border-b border-[#222634] px-3 sm:px-4 flex items-center justify-between select-none z-40 text-stone-200">
      
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <Link 
          href="/" 
          className="flex items-center gap-2 group p-1 -ml-1 rounded-lg hover:bg-[#181b24] transition-colors"
          title="Return to Calli Art Home"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-stone-950 shadow-md shadow-amber-900/30">
            <Feather className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-sm tracking-wide text-amber-200 group-hover:text-amber-100 transition-colors">
                MyQalam Studio
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                PRO UNLOCKED
              </span>
            </div>
            <span className="text-[10px] text-stone-400 -mt-0.5">
              Arabic Calligraphy Engine • 100% Free
            </span>
          </div>
        </Link>

        {/* Vertical divider */}
        <div className="h-5 w-px bg-stone-800 hidden md:block mx-1" />

        {/* Script Selector Tabs */}
        <div className="flex items-center bg-[#151720] p-0.5 rounded-lg border border-[#262b3b]">
          <button
            onClick={() => onSelectScript('thuluth')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              currentScript === 'thuluth'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-50 shadow-sm font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#1d212f]'
            }`}
          >
            Thuluth (ثلث)
          </button>
          <button
            onClick={() => onSelectScript('jali_diwani')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              currentScript === 'jali_diwani'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-50 shadow-sm font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#1d212f]'
            }`}
          >
            Jali Diwani (جلي ديواني)
          </button>
          <button
            onClick={() => onSelectScript('square_kufic')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              currentScript === 'square_kufic'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-50 shadow-sm font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#1d212f]'
            }`}
          >
            Square Kufic (كوفي)
          </button>
        </div>

        {/* Preset Compositions Dropdown */}
        <div className="relative group hidden lg:block">
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-300 hover:text-amber-300 hover:bg-[#181b25] border border-[#222634] rounded-lg transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Presets</span>
          </button>
          <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#14161f] border border-[#2b3042] rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50">
            <div className="px-2 py-1 text-[10px] uppercase font-bold text-stone-400 border-b border-stone-800">
              Master Compositions
            </div>
            {STUDIO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#202434] transition-colors flex flex-col gap-0.5 mt-0.5"
              >
                <span className="font-medium text-amber-200">{preset.name}</span>
                <span className="text-[10px] text-stone-400 line-clamp-1">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center Controls: Undo / Redo & Zoom */}
      <div className="flex items-center gap-1 bg-[#14161f] p-1 rounded-lg border border-[#222634]">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`p-1.5 rounded hover:bg-[#202433] transition-colors ${
            canUndo ? 'text-stone-300' : 'text-stone-600 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className={`p-1.5 rounded hover:bg-[#202433] transition-colors ${
            canRedo ? 'text-stone-300' : 'text-stone-600 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
        
        <div className="h-4 w-px bg-stone-800 mx-1" />

        <button
          onClick={() => onZoomChange(Math.max(0.25, zoom - 0.15))}
          title="Zoom Out"
          className="p-1.5 rounded hover:bg-[#202433] text-stone-300 transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span 
          onClick={() => onZoomChange(1.0)}
          title="Click to reset zoom to 100%"
          className="text-[11px] font-mono text-stone-400 w-10 text-center cursor-pointer hover:text-amber-300"
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => onZoomChange(Math.min(3.0, zoom + 0.15))}
          title="Zoom In"
          className="p-1.5 rounded hover:bg-[#202433] text-stone-300 transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Quran & Dhikr Library */}
        <button
          onClick={onOpenQuranModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#171a24] hover:bg-[#222634] text-amber-200 border border-amber-500/20 rounded-lg transition-colors"
          title="Open Quran Verses & Dhikr Library"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Quran & Dhikr</span>
        </button>

        {/* Projects Save / Open */}
        <button
          onClick={onOpenProjectModal}
          className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-stone-300 hover:bg-[#1b1e2a] border border-[#222634] rounded-lg transition-colors flex items-center gap-1.5"
          title="Projects & Local Save"
        >
          <FolderDown className="w-3.5 h-3.5 text-stone-400" />
          <span className="hidden md:inline">Projects</span>
        </button>

        {/* Animated Video Generator */}
        <button
          onClick={onOpenVideoModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 text-stone-950 rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all"
          title="Generate Stroke-by-Stroke Animated Video"
        >
          <Video className="w-3.5 h-3.5 text-stone-950" />
          <span className="hidden sm:inline">Animate Video</span>
        </button>

        {/* Export Vector / Raster */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#242938] hover:bg-[#30374b] text-amber-100 border border-[#3e445b] rounded-lg shadow-sm transition-colors"
          title="Export SVG, DXF, PNG, 4K Print"
        >
          <Download className="w-3.5 h-3.5 text-amber-300" />
          <span>Export</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-[#1a1d28] border border-[#222634] transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

    </header>
  );
}
