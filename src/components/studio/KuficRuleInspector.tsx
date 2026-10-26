'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw, Grid3X3, Sparkles } from 'lucide-react';
import { KuficGrid, SymmetryMode } from '@/lib/calligraphy/types';

interface KuficRuleInspectorProps {
  grid: KuficGrid;
  onSymmetryChange: (symmetry: SymmetryMode) => void;
  onLoadPreset: (preset: 'allah' | 'muhammad' | 'ali' | 'bismillah') => void;
  onClearGrid: () => void;
}

export default function KuficRuleInspector({
  grid,
  onSymmetryChange,
  onLoadPreset,
  onClearGrid
}: KuficRuleInspectorProps) {
  const { ruleCheck, symmetry, rows, cols } = grid;
  const blackPct = Math.round(ruleCheck.blackRatio * 100);
  const whitePct = 100 - blackPct;

  return (
    <div className="bg-[#141620] border border-[#272d3f] rounded-xl p-3 text-stone-200 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#222738] pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-xs tracking-wide text-amber-200 uppercase">
            Square Kufic Live Rules
          </span>
        </div>
        <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded font-mono">
          {cols}×{rows} Grid
        </span>
      </div>

      {/* 1. Black/White Balance Meter */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-stone-400">Space Equilibrium</span>
          <span className="font-mono font-bold text-amber-300">
            {blackPct}% Ink / {whitePct}% Void
          </span>
        </div>
        <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden flex border border-stone-800">
          <div 
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${blackPct}%` }}
          />
          <div 
            className="bg-stone-700 h-full transition-all duration-300"
            style={{ width: `${whitePct}%` }}
          />
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
          {ruleCheck.isBalanced ? (
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Master Class 50/50 Balance
            </span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Adjust ink fill towards 50%
            </span>
          )}
        </div>
      </div>

      {/* 2. Labyrinth Continuity */}
      <div className="mb-3 bg-[#10121a] p-2 rounded-lg border border-[#222738] flex items-center justify-between text-xs">
        <span className="text-stone-400">Labyrinth Continuity</span>
        {ruleCheck.isLabyrinthContinuous ? (
          <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Continuous Paths
          </span>
        ) : (
          <span className="text-amber-400 font-medium text-[11px]">
            {ruleCheck.brokenPathsCount} Isolated Islands
          </span>
        )}
      </div>

      {/* 3. Symmetry Mode Selection */}
      <div className="mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
          Symmetry Engine
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onSymmetryChange('none')}
            className={`py-1 px-2 rounded-lg text-xs transition-colors ${
              symmetry === 'none'
                ? 'bg-amber-600 text-stone-950 font-bold'
                : 'bg-[#1b1e2b] text-stone-300 hover:bg-[#252a3d]'
            }`}
          >
            Standard Free
          </button>
          <button
            onClick={() => onSymmetryChange('muthanna')}
            className={`py-1 px-2 rounded-lg text-xs transition-colors ${
              symmetry === 'muthanna'
                ? 'bg-amber-600 text-stone-950 font-bold'
                : 'bg-[#1b1e2b] text-stone-300 hover:bg-[#252a3d]'
            }`}
          >
            Muthanna (Mirror)
          </button>
          <button
            onClick={() => onSymmetryChange('radial_4')}
            className={`py-1 px-2 rounded-lg text-xs transition-colors ${
              symmetry === 'radial_4'
                ? 'bg-amber-600 text-stone-950 font-bold'
                : 'bg-[#1b1e2b] text-stone-300 hover:bg-[#252a3d]'
            }`}
          >
            4-Fold Rotary
          </button>
          <button
            onClick={() => onSymmetryChange('radial_8')}
            className={`py-1 px-2 rounded-lg text-xs transition-colors ${
              symmetry === 'radial_8'
                ? 'bg-amber-600 text-stone-950 font-bold'
                : 'bg-[#1b1e2b] text-stone-300 hover:bg-[#252a3d]'
            }`}
          >
            8-Fold Radial
          </button>
        </div>
      </div>

      {/* 4. Quick Iconic Presets */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
          Classical Kufic Inscriptions
        </div>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => onLoadPreset('allah')}
            className="py-1 px-2 text-left bg-[#1b1e2b] hover:bg-amber-600 hover:text-stone-950 text-stone-300 text-xs rounded transition-colors"
          >
            الله (4-Fold)
          </button>
          <button
            onClick={() => onLoadPreset('muhammad')}
            className="py-1 px-2 text-left bg-[#1b1e2b] hover:bg-amber-600 hover:text-stone-950 text-stone-300 text-xs rounded transition-colors"
          >
            محمد (Labyrinth)
          </button>
          <button
            onClick={() => onLoadPreset('ali')}
            className="py-1 px-2 text-left bg-[#1b1e2b] hover:bg-amber-600 hover:text-stone-950 text-stone-300 text-xs rounded transition-colors"
          >
            علي (Geometric)
          </button>
          <button
            onClick={() => onLoadPreset('bismillah')}
            className="py-1 px-2 text-left bg-[#1b1e2b] hover:bg-amber-600 hover:text-stone-950 text-stone-300 text-xs rounded transition-colors"
          >
            البسملة (Frieze)
          </button>
        </div>
      </div>
    </div>
  );
}
