'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Feather, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  PenTool, 
  BookOpen, 
  Image as ImageIcon,
  Instagram, 
  Youtube, 
  QrCode,
  Heart,
  Globe,
  Mail,
  Smartphone,
  Monitor
} from 'lucide-react';
import { CREATOR_PROFILE } from '@/lib/mock-data';

export default function LinksPage() {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [mobileMockupMode, setMobileMockupMode] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const socialLinks = [
    { name: 'Instagram', url: 'https://instagram.com', icon: Instagram, color: 'hover:text-pink-600' },
    { name: 'YouTube', url: 'https://youtube.com', icon: Youtube, color: 'hover:text-red-600' },
    { name: 'Portfolio', url: 'https://behance.net', icon: Globe, color: 'hover:text-blue-600' },
    { name: 'Contact', url: 'mailto:contact@calliart.studio', icon: Mail, color: 'hover:text-amber-600' },
  ];

  const portalCards = [
    {
      title: '🖌️ Interactive Web Studio',
      description: 'Practice calligraphy on live canvas with broad, pointed, and reed qalam nibs.',
      href: '/studio',
      badge: 'Free Studio',
      isInternal: true,
      accent: 'border-amber-400 bg-amber-50/50 hover:bg-amber-100/60',
    },
    {
      title: '🖼️ Community Artwork Showcase',
      description: 'Explore curated traditional and digital calligraphy submissions from our global community.',
      href: '/feed',
      badge: 'Showcase',
      isInternal: true,
      accent: 'border-rose-200 bg-white hover:border-rose-400 hover:shadow-md',
    },
    {
      title: '📥 Free Practice Sheets & Guides',
      description: 'Download printable 55° Copperplate guidelines, Gothic exemplars, and Procreate brushes.',
      href: '/resources',
      badge: 'Downloads',
      isInternal: true,
      accent: 'border-blue-200 bg-white hover:border-blue-400 hover:shadow-md',
    },
    {
      title: '🎓 Copperplate & Gothic Masterclass',
      description: 'Enroll in our comprehensive 8-week video course: from stroke anatomy to whole-arm flourishing.',
      href: 'https://calliart.studio/masterclass',
      badge: 'Course',
      isInternal: false,
      accent: 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-md',
    },
    {
      title: '🛍️ Handcrafted Walnut Inks & Nib Holders',
      description: 'Handmade oblique holders, organic walnut crystal inks, and custom cut bamboo qalams.',
      href: 'https://calliart.studio/shop',
      badge: 'Shop',
      isInternal: false,
      accent: 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-md',
    },
  ];

  return (
    <div className="min-h-screen bg-parchment-pattern py-10 px-4 sm:px-6">
      
      {/* Top Device & Share Bar */}
      <div className="max-w-xl mx-auto flex items-center justify-between mb-8 pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMockupMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !mobileMockupMode ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Width</span>
          </button>
          <button
            onClick={() => setMobileMockupMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileMockupMode ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Frame</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:border-stone-300 shadow-sm transition-all"
            title="Show QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:border-stone-300 shadow-sm text-xs font-semibold transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Container (Simulating Phone Frame when toggled) */}
      <div 
        className={`mx-auto transition-all duration-300 ${
          mobileMockupMode
            ? 'max-w-sm rounded-[40px] border-8 border-stone-800 shadow-2xl bg-white p-6 my-4'
            : 'max-w-md bg-white/80 backdrop-blur-md rounded-3xl border border-stone-200/90 shadow-xl p-6 sm:p-8'
        }`}
      >
        
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-lg mx-auto">
              <img
                src={CREATOR_PROFILE.avatar_url}
                alt={CREATOR_PROFILE.full_name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center border-2 border-white shadow-sm" title="Verified Master Calligrapher">
              <Feather className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
              {CREATOR_PROFILE.full_name}
            </h1>
            <p className="text-xs font-mono font-medium text-amber-800">
              @{CREATOR_PROFILE.username}
            </p>
          </div>

          <p className="text-stone-600 text-sm leading-relaxed max-w-sm mx-auto">
            {CREATOR_PROFILE.bio}
          </p>

          {/* Social Icons Bar */}
          <div className="flex items-center justify-center gap-3 pt-1">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 ${social.color} hover:bg-stone-200/80 transition-all shadow-sm`}
                  aria-label={social.name}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Portal Links Cards */}
        <div className="mt-8 space-y-3.5">
          {portalCards.map((card, idx) => {
            const Content = (
              <div
                className={`p-4 rounded-2xl border transition-all ${card.accent}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-medium text-stone-900 text-sm">
                        {card.title}
                      </h2>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-stone-400 shrink-0 mt-0.5">
                    {card.isInternal ? (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                        {card.badge}
                      </span>
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>
            );

            return card.isInternal ? (
              <Link key={idx} href={card.href} className="block">
                {Content}
              </Link>
            ) : (
              <a key={idx} href={card.href} target="_blank" rel="noreferrer" className="block">
                {Content}
              </a>
            );
          })}
        </div>

        {/* Footer info inside portal */}
        <div className="mt-8 pt-6 border-t border-stone-200 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-stone-500">
            <span>Powered by</span>
            <Link href="/" className="font-serif font-bold text-stone-800 hover:text-amber-800">
              Calli Art
            </Link>
          </div>
          <p className="text-[10px] text-stone-400">
            Responsive on Mobile, Tablet & Desktop • Supabase Backend
          </p>
        </div>

      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <h2 className="font-serif text-xl font-bold text-stone-900">Scan Bio QR Code</h2>
              <p className="text-xs text-stone-500">
                Share this portal page instantly at calligraphy exhibitions and workshops.
              </p>
            </div>

            {/* Generated QR representation */}
            <div className="p-4 bg-stone-50 border-2 border-dashed border-amber-300 rounded-2xl flex flex-col items-center justify-center">
              <div className="w-48 h-48 bg-white p-3 rounded-xl border border-stone-200 shadow-sm flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-stone-900">
                  <path fill="currentColor" d="M10,10 h30 v30 h-30 z M16,16 v18 h18 v-18 z M22,22 h6 v6 h-6 z" />
                  <path fill="currentColor" d="M60,10 h30 v30 h-30 z M66,16 v18 h18 v-18 z M72,22 h6 v6 h-6 z" />
                  <path fill="currentColor" d="M10,60 h30 v30 h-30 z M16,66 v18 h18 v-18 z M22,72 h6 v6 h-6 z" />
                  <circle cx="50" cy="50" r="5" fill="#d97706" />
                  <rect x="45" y="15" width="8" height="8" fill="currentColor" />
                  <rect x="45" y="75" width="8" height="8" fill="currentColor" />
                  <rect x="65" y="50" width="10" height="10" fill="currentColor" />
                  <rect x="75" y="65" width="15" height="15" fill="currentColor" />
                  <rect x="55" y="75" width="8" height="8" fill="currentColor" />
                </svg>
              </div>
              <span className="text-[11px] font-mono text-stone-500 mt-3">
                calliart.studio/links
              </span>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
