'use client';

import React, { useState } from 'react';
import { Search, X, BookOpen, Sparkles, Heart, Plus, Check } from 'lucide-react';
import { QURAN_LIBRARY, DHIKR_LIBRARY, ASMA_UL_HUSNA } from '@/lib/calligraphy/quranLibrary';
import { QuranVerse, DhikrItem, AllahName } from '@/lib/calligraphy/types';

interface QuranLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText: (text: string, title?: string) => void;
}

export default function QuranLibraryModal({
  isOpen,
  onClose,
  onInsertText
}: QuranLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'quran' | 'dhikr' | 'names'>('quran');
  const [searchQuery, setSearchQuery] = useState('');
  const [insertedItem, setInsertedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter Quran
  const filteredQuran = QURAN_LIBRARY.filter(v => 
    v.textArabic.includes(searchQuery) ||
    v.textEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.surahNameEnglish.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter Dhikr
  const filteredDhikr = DHIKR_LIBRARY.filter(d => 
    d.textArabic.includes(searchQuery) ||
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.transliteration.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter 99 Names
  const filteredNames = ASMA_UL_HUSNA.filter(n =>
    n.arabic.includes(searchQuery) ||
    n.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (text: string, id: string, title?: string) => {
    onInsertText(text, title);
    setInsertedItem(id);
    setTimeout(() => {
      setInsertedItem(null);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#10121a] border border-[#272d3f] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-stone-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#202534] flex items-center justify-between bg-[#141622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-100 font-serif">
                Quran & Sacred Dhikr Library
              </h3>
              <p className="text-xs text-stone-400">
                100% Free & Unlocked • Searchable Quranic database with authentic vowelled text
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

        {/* Search Bar & Tabs */}
        <div className="p-4 border-b border-[#202534] space-y-3 bg-[#11131c]">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Surah, English meaning, Arabic text, or 99 Names..."
              className="w-full pl-9 pr-4 py-2 bg-[#171a25] border border-[#2b3042] rounded-xl text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('quran')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'quran'
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'bg-[#181b26] text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Quranic Verses ({filteredQuran.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('dhikr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'dhikr'
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'bg-[#181b26] text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sacred Dhikr & Prayers ({filteredDhikr.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('names')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'names'
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'bg-[#181b26] text-stone-400 hover:text-stone-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>99 Names of Allah ({filteredNames.length})</span>
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* TAB 1: QURAN */}
          {activeTab === 'quran' && (
            <div className="space-y-3">
              {filteredQuran.map((verse, idx) => (
                <div
                  key={idx}
                  className="bg-[#141724] border border-[#252b3d] hover:border-amber-500/40 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all group"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded">
                        Surah {verse.surahNameEnglish} ({verse.surahNumber}:{verse.ayahNumber})
                      </span>
                    </div>
                    <p dir="rtl" className="text-xl font-serif text-amber-200 leading-loose">
                      {verse.textArabic}
                    </p>
                    <p className="text-xs text-stone-400 italic">
                      &quot;{verse.textEnglish}&quot;
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelect(verse.textArabic, `q-${idx}`, `Surah ${verse.surahNameEnglish}`)}
                    className="w-full md:w-auto px-4 py-2 bg-[#202535] hover:bg-amber-600 hover:text-stone-950 text-amber-300 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    {insertedItem === `q-${idx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Loaded!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insert into Studio</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: DHIKR */}
          {activeTab === 'dhikr' && (
            <div className="space-y-3">
              {filteredDhikr.map((dhikr) => (
                <div
                  key={dhikr.id}
                  className="bg-[#141724] border border-[#252b3d] hover:border-amber-500/40 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all group"
                >
                  <div className="flex-1 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-800 text-amber-400 px-2 py-0.5 rounded">
                      {dhikr.title}
                    </span>
                    <p dir="rtl" className="text-xl font-serif text-amber-200 leading-loose">
                      {dhikr.textArabic}
                    </p>
                    <p className="text-xs text-stone-300 font-medium">
                      {dhikr.transliteration}
                    </p>
                    <p className="text-xs text-stone-400 italic">
                      &quot;{dhikr.meaning}&quot;
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelect(dhikr.textArabic, dhikr.id, dhikr.title)}
                    className="w-full md:w-auto px-4 py-2 bg-[#202535] hover:bg-amber-600 hover:text-stone-950 text-amber-300 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    {insertedItem === dhikr.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Loaded!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insert into Studio</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: 99 NAMES OF ALLAH */}
          {activeTab === 'names' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredNames.map((name) => (
                <button
                  key={name.number}
                  onClick={() => handleSelect(name.arabic, `name-${name.number}`, name.transliteration)}
                  className="bg-[#141724] border border-[#252b3d] hover:border-amber-500 p-3 rounded-xl text-left transition-all hover:bg-[#1a1d2d] group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-stone-500">#{name.number}</span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-bold">
                        1-Click
                      </span>
                    </div>
                    <p dir="rtl" className="text-2xl font-serif text-amber-200 text-center py-2">
                      {name.arabic}
                    </p>
                  </div>
                  <div className="border-t border-stone-800 pt-1.5 text-center">
                    <p className="text-xs font-semibold text-stone-200">{name.transliteration}</p>
                    <p className="text-[10px] text-stone-400 line-clamp-1 italic">{name.meaning}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
