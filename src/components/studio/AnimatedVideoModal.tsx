'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Video, 
  Play, 
  Square, 
  Download, 
  Sparkles, 
  Sliders, 
  Layers, 
  CheckCircle2,
  Share2,
  RefreshCw
} from 'lucide-react';
import { 
  CompositionState, 
  VideoStyle, 
  VideoAspectRatio, 
  VideoSpeed 
} from '@/lib/calligraphy/types';
import { CalligraphyVideoRecorder } from '@/lib/calligraphy/videoGenerator';

interface AnimatedVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  composition: CompositionState;
}

export default function AnimatedVideoModal({
  isOpen,
  onClose,
  composition
}: AnimatedVideoModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderRef = useRef<CalligraphyVideoRecorder | null>(null);

  const [style, setStyle] = useState<VideoStyle>('reed_qalam');
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('9:16');
  const [speed, setSpeed] = useState<VideoSpeed>('natural');
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.stopRecording();
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  if (!isOpen) return null;

  const startReplay = async () => {
    if (!canvasRef.current) return;
    setVideoBlob(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }

    setIsRecording(true);
    setProgress(0);

    const recorder = new CalligraphyVideoRecorder(canvasRef.current);
    recorderRef.current = recorder;

    await recorder.startRecording(composition, {
      style,
      aspectRatio,
      speed,
      onProgress: (p) => setProgress(p),
      onComplete: (blob) => {
        setIsRecording(false);
        setVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      }
    });
  };

  const stopReplay = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording();
    }
    setIsRecording(false);
  };

  const downloadVideo = () => {
    if (!videoBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(videoBlob);
    a.download = `${(composition.title || 'calligraphy-animation').toLowerCase()}-${aspectRatio}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const styleOptions: { id: VideoStyle; name: string; desc: string }[] = [
    { id: 'reed_qalam', name: 'Traditional Reed Qalam', desc: 'Wooden chisel pen nib moves along the vector path depositing fresh ink' },
    { id: 'liquid_gold', name: 'Liquid Gold Ink', desc: 'Shimmering metallic gold trail with glowing amber embers' },
    { id: 'glowing_neon', name: 'Cyber Islamic Neon', desc: 'Luminous cyan & emerald glow with radiant bloom' },
    { id: 'chalkboard', name: 'White Slate Chalk', desc: 'Soft white calligraphic chalk on dark textured slate' },
    { id: 'oil_canvas', name: 'Oil & Canvas', desc: 'Rich crimson impasto paint stroke on woven linen' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#10121a] border border-[#272d3f] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-stone-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#202534] flex items-center justify-between bg-[#141622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-100 font-serif">
                Stroke-by-Stroke Animated Video Generator
              </h3>
              <p className="text-xs text-stone-400">
                100% Free & Unlocked • Replays traditional calligraphic penmanship for Reels, Shorts & TikTok
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopReplay();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-[#202434] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Layout */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Video Preview Viewport */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-[#07080b] p-4 rounded-2xl border border-[#232838] relative min-h-[380px]">
            
            {/* Live Animating Canvas */}
            <canvas
              ref={canvasRef}
              className="max-h-[360px] max-w-full rounded-lg shadow-2xl border border-stone-800 object-contain"
              style={{
                aspectRatio: aspectRatio === '9:16' ? '9/16' : aspectRatio === '16:9' ? '16/9' : '1/1'
              }}
            />

            {/* Video Download Ready Banner */}
            {videoUrl && !isRecording && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
                <h4 className="text-base font-bold text-amber-200">Video Rendered Successfully!</h4>
                <p className="text-xs text-stone-300 mt-1 mb-4">
                  Ready for Instagram Reels, TikTok, YouTube Shorts, or Facebook Stories.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={downloadVideo}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-bold rounded-xl shadow-lg flex items-center gap-2 hover:brightness-110 transition-all text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Video ({aspectRatio})</span>
                  </button>
                  <button
                    onClick={startReplay}
                    className="px-4 py-2.5 bg-[#202434] hover:bg-[#2b3044] text-stone-200 rounded-xl font-semibold flex items-center gap-2 transition-all text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-record</span>
                  </button>
                </div>
              </div>
            )}

            {/* Progress Bar during recording */}
            {isRecording && (
              <div className="absolute bottom-4 left-6 right-6 bg-[#12141c]/90 backdrop-blur-md p-3 rounded-xl border border-amber-500/30">
                <div className="flex justify-between text-xs text-amber-300 mb-1 font-mono">
                  <span>Inscribing Calligraphy...</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Parameters & Controls */}
          <div className="md:col-span-5 space-y-4 text-xs">
            
            {/* Visual Style Selector */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                Visual Inscribing Style
              </span>
              <div className="space-y-1.5">
                {styleOptions.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStyle(st.id)}
                    disabled={isRecording}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                      style === st.id
                        ? 'border-amber-500 bg-[#1e2230] shadow-sm'
                        : 'border-[#222736] bg-[#141620] hover:bg-[#1a1d28]'
                    }`}
                  >
                    <span className="font-semibold text-stone-200 block">{st.name}</span>
                    <span className="text-[10px] text-stone-500 line-clamp-1">{st.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Video Aspect Ratio */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                Aspect Ratio Format
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '9:16' as const, label: '9:16 (Reels/TikTok)' },
                  { id: '1:1' as const, label: '1:1 (Square Feed)' },
                  { id: '16:9' as const, label: '16:9 (Landscape)' },
                ].map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id)}
                    disabled={isRecording}
                    className={`p-2 rounded-lg font-medium text-center transition-colors ${
                      aspectRatio === ar.id
                        ? 'bg-amber-600 text-stone-950 font-bold'
                        : 'bg-[#181a26] text-stone-300 hover:bg-[#222736]'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed Control */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                Writing Tempo
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'natural', 'brisk'] as VideoSpeed[]).map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setSpeed(sp)}
                    disabled={isRecording}
                    className={`p-2 rounded-lg font-medium capitalize text-center transition-colors ${
                      speed === sp
                        ? 'bg-amber-600 text-stone-950 font-bold'
                        : 'bg-[#181a26] text-stone-300 hover:bg-[#222736]'
                    }`}
                  >
                    {sp === 'slow' ? 'Meditative' : sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Recording Action Button */}
            <div className="pt-2">
              {isRecording ? (
                <button
                  onClick={stopReplay}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950/50"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop Recording</span>
                </button>
              ) : (
                <button
                  onClick={startReplay}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 text-stone-950 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/50"
                >
                  <Play className="w-4 h-4 fill-stone-950" />
                  <span>Start Stroke Replay & Record</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
