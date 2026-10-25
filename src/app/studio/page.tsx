'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PenTool, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  Download, 
  Share2, 
  Layers, 
  Eye, 
  EyeOff, 
  Palette, 
  Sliders, 
  Check, 
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Brush,
  Feather
} from 'lucide-react';
import { BrushType, PaperTexture, GuidelineMode } from '@/lib/types';

export default function StudioPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Brush Settings
  const [brushType, setBrushType] = useState<BrushType>('broad_chisel');
  const [brushSize, setBrushSize] = useState<number>(18);
  const [nibAngle, setNibAngle] = useState<number>(45); // Degrees (0-90)
  const [inkColor, setInkColor] = useState<string>('#171717');
  const [inkOpacity, setInkOpacity] = useState<number>(1.0);

  // Paper & Guidelines
  const [paper, setPaper] = useState<PaperTexture>('parchment');
  const [guideline, setGuideline] = useState<GuidelineMode>('copperplate');
  const [showGuidelines, setShowGuidelines] = useState<boolean>(true);
  const [guidelineOpacity, setGuidelineOpacity] = useState<number>(0.35);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number; time: number; pressure?: number } | null>(null);
  
  // History for Undo / Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const maxHistorySteps = 25;

  // Color Swatches
  const colorSwatches = [
    { name: 'Sumi Ink', hex: '#171717' },
    { name: 'Walnut Sepia', hex: '#4a2e18' },
    { name: 'Illuminated Gold', hex: '#c59b27' },
    { name: 'Royal Crimson', hex: '#8b1e2f' },
    { name: 'Lapis Indigo', hex: '#1c3144' },
    { name: 'Forest Emerald', hex: '#234e38' },
    { name: 'Parchment White', hex: '#fdfbf7' },
  ];

  // Paper backgrounds
  const paperStyles: Record<PaperTexture, { bg: string; name: string }> = {
    parchment: { bg: '#fbf8ee', name: 'Antique Parchment' },
    dark_obsidian: { bg: '#13151b', name: 'Dark Obsidian' },
    handmade_deckle: { bg: '#f2eee5', name: 'Handmade Deckle' },
    clean_white: { bg: '#ffffff', name: 'Pure White' },
  };

  // Setup Canvas Dimensions & Initial State
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const overlay = overlayCanvasRef.current;
    if (!canvas || !overlay) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth;
    const height = Math.max(parent.clientHeight, 620);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    overlay.width = width * dpr;
    overlay.height = height * dpr;
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Fill background
    ctx.fillStyle = paperStyles[paper].bg;
    ctx.fillRect(0, 0, width, height);

    // Save initial state in history
    const initialImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialImageData]);
    setHistoryIndex(0);

    drawGuidelines(overlay, width, height);
  }, [paper]);

  // Draw Guidelines on Overlay Canvas
  const drawGuidelines = useCallback((overlay: HTMLCanvasElement, width: number, height: number) => {
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (!showGuidelines || guideline === 'none') return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = paper === 'dark_obsidian' ? '#ffffff' : '#8c7b64';
    ctx.globalAlpha = guidelineOpacity;
    ctx.lineWidth = 1;

    if (guideline === 'copperplate') {
      // 55-degree slant lines + 4-line ruling grid
      const slantAngle = (55 * Math.PI) / 180;
      const tanSlant = Math.tan(slantAngle);

      // Horizontal lines (Ascender, Waist, Base, Descender)
      const lineHeight = 60;
      const startY = 80;
      for (let y = startY; y < height - 60; y += lineHeight * 2) {
        // Ascender
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        // Waistline
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, y + lineHeight * 0.4);
        ctx.lineTo(width, y + lineHeight * 0.4);
        ctx.stroke();
        ctx.setLineDash([]);

        // Baseline (thicker)
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y + lineHeight);
        ctx.lineTo(width, y + lineHeight);
        ctx.stroke();
        ctx.lineWidth = 1;

        // Descender
        ctx.beginPath();
        ctx.moveTo(0, y + lineHeight * 1.6);
        ctx.lineTo(width, y + lineHeight * 1.6);
        ctx.stroke();
      }

      // 55° Slant Lines
      const slantSpacing = 40;
      for (let x = -height; x < width + height; x += slantSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(x + height / tanSlant, 0);
        ctx.stroke();
      }
    } else if (guideline === 'gothic') {
      // Gothic 5-nib-width ruling
      const nibStep = brushSize;
      const xHeight = nibStep * 5;
      for (let y = 80; y < height - 60; y += xHeight + 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, y + xHeight);
        ctx.lineTo(width, y + xHeight);
        ctx.stroke();
      }
    } else if (guideline === 'arabic_nuqta') {
      // Rhombic Nuqta dot grid
      const dotSize = brushSize * 1.1;
      const angleRad = (70 * Math.PI) / 180;
      for (let y = 60; y < height; y += dotSize * 2.5) {
        for (let x = 60; x < width; x += dotSize * 2.5) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angleRad);
          ctx.strokeRect(-dotSize / 2, -dotSize / 2, dotSize, dotSize);
          ctx.restore();
        }
      }
    } else if (guideline === 'grid') {
      // Simple dot grid
      const step = 25;
      for (let x = step; x < width; x += step) {
        for (let y = step; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fillStyle = paper === 'dark_obsidian' ? '#ffffff' : '#8c7b64';
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }, [guideline, showGuidelines, guidelineOpacity, paper, brushSize]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => initCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  // Redraw guidelines when toggle/options change
  useEffect(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const parent = overlay.parentElement;
    if (!parent) return;
    drawGuidelines(overlay, parent.clientWidth, Math.max(parent.clientHeight, 620));
  }, [drawGuidelines]);

  // Push Canvas State to Undo History
  const pushState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    if (newHistory.length >= maxHistorySteps) {
      newHistory.shift();
    }
    newHistory.push(data);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newIndex = historyIndex - 1;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newIndex = historyIndex + 1;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  // Clear Canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    ctx.fillStyle = paperStyles[paper].bg;
    ctx.fillRect(0, 0, parent.clientWidth, Math.max(parent.clientHeight, 620));
    pushState();
  };

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setLastPoint({ 
      x, 
      y, 
      time: Date.now(), 
      pressure: e.pressure && e.pressure > 0 ? e.pressure : 0.5 
    });
  };

  // Pointer Move (Stroke Rendering Engine)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const currentTime = Date.now();
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;

    ctx.save();
    ctx.fillStyle = inkColor;
    ctx.strokeStyle = inkColor;
    ctx.globalAlpha = inkOpacity;

    if (brushType === 'broad_chisel' || brushType === 'qalam_reed') {
      // Broad-edge / Qalam Nib: Ribbon polygon connection at specified angle
      const angle = brushType === 'qalam_reed' ? 70 : nibAngle;
      const rad = (angle * Math.PI) / 180;
      const halfSize = brushSize / 2;

      const dx = halfSize * Math.cos(rad);
      const dy = halfSize * Math.sin(rad);

      ctx.beginPath();
      ctx.moveTo(lastPoint.x - dx, lastPoint.y - dy);
      ctx.lineTo(lastPoint.x + dx, lastPoint.y + dy);
      ctx.lineTo(currentX + dx, currentY + dy);
      ctx.lineTo(currentX - dx, currentY - dy);
      ctx.closePath();
      ctx.fill();

      // Soft cap rounded nib edge
      ctx.beginPath();
      ctx.arc(currentX, currentY, 1, 0, Math.PI * 2);
      ctx.fill();

    } else if (brushType === 'pointed_flex') {
      // Pointed Copperplate Pen: Speed & pressure sensitive swell
      const dist = Math.hypot(currentX - lastPoint.x, currentY - lastPoint.y);
      const timeDiff = Math.max(currentTime - lastPoint.time, 1);
      const speed = dist / timeDiff;

      // Downward direction gives swell; upstrokes stay hairline thin
      const isDownstroke = currentY > lastPoint.y;
      const flexFactor = isDownstroke ? Math.min(pressure * 2.2, 1.8) : 0.3;
      const dynamicSize = Math.max(2, brushSize * flexFactor * (1 / (speed * 0.5 + 1)));

      ctx.lineWidth = dynamicSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

    } else if (brushType === 'brush_script') {
      // Modern Brush Pen: Smooth fluid taper
      const dynamicSize = Math.max(3, brushSize * (pressure * 1.5));
      ctx.lineWidth = dynamicSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

    } else {
      // Monoline
      ctx.lineWidth = brushSize / 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
    }

    ctx.restore();
    setLastPoint({ x: currentX, y: currentY, time: currentTime, pressure });
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPoint(null);
      pushState();
    }
  };

  // Download Canvas as PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `calli-art-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Publish / Share directly to Community Feed
  const handlePublishToFeed = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('calli_studio_export', dataUrl);
      router.push('/feed');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#13161d] text-stone-200">
      
      {/* Studio Top Control Ribbon */}
      <div className="bg-[#1c202a] border-b border-stone-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md z-10">
        
        {/* Left: Brush Selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'broad_chisel', label: 'Chisel Nib (Gothic/Italic)', icon: PenTool },
            { id: 'pointed_flex', label: 'Pointed Flex (Copperplate)', icon: Feather },
            { id: 'qalam_reed', label: 'Qalam Reed (Arabic)', icon: Brush },
            { id: 'brush_script', label: 'Brush Pen (Modern)', icon: Sparkles },
            { id: 'monoline', label: 'Monoline Pen', icon: PenTool },
          ].map((b) => {
            const Icon = b.icon;
            const isSelected = brushType === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setBrushType(b.id as BrushType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{b.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Actions (Undo, Redo, Clear, Download, Publish) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-40 transition-colors"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-40 transition-colors"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleClear}
            className="p-2 rounded-xl bg-stone-800 hover:bg-red-900/60 text-stone-300 hover:text-red-300 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
            title="Download PNG"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Export PNG</span>
          </button>

          <button
            onClick={handlePublishToFeed}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Publish to Feed</span>
          </button>
        </div>

      </div>

      {/* Main Studio Body: Side Panel + Canvas Area */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* Left Studio Tool Palettes (Size, Nib Angle, Colors, Guidelines) */}
        <div className="w-full md:w-72 bg-[#171b24] border-r border-stone-800/90 p-4 space-y-5 overflow-y-auto max-h-[35vh] md:max-h-none shrink-0 text-xs">
          
          {/* Nib Size & Angle Controls */}
          <div className="space-y-3 bg-[#1e2330] p-3.5 rounded-2xl border border-stone-800">
            <div className="flex items-center justify-between text-stone-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Nib Size
              </span>
              <span className="font-mono text-amber-300">{brushSize}px</span>
            </div>
            <input
              type="range"
              min={2}
              max={60}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />

            {(brushType === 'broad_chisel' || brushType === 'qalam_reed') && (
              <div className="pt-2 border-t border-stone-700/60 space-y-2">
                <div className="flex items-center justify-between text-stone-300 font-medium">
                  <span>Nib Angle</span>
                  <span className="font-mono text-amber-300">{nibAngle}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  value={nibAngle}
                  onChange={(e) => setNibAngle(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex items-center justify-between gap-1 text-[10px] text-stone-400">
                  <button onClick={() => setNibAngle(30)} className="hover:text-amber-300">30° Roman</button>
                  <button onClick={() => setNibAngle(45)} className="hover:text-amber-300 font-bold text-amber-400">45° Gothic</button>
                  <button onClick={() => setNibAngle(70)} className="hover:text-amber-300">70° Qalam</button>
                </div>
              </div>
            )}
          </div>

          {/* Ink Color Palette */}
          <div className="space-y-2 bg-[#1e2330] p-3.5 rounded-2xl border border-stone-800">
            <div className="flex items-center justify-between font-medium text-stone-300">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Ink Palette
              </span>
              <div 
                className="w-4 h-4 rounded-full border border-stone-600" 
                style={{ backgroundColor: inkColor }} 
              />
            </div>
            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {colorSwatches.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setInkColor(color.hex)}
                  className={`w-7 h-7 rounded-lg border transition-transform flex items-center justify-center ${
                    inkColor === color.hex ? 'scale-110 border-amber-400 shadow-sm' : 'border-stone-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {inkColor === color.hex && (
                    <Check className={`w-3.5 h-3.5 ${color.hex === '#fdfbf7' ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-700/60">
              <span className="text-stone-400 text-[11px]">Custom Hex</span>
              <input
                type="color"
                value={inkColor}
                onChange={(e) => setInkColor(e.target.value)}
                className="w-7 h-6 bg-transparent cursor-pointer rounded"
              />
            </div>
          </div>

          {/* Calligraphy Guidelines Overlay */}
          <div className="space-y-3 bg-[#1e2330] p-3.5 rounded-2xl border border-stone-800">
            <div className="flex items-center justify-between font-medium text-stone-300">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Practice Guidelines
              </span>
              <button
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="text-stone-400 hover:text-amber-400 transition-colors"
                title={showGuidelines ? 'Hide Guidelines' : 'Show Guidelines'}
              >
                {showGuidelines ? <Eye className="w-4 h-4 text-amber-400" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'copperplate', label: '55° Slant' },
                { id: 'arabic_nuqta', label: 'Nuqta Dots' },
                { id: 'gothic', label: 'Gothic 5x' },
                { id: 'grid', label: 'Dot Grid' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => { setGuideline(g.id as GuidelineMode); setShowGuidelines(true); }}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all ${
                    guideline === g.id && showGuidelines
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {showGuidelines && (
              <div className="pt-2 border-t border-stone-700/60 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>Guide Opacity</span>
                  <span className="font-mono text-amber-300">{Math.round(guidelineOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.8}
                  step={0.05}
                  value={guidelineOpacity}
                  onChange={(e) => setGuidelineOpacity(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Paper Background Style */}
          <div className="space-y-2 bg-[#1e2330] p-3.5 rounded-2xl border border-stone-800">
            <span className="font-medium text-stone-300 block">Paper Surface</span>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(paperStyles) as PaperTexture[]).map((pKey) => (
                <button
                  key={pKey}
                  onClick={() => setPaper(pKey)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all ${
                    paper === pKey
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                  }`}
                >
                  {paperStyles[pKey].name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Studio Canvas Working Area */}
        <div className="flex-1 relative flex items-center justify-center p-2 sm:p-6 bg-obsidian-pattern overflow-hidden">
          <div className="relative w-full h-full max-w-5xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex items-center justify-center">
            
            {/* Base Drawing Canvas */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="absolute inset-0 w-full h-full cursor-crosshair canvas-container"
            />

            {/* Non-destructive Guideline Overlay Canvas */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Quick floating status badge */}
            <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] font-mono text-stone-400/80 bg-stone-900/80 px-2.5 py-1 rounded-full border border-stone-800 backdrop-blur-sm">
              {brushType.replace('_', ' ').toUpperCase()} • {brushSize}px {brushType === 'broad_chisel' ? `• ${nibAngle}°` : ''}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
