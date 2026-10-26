'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CompositionState, 
  ScriptType, 
  ShapeType, 
  ToolMode, 
  TashkeelDensity, 
  PaperTextureType, 
  InkColorType, 
  CanvasAspectRatio, 
  CalligraphyGlyph, 
  TashkeelItem, 
  HarakatType,
  SymmetryMode
} from '@/lib/calligraphy/types';
import { STUDIO_PRESETS } from '@/lib/calligraphy/presets';
import { generateThuluthComposition, setGlyphAlternate } from '@/lib/calligraphy/thuluthEngine';
import { generateJaliDiwaniComposition } from '@/lib/calligraphy/jaliDiwaniEngine';
import { createKuficGrid, toggleKuficCellWithSymmetry } from '@/lib/calligraphy/squareKuficEngine';
import { fitGlyphsToShape } from '@/lib/calligraphy/shapeFitting';
import { generateOrganicTashkeel, createTashkeelItem } from '@/lib/calligraphy/tashkeelEngine';
import { saveActiveProject, loadActiveProject } from '@/lib/calligraphy/storage';

// Studio UI Components
import StudioHeader from '@/components/studio/StudioHeader';
import StudioLeftToolbar from '@/components/studio/StudioLeftToolbar';
import StudioRightSidebar from '@/components/studio/StudioRightSidebar';
import StudioCanvas from '@/components/studio/StudioCanvas';
import QuranLibraryModal from '@/components/studio/QuranLibraryModal';
import ExportModal from '@/components/studio/ExportModal';
import AnimatedVideoModal from '@/components/studio/AnimatedVideoModal';
import ProjectManagerModal from '@/components/studio/ProjectManagerModal';

export default function StudioPage() {
  // 1. Initial State: Load from localStorage or Default Preset
  const [composition, setComposition] = useState<CompositionState>(() => {
    const saved = loadActiveProject();
    if (saved) return saved;
    // Default: Bismillah Teardrop preset
    return STUDIO_PRESETS[0].createState();
  });

  // History stack for Undo / Redo
  const [history, setHistory] = useState<CompositionState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isHistoryAction = useRef(false);

  // Active Tool and View Controls
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [zoom, setZoom] = useState<number>(1.0);
  const [showMizanGuides, setShowMizanGuides] = useState<boolean>(true);
  const [showShapeGuide, setShowShapeGuide] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Selection states
  const [selectedGlyphId, setSelectedGlyphId] = useState<string | null>(null);
  const [selectedTashkeelId, setSelectedTashkeelId] = useState<string | null>(null);

  // Modal dialog toggles
  const [isQuranModalOpen, setIsQuranModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Push state to history stack
  const pushHistory = useCallback((newState: CompositionState) => {
    if (isHistoryAction.current) {
      isHistoryAction.current = false;
      return;
    }

    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      const updated = [...upToCurrent, newState];
      // Keep max 35 history states to preserve memory
      if (updated.length > 35) {
        return updated.slice(updated.length - 35);
      }
      return updated;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 34));
    saveActiveProject(newState);
  }, [historyIndex]);

  // Initial history snapshot
  useEffect(() => {
    if (history.length === 0) {
      setHistory([composition]);
      setHistoryIndex(0);
    }
  }, [composition, history.length]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isHistoryAction.current = true;
      const targetState = history[historyIndex - 1];
      setComposition(targetState);
      setHistoryIndex(historyIndex - 1);
      saveActiveProject(targetState);
    }
  }, [history, historyIndex]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isHistoryAction.current = true;
      const targetState = history[historyIndex + 1];
      setComposition(targetState);
      setHistoryIndex(historyIndex + 1);
      saveActiveProject(targetState);
    }
  }, [history, historyIndex]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs or textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'v' || e.key === 'V') {
        setToolMode('select');
      } else if (e.key === 'a' || e.key === 'A') {
        setToolMode('sculpt');
      } else if (e.key === 't' || e.key === 'T') {
        setToolMode('tashkeel');
      } else if (e.key === 's' || e.key === 'S') {
        setToolMode('shape');
      } else if (e.key === 'p' || e.key === 'P') {
        setToolMode('pen');
      } else if (e.key === 'm' || e.key === 'M') {
        setToolMode('guidelines');
      } else if (e.key === 'Escape') {
        setSelectedGlyphId(null);
        setSelectedTashkeelId(null);
        setIsQuranModalOpen(false);
        setIsExportModalOpen(false);
        setIsVideoModalOpen(false);
        setIsProjectModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Update Composition & Push History Helper
  const updateComposition = useCallback((updater: (prev: CompositionState) => CompositionState) => {
    setComposition((prev) => {
      const updated = updater(prev);
      pushHistory(updated);
      return updated;
    });
  }, [pushHistory]);

  // Regenerate Calligraphy Glyphs when Text or Script Changes
  const regenerateGlyphs = useCallback((
    text: string, 
    script: ScriptType, 
    shape: ShapeType, 
    bounds: any, 
    strength: number, 
    kashida: number
  ) => {
    if (script === 'square_kufic') {
      return { glyphs: [], kuficGrid: createKuficGrid('allah', 'radial_4') };
    }

    let rawGlyphs: CalligraphyGlyph[] = [];
    if (script === 'thuluth') {
      rawGlyphs = generateThuluthComposition(text, bounds.cx, bounds.cy + 30, 1.15, kashida);
    } else if (script === 'jali_diwani') {
      rawGlyphs = generateJaliDiwaniComposition(text, bounds.cx, bounds.cy + 30, 1.15);
    }

    const fitted = fitGlyphsToShape(rawGlyphs, shape, bounds, strength);
    return { glyphs: fitted, kuficGrid: undefined };
  }, []);

  // Handle Script Switch
  const handleSelectScript = (newScript: ScriptType) => {
    updateComposition((prev) => {
      const { glyphs, kuficGrid } = regenerateGlyphs(
        prev.text, 
        newScript, 
        prev.shape, 
        prev.shapeBounds, 
        prev.shapeFittingStrength, 
        prev.kashidaAmount
      );
      return {
        ...prev,
        script: newScript,
        nibAngle: newScript === 'thuluth' ? 70 : newScript === 'jali_diwani' ? 82 : 90,
        glyphs,
        kuficGrid
      };
    });
  };

  // Handle Shape Selection
  const handleSelectShape = (newShape: ShapeType) => {
    updateComposition((prev) => {
      const fitted = fitGlyphsToShape(prev.glyphs, newShape, prev.shapeBounds, prev.shapeFittingStrength || 0.75);
      return {
        ...prev,
        shape: newShape,
        shapeFittingStrength: newShape === 'none' ? 0 : 0.75,
        glyphs: fitted
      };
    });
  };

  // Handle Text Content Change
  const handleTextChange = (newText: string) => {
    updateComposition((prev) => {
      const { glyphs, kuficGrid } = regenerateGlyphs(
        newText,
        prev.script,
        prev.shape,
        prev.shapeBounds,
        prev.shapeFittingStrength,
        prev.kashidaAmount
      );
      return {
        ...prev,
        text: newText,
        glyphs,
        kuficGrid: kuficGrid || prev.kuficGrid
      };
    });
  };

  // Handle Tashkeel Density Change
  const handleTashkeelDensityChange = (density: TashkeelDensity) => {
    updateComposition((prev) => {
      const items = generateOrganicTashkeel(
        prev.shapeBounds.cx,
        prev.shapeBounds.cy,
        prev.shapeBounds.width * 0.8,
        prev.shapeBounds.height * 0.75,
        density
      );
      return {
        ...prev,
        tashkeelDensity: density,
        floatingTashkeel: items
      };
    });
  };

  // Handle Fitting Strength Change
  const handleShapeFittingStrengthChange = (strength: number) => {
    updateComposition((prev) => {
      const fitted = fitGlyphsToShape(prev.glyphs, prev.shape, prev.shapeBounds, strength);
      return {
        ...prev,
        shapeFittingStrength: strength,
        glyphs: fitted
      };
    });
  };

  // Load Preset
  const handleSelectPreset = (presetId: string) => {
    const preset = STUDIO_PRESETS.find(p => p.id === presetId);
    if (preset) {
      const newState = preset.createState();
      updateComposition(() => newState);
      setSelectedGlyphId(null);
      setSelectedTashkeelId(null);
    }
  };

  // Add individual floating Tashkeel
  const handleAddTashkeel = (type: HarakatType) => {
    const newItem = createTashkeelItem(
      type,
      composition.shapeBounds.cx + (Math.random() * 80 - 40),
      composition.shapeBounds.cy + (Math.random() * 80 - 40),
      1.0,
      0
    );
    updateComposition((prev) => ({
      ...prev,
      floatingTashkeel: [...prev.floatingTashkeel, newItem]
    }));
    setSelectedTashkeelId(newItem.id);
    setSelectedGlyphId(null);
  };

  // Update Selected Glyph
  const handleUpdateGlyph = (updated: CalligraphyGlyph) => {
    updateComposition((prev) => ({
      ...prev,
      glyphs: prev.glyphs.map(g => g.id === updated.id ? updated : g)
    }));
  };

  // Delete Selected Glyph
  const handleDeleteGlyph = (id: string) => {
    updateComposition((prev) => ({
      ...prev,
      glyphs: prev.glyphs.filter(g => g.id !== id)
    }));
    setSelectedGlyphId(null);
  };

  // Update Selected Tashkeel
  const handleUpdateTashkeel = (updated: TashkeelItem) => {
    updateComposition((prev) => ({
      ...prev,
      floatingTashkeel: prev.floatingTashkeel.map(t => t.id === updated.id ? updated : t)
    }));
  };

  // Delete Selected Tashkeel
  const handleDeleteTashkeel = (id: string) => {
    updateComposition((prev) => ({
      ...prev,
      floatingTashkeel: prev.floatingTashkeel.filter(t => t.id !== id)
    }));
    setSelectedTashkeelId(null);
  };

  // Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Selected Glyph & Tashkeel items
  const selectedGlyph = composition.glyphs.find(g => g.id === selectedGlyphId) || null;
  const selectedTashkeel = composition.floatingTashkeel.find(t => t.id === selectedTashkeelId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0c0d10] text-stone-100 font-sans select-none">
      
      {/* 1. TOP HEADER BAR */}
      <StudioHeader
        currentScript={composition.script}
        onSelectScript={handleSelectScript}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={() => handleSelectPreset('bismillah-teardrop')}
        zoom={zoom}
        onZoomChange={setZoom}
        onOpenQuranModal={() => setIsQuranModalOpen(true)}
        onOpenVideoModal={() => setIsVideoModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        onSelectPreset={handleSelectPreset}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* 2. MAIN WORKSPACE VIEW (Left Toolbar + Center Canvas + Right Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Toolbar */}
        <StudioLeftToolbar
          toolMode={toolMode}
          onSelectToolMode={setToolMode}
          activeShape={composition.shape}
          onSelectShape={handleSelectShape}
          nibAngle={composition.nibAngle}
          onNibAngleChange={(angle) => updateComposition(prev => ({ ...prev, nibAngle: angle }))}
          nibWidth={composition.nibWidth}
          onNibWidthChange={(width) => updateComposition(prev => ({ ...prev, nibWidth: width }))}
          kashida={composition.kashidaAmount}
          onKashidaChange={(kash) => updateComposition(prev => ({ ...prev, kashidaAmount: kash }))}
          showMizanGuides={showMizanGuides}
          onToggleMizanGuides={() => setShowMizanGuides(!showMizanGuides)}
          showShapeGuide={showShapeGuide}
          onToggleShapeGuide={() => setShowShapeGuide(!showShapeGuide)}
          onAddTashkeel={handleAddTashkeel}
        />

        {/* Center Interactive Canvas */}
        <StudioCanvas
          composition={composition}
          zoom={zoom}
          onZoomChange={setZoom}
          toolMode={toolMode}
          showMizanGuides={showMizanGuides}
          showShapeGuide={showShapeGuide}
          selectedGlyph={selectedGlyph}
          onSelectGlyph={(g) => {
            setSelectedGlyphId(g?.id || null);
            if (g) setSelectedTashkeelId(null);
          }}
          onUpdateGlyph={handleUpdateGlyph}
          selectedTashkeel={selectedTashkeel}
          onSelectTashkeel={(t) => {
            setSelectedTashkeelId(t?.id || null);
            if (t) setSelectedGlyphId(null);
          }}
          onUpdateTashkeel={handleUpdateTashkeel}
          onUpdateComposition={(updated) => updateComposition(() => updated)}
        />

        {/* Right Sidebar */}
        <StudioRightSidebar
          composition={composition}
          onTextChange={handleTextChange}
          onTashkeelDensityChange={handleTashkeelDensityChange}
          onShapeFittingStrengthChange={handleShapeFittingStrengthChange}
          onPaperTextureChange={(p) => updateComposition(prev => ({ ...prev, paperTexture: p }))}
          onInkColorChange={(ink) => updateComposition(prev => ({ ...prev, inkColor: ink }))}
          onAspectRatioChange={(ar) => updateComposition(prev => ({ ...prev, aspectRatio: ar }))}
          selectedGlyph={selectedGlyph}
          onUpdateSelectedGlyph={handleUpdateGlyph}
          onDeleteSelectedGlyph={handleDeleteGlyph}
          selectedTashkeel={selectedTashkeel}
          onUpdateSelectedTashkeel={handleUpdateTashkeel}
          onDeleteSelectedTashkeel={handleDeleteTashkeel}
          onToggleLayerVisibility={(layerId) => {
            updateComposition(prev => ({
              ...prev,
              layers: prev.layers.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l)
            }));
          }}
          onToggleConcentricRing={() => {
            updateComposition(prev => ({
              ...prev,
              showConcentricRing: !prev.showConcentricRing
            }));
          }}
          onConcentricRingTextChange={(txt) => {
            updateComposition(prev => ({
              ...prev,
              concentricRingText: txt
            }));
          }}
          onToggleSacredGeometry={() => {
            updateComposition(prev => ({
              ...prev,
              showSacredGeometry: !prev.showSacredGeometry
            }));
          }}
          onGeometryPatternChange={(pattern) => {
            updateComposition(prev => ({
              ...prev,
              geometryPattern: pattern
            }));
          }}
          // Kufic Handlers
          onKuficSymmetryChange={(sym: SymmetryMode) => {
            if (composition.kuficGrid) {
              updateComposition(prev => ({
                ...prev,
                kuficGrid: prev.kuficGrid ? { ...prev.kuficGrid, symmetry: sym } : undefined
              }));
            }
          }}
          onKuficLoadPreset={(presetName: 'allah' | 'muhammad' | 'ali' | 'bismillah') => {
            const newGrid = createKuficGrid(presetName, composition.kuficGrid?.symmetry || 'radial_4');
            updateComposition(prev => ({
              ...prev,
              kuficGrid: newGrid
            }));
          }}
          onKuficClear={() => {
            if (composition.kuficGrid) {
              const empty = composition.kuficGrid.cells.map(r => r.map(() => false));
              updateComposition(prev => ({
                ...prev,
                kuficGrid: prev.kuficGrid ? { ...prev.kuficGrid, cells: empty } : undefined
              }));
            }
          }}
        />

      </div>

      {/* 3. MODAL DIALOGS */}
      
      {/* Quran & Dhikr Library Modal */}
      <QuranLibraryModal
        isOpen={isQuranModalOpen}
        onClose={() => setIsQuranModalOpen(false)}
        onInsertText={(arabicText, title) => {
          updateComposition(prev => {
            const { glyphs } = regenerateGlyphs(
              arabicText,
              prev.script,
              prev.shape,
              prev.shapeBounds,
              prev.shapeFittingStrength,
              prev.kashidaAmount
            );
            return {
              ...prev,
              text: arabicText,
              title: title || prev.title,
              glyphs
            };
          });
        }}
      />

      {/* Production & Vector Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        composition={composition}
      />

      {/* Stroke-by-Stroke Animated Video Generator Modal */}
      <AnimatedVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        composition={composition}
      />

      {/* Projects Local Storage Manager Modal */}
      <ProjectManagerModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        currentComposition={composition}
        onLoadProject={(proj) => updateComposition(() => proj)}
        onNewProject={() => {
          updateComposition(() => ({
            id: `proj-${Date.now()}`,
            title: 'Untitled Calligraphy',
            text: 'بسم الله',
            secondaryText: '',
            script: 'thuluth',
            shape: 'none',
            shapeBounds: { cx: 500, cy: 500, width: 700, height: 700 },
            tashkeelDensity: 'balanced',
            paperTexture: 'ahar',
            inkColor: 'liquid_gold',
            aspectRatio: '1:1',
            symmetry: 'none',
            nibAngle: 70,
            nibWidth: 18,
            nuqtaSize: 15,
            kashidaAmount: 0.1,
            shapeFittingStrength: 0,
            showConcentricRing: false,
            showArabesqueBorder: false,
            showSacredGeometry: false,
            geometryPattern: 'khatam_8',
            glyphs: generateThuluthComposition('بسم الله', 500, 500, 1.2, 0.1),
            floatingTashkeel: [],
            layers: [
              { id: 'layer-1', name: 'Main Text', type: 'main_text', visible: true, locked: false, opacity: 1, elements: [] }
            ],
            lastModified: Date.now()
          }));
        }}
      />

    </div>
  );
}
