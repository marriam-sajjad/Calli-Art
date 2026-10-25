import React from 'react';
import Link from 'next/link';
import { Feather, Heart, Github, Instagram, Youtube, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Feather className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold text-stone-100 tracking-tight">
                Calli Art
              </span>
            </div>
            <p className="text-stone-400 text-sm max-w-md leading-relaxed">
              The modern web platform for traditional and contemporary calligraphy artists.
              Practice in the interactive web studio, showcase your hand lettering, access downloadable practice sheets, and connect with fellow scribes.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-amber-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-amber-400 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-amber-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-amber-400">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/links" className="text-stone-400 hover:text-stone-100 transition-colors">
                  Link-in-Bio Portal
                </Link>
              </li>
              <li>
                <Link href="/feed" className="text-stone-400 hover:text-stone-100 transition-colors">
                  Community Feed & Showcase
                </Link>
              </li>
              <li>
                <Link href="/studio" className="text-stone-400 hover:text-stone-100 transition-colors">
                  Interactive Canvas Studio
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-stone-400 hover:text-stone-100 transition-colors">
                  Digital Practice Sheets
                </Link>
              </li>
            </ul>
          </div>

          {/* Database / Supabase Info */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-amber-400">Architecture</h3>
            <div className="text-xs text-stone-400 space-y-2">
              <p className="flex items-center gap-1.5 text-stone-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                Backend: Supabase RLS
              </p>
              <p>Storage Bucket: <code className="text-amber-300">artworks</code></p>
              <p>Database: <code className="text-amber-300">posts, profiles, resources</code></p>
              <p className="text-stone-500 pt-1">
                Public Read Access with Authenticated Row-Level Security.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Calli Art Studio. Built for Calligraphers & Lettering Enthusiasts.</p>
          <p className="flex items-center gap-1">
            Crafted with passion for the sacred art of pen & ink
          </p>
        </div>
      </div>
    </footer>
  );
}
