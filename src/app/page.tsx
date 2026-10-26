'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PenTool, 
  Sparkles, 
  BookOpen, 
  Share2, 
  ArrowRight, 
  Heart, 
  Download, 
  Layers, 
  CheckCircle,
  Database,
  ShieldCheck,
  Feather,
  Palette
} from 'lucide-react';
import { INITIAL_POSTS, INITIAL_RESOURCES } from '@/lib/mock-data';

export default function HomePage() {
  // Mini interactive scratchpad in the hero
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Initial background & welcoming text
    ctx.fillStyle = '#f8f4ec';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw guideline
    ctx.strokeStyle = '#e5d5b7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, rect.height * 0.65);
    ctx.lineTo(rect.width - 30, rect.height * 0.65);
    ctx.stroke();

    // Subtle helper text
    ctx.font = 'italic 16px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#a89d8d';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Test your stroke here: draw a curve with your mouse or finger', rect.width / 2, rect.height / 2);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!hasDrawn) {
      // Clear placeholder on first draw
      ctx.fillStyle = '#f8f4ec';
      ctx.fillRect(0, 0, rect.width, rect.height);
      setHasDrawn(true);
    }

    setIsDrawing(true);
    setLastPoint({ x, y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // Chisel / Calligraphy broad nib simulation (angle ~ 45deg)
    const nibSize = 14;
    const angleRad = (45 * Math.PI) / 180;
    const dx = (nibSize / 2) * Math.cos(angleRad);
    const dy = (nibSize / 2) * Math.sin(angleRad);

    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(lastPoint.x - dx, lastPoint.y - dy);
    ctx.lineTo(lastPoint.x + dx, lastPoint.y + dy);
    ctx.lineTo(currentX + dx, currentY + dy);
    ctx.lineTo(currentX - dx, currentY - dy);
    ctx.closePath();
    ctx.fill();

    setLastPoint({ x: currentX, y: currentY });
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearMiniCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#f8f4ec';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fdfbf7] via-[#f7f2e7] to-[#fdfbf7] border-b border-stone-200/70 pt-12 lg:pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>MyQalam Studio • 100% Free &amp; Unlocked</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
                Arabic Calligraphy <span className="text-amber-800 underline decoration-amber-400 decoration-wavy decoration-2">Design Studio</span>
              </h1>

              <p className="text-stone-600 text-base sm:text-lg max-w-2xl leading-relaxed mx-auto lg:mx-0">
                A browser-based studio inspired by <strong>MyQalam Studio</strong>: procedural vector engines for <strong>Thuluth</strong>, <strong>Jali Diwani</strong>, and <strong>Square Kufic</strong>, automatic shape fitting (Circles, Teardrops, Mihrabs), full Quran &amp; Dhikr library, laser-ready welded SVG &amp; DXF CNC export, and stroke-by-stroke animated video generation.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/studio"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-amber-200 font-semibold text-base shadow-lg shadow-amber-950/20 hover:brightness-110 hover:shadow-xl transition-all border border-amber-500/30"
                >
                  <PenTool className="w-5 h-5 text-amber-400" />
                  <span>Launch MyQalam Studio</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  href="/feed"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-stone-300 text-stone-800 font-medium text-base hover:bg-stone-50 hover:border-stone-400 shadow-sm transition-all"
                >
                  <span>Explore Community Feed</span>
                </Link>
              </div>

              {/* Feature Pills */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>100% Unlocked • No Paywalls</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Laser SVG &amp; CNC DXF Ready</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Stroke-by-Stroke Video Generator</span>
                </div>
              </div>
            </div>

            {/* Right Mini Interactive Canvas */}
            <div className="lg:col-span-5">
              <div className="bg-white p-4 rounded-3xl border border-stone-300/80 shadow-xl shadow-stone-900/5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-stone-500 ml-2">Interactive Chisel Pen</span>
                  </div>
                  <button
                    onClick={clearMiniCanvas}
                    className="text-xs text-stone-400 hover:text-stone-700 underline"
                  >
                    Clear
                  </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-stone-200">
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    className="w-full h-64 sm:h-72 cursor-crosshair canvas-container"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-500">
                    Broad edge nib simulation (45° angle)
                  </span>
                  <Link
                    href="/studio"
                    className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                  >
                    <span>Full Studio & Guides</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The 4 Core Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
            Complete Calligraphy Architecture
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Engineered precisely according to your system blueprint with Next.js, Tailwind CSS, and Supabase.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Link in Bio */}
          <Link
            href="/links"
            className="group p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                Link-in-Bio Portal
              </h3>
              <p className="text-xs text-stone-500 font-mono mt-0.5">/links</p>
              <p className="text-sm text-stone-600 mt-3 leading-relaxed">
                Mobile-first artist profile hub with social links, portfolio highlights, QR code sharing, and custom bio cards.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-amber-800 group-hover:translate-x-1 transition-transform">
              <span>View Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 2: Community Feed */}
          <Link
            href="/feed"
            className="group p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                Community Showcase
              </h3>
              <p className="text-xs text-stone-500 font-mono mt-0.5">/feed</p>
              <p className="text-sm text-stone-600 mt-3 leading-relaxed">
                Responsive artwork gallery with category filters, live like counters, comments, and Supabase image uploads.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-rose-700 group-hover:translate-x-1 transition-transform">
              <span>Browse Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 3: Interactive Canvas */}
          <Link
            href="/studio"
            className="group p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                MyQalam Arabic Studio
              </h3>
              <p className="text-xs text-stone-500 font-mono mt-0.5">/studio</p>
              <p className="text-sm text-stone-600 mt-3 leading-relaxed">
                Full-featured Arabic Calligraphy Design Studio: Thuluth, Jali Diwani, Square Kufic, automatic shape fitting, Quran library, laser SVG/DXF, and video generator.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-stone-900 group-hover:translate-x-1 transition-transform">
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 4: Digital Downloads */}
          <Link
            href="/resources"
            className="group p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                Digital Downloads
              </h3>
              <p className="text-xs text-stone-500 font-mono mt-0.5">/resources</p>
              <p className="text-sm text-stone-600 mt-3 leading-relaxed">
                Downloadable PDF practice sheets, Procreate brush packs, letterform anatomy guides, and instant ruling sheet generator.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-blue-700 group-hover:translate-x-1 transition-transform">
              <span>Access Downloads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

        </div>
      </section>

      {/* Responsive Showcase Feed Preview (Using the User's exact layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-amber-700 mb-1">
              Community Gallery
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Latest Handcrafted Artworks
            </h2>
          </div>
          <Link
            href="/feed"
            className="text-sm font-semibold text-stone-800 hover:text-amber-800 flex items-center gap-1"
          >
            <span>View All Artworks ({INITIAL_POSTS.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Desktop: Multi-column Grid | Mobile: Single-column Feed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {INITIAL_POSTS.slice(0, 4).map((post) => (
            <div 
              key={post.id} 
              className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition group"
            >
              <div className="relative h-56 overflow-hidden bg-stone-100">
                <img 
                  src={post.media_url} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt={post.title} 
                />
                <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-stone-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-stone-600 line-clamp-2">
                  {post.description}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100">
                  <span>@{post.author?.username || 'artist'}</span>
                  <div className="flex items-center gap-1 text-rose-600 font-medium">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{post.likes_count}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Backend & Security Architecture Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-stone-900 text-stone-100 p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <Database className="w-3.5 h-3.5" />
                <span>Supabase Backend Architecture</span>
              </div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-white">
                Scalable Storage, Relational Schema & Row Level Security
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Calli Art is integrated with Supabase. The database enforces Row Level Security (RLS) ensuring public open read access for visitors while requiring authenticated tokens for uploads and mutations.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs font-mono">
                <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                  <div className="text-amber-400 font-bold">Storage Bucket</div>
                  <div className="text-stone-300 mt-1">artworks / resources</div>
                </div>
                <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                  <div className="text-amber-400 font-bold">Database Tables</div>
                  <div className="text-stone-300 mt-1">profiles, posts, likes</div>
                </div>
                <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700 col-span-2 sm:col-span-1">
                  <div className="text-emerald-400 font-bold">RLS Policies</div>
                  <div className="text-stone-300 mt-1">Read: Open | Write: Auth</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-stone-800 border border-stone-700 font-mono text-xs text-stone-300 space-y-2">
                <div className="text-stone-400 text-[11px]">// Configured Supabase Endpoint</div>
                <div className="text-amber-300 truncate">https://lvveadhykwvtkepmzytm.supabase.co</div>
                <div className="text-stone-400 text-[11px] pt-1">// Ready for Production Schema</div>
                <div className="text-emerald-400">schema.sql ready in /supabase folder</div>
              </div>

              <Link
                href="/studio"
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl text-center text-sm shadow-md transition-colors"
              >
                Create Artwork in Studio
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
