'use client';

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileCode, 
  Layers, 
  Scissors, 
  Image as ImageIcon, 
  CheckCircle2, 
  Sparkles,
  Zap
} from 'lucide-react';
import { CompositionState } from '@/lib/calligraphy/types';
import { 
  generateSvgExport, 
  generateDxfExport, 
  downloadFile, 
  downloadRasterImage 
} from '@/lib/calligraphy/exportPipeline';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  composition: CompositionState;
}

export default function ExportModal({
  isOpen,
  onClose,
  composition
}: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'vector' | 'dxf' | 'raster'>('vector');
  const [weldPaths, setWeldPaths] = useState(true);
  const [strokeOnly, setStrokeOnly] = useState(false);
  const [includeBorders, setIncludeBorders] = useState(true);
  const [includeTashkeel, setIncludeTashkeel] = useState(true);
  const [rasterFormat, setRasterFormat] = useState<'png' | 'jpeg'>('png');
  const [rasterResolution, setRasterResolution] = useState<1080 | 2160 | 4000>(2160);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const baseFileName = (composition.title || 'calligraphy-composition')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');

  // Handle SVG download
  const handleDownloadSvg = () => {
    const svgData = generateSvgExport(composition, {
      weldPaths,
      strokeOnlyForCutting: strokeOnly,
      includeBorders,
      includeTashkeel,
      paperBackground: !strokeOnly,
    });
    downloadFile(`${baseFileName}.svg`, svgData, 'image/svg+xml');
    triggerSuccess();
  };

  // Handle DXF download
  const handleDownloadDxf = () => {
    const dxfData = generateDxfExport(composition);
    downloadFile(`${baseFileName}.dxf`, dxfData, 'application/dxf');
    triggerSuccess();
  };

  // Handle Raster PNG/JPG download
  const handleDownloadRaster = async () => {
    setIsExporting(true);
    try {
      const svgData = generateSvgExport(composition, {
        weldPaths: true,
        includeBorders,
        includeTashkeel,
        strokeOnlyForCutting: false,
        paperBackground: rasterFormat === 'jpeg',
      });
      await downloadRasterImage(
        svgData,
        `${baseFileName}-${rasterResolution}p.${rasterFormat}`,
        rasterFormat,
        rasterResolution
      );
      triggerSuccess();
    } catch (err) {
      console.error('Raster export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const triggerSuccess = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#10121a] border border-[#272d3f] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-stone-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#202534] flex items-center justify-between bg-[#141622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-100 font-serif">
                Production & Vector Export Pipeline
              </h3>
              <p className="text-xs text-stone-400">
                100% Free & Unlocked • Laser Engravers, CNC Routers, Cricut, Illustrator & 4K Print
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-[#202434] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#202534] bg-[#12141c]">
          <button
            onClick={() => setActiveTab('vector')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'vector'
                ? 'border-amber-500 text-amber-300 bg-[#171a25]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Vector SVG (Laser / Cricut)</span>
          </button>

          <button
            onClick={() => setActiveTab('dxf')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'dxf'
                ? 'border-amber-500 text-amber-300 bg-[#171a25]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>AutoCAD DXF (CNC Routers)</span>
          </button>

          <button
            onClick={() => setActiveTab('raster')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'raster'
                ? 'border-amber-500 text-amber-300 bg-[#171a25]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Raster (4K PNG & JPG)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* TAB 1: SVG VECTOR */}
          {activeTab === 'vector' && (
            <div className="space-y-4">
              <div className="bg-[#151724] border border-[#262c3f] p-4 rounded-xl space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                  SVG Laser & Cutter Settings
                </span>

                <label className="flex items-center gap-2.5 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={weldPaths}
                    onChange={(e) => setWeldPaths(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>Weld all letter strokes into a single continuous compound path (Prevents overlapping double cuts in LightBurn/Laser)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={strokeOnly}
                    onChange={(e) => setStrokeOnly(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>Hairline Cut Stroke Only (No fills, red cut lines for laser/vinyl cutters)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={includeBorders}
                    onChange={(e) => setIncludeBorders(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>Include shape boundary contour & border frames</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={includeTashkeel}
                    onChange={(e) => setIncludeTashkeel(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>Include Tashkeel vowels & ornamental nuqtas</span>
                </label>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-stone-300 text-[11px] flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Compatible with LightBurn, Glowforge, xTool, Cricut Design Space, Silhouette Studio, and Adobe Illustrator.</span>
              </div>

              <button
                onClick={handleDownloadSvg}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 rounded-xl font-bold text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Clean Vector SVG</span>
              </button>
            </div>
          )}

          {/* TAB 2: DXF CAD */}
          {activeTab === 'dxf' && (
            <div className="space-y-4">
              <div className="bg-[#151724] border border-[#262c3f] p-4 rounded-xl space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                  AutoCAD DXF R12 Machine Code
                </span>
                <p className="text-stone-300 leading-relaxed text-xs">
                  Generates clean, closed <code className="text-amber-300 font-mono">POLYLINE</code> and <code className="text-amber-300 font-mono">VERTEX</code> entities with zero 3D artifacts.
                  Feeds directly into CNC wood routers, marble waterjet cutters, and industrial metal plasma machines.
                </p>
                <div className="p-2.5 rounded-lg bg-[#0e1017] border border-stone-800 font-mono text-[11px] text-stone-400">
                  Layer: CALLIGRAPHY • Format: AC1009 (R12 Standard) • Units: mm
                </div>
              </div>

              <button
                onClick={handleDownloadDxf}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 rounded-xl font-bold text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Machine-Ready DXF</span>
              </button>
            </div>
          )}

          {/* TAB 3: HIGH-RES RASTER */}
          {activeTab === 'raster' && (
            <div className="space-y-4">
              <div className="bg-[#151724] border border-[#262c3f] p-4 rounded-xl space-y-3">
                
                {/* Format selection */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Image Format
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setRasterFormat('png')}
                      className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
                        rasterFormat === 'png'
                          ? 'bg-amber-600 text-stone-950 font-bold'
                          : 'bg-[#1b1e2b] text-stone-300'
                      }`}
                    >
                      Transparent PNG (Lossless)
                    </button>
                    <button
                      onClick={() => setRasterFormat('jpeg')}
                      className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
                        rasterFormat === 'jpeg'
                          ? 'bg-amber-600 text-stone-950 font-bold'
                          : 'bg-[#1b1e2b] text-stone-300'
                      }`}
                    >
                      High-DPI JPG (With Paper Texture)
                    </button>
                  </div>
                </div>

                {/* Resolution selection */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Render Resolution
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { res: 1080 as const, label: '1080p (Full HD)' },
                      { res: 2160 as const, label: '2K Quad HD' },
                      { res: 4000 as const, label: '4K Ultra HD (Print)' },
                    ].map((item) => (
                      <button
                        key={item.res}
                        onClick={() => setRasterResolution(item.res)}
                        className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
                          rasterResolution === item.res
                            ? 'bg-amber-600 text-stone-950 font-bold'
                            : 'bg-[#1b1e2b] text-stone-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <button
                onClick={handleDownloadRaster}
                disabled={isExporting}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 rounded-xl font-bold text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isExporting ? (
                  <span>Rendering {rasterResolution}p Canvas...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download {rasterResolution}p {rasterFormat.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Success Banner */}
          {exportSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>File exported successfully with zero watermarks!</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
