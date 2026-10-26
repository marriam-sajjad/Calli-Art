'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  CompositionState, 
  CalligraphyGlyph, 
  TashkeelItem, 
  ToolMode, 
  Point 
} from '@/lib/calligraphy/types';
import { getShapeOutlinePath } from '@/lib/calligraphy/shapeFitting';
import { transformPath, createRhombicDotPath } from '@/lib/calligraphy/bezierUtils';
import { toggleKuficCellWithSymmetry } from '@/lib/calligraphy/squareKuficEngine';

interface StudioCanvasProps {
  composition: CompositionState;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  toolMode: ToolMode;
  showMizanGuides: boolean;
  showShapeGuide: boolean;
  selectedGlyph: CalligraphyGlyph | null;
  onSelectGlyph: (glyph: CalligraphyGlyph | null) => void;
  onUpdateGlyph: (glyph: CalligraphyGlyph) => void;
  onDeleteGlyph?: (id: string) => void;
  selectedTashkeel: TashkeelItem | null;
  onSelectTashkeel: (item: TashkeelItem | null) => void;
  onUpdateTashkeel: (item: TashkeelItem) => void;
  onDeleteTashkeel?: (id: string) => void;
  onUpdateComposition: (comp: CompositionState) => void;
}

export default function StudioCanvas({
  composition,
  zoom,
  onZoomChange,
  toolMode,
  showMizanGuides,
  showShapeGuide,
  selectedGlyph,
  onSelectGlyph,
  onUpdateGlyph,
  onDeleteGlyph,
  selectedTashkeel,
  onSelectTashkeel,
  onUpdateTashkeel,
  onDeleteTashkeel,
  onUpdateComposition
}: StudioCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<Point>({ x: 0, y: 0 });
  const [draggingElement, setDraggingElement] = useState<{
    id: string;
    type: 'glyph' | 'tashkeel';
    startX: number;
    startY: number;
    elemStartX: number;
    elemStartY: number;
  } | null>(null);

  // Wheel zoom handling
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      onZoomChange(Math.min(3.0, Math.max(0.25, zoom * zoomFactor)));
    } else {
      // Pan with wheel
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  // Pointer Down for Canvas Pan or Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    // Middle button or Spacebar held triggers pan
    if (e.button === 1 || e.buttons === 4 || e.altKey) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    // Clicking empty canvas deselects
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      onSelectGlyph(null);
      onSelectTashkeel(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
      return;
    }

    if (draggingElement) {
      const dx = (e.clientX - draggingElement.startX) / zoom;
      const dy = (e.clientY - draggingElement.startY) / zoom;

      if (draggingElement.type === 'glyph' && selectedGlyph) {
        onUpdateGlyph({
          ...selectedGlyph,
          x: draggingElement.elemStartX + dx,
          y: draggingElement.elemStartY + dy,
        });
      } else if (draggingElement.type === 'tashkeel' && selectedTashkeel) {
        onUpdateTashkeel({
          ...selectedTashkeel,
          x: draggingElement.elemStartX + dx,
          y: draggingElement.elemStartY + dy,
        });
      }
    }
  };

  const handlePointerUp = () => {
    setIsPanning(false);
    setDraggingElement(null);
  };

  // Start dragging a glyph
  const handleGlyphPointerDown = (e: React.PointerEvent, glyph: CalligraphyGlyph) => {
    e.stopPropagation();
    onSelectGlyph(glyph);
    onSelectTashkeel(null);
    setDraggingElement({
      id: glyph.id,
      type: 'glyph',
      startX: e.clientX,
      startY: e.clientY,
      elemStartX: glyph.x,
      elemStartY: glyph.y,
    });
  };

  // Start dragging a Tashkeel mark
  const handleTashkeelPointerDown = (e: React.PointerEvent, t: TashkeelItem) => {
    e.stopPropagation();
    onSelectTashkeel(t);
    onSelectGlyph(null);
    setDraggingElement({
      id: t.id,
      type: 'tashkeel',
      startX: e.clientX,
      startY: e.clientY,
      elemStartX: t.x,
      elemStartY: t.y,
    });
  };

  // Handle Square Kufic grid cell click
  const handleKuficCellClick = (r: number, c: number) => {
    if (!composition.kuficGrid) return;
    const newGrid = toggleKuficCellWithSymmetry(composition.kuficGrid, r, c);
    onUpdateComposition({
      ...composition,
      kuficGrid: newGrid
    });
  };

  // Determine paper background color & styling
  const getPaperBg = () => {
    switch (composition.paperTexture) {
      case 'dark_obsidian': return '#0e1017';
      case 'tea_stained': return '#f2e8d5';
      case 'aged_manuscript': return '#ebdcc0';
      case 'royal_silk': return '#faf6ee';
      case 'iznik_tile': return '#ebf3f7';
      case 'ahar':
      default:
        return '#FBF7EE';
    }
  };

  // Ink color fill string
  const getInkFill = () => {
    switch (composition.inkColor) {
      case 'liquid_gold': return 'url(#goldFoilGradient)';
      case 'burnished_copper': return 'url(#copperGradient)';
      case 'silver_foil': return 'url(#silverGradient)';
      case 'walnut_sepia': return '#4a2e18';
      case 'lapis_lazuli': return '#183b6b';
      case 'ruby_crimson': return '#801824';
      case 'iron_gall':
      default:
        return '#131418';
    }
  };

  // Determine paper size from aspect ratio
  const getCanvasDimensions = () => {
    switch (composition.aspectRatio) {
      case '4:5': return { w: 800, h: 1000 };
      case '16:9': return { w: 1200, h: 675 };
      case '9:16': return { w: 675, h: 1200 };
      case 'a4': return { w: 800, h: 1131 };
      case '1:1':
      default:
        return { w: 1000, h: 1000 };
    }
  };

  const { w: canvasW, h: canvasH } = getCanvasDimensions();

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="flex-1 bg-[#090a0d] relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      style={{
        backgroundImage: `radial-gradient(#1c202e 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Canvas Paper Sheet Container */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.05s ease-out',
        }}
        className="relative shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-[#2b3042] rounded-sm transition-shadow"
      >
        <svg
          width={canvasW}
          height={canvasH}
          viewBox={`0 0 ${canvasW} ${canvasH}`}
          className="block overflow-visible"
          style={{ backgroundColor: getPaperBg() }}
        >
          {/* Visual Defs: Metallic Foil Gradients & Patterns */}
          <defs>
            {/* Liquid Gold Foil Gradient */}
            <linearGradient id="goldFoilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c59b27" />
              <stop offset="25%" stopColor="#f3c64f" />
              <stop offset="50%" stopColor="#fff3bf" />
              <stop offset="75%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#9a7b1c" />
            </linearGradient>

            {/* Burnished Copper Gradient */}
            <linearGradient id="copperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9e472a" />
              <stop offset="40%" stopColor="#d97443" />
              <stop offset="70%" stopColor="#f7a881" />
              <stop offset="100%" stopColor="#87351a" />
            </linearGradient>

            {/* Silver Platinum Gradient */}
            <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8a929e" />
              <stop offset="50%" stopColor="#eef1f5" />
              <stop offset="100%" stopColor="#7a828e" />
            </linearGradient>

            {/* Concentric Text Ring Circular Path */}
            <path
              id="concentricTextPath"
              d={`M ${canvasW / 2} ${canvasH / 2 - 380} A 380 380 0 1 1 ${canvasW / 2 - 0.01} ${canvasH / 2 - 380}`}
            />
          </defs>

          {/* ================= 1. SACRED GEOMETRY BACKGROUND ================= */}
          {composition.showSacredGeometry && (
            <g opacity="0.25" stroke={getInkFill()} fill="none" strokeWidth="1.2">
              {composition.geometryPattern === 'khatam_8' && (
                <g transform={`translate(${canvasW / 2}, ${canvasH / 2})`}>
                  {/* 8-point star (Khatam Sulayman) */}
                  <rect x="-240" y="-240" width="480" height="480" />
                  <rect x="-240" y="-240" width="480" height="480" transform="rotate(45)" />
                  <circle r="340" />
                  <circle r="240" strokeDasharray="4 6" />
                </g>
              )}
              {composition.geometryPattern === 'girih_tile' && (
                <g transform={`translate(${canvasW / 2}, ${canvasH / 2})`}>
                  <polygon points="0,-300 212,-212 300,0 212,212 0,300 -212,212 -300,0 -212,-212" />
                  <polygon points="0,-220 155,-155 220,0 155,155 0,220 -155,155 -220,0 -155,-155" />
                </g>
              )}
              {composition.geometryPattern === 'rosette_12' && (
                <g transform={`translate(${canvasW / 2}, ${canvasH / 2})`}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <circle
                      key={i}
                      cx={Math.cos((i * 30 * Math.PI) / 180) * 160}
                      cy={Math.sin((i * 30 * Math.PI) / 180) * 160}
                      r="160"
                      strokeWidth="0.8"
                    />
                  ))}
                  <circle r="320" />
                </g>
              )}
            </g>
          )}

          {/* ================= 2. CONCENTRIC TEXT RING (Ayat al-Kursi style) ================= */}
          {composition.showConcentricRing && (
            <g>
              <circle
                cx={canvasW / 2}
                cy={canvasH / 2}
                r="380"
                fill="none"
                stroke={getInkFill()}
                strokeWidth="1.5"
                opacity="0.4"
              />
              <circle
                cx={canvasW / 2}
                cy={canvasH / 2}
                r="410"
                fill="none"
                stroke={getInkFill()}
                strokeWidth="2.5"
                opacity="0.7"
              />
              <text fill={getInkFill()} fontSize="18" fontFamily="serif" letterSpacing="3">
                <textPath href="#concentricTextPath" startOffset="0%">
                  {composition.concentricRingText || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ'}
                </textPath>
              </text>
            </g>
          )}

          {/* ================= 3. SHAPE CONTOUR GUIDE ================= */}
          {composition.shape !== 'none' && showShapeGuide && (
            <path
              d={getShapeOutlinePath(composition.shape, composition.shapeBounds)}
              fill="none"
              stroke="#d4af37"
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity="0.6"
            />
          )}

          {/* ================= 4. MIZAN PROPORTIONAL GUIDELINES ================= */}
          {showMizanGuides && (
            <g opacity="0.4">
              {/* Baseline */}
              <line
                x1="80"
                y1={composition.shapeBounds.cy + 30}
                x2={canvasW - 80}
                y2={composition.shapeBounds.cy + 30}
                stroke="#c59b27"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {/* Ascender line */}
              <line
                x1="80"
                y1={composition.shapeBounds.cy - 120}
                x2={canvasW - 80}
                y2={composition.shapeBounds.cy - 120}
                stroke="#c59b27"
                strokeWidth="0.8"
                strokeDasharray="2 4"
              />
              {/* Classical 7-Nuqta vertical stack for Ibn Muqla's Mizan */}
              <g transform={`translate(${canvasW - 120}, ${composition.shapeBounds.cy - 100})`}>
                {Array.from({ length: 7 }).map((_, idx) => (
                  <path
                    key={idx}
                    d={createRhombicDotPath(0, idx * 18, 14, 70)}
                    fill="#c59b27"
                    opacity="0.6"
                  />
                ))}
                {/* Proportional Mizan Circle */}
                <circle cx="0" cy="54" r="63" fill="none" stroke="#c59b27" strokeWidth="1" strokeDasharray="3 3" />
                <text x="-4" y="-12" fill="#c59b27" fontSize="10" fontFamily="sans-serif">Alif (7 Nuqtas)</text>
              </g>
            </g>
          )}

          {/* ================= 5. SQUARE KUFIC 2D INTERACTIVE GRID ================= */}
          {composition.script === 'square_kufic' && composition.kuficGrid && (
            <g transform={`translate(${canvasW / 2 - (composition.kuficGrid.cols * composition.kuficGrid.cellSize) / 2}, ${canvasH / 2 - (composition.kuficGrid.rows * composition.kuficGrid.cellSize) / 2})`}>
              {composition.kuficGrid.cells.map((row, rIdx) =>
                row.map((filled, cIdx) => {
                  const size = composition.kuficGrid!.cellSize;
                  const x = cIdx * size;
                  const y = rIdx * size;
                  return (
                    <rect
                      key={`${rIdx}-${cIdx}`}
                      x={x}
                      y={y}
                      width={size}
                      height={size}
                      fill={filled ? getInkFill() : 'transparent'}
                      stroke="rgba(150, 150, 150, 0.15)"
                      strokeWidth="1"
                      className="cursor-pointer hover:stroke-amber-400"
                      onClick={() => handleKuficCellClick(rIdx, cIdx)}
                    />
                  );
                })
              )}
            </g>
          )}

          {/* ================= 6. PROCEDURAL CALLIGRAPHIC GLYPHS ================= */}
          {composition.script !== 'square_kufic' && (
            <g id="calligraphy-layer">
              {composition.glyphs.map((glyph) => {
                const isSelected = selectedGlyph?.id === glyph.id;
                const pathStr = transformPath(
                  glyph.pathData,
                  glyph.x,
                  glyph.y,
                  glyph.scaleX * (glyph.reverseTail ? -1 : 1),
                  glyph.scaleY,
                  glyph.rotation,
                  0,
                  0
                );

                return (
                  <g key={glyph.id} className="cursor-move">
                    {/* Selected halo */}
                    {isSelected && (
                      <path
                        d={pathStr}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="5"
                        opacity="0.7"
                      />
                    )}

                    {/* Main Ink Glyph */}
                    <path
                      d={pathStr}
                      fill={getInkFill()}
                      stroke="none"
                      onPointerDown={(e) => handleGlyphPointerDown(e, glyph)}
                      className="transition-opacity hover:opacity-90"
                    />

                    {/* Glyph Dots */}
                    {glyph.dots.map((dot) => {
                      const dotPath = transformPath(
                        dot.pathData,
                        dot.x,
                        dot.y,
                        dot.scale,
                        dot.scale,
                        dot.rotation,
                        0,
                        0
                      );
                      return (
                        <path
                          key={dot.id}
                          d={dotPath}
                          fill={getInkFill()}
                          onPointerDown={(e) => handleGlyphPointerDown(e, glyph)}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </g>
          )}

          {/* ================= 7. FLOATING TASHKEEL & HARAKAT LAYER ================= */}
          <g id="tashkeel-layer">
            {composition.floatingTashkeel.map((t) => {
              const isSelected = selectedTashkeel?.id === t.id;
              const tPath = transformPath(t.pathData, t.x, t.y, t.scale, t.scale, t.rotation, 0, 0);

              return (
                <g key={t.id} className="cursor-move">
                  {isSelected && (
                    <circle
                      cx={t.x}
                      cy={t.y}
                      r="16"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  )}
                  <path
                    d={tPath}
                    fill={getInkFill()}
                    onPointerDown={(e) => handleTashkeelPointerDown(e, t)}
                    className="hover:opacity-80"
                  />
                </g>
              );
            })}
          </g>

          {/* ================= 8. VECTOR BOUNDING BOX & HANDLES FOR SELECTED GLYPH ================= */}
          {selectedGlyph && (
            <g className="pointer-events-none">
              <rect
                x={selectedGlyph.x - 45 * selectedGlyph.scaleX}
                y={selectedGlyph.y - 75 * selectedGlyph.scaleY}
                width={90 * selectedGlyph.scaleX}
                height={115 * selectedGlyph.scaleY}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.85"
              />
              <rect x={selectedGlyph.x - 45 * selectedGlyph.scaleX - 3} y={selectedGlyph.y - 75 * selectedGlyph.scaleY - 3} width="6" height="6" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
              <rect x={selectedGlyph.x + 45 * selectedGlyph.scaleX - 3} y={selectedGlyph.y - 75 * selectedGlyph.scaleY - 3} width="6" height="6" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
              <rect x={selectedGlyph.x - 45 * selectedGlyph.scaleX - 3} y={selectedGlyph.y + 40 * selectedGlyph.scaleY - 3} width="6" height="6" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
              <rect x={selectedGlyph.x + 45 * selectedGlyph.scaleX - 3} y={selectedGlyph.y + 40 * selectedGlyph.scaleY - 3} width="6" height="6" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1={selectedGlyph.x} y1={selectedGlyph.y - 75 * selectedGlyph.scaleY} x2={selectedGlyph.x} y2={selectedGlyph.y - 75 * selectedGlyph.scaleY - 18} stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx={selectedGlyph.x} cy={selectedGlyph.y - 75 * selectedGlyph.scaleY - 18} r="4.5" fill="#38bdf8" />
            </g>
          )}

        </svg>

        {/* ================= 9. INTERACTIVE FLOATING QUICK SCULPT TOOLBAR ================= */}
        {selectedGlyph && (
          <div
            style={{
              position: 'absolute',
              left: `${selectedGlyph.x}px`,
              top: `${Math.max(10, selectedGlyph.y - 75 * selectedGlyph.scaleY - 42)}px`,
              transform: 'translateX(-50%)',
            }}
            className="bg-[#121520]/95 backdrop-blur-md border border-amber-500/40 rounded-xl px-2 py-1 shadow-2xl flex items-center gap-1.5 z-40 text-stone-200 text-xs"
          >
            <span className="font-bold text-amber-300 font-serif px-1">{selectedGlyph.char}</span>
            {selectedGlyph.availableAlternates.length > 1 && (
              <button
                onClick={() => {
                  const nextAlt = (selectedGlyph.alternateIndex + 1) % selectedGlyph.availableAlternates.length;
                  onUpdateGlyph({ ...selectedGlyph, alternateIndex: nextAlt });
                }}
                className="px-2 py-0.5 rounded bg-[#1e2334] hover:bg-amber-600 hover:text-stone-950 text-[10px] font-semibold transition-colors"
                title="Cycle Alternate Form"
              >
                Alt {selectedGlyph.alternateIndex + 1}/{selectedGlyph.availableAlternates.length}
              </button>
            )}
            <button
              onClick={() => onUpdateGlyph({ ...selectedGlyph, elevation: selectedGlyph.elevation + 6 })}
              className="px-1.5 py-0.5 rounded hover:bg-[#202538] text-[10px]"
              title="Lift Baseline (+6px)"
            >
              ▲ Lift
            </button>
            <button
              onClick={() => onUpdateGlyph({ ...selectedGlyph, elevation: selectedGlyph.elevation - 6 })}
              className="px-1.5 py-0.5 rounded hover:bg-[#202538] text-[10px]"
              title="Drop Baseline (-6px)"
            >
              ▼ Drop
            </button>
            <button
              onClick={() => onUpdateGlyph({ ...selectedGlyph, reverseTail: !selectedGlyph.reverseTail })}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                selectedGlyph.reverseTail ? 'bg-amber-600 text-stone-950 font-bold' : 'hover:bg-[#202538]'
              }`}
              title="Reverse Tail (Ya Marduda)"
            >
              ⇄ Marduda
            </button>
            {onDeleteGlyph && (
              <button
                onClick={() => onDeleteGlyph(selectedGlyph.id)}
                className="p-1 rounded text-red-400 hover:bg-red-950/40 text-xs ml-0.5"
                title="Delete Letter"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Canvas HUD Overlay */}
      <div className="absolute bottom-4 left-6 flex items-center gap-2 bg-[#12141d]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#272b3b] text-stone-300 text-xs shadow-xl pointer-events-none">
        <span className="text-amber-400 font-bold uppercase text-[10px] tracking-wider">
          {composition.script.replace('_', ' ')}
        </span>
        <span className="text-stone-600">•</span>
        <span className="text-stone-400 text-[11px]">
          {composition.shape !== 'none' ? `Contour: ${composition.shape}` : 'Freeform Composition'}
        </span>
        <span className="text-stone-600">•</span>
        <span className="text-stone-400 text-[11px]">
          Space+Drag to Pan • Wheel to Zoom
        </span>
      </div>

    </div>
  );
}
