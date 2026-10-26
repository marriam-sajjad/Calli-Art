'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  FolderDown, 
  Save, 
  Trash2, 
  Upload, 
  Download, 
  FileText, 
  Check, 
  Plus, 
  Calendar 
} from 'lucide-react';
import { CompositionState } from '@/lib/calligraphy/types';
import { 
  listSavedProjects, 
  saveProjectToLibrary, 
  loadProjectFromLibrary, 
  deleteProjectFromLibrary, 
  SavedProjectMeta 
} from '@/lib/calligraphy/storage';
import { downloadFile } from '@/lib/calligraphy/exportPipeline';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentComposition: CompositionState;
  onLoadProject: (project: CompositionState) => void;
  onNewProject: () => void;
}

export default function ProjectManagerModal({
  isOpen,
  onClose,
  currentComposition,
  onLoadProject,
  onNewProject
}: ProjectManagerModalProps) {
  const [projects, setProjects] = useState<SavedProjectMeta[]>([]);
  const [projectTitle, setProjectTitle] = useState(currentComposition.title || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProjects(listSavedProjects());
      setProjectTitle(currentComposition.title || '');
    }
  }, [isOpen, currentComposition.title]);

  if (!isOpen) return null;

  // Save current
  const handleSaveCurrent = () => {
    const updated: CompositionState = {
      ...currentComposition,
      title: projectTitle.trim() || 'Untitled Calligraphy',
      lastModified: Date.now()
    };
    saveProjectToLibrary(updated);
    setProjects(listSavedProjects());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Load project
  const handleSelect = (id: string) => {
    const loaded = loadProjectFromLibrary(id);
    if (loaded) {
      onLoadProject(loaded);
      onClose();
    }
  };

  // Delete project
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProjectFromLibrary(id);
    setProjects(listSavedProjects());
  };

  // Export as .qalam JSON file
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(currentComposition, null, 2);
    downloadFile(
      `${(currentComposition.title || 'calligraphy-project').toLowerCase().replace(/\s+/g, '-')}.qalam`,
      jsonStr,
      'application/json'
    );
  };

  // Import .qalam JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.script) {
          saveProjectToLibrary(parsed);
          setProjects(listSavedProjects());
          onLoadProject(parsed);
          onClose();
        }
      } catch (err) {
        alert('Invalid .qalam project file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#10121a] border border-[#272d3f] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col text-stone-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#202534] flex items-center justify-between bg-[#141622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FolderDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-100 font-serif">
                Projects & Storage Manager
              </h3>
              <p className="text-xs text-stone-400">
                100% Client-Side Local Storage • No accounts, passwords, or cloud lock-in
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

        {/* Save Current Section */}
        <div className="p-5 border-b border-[#202534] bg-[#12141e] space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
            Save Current Active Project
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. My Bismillah Teardrop Masterpiece"
              className="flex-1 px-3 py-2 bg-[#171a25] border border-[#2b3042] rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSaveCurrent}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all whitespace-nowrap"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved!' : 'Save Project'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg bg-[#181b26] hover:bg-[#232737] text-stone-300 text-xs flex items-center gap-1.5 border border-[#252a3b] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export as .qalam File</span>
            </button>

            <label className="px-3 py-1.5 rounded-lg bg-[#181b26] hover:bg-[#232737] text-stone-300 text-xs flex items-center gap-1.5 border border-[#252a3b] transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Import .qalam File</span>
              <input
                type="file"
                accept=".qalam,.json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Saved Projects List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2 max-h-[300px]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
            Saved Projects ({projects.length})
          </span>

          {projects.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs">
              No saved projects yet. Click &quot;Save Project&quot; above to store your artwork.
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleSelect(proj.id)}
                className="p-3 bg-[#141624] hover:bg-[#1a1e30] border border-[#252b3d] hover:border-amber-500/50 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
              >
                <div>
                  <h4 className="text-xs font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                    {proj.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-400">
                    <span className="capitalize">{proj.script.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{new Date(proj.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDelete(proj.id, e)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#202534] bg-[#12141c] flex justify-between items-center">
          <button
            onClick={() => {
              onNewProject();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-[#181b26] hover:bg-[#252a3b] text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Blank Canvas</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#202434] hover:bg-[#2b3044] text-stone-300 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
