import { CompositionState, VideoStyle, VideoAspectRatio, VideoSpeed, Point } from './types';
import { samplePointsFromPath } from './bezierUtils';

export interface VideoRenderOptions {
  style: VideoStyle;
  aspectRatio: VideoAspectRatio;
  speed: VideoSpeed;
  onProgress?: (progress: number) => void;
  onComplete?: (videoBlob: Blob) => void;
}

/**
 * Animated Calligraphic Video Generator.
 * Animates the calligraphy stroke-by-stroke using authentic reed qalam mechanics
 * and records it live via MediaRecorder.
 */
export class CalligraphyVideoRecorder {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D context not supported');
    this.ctx = context;
  }

  public async startRecording(
    comp: CompositionState,
    options: VideoRenderOptions
  ): Promise<void> {
    const { style, aspectRatio, speed, onProgress, onComplete } = options;

    // Set dimensions based on aspect ratio
    let width = 1080;
    let height = 1080;
    if (aspectRatio === '9:16') {
      width = 720;
      height = 1280;
    } else if (aspectRatio === '16:9') {
      width = 1280;
      height = 720;
    }

    this.canvas.width = width;
    this.canvas.height = height;

    // Prepare stroke paths in calligraphic sequence
    const strokePaths: { pathData: string; points: Point[]; color: string; type: string }[] = [];

    // Main glyphs
    for (const g of comp.glyphs) {
      const sampled = samplePointsFromPath(g.pathData, 45);
      strokePaths.push({
        pathData: g.pathData,
        points: sampled.map(p => ({
          x: p.x * g.scaleX + g.x * (width / 1000),
          y: p.y * g.scaleY + g.y * (height / 1000)
        })),
        color: this.getInkColor(style, comp),
        type: 'letter'
      });

      // Glyph dots
      for (const d of g.dots) {
        strokePaths.push({
          pathData: d.pathData,
          points: [{ x: d.x * (width / 1000), y: d.y * (height / 1000) }],
          color: this.getInkColor(style, comp),
          type: 'nuqta'
        });
      }
    }

    // Floating Tashkeel
    for (const t of comp.floatingTashkeel) {
      strokePaths.push({
        pathData: t.pathData,
        points: [{ x: t.x * (width / 1000), y: t.y * (height / 1000) }],
        color: this.getInkColor(style, comp),
        type: 'harakat'
      });
    }

    // Setup MediaRecorder
    this.recordedChunks = [];
    let stream: MediaStream;
    try {
      stream = (this.canvas as any).captureStream(60);
    } catch {
      stream = (this.canvas as any).captureStream();
    }

    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm',
      'video/mp4'
    ];
    let selectedMime = 'video/webm';
    for (const mime of mimeTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    this.mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMime });
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: selectedMime });
      if (onComplete) onComplete(blob);
    };

    this.mediaRecorder.start();
    this.isRecording = true;

    // Determine speed factor
    const speedMultiplier = speed === 'slow' ? 0.5 : speed === 'brisk' ? 2.0 : 1.0;
    const totalStrokes = strokePaths.length;
    let currentStrokeIdx = 0;
    let strokeProgress = 0;

    const renderFrame = () => {
      if (!this.isRecording) return;

      // Draw background
      this.drawBackground(style, comp, width, height);

      // Draw previously completed strokes
      for (let i = 0; i < currentStrokeIdx; i++) {
        this.drawCompletedStroke(strokePaths[i], style);
      }

      // Draw active animating stroke
      if (currentStrokeIdx < totalStrokes) {
        const active = strokePaths[currentStrokeIdx];
        this.drawProgressingStroke(active, strokeProgress, style);

        // Advance progress
        strokeProgress += 0.05 * speedMultiplier;
        if (strokeProgress >= 1) {
          strokeProgress = 0;
          currentStrokeIdx++;
        }

        const overallProgress = (currentStrokeIdx + strokeProgress) / totalStrokes;
        if (onProgress) onProgress(overallProgress);

        this.animationFrameId = requestAnimationFrame(renderFrame);
      } else {
        // Lingering finish frame (hold 1.5 seconds)
        setTimeout(() => {
          this.stopRecording();
        }, 1500);
      }
    };

    this.animationFrameId = requestAnimationFrame(renderFrame);
  }

  public stopRecording() {
    this.isRecording = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  private getInkColor(style: VideoStyle, comp: CompositionState): string {
    if (style === 'liquid_gold') return '#E5B83B';
    if (style === 'glowing_neon') return '#00E5FF';
    if (style === 'chalkboard') return '#FFFFFF';
    if (style === 'oil_canvas') return '#B33927';
    return '#171717';
  }

  private drawBackground(style: VideoStyle, comp: CompositionState, w: number, h: number) {
    const ctx = this.ctx;
    if (style === 'chalkboard') {
      ctx.fillStyle = '#1e242b';
      ctx.fillRect(0, 0, w, h);
      // Slate dust texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 0; i < 80; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
    } else if (style === 'glowing_neon') {
      ctx.fillStyle = '#06070a';
      ctx.fillRect(0, 0, w, h);
    } else if (style === 'oil_canvas') {
      ctx.fillStyle = '#EBE3D5';
      ctx.fillRect(0, 0, w, h);
    } else {
      // Parchment / Ahar
      ctx.fillStyle = comp.paperTexture === 'dark_obsidian' ? '#0f1118' : '#FBF7EE';
      ctx.fillRect(0, 0, w, h);
    }
  }

  private drawCompletedStroke(stroke: { points: Point[]; color: string; type: string }, style: VideoStyle) {
    const ctx = this.ctx;
    const pts = stroke.points;
    if (pts.length === 0) return;

    ctx.save();
    if (style === 'glowing_neon') {
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 8;
    } else if (style === 'liquid_gold') {
      ctx.shadowColor = '#D4AF37';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 10;
    } else {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.type === 'nuqta' ? 12 : 9;
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  private drawProgressingStroke(
    stroke: { points: Point[]; color: string; type: string },
    progress: number,
    style: VideoStyle
  ) {
    const ctx = this.ctx;
    const pts = stroke.points;
    if (pts.length === 0) return;

    const count = Math.max(1, Math.floor(pts.length * Math.min(1, progress)));

    ctx.save();
    if (style === 'glowing_neon') {
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = 24;
      ctx.strokeStyle = '#E0F7FA';
      ctx.lineWidth = 8;
    } else if (style === 'liquid_gold') {
      ctx.shadowColor = '#F3C64F';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#FFDF73';
      ctx.lineWidth = 10;
    } else {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 9;
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < count; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();

    // Draw active pen tip indicator
    const currentPt = pts[Math.min(count - 1, pts.length - 1)];
    if (currentPt) {
      if (style === 'reed_qalam') {
        // Draw miniature wooden chisel reed pen tip
        ctx.save();
        ctx.translate(currentPt.x, currentPt.y);
        ctx.rotate(-45 * Math.PI / 180);
        ctx.fillStyle = '#8B5A2B'; // Wood
        ctx.fillRect(-4, -18, 8, 18);
        ctx.fillStyle = '#171717'; // Wet ink tip
        ctx.fillRect(-4, -2, 8, 4);
        ctx.restore();
      } else if (style === 'liquid_gold') {
        // Gold glowing particle spark
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.arc(currentPt.x, currentPt.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
