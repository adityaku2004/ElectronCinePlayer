import React, { useEffect, useRef, useState } from 'react';
import {
  Music,
  Radio,
  Wrench,
  Sparkles,
  Info,
  Layers,
  Volume2,
  AlertCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { PlaylistItem } from '../../types';
import { MkvDiagnosticReport } from '../../utils/mkvInspector';

interface AudioVisualizerOverlayProps {
  currentVideo: PlaylistItem | null;
  isPlaying: boolean;
  isAudioOnly: boolean;
  videoWidth: number;
  videoHeight: number;
  diagnosticReport: MkvDiagnosticReport | null;
  onOpenDiagnostics: () => void;
  onTriggerFastRemux?: () => void;
  isRemuxing?: boolean;
}

export const AudioVisualizerOverlay: React.FC<AudioVisualizerOverlayProps> = ({
  currentVideo,
  isPlaying,
  isAudioOnly,
  videoWidth,
  videoHeight,
  diagnosticReport,
  onOpenDiagnostics,
  onTriggerFastRemux,
  isRemuxing = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [visualizerMode, setVisualizerMode] = useState<'bars' | 'wave' | 'pulse'>('bars');

  // Should we show the visualizer overlay?
  // Show if explicitly marked as audio-only OR if playing and video width/height is 0 in an MKV file
  const isVideoInvisible = (videoWidth === 0 || videoHeight === 0);
  const isMkv = diagnosticReport?.isMkv || currentVideo?.metadata?.filename.toLowerCase().endsWith('.mkv');
  const shouldDisplay = isAudioOnly || (isMkv && isVideoInvisible);

  useEffect(() => {
    if (!shouldDisplay || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const numBars = 48;
    const barHeights = new Array(numBars).fill(10);

    const render = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      phase += isPlaying ? 0.08 : 0.01;

      if (visualizerMode === 'bars') {
        const barWidth = (width / numBars) * 0.65;
        const gap = (width / numBars) * 0.35;

        for (let i = 0; i < numBars; i++) {
          const distanceFromCenter = Math.abs(i - numBars / 2) / (numBars / 2);
          const baseIntensity = Math.sin(phase + i * 0.25) * 0.5 + 0.5;
          const secondary = Math.cos(phase * 1.5 - i * 0.15) * 0.5 + 0.5;

          const targetHeight = isPlaying
            ? Math.max(8, (baseIntensity * 0.6 + secondary * 0.4) * (height * 0.45) * (1 - distanceFromCenter * 0.35))
            : 6;

          barHeights[i] += (targetHeight - barHeights[i]) * 0.2;

          const x = i * (barWidth + gap) + gap / 2;
          const h = barHeights[i];

          // Create vibrant gradient
          const gradient = ctx.createLinearGradient(0, centerY - h, 0, centerY + h);
          gradient.addColorStop(0, 'rgba(0, 240, 255, 0.9)');
          gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.7)');
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0.9)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, centerY - h, barWidth, h * 2, 4);
          ctx.fill();

          // Subtle reflection glow
          ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
          ctx.shadowBlur = 8;
        }
      } else if (visualizerMode === 'wave') {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#00F0FF';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 12;

        for (let x = 0; x < width; x += 4) {
          const normX = x / width;
          const amp = isPlaying ? Math.sin(normX * Math.PI) * (height * 0.28) : 4;
          const y = centerY + Math.sin(normX * 12 + phase) * amp * Math.cos(normX * 6 - phase * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Second harmonic wave
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
        for (let x = 0; x < width; x += 4) {
          const normX = x / width;
          const amp = isPlaying ? Math.sin(normX * Math.PI) * (height * 0.18) : 2;
          const y = centerY + Math.sin(normX * 18 - phase * 1.2) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shouldDisplay, isPlaying, visualizerMode]);

  if (!shouldDisplay) {
    return null;
  }

  const audioCodec = diagnosticReport?.primaryAudioCodec || 'AAC Stereo Stream';
  const videoCodec = diagnosticReport?.primaryVideoCodec || (diagnosticReport?.isHevc ? 'H.265 / HEVC' : 'H.264 / AVC');

  return (
    <div className="absolute inset-0 z-25 flex flex-col items-center justify-between p-6 pointer-events-none bg-gradient-to-b from-black/80 via-[#07090e]/95 to-black/90 select-none">
      {/* Top Banner: Video Stream Diagnosis Notification */}
      <div className="w-full max-w-2xl mt-14 pointer-events-auto transition-all animate-fadeIn">
        <div className="p-3.5 rounded-2xl glass-panel border border-cyan-500/30 bg-[#0d1017]/90 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  MKV Audio Stream Active
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono-time font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Video Not Decoded
                </span>
              </div>
              <p className="text-[11px] text-gray-300 mt-0.5 line-clamp-1">
                Audio is playing smoothly, but the video stream ({videoCodec}) is not appearing in this browser.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {onTriggerFastRemux && diagnosticReport?.remuxableToMp4 && (
              <button
                type="button"
                onClick={onTriggerFastRemux}
                disabled={isRemuxing}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-xs tracking-wide transition-all shadow-md shadow-cyan-500/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>{isRemuxing ? 'Remuxing...' : 'Fix Video (Remux)'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenDiagnostics}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>Diagnose</span>
            </button>
          </div>
        </div>
      </div>

      {/* Center: Live Audio Visualizer Canvas & Metadata HUD */}
      <div className="flex flex-col items-center justify-center w-full max-w-xl my-auto text-center pointer-events-auto">
        <div className="relative mb-6">
          {/* Ambient Glow */}
          <div className="absolute -inset-8 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none animate-pulse-glow" />

          {/* Vinyl / Cover Art Glow Badge */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-gray-900 via-[#121620] to-[#1e2433] border-2 border-cyan-500/40 shadow-2xl flex items-center justify-center">
            <div className={`p-6 rounded-full bg-black/60 border border-white/10 flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <Music className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400" />
            </div>
            {isPlaying && (
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black animate-ping" />
            )}
          </div>
        </div>

        {/* Title and Specs */}
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide max-w-md truncate">
          {currentVideo?.title || 'MKV Audio Stream'}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-2 font-mono-time text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1">
            <Volume2 className="w-3 h-3" />
            {audioCodec}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
            MKV Matroska Container
          </span>
          {diagnosticReport?.subtitleTracks && diagnosticReport.subtitleTracks.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {diagnosticReport.subtitleTracks.length} Subtitle Tracks
            </span>
          )}
        </div>

        {/* Visualizer Spectrum Canvas */}
        <div className="w-full h-24 sm:h-28 mt-6">
          <canvas
            ref={canvasRef}
            width={540}
            height={110}
            className="w-full h-full"
          />
        </div>

        {/* Visualizer Style Switcher */}
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => setVisualizerMode('bars')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-time transition-colors cursor-pointer ${
              visualizerMode === 'bars'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Bars Spectrum
          </button>
          <button
            type="button"
            onClick={() => setVisualizerMode('wave')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-time transition-colors cursor-pointer ${
              visualizerMode === 'wave'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Smooth Wave
          </button>
        </div>
      </div>

      {/* Bottom Spacer for Player Controls */}
      <div className="h-16 pointer-events-none" />
    </div>
  );
};
