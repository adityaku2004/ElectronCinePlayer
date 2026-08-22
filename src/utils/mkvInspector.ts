import { SubtitleTrack, SubtitleCue } from '../types';
import { generateId } from './fileHelpers';

export interface MkvStreamTrack {
  trackNumber: number;
  trackUID?: number;
  trackType: number; // 1 = Video, 2 = Audio, 17 = Subtitle
  codecId: string;
  name?: string;
  language?: string;
  codecPrivate?: Uint8Array;
  // Video specific
  width?: number;
  height?: number;
  displayWidth?: number;
  displayHeight?: number;
  fps?: number;
  // Audio specific
  sampleRate?: number;
  channels?: number;
  bitDepth?: number;
  // Subtitle specific
  cues?: SubtitleCue[];
}

export interface MkvDiagnosticReport {
  isMkv: boolean;
  filename: string;
  fileSize: number;
  duration?: number;
  timecodeScale?: number;
  muxingApp?: string;
  writingApp?: string;
  videoTracks: MkvStreamTrack[];
  audioTracks: MkvStreamTrack[];
  subtitleTracks: MkvStreamTrack[];
  hasVideo: boolean;
  hasAudio: boolean;
  primaryVideoCodec?: string;
  primaryAudioCodec?: string;
  isHevc: boolean;
  isH264: boolean;
  isVp9: boolean;
  isAv1: boolean;
  isBrowserCompatibleVideo: boolean;
  isBrowserCompatibleAudio: boolean;
  remuxableToMp4: boolean;
  diagnosisReason: string;
  recommendedAction: 'remux' | 'audio_mode' | 'enable_flags' | 'native_ready' | 'none';
}

// Human readable friendly codec names
export const CODEC_DISPLAY_NAMES: Record<string, string> = {
  'V_MPEG4/ISO/AVC': 'H.264 / AVC (Advanced Video Coding)',
  'V_MPEGH/ISO/HEVC': 'H.265 / HEVC (High Efficiency Video Coding)',
  'V_VP8': 'Google VP8',
  'V_VP9': 'Google VP9',
  'V_AV1': 'AOMedia Video 1 (AV1)',
  'V_MS/VFW/FOURCC': 'MPEG-4 / DivX / XviD (VFW FourCC)',
  'V_MPEG2': 'MPEG-2 Video',
  'V_THEORA': 'Xiph Theora',
  'A_AAC': 'AAC (Advanced Audio Coding)',
  'A_AAC/MPEG4/LC': 'AAC-LC (Low Complexity)',
  'A_AAC/MPEG2/LC': 'AAC-LC MPEG-2',
  'A_OPUS': 'Opus Audio Codec',
  'A_VORBIS': 'Ogg Vorbis Audio',
  'A_FLAC': 'FLAC (Free Lossless Audio Codec)',
  'A_MPEG/L3': 'MP3 (MPEG-1 Audio Layer III)',
  'A_MPEG/L2': 'MP2 (MPEG-1 Audio Layer II)',
  'A_AC3': 'Dolby Digital AC-3 (5.1 / Stereo)',
  'A_EAC3': 'Dolby Digital Plus (E-AC-3)',
  'A_DTS': 'DTS Digital Surround',
  'A_PCM/INT/LIT': 'Uncompressed PCM (Linear Little-Endian)',
  'S_TEXT/UTF8': 'Plain UTF-8 Subtitles (SRT)',
  'S_TEXT/ASS': 'Advanced SubStation Alpha (ASS)',
  'S_TEXT/SSA': 'SubStation Alpha (SSA)',
  'S_VOBSUB': 'VobSub Bitmap Subtitles',
  'S_HDMV/PGS': 'PGS HDMV Blu-ray Subtitles'
};

function readElementId(data: Uint8Array, offset: number): { id: number; length: number } | null {
  if (offset >= data.length) return null;
  const firstByte = data[offset];
  if (firstByte === 0) return null;

  let length = 1;
  let mask = 0x80;
  while ((firstByte & mask) === 0 && length <= 4) {
    mask >>= 1;
    length++;
  }

  if (offset + length > data.length) return null;

  let id = 0;
  for (let i = 0; i < length; i++) {
    id = (id << 8) | data[offset + i];
  }

  return { id: id >>> 0, length };
}

function readDataSize(data: Uint8Array, offset: number): { size: number; length: number } | null {
  if (offset >= data.length) return null;
  const firstByte = data[offset];
  if (firstByte === 0) return null;

  let length = 1;
  let mask = 0x80;
  while ((firstByte & mask) === 0 && length <= 8) {
    mask >>= 1;
    length++;
  }

  if (offset + length > data.length) return null;

  let size = firstByte & (mask - 1);
  for (let i = 1; i < length; i++) {
    size = size * 256 + data[offset + i];
  }

  return { size, length };
}

function readUint(data: Uint8Array, offset: number, length: number): number {
  let val = 0;
  for (let i = 0; i < length; i++) {
    val = (val * 256) + data[offset + i];
  }
  return val;
}

function readFloat(data: Uint8Array, offset: number, length: number): number {
  const view = new DataView(data.buffer, data.byteOffset + offset, length);
  if (length === 4) return view.getFloat32(0, false);
  if (length === 8) return view.getFloat64(0, false);
  return 0;
}

function readUtf8(data: Uint8Array, offset: number, length: number): string {
  const slice = data.subarray(offset, offset + length);
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(slice).replace(/\0/g, '').trim();
}

/**
 * Checks whether a given video MIME & codec string is natively supported by current browser
 */
export function checkBrowserVideoSupport(codecId: string): boolean {
  if (typeof document === 'undefined') return true;
  const video = document.createElement('video');

  if (codecId.includes('AVC') || codecId.includes('H264')) {
    const canPlayMp4 = video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
    return canPlayMp4 === 'probably' || canPlayMp4 === 'maybe';
  }
  if (codecId.includes('HEVC') || codecId.includes('H265') || codecId.includes('MPEGH')) {
    const canPlayHevc = video.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"') ||
                        video.canPlayType('video/mp4; codecs="hvc1.1.6.L93.B0"');
    return canPlayHevc === 'probably' || canPlayHevc === 'maybe';
  }
  if (codecId.includes('VP9')) {
    const canPlayVp9 = video.canPlayType('video/webm; codecs="vp9, opus"');
    return canPlayVp9 === 'probably' || canPlayVp9 === 'maybe';
  }
  if (codecId.includes('VP8')) {
    const canPlayVp8 = video.canPlayType('video/webm; codecs="vp8, vorbis"');
    return canPlayVp8 === 'probably' || canPlayVp8 === 'maybe';
  }
  if (codecId.includes('AV1')) {
    const canPlayAv1 = video.canPlayType('video/webm; codecs="av01.0.05M.08"');
    return canPlayAv1 === 'probably' || canPlayAv1 === 'maybe';
  }
  return false;
}

/**
 * Fully analyzes MKV file headers, stream tracks, and codec parameters
 */
export async function inspectMkvFile(file: File | Blob, filename: string = 'media.mkv'): Promise<MkvDiagnosticReport> {
  const isMkv = filename.toLowerCase().endsWith('.mkv') || file.type.includes('matroska');
  const fileSize = file.size;

  const defaultReport: MkvDiagnosticReport = {
    isMkv,
    filename,
    fileSize,
    videoTracks: [],
    audioTracks: [],
    subtitleTracks: [],
    hasVideo: false,
    hasAudio: false,
    isHevc: false,
    isH264: false,
    isVp9: false,
    isAv1: false,
    isBrowserCompatibleVideo: true,
    isBrowserCompatibleAudio: true,
    remuxableToMp4: false,
    diagnosisReason: 'File appears to be playable or not an MKV container.',
    recommendedAction: 'none'
  };

  try {
    const MAX_HEADER_SIZE = Math.min(fileSize, 64 * 1024 * 1024);
    const arrayBuffer = await file.slice(0, MAX_HEADER_SIZE).arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    let offset = 0;
    let timecodeScale = 1000000;
    let duration: number | undefined;
    let muxingApp: string | undefined;
    let writingApp: string | undefined;

    const tracks: MkvStreamTrack[] = [];

    while (offset < data.length - 8) {
      const elemIdInfo = readElementId(data, offset);
      if (!elemIdInfo) {
        offset++;
        continue;
      }
      offset += elemIdInfo.length;

      const sizeInfo = readDataSize(data, offset);
      if (!sizeInfo) {
        offset++;
        continue;
      }
      offset += sizeInfo.length;

      const elemId = elemIdInfo.id;
      const elemSize = sizeInfo.size;
      const elemEnd = offset + elemSize;

      // 0x18538067 = Segment
      if (elemId === 0x18538067) {
        continue;
      }

      // 0x1549A966 = Segment Info
      if (elemId === 0x1549A966) {
        let infoOffset = offset;
        while (infoOffset < elemEnd && infoOffset < data.length - 4) {
          const childId = readElementId(data, infoOffset);
          if (!childId) break;
          infoOffset += childId.length;
          const childSize = readDataSize(data, infoOffset);
          if (!childSize) break;
          infoOffset += childSize.length;

          if (childId.id === 0x2AD7B1) {
            // TimecodeScale
            timecodeScale = readUint(data, infoOffset, childSize.size);
          } else if (childId.id === 0x4489) {
            // Duration
            const durRaw = readFloat(data, infoOffset, childSize.size);
            duration = (durRaw * timecodeScale) / 1e9;
          } else if (childId.id === 0x4D80) {
            // MuxingApp
            muxingApp = readUtf8(data, infoOffset, childSize.size);
          } else if (childId.id === 0x5741) {
            // WritingApp
            writingApp = readUtf8(data, infoOffset, childSize.size);
          }
          infoOffset += childSize.size;
        }
        offset = elemEnd;
        continue;
      }

      // 0x1654AE6B = Tracks
      if (elemId === 0x1654AE6B) {
        let tracksOffset = offset;
        while (tracksOffset < elemEnd && tracksOffset < data.length - 4) {
          const trackEntryId = readElementId(data, tracksOffset);
          if (!trackEntryId) break;
          tracksOffset += trackEntryId.length;
          const trackEntrySize = readDataSize(data, tracksOffset);
          if (!trackEntrySize) break;
          tracksOffset += trackEntrySize.length;

          if (trackEntryId.id === 0xAE) {
            // TrackEntry
            let entryOffset = tracksOffset;
            const entryEnd = tracksOffset + trackEntrySize.size;

            let trackNumber = 0;
            let trackUID: number | undefined;
            let trackType = 0;
            let codecId = '';
            let trackName: string | undefined;
            let language: string | undefined;
            let codecPrivate: Uint8Array | undefined;
            let width: number | undefined;
            let height: number | undefined;
            let displayWidth: number | undefined;
            let displayHeight: number | undefined;
            let sampleRate: number | undefined;
            let channels: number | undefined;
            let bitDepth: number | undefined;

            while (entryOffset < entryEnd && entryOffset < data.length - 4) {
              const fieldId = readElementId(data, entryOffset);
              if (!fieldId) break;
              entryOffset += fieldId.length;
              const fieldSize = readDataSize(data, entryOffset);
              if (!fieldSize) break;
              entryOffset += fieldSize.length;

              if (fieldId.id === 0xD7) {
                trackNumber = readUint(data, entryOffset, fieldSize.size);
              } else if (fieldId.id === 0x73C5) {
                trackUID = readUint(data, entryOffset, fieldSize.size);
              } else if (fieldId.id === 0x83) {
                trackType = readUint(data, entryOffset, fieldSize.size);
              } else if (fieldId.id === 0x86) {
                codecId = readUtf8(data, entryOffset, fieldSize.size);
              } else if (fieldId.id === 0x536E) {
                trackName = readUtf8(data, entryOffset, fieldSize.size);
              } else if (fieldId.id === 0x22B59C || fieldId.id === 0x22B59D) {
                language = readUtf8(data, entryOffset, fieldSize.size).toLowerCase();
              } else if (fieldId.id === 0x63A2) {
                codecPrivate = data.slice(entryOffset, entryOffset + fieldSize.size);
              } else if (fieldId.id === 0xE0) {
                // VideoSettings Container
                let vOffset = entryOffset;
                const vEnd = entryOffset + fieldSize.size;
                while (vOffset < vEnd) {
                  const vId = readElementId(data, vOffset);
                  if (!vId) break;
                  vOffset += vId.length;
                  const vSize = readDataSize(data, vOffset);
                  if (!vSize) break;
                  vOffset += vSize.length;

                  if (vId.id === 0xB0) width = readUint(data, vOffset, vSize.size);
                  else if (vId.id === 0xBA) height = readUint(data, vOffset, vSize.size);
                  else if (vId.id === 0x2383E0) displayWidth = readUint(data, vOffset, vSize.size);
                  else if (vId.id === 0x2383E1) displayHeight = readUint(data, vOffset, vSize.size);

                  vOffset += vSize.size;
                }
              } else if (fieldId.id === 0xE1) {
                // AudioSettings Container
                let aOffset = entryOffset;
                const aEnd = entryOffset + fieldSize.size;
                while (aOffset < aEnd) {
                  const aId = readElementId(data, aOffset);
                  if (!aId) break;
                  aOffset += aId.length;
                  const aSize = readDataSize(data, aOffset);
                  if (!aSize) break;
                  aOffset += aSize.length;

                  if (aId.id === 0xB5) sampleRate = readFloat(data, aOffset, aSize.size);
                  else if (aId.id === 0x9F) channels = readUint(data, aOffset, aSize.size);
                  else if (aId.id === 0x6264) bitDepth = readUint(data, aOffset, aSize.size);

                  aOffset += aSize.size;
                }
              }

              entryOffset += fieldSize.size;
            }

            tracks.push({
              trackNumber,
              trackUID,
              trackType,
              codecId,
              name: trackName,
              language: language || 'und',
              codecPrivate,
              width,
              height,
              displayWidth,
              displayHeight,
              sampleRate: sampleRate ? Math.round(sampleRate) : undefined,
              channels,
              bitDepth
            });
          }

          tracksOffset += trackEntrySize.size;
        }
        offset = elemEnd;
        break; // We have collected track descriptors!
      }

      offset = elemEnd;
    }

    const videoTracks = tracks.filter((t) => t.trackType === 1);
    const audioTracks = tracks.filter((t) => t.trackType === 2);
    const subtitleTracks = tracks.filter((t) => t.trackType === 17 || t.codecId.startsWith('S_'));

    const primaryVideo = videoTracks[0];
    const primaryAudio = audioTracks[0];

    const isHevc = primaryVideo?.codecId.includes('HEVC') || primaryVideo?.codecId.includes('H265') || false;
    const isH264 = primaryVideo?.codecId.includes('AVC') || primaryVideo?.codecId.includes('H264') || false;
    const isVp9 = primaryVideo?.codecId.includes('VP9') || false;
    const isAv1 = primaryVideo?.codecId.includes('AV1') || false;

    // Determine browser video compatibility
    let isBrowserCompatibleVideo = true;
    let diagnosisReason = '';
    let recommendedAction: MkvDiagnosticReport['recommendedAction'] = 'none';

    if (videoTracks.length === 0 && audioTracks.length > 0) {
      isBrowserCompatibleVideo = false;
      diagnosisReason = 'This MKV file contains only an audio stream (no video track detected).';
      recommendedAction = 'audio_mode';
    } else if (isHevc) {
      const browserCanHevc = checkBrowserVideoSupport('V_MPEGH/ISO/HEVC');
      if (!browserCanHevc) {
        isBrowserCompatibleVideo = false;
        diagnosisReason = 'Video is encoded in H.265 (HEVC), which is not natively supported by this browser without hardware HEVC decoding flags enabled.';
        recommendedAction = 'enable_flags';
      } else {
        diagnosisReason = 'Video is encoded in H.265 (HEVC) with browser support.';
        recommendedAction = 'native_ready';
      }
    } else if (isH264) {
      // In web browsers, MKV containers with H.264 video might not render unless remuxed to MP4 or WebM
      isBrowserCompatibleVideo = false; // Flag as requiring remux / inspection
      diagnosisReason = 'Video is standard H.264 (AVC) encapsulated in an MKV container. Browsers often demux the AAC audio but drop video inside MKV. A 1-click fast remux into an MP4 container will restore video instantly without quality loss.';
      recommendedAction = 'remux';
    } else if (primaryVideo && !isVp9 && !isAv1) {
      isBrowserCompatibleVideo = false;
      diagnosisReason = `Video codec "${primaryVideo.codecId}" (${CODEC_DISPLAY_NAMES[primaryVideo.codecId] || 'Legacy Codec'}) is not supported by standard browser decoders.`;
      recommendedAction = 'audio_mode';
    } else {
      isBrowserCompatibleVideo = true;
      diagnosisReason = 'Video stream (VP9/AV1/WebM) is natively supported by modern web browsers.';
      recommendedAction = 'native_ready';
    }

    const remuxableToMp4 = isH264;

    return {
      isMkv: true,
      filename,
      fileSize,
      duration,
      timecodeScale,
      muxingApp,
      writingApp,
      videoTracks,
      audioTracks,
      subtitleTracks,
      hasVideo: videoTracks.length > 0,
      hasAudio: audioTracks.length > 0,
      primaryVideoCodec: primaryVideo ? (CODEC_DISPLAY_NAMES[primaryVideo.codecId] || primaryVideo.codecId) : undefined,
      primaryAudioCodec: primaryAudio ? (CODEC_DISPLAY_NAMES[primaryAudio.codecId] || primaryAudio.codecId) : undefined,
      isHevc,
      isH264,
      isVp9,
      isAv1,
      isBrowserCompatibleVideo,
      isBrowserCompatibleAudio: true,
      remuxableToMp4,
      diagnosisReason,
      recommendedAction
    };
  } catch (err) {
    console.warn('MKV Inspection error:', err);
    return defaultReport;
  }
}
