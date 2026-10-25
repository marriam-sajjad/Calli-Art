'use client';

import React, { useState } from 'react';
import { 
  Download, 
  BookOpen, 
  Search, 
  Filter, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  Sliders, 
  Printer, 
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_RESOURCES } from '@/lib/mock-data';
import { Resource } from '@/lib/types';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Custom Guideline Sheet Generator Modal state
  const [showGenerator, setShowGenerator] = useState(false);
  const [slantAngle, setSlantAngle] = useState(55);
  const [xHeight, setXHeight] = useState(5); // mm
  const [ascenderRatio, setAscenderRatio] = useState(3);
  const [descenderRatio, setDescenderRatio] = useState(3);

  const categories = ['All', 'Practice Sheets', 'Brush Packs', 'Guides & Cheat Sheets', 'Masterclass'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Masterclass'];

  const filteredResources = resources.filter((res) => {
    const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || res.difficulty === selectedDifficulty;
    const matchesSearch = 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.file_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  // Handle Resource Download
  const handleDownloadResource = (resource: Resource) => {
    setDownloadingId(resource.id);

    setTimeout(() => {
      // Increment download counter
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, download_count: r.download_count + 1 } : r))
      );
      setDownloadingId(null);

      // Trigger dummy or generated file download
      generateDownloadableGuide(resource.title);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#c59b27', '#171717', '#e5d5b7'],
      });
    }, 900);
  };

  // Generate and download a real SVG guideline printable sheet
  const generateDownloadableGuide = (title: string) => {
    const width = 800;
    const height = 1100;
    const slantRad = (slantAngle * Math.PI) / 180;
    const tan = Math.tan(slantRad);

    let linesSvg = '';
    // Draw horizontal ruling lines
    const unit = xHeight * 4;
    for (let y = 100; y < height - 100; y += unit * 3) {
      linesSvg += `
        <!-- Ascender line -->
        <line x1="50" y1="${y}" x2="${width - 50}" y2="${y}" stroke="#b0a898" stroke-width="0.8" />
        <!-- Waistline (x-height) -->
        <line x1="50" y1="${y + unit}" x2="${width - 50}" y2="${y + unit}" stroke="#b0a898" stroke-width="0.8" stroke-dasharray="4,4" />
        <!-- Baseline -->
        <line x1="50" y1="${y + unit * 2}" x2="${width - 50}" y2="${y + unit * 2}" stroke="#6b5b45" stroke-width="1.5" />
        <!-- Descender line -->
        <line x1="50" y1="${y + unit * 3}" x2="${width - 50}" y2="${y + unit * 3}" stroke="#b0a898" stroke-width="0.8" />
      `;
    }

    // Draw slant lines
    for (let x = -height; x < width + height; x += 45) {
      linesSvg += `<line x1="${x}" y1="${height}" x2="${x + height / tan}" y2="0" stroke="#dcd4c3" stroke-width="0.6" />`;
    }

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <rect width="100%" height="100%" fill="#ffffff" />
        <text x="50" y="50" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#1c1917">Calli Art — ${title}</text>
        <text x="50" y="70" font-family="sans-serif" font-size="11" fill="#78716c">Slant Angle: ${slantAngle}° | x-Height: ${xHeight}mm | Scaled for A4 / Letter Printing</text>
        <g>${linesSvg}</g>
        <text x="${width - 200}" y="${height - 40}" font-family="sans-serif" font-size="10" fill="#a8a29e">calliart.studio/resources</text>
      </svg>
    `;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-guideline.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Digital Downloads & Downloads</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Calligraphy Practice Sheets & Guides
            </h1>
            <p className="text-stone-600 text-sm mt-1 max-w-2xl leading-relaxed">
              Curated master guides, printable 55° slant ruling sheets, Procreate brush packs, and ductus exemplars for serious scribes.
            </p>
          </div>

          {/* Quick Generator Button */}
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold shadow-md transition-all shrink-0"
          >
            <Sliders className="w-4 h-4" />
            <span>Generate Custom Ruling Sheet</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Difficulty Selector */}
            <div className="relative">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 pr-8 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500 appearance-none cursor-pointer"
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    Level: {d}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search practice sheets..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const isDownloading = downloadingId === res.id;
            return (
              <div
                key={res.id}
                className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-stone-100">
                    <img
                      src={res.preview_url}
                      alt={res.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-stone-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        {res.file_type}
                      </span>
                      <span className="bg-white/90 backdrop-blur-md text-stone-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {res.file_size}
                      </span>
                    </div>

                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      res.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-800' :
                      res.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {res.difficulty}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
                      {res.category}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {res.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs text-stone-400 font-medium">
                      {res.download_count.toLocaleString()} downloads
                    </span>

                    <button
                      onClick={() => handleDownloadResource(res)}
                      disabled={isDownloading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Preparing...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 text-amber-300" />
                          <span>Download Free</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-300 p-8">
            <BookOpen className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-stone-900">No resources matched your search</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              Try adjusting your category filter or search keywords.
            </p>
          </div>
        )}

      </div>

      {/* =========================================================================
          Custom Guideline Sheet Generator Modal
      ========================================================================= */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Guideline Sheet Generator</h3>
                  <p className="text-xs text-stone-500">Generate high-precision printable ruling paper for printing.</p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerator(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Slant Angle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-stone-700">
                  <span>Slant Angle</span>
                  <span className="font-mono text-amber-800">{slantAngle}°</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={75}
                  value={slantAngle}
                  onChange={(e) => setSlantAngle(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <div className="flex items-center justify-between text-[10px] text-stone-400">
                  <span>45° Italic</span>
                  <span className="font-bold text-stone-800">55° Copperplate standard</span>
                  <span>60° Spencerian</span>
                </div>
              </div>

              {/* x-Height */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-stone-700">
                  <span>x-Height (Waist to Baseline)</span>
                  <span className="font-mono text-amber-800">{xHeight} mm</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={12}
                  value={xHeight}
                  onChange={(e) => setXHeight(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              {/* Preview preview box */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1">
                <p className="font-medium text-stone-800">Ready to Export Printable Vector</p>
                <p className="text-[11px] text-stone-500">
                  Generates an ultra-crisp SVG / printable sheet ready for your desk printer.
                </p>
              </div>

              <button
                onClick={() => {
                  generateDownloadableGuide('Custom Practice Pad');
                  setShowGenerator(false);
                }}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Download Printable Guideline (SVG / Vector)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
