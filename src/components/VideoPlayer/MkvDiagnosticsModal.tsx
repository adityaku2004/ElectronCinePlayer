import React, { useState } from 'react';
import {
  Wrench,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileVideo,
  Volume2,
  Subtitles,
  Layers,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { Modal } from '../Common/Modal';
import { PlaylistItem } from '../../types';
import { MkvDiagnosticReport, CODEC_DISPLAY_NAMES } from '../../utils/mkvInspector';
import { formatFileSize } from '../../utils/fileHelpers';
import { formatTime } from '../../utils/formatTime';

interface MkvDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVideo: PlaylistItem | null;
  report: MkvDiagnosticReport | null;
  videoWidth: number;
  videoHeight: number;
  onRemuxToMp4: () => Promise<void>;
  isRemuxing: boolean;
  remuxProgress: { progress: number; stage: string };
  onShowToast: (text: string) => void;
}

export const MkvDiagnosticsModal: React.FC<MkvDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  currentVideo,
  report,
  videoWidth,
  videoHeight,
  onRemuxToMp4,
  isRemuxing,
  remuxProgress,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'stream_details' | 'guide'>('diagnosis');

  const isVideoInvisible = (videoWidth === 0 || videoHeight === 0);
  const primaryVideo = report?.videoTracks[0];
  const primaryAudio = report?.audioTracks[0];

  const videoCodecName = primaryVideo
    ? (CODEC_DISPLAY_NAMES[primaryVideo.codecId] || primaryVideo.codecId)
    : 'No Video Track';

  const audioCodecName = primaryAudio
    ? (CODEC_DISPLAY_NAMES[primaryAudio.codecId] || primaryAudio.codecId)
    : 'No Audio Track';

  const handleRunRemux = async () => {
    try {
      await onRemuxToMp4();
      onShowToast('Video stream repaired! Video and audio now playing in sync.');
    } catch (e) {
      onShowToast('Remuxing could not complete for this specific file.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MKV Stream & Video Diagnostics"
      subtitle="Comprehensive stream inspection, codec compatibility, and in-browser repair"
      icon={<Wrench className="w-5 h-5 text-cyan-400" />}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-black/40 border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('diagnosis')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'diagnosis'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Diagnosis & 1-Click Fix</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stream_details')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'stream_details'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stream Tracks ({report ? report.videoTracks.length + report.audioTracks.length + report.subtitleTracks.length : 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why Audio Plays Without Video</span>
          </button>
        </div>

        {/* TAB 1: DIAGNOSIS & 1-CLICK FIX */}
        {activeTab === 'diagnosis' && (
          <div className="space-y-4">
            {/* Status Alert Header Card */}
            <div className={`p-4 rounded-2xl border ${
              isVideoInvisible
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
            } flex items-start gap-3.5`}>
              <div className={`p-2.5 rounded-xl ${
                isVideoInvisible ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
              } shrink-0 mt-0.5`}>
                {isVideoInvisible ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    {isVideoInvisible ? 'Video Stream Not Rendering' : 'All Streams Playing Correctly'}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-time font-bold bg-black/40 text-cyan-300 border border-white/10">
                    MKV Matroska
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  {report?.diagnosisReason || 'Audio track is decoding and playing, but video frames are not being rendered by the browser video engine.'}
                </p>
              </div>
            </div>

            {/* Quick Status Breakdown Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Video Stream Status Card */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 font-medium flex items-center gap-1.5">
                    <FileVideo className="w-4 h-4 text-cyan-400" />
                    Video Track
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isVideoInvisible
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {isVideoInvisible ? '🔴 No Frame Output' : '🟢 Rendering'}
                  </span>
                </div>
                <div className="space-y-1 font-mono-time">
                  <div className="text-xs font-bold text-white truncate" title={videoCodecName}>
                    {videoCodecName}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {primaryVideo?.width ? `${primaryVideo.width} × ${primaryVideo.height}` : 'Resolution N/A'}
                  </div>
                </div>
              </div>

              {/* Audio Stream Status Card */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 font-medium flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-purple-400" />
                    Audio Track
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🟢 Active & Playing
                  </span>
                </div>
                <div className="space-y-1 font-mono-time">
                  <div className="text-xs font-bold text-white truncate" title={audioCodecName}>
                    {audioCodecName}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {primaryAudio?.sampleRate ? `${(primaryAudio.sampleRate / 1000).toFixed(1)} kHz` : '48 kHz'} • {primaryAudio?.channels === 6 ? '5.1 Surround' : 'Stereo (2.0)'}
                  </div>
                </div>
              </div>
            </div>

            {/* 1-Click Fast Remux Action Panel */}
            {report?.remuxableToMp4 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#10141e] to-blue-950/40 border border-cyan-500/40 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Recommended Solution: 1-Click Stream Remux
                      </h4>
                      <p className="text-[11px] text-gray-300 mt-0.5">
                        Converts the MKV encapsulation into an MP4 container in seconds with zero loss of quality.
                      </p>
                    </div>
                  </div>
                </div>

                {isRemuxing ? (
                  <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono-time">
                      <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        {remuxProgress.stage}
                      </span>
                      <span className="text-white font-bold">{remuxProgress.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-150"
                        style={{ width: `${remuxProgress.progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRunRemux}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-black" />
                    <span>⚡ Remux & Repair Video Stream Now</span>
                  </button>
                )}
              </div>
            )}

            {/* If HEVC: Explanation & Solutions */}
            {report?.isHevc && (
              <div className="p-4 rounded-2xl bg-[#141720] border border-white/10 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">
                    H.265 / HEVC Video Stream Detected
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  This MKV uses H.265 (HEVC), which requires browser hardware decoding support. You can enjoy the full audio stream with our built-in <strong>Audio Visualizer Mode</strong>, or enable HEVC hardware decoding in your browser settings (see the Guide tab).
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DETAILED STREAM TRACKS */}
        {activeTab === 'stream_details' && (
          <div className="space-y-3">
            <div className="text-[11px] text-gray-400">
              Streams detected in container <strong>{currentVideo?.metadata?.filename || 'media.mkv'}</strong> ({formatFileSize(report?.fileSize)}):
            </div>

            {/* Video Tracks List */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-400 flex items-center gap-1.5">
                <FileVideo className="w-3.5 h-3.5" />
                Video Tracks ({report?.videoTracks.length || 0})
              </span>
              {report?.videoTracks.map((vt, i) => (
                <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between font-mono-time text-xs">
                  <div>
                    <div className="font-bold text-white">
                      Track #{vt.trackNumber}: {CODEC_DISPLAY_NAMES[vt.codecId] || vt.codecId}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {vt.width ? `${vt.width} × ${vt.height}` : 'Variable'} • Codec ID: {vt.codecId}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isVideoInvisible ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {isVideoInvisible ? 'Audio Only Output' : 'Active Video'}
                  </span>
                </div>
              ))}
            </div>

            {/* Audio Tracks List */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-purple-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                Audio Tracks ({report?.audioTracks.length || 0})
              </span>
              {report?.audioTracks.map((at, i) => (
                <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between font-mono-time text-xs">
                  <div>
                    <div className="font-bold text-white">
                      Track #{at.trackNumber}: {CODEC_DISPLAY_NAMES[at.codecId] || at.codecId}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {at.sampleRate ? `${at.sampleRate} Hz` : '48 kHz'} • {at.channels} Channels ({at.language?.toUpperCase() || 'UND'})
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    🟢 Playing
                  </span>
                </div>
              ))}
            </div>

            {/* Subtitle Tracks List */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
                <Subtitles className="w-3.5 h-3.5" />
                Embedded Subtitle Tracks ({report?.subtitleTracks.length || 0})
              </span>
              {report?.subtitleTracks.map((st, i) => (
                <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between font-mono-time text-xs">
                  <div>
                    <div className="font-bold text-white">
                      Track #{st.trackNumber}: {st.name || CODEC_DISPLAY_NAMES[st.codecId] || st.codecId}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Language: {st.language?.toUpperCase() || 'UND'} • Type: {st.codecId}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                    Parsed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WHY AUDIO PLAYS WITHOUT VIDEO */}
        {activeTab === 'guide' && (
          <div className="space-y-3 leading-relaxed text-gray-300">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                1. Container vs Codec Architecture in Web Browsers
              </h4>
              <p className="text-[11px]">
                Matroska (<code>.mkv</code>) is an open-standard container capable of holding any video codec (H.264, H.265/HEVC, VP9, AV1, XviD) and audio codec (AAC, MP3, Opus, FLAC, AC-3).
              </p>
              <p className="text-[11px]">
                Web browsers natively support common audio codecs like <strong>AAC, Opus, and MP3</strong>. When you open an MKV, the browser easily demuxes and decodes the audio track.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                2. Why the Video Screen Remains Black
              </h4>
              <p className="text-[11px]">
                • <strong>H.264 in MKV Container:</strong> Chrome, Safari, and Firefox can natively decode H.264 video, but their built-in container demuxers expect H.264 inside an MP4/WebM container rather than MKV. Clicking <strong>⚡ 1-Click Remux</strong> repackages the stream without losing quality and immediately renders the video.
              </p>
              <p className="text-[11px]">
                • <strong>H.265 / HEVC:</strong> Many 4K MKVs use H.265 (HEVC), which requires browser hardware decoding flags or patent licenses. You can enable hardware HEVC in Chrome by visiting <code>chrome://flags/#enable-hevc</code> and setting it to <em>Enabled</em>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 space-y-1">
              <div className="font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Cine Media Player Solution
              </div>
              <p className="text-[11px]">
                This player includes an automated <strong>Audio Visualizer Mode</strong> with dynamic frequency spectrum, track metadata, and instant <strong>1-Click Remux</strong> so you always have uninterrupted playback.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
        <div className="text-[11px] text-gray-400 font-mono-time">
          {report?.filename || 'media.mkv'}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          Close Diagnostics
        </button>
      </div>
    </Modal>
  );
};
