import { useState, useEffect, useRef, useCallback } from 'react';
import { PlaylistItem, PlayerSettings, SubtitleSettings, SubtitleCue, AspectRatioMode } from '../types';
import { extensionStorage } from '../utils/extensionStorage';

interface UseVideoPlayerProps {
  currentVideo: PlaylistItem | null;
  settings: PlayerSettings;
  subtitleSettings: SubtitleSettings;
  onVideoEnd?: () => void;
  onShowToast?: (text: string) => void;
}

export function useVideoPlayer({
  currentVideo,
  settings,
  subtitleSettings,
  onVideoEnd,
  onShowToast
}: UseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // High-performance seek tracking refs
  const pendingSeekTargetRef = useRef<number | null>(null);
  const seekDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const seekRafRef = useRef<number | null>(null);
  const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveStorageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeSeekAccumulatorToastRef = useRef<{ totalDelta: number; timer: NodeJS.Timeout | null }>({
    totalDelta: 0,
    timer: null
  });

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [volume, setVolume] = useState(settings.volume ?? 1);
  const [isMuted, setIsMuted] = useState(settings.isMuted ?? false);
  const [playbackRate, setPlaybackRate] = useState(settings.defaultSpeed ?? 1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>(settings.defaultAspectRatio ?? 'contain');
  const [error, setError] = useState<string | null>(null);
  const [activeCue, setActiveCue] = useState<SubtitleCue | null>(null);
  const [videoWidth, setVideoWidth] = useState<number>(0);
  const [videoHeight, setVideoHeight] = useState<number>(0);
  const [isAudioOnly, setIsAudioOnly] = useState<boolean>(false);

  // Perform low-overhead hardware seek using fastSeek if available
  const performHardwareSeek = useCallback((targetTime: number) => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if ('fastSeek' in video && typeof (video as unknown as { fastSeek: (t: number) => void }).fastSeek === 'function') {
        (video as unknown as { fastSeek: (t: number) => void }).fastSeek(targetTime);
      } else {
        video.currentTime = targetTime;
      }
    } catch {
      try {
        video.currentTime = targetTime;
      } catch {
        // Ignore seek error if video unmounted
      }
    }
  }, []);

  // Initialize and attach Web Audio Gain Node for Audio Boost
  const setupAudioGraph = useCallback(() => {
    if (!videoRef.current || audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const source = ctx.createMediaElementSource(videoRef.current);
      const gain = ctx.createGain();

      source.connect(gain);
      gain.connect(ctx.destination);

      audioContextRef.current = ctx;
      audioSourceRef.current = source;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn('Audio Context init note (may already be attached):', e);
    }
  }, []);

  // Update volume & gain
  const updateVolume = useCallback((newVol: number, muted?: boolean) => {
    const video = videoRef.current;
    if (!video) return;

    const targetMute = muted !== undefined ? muted : isMuted;
    const clampedVol = Math.max(0, Math.min(settings.audioBoost ? 2.0 : 1.0, newVol));

    setVolume(clampedVol);
    setIsMuted(targetMute);

    video.muted = targetMute;

    if (clampedVol > 1.0) {
      video.volume = 1.0;
      setupAudioGraph();
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = targetMute ? 0 : clampedVol;
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
        }
      }
    } else {
      video.volume = clampedVol;
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = targetMute ? 0 : 1.0;
      }
    }
  }, [isMuted, settings.audioBoost, setupAudioGraph]);

  // Play / Pause handling
  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    try {
      if (video.paused || video.ended) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Playback toggle error:', err);
      }
    }
  }, []);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      await video.play();
      setIsPlaying(true);
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Play error:', err);
      }
    }
  }, []);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setIsPlaying(false);
  }, []);

  // Debounced storage position saver
  const debouncedSavePlaybackPosition = useCallback((videoId: string, time: number) => {
    if (saveStorageTimerRef.current) {
      clearTimeout(saveStorageTimerRef.current);
    }
    saveStorageTimerRef.current = setTimeout(() => {
      extensionStorage.savePlaybackPosition(videoId, time);
    }, 500);
  }, []);

  // Seek relative or absolute with zero-latency UI update and hardware fastSeek
  const seekTo = useCallback((targetTime: number) => {
    const video = videoRef.current;
    if (!video || !isFinite(duration) || duration <= 0) return;

    const clampedTime = Math.max(0, Math.min(duration, targetTime));
    pendingSeekTargetRef.current = clampedTime;

    // Immediately update UI timeline position without waiting for decoder
    setCurrentTime(clampedTime);
    setIsSeeking(true);

    if (seekRafRef.current) {
      cancelAnimationFrame(seekRafRef.current);
    }

    seekRafRef.current = requestAnimationFrame(() => {
      performHardwareSeek(clampedTime);
      if (currentVideo) {
        debouncedSavePlaybackPosition(currentVideo.id, clampedTime);
      }
    });
  }, [duration, currentVideo, performHardwareSeek, debouncedSavePlaybackPosition]);

  // Ultra-fast relative seek (Right / Left keys, 5s / 10s skips) with accumulation
  const seekRelative = useCallback((deltaSeconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const totalDur = isFinite(duration) && duration > 0 ? duration : (video.duration || 999999);

    // Calculate base time from in-flight target if user is pressing keys rapidly
    const baseTime = pendingSeekTargetRef.current !== null
      ? pendingSeekTargetRef.current
      : (video.currentTime || currentTime || 0);

    const target = Math.max(0, Math.min(totalDur, baseTime + deltaSeconds));
    pendingSeekTargetRef.current = target;

    // 1. Instant UI update (0ms lag on timeline, time badges & controls)
    setCurrentTime(target);
    setIsSeeking(true);

    // 2. Accumulate delta for toast indicator
    activeSeekAccumulatorToastRef.current.totalDelta += deltaSeconds;
    if (activeSeekAccumulatorToastRef.current.timer) {
      clearTimeout(activeSeekAccumulatorToastRef.current.timer);
    }
    activeSeekAccumulatorToastRef.current.timer = setTimeout(() => {
      const accum = activeSeekAccumulatorToastRef.current.totalDelta;
      if (accum !== 0) {
        onShowToast?.(`${accum > 0 ? '+' : ''}${accum}s`);
      }
      activeSeekAccumulatorToastRef.current.totalDelta = 0;
    }, 200);

    // 3. Debounce hardware seek execution by a micro-frame for smooth rapid-fire key presses
    if (seekDebounceTimerRef.current) {
      clearTimeout(seekDebounceTimerRef.current);
    }

    seekDebounceTimerRef.current = setTimeout(() => {
      performHardwareSeek(target);
      if (currentVideo) {
        debouncedSavePlaybackPosition(currentVideo.id, target);
      }
    }, 16); // 1-frame (16ms) batch window
  }, [duration, currentTime, performHardwareSeek, onShowToast, currentVideo, debouncedSavePlaybackPosition]);

  // Change playback speed
  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    onShowToast?.(`Speed ${rate}x`);
  }, [onShowToast]);

  // Picture in Picture
  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPip(false);
      } else if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
        await video.requestPictureInPicture();
        setIsPip(true);
      } else {
        onShowToast?.('Picture-in-Picture not supported');
      }
    } catch (err) {
      console.warn('PiP error:', err);
      onShowToast?.('Failed to toggle Picture-in-Picture');
    }
  }, [onShowToast]);

  // Calculate Subtitles
  useEffect(() => {
    if (!subtitleSettings.enabled || !currentVideo) {
      setActiveCue(null);
      return;
    }

    const selectedTrack = currentVideo.subtitleTracks.find(
      (t) => t.id === currentVideo.selectedSubtitleTrackId
    );

    if (!selectedTrack || !selectedTrack.cues || selectedTrack.cues.length === 0) {
      setActiveCue(null);
      return;
    }

    // Apply subtitle sync offset
    const adjustedTime = currentTime - (subtitleSettings.syncOffset || 0);

    const matchingCue = selectedTrack.cues.find(
      (cue) => adjustedTime >= cue.startTime && adjustedTime <= cue.endTime
    );

    setActiveCue(matchingCue || null);
  }, [currentTime, subtitleSettings.enabled, subtitleSettings.syncOffset, currentVideo]);

  // Video Event Listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const clearBufferTimeout = () => {
      if (bufferTimeoutRef.current) {
        clearTimeout(bufferTimeoutRef.current);
        bufferTimeoutRef.current = null;
      }
    };

    const onPlay = () => {
      clearBufferTimeout();
      setIsBuffering(false);
      setIsPlaying(true);
    };

    const onPause = () => {
      clearBufferTimeout();
      setIsBuffering(false);
      setIsPlaying(false);
    };

    // Debounce the buffering indicator by 280ms so sub-second 5s/10s seeks don't flash a loading spinner
    const onWaiting = () => {
      clearBufferTimeout();
      bufferTimeoutRef.current = setTimeout(() => {
        setIsBuffering(true);
      }, 280);
    };

    const onSeeking = () => {
      setIsSeeking(true);
    };

    const onSeeked = () => {
      clearBufferTimeout();
      setIsBuffering(false);
      // If no new relative keyboard seek has been queued, clear in-flight target and sync
      if (pendingSeekTargetRef.current === null) {
        setIsSeeking(false);
        setCurrentTime(video.currentTime);
      }
    };

    const onCanPlay = () => {
      clearBufferTimeout();
      setIsBuffering(false);
    };

    const onTimeUpdate = () => {
      clearBufferTimeout();
      setIsBuffering(false);

      // Only update time from video element when not in the middle of a rapid key seek
      if (pendingSeekTargetRef.current === null && !isSeeking) {
        setCurrentTime(video.currentTime);
      }

      // Update buffer progress
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const dur = video.duration || 1;
        setBufferedPercent(Math.min(100, (bufferedEnd / dur) * 100));
      }

      // Periodically record playback position (debounced)
      if (currentVideo && Math.floor(video.currentTime) % 5 === 0) {
        debouncedSavePlaybackPosition(currentVideo.id, video.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      clearBufferTimeout();
      setDuration(video.duration || 0);
      setIsBuffering(false);
      setError(null);

      const w = video.videoWidth || 0;
      const h = video.videoHeight || 0;
      setVideoWidth(w);
      setVideoHeight(h);
      setIsAudioOnly(w === 0 && h === 0 && (video.duration || 0) > 0);

      // Apply initial rate & volume
      video.playbackRate = playbackRate;
      video.muted = isMuted;
      video.volume = Math.min(1, volume);
    };

    const onPlaying = () => {
      clearBufferTimeout();
      setIsBuffering(false);
      setIsPlaying(true);
      setError(null);

      const w = video.videoWidth || 0;
      const h = video.videoHeight || 0;
      setVideoWidth(w);
      setVideoHeight(h);
      if (w === 0 && h === 0 && (video.duration || 0) > 0) {
        setIsAudioOnly(true);
      }
    };

    const onEnded = () => {
      clearBufferTimeout();
      setIsBuffering(false);
      setIsPlaying(false);
      if (settings.loop) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        onVideoEnd?.();
      }
    };

    const onError = () => {
      clearBufferTimeout();
      setIsBuffering(false);
      setIsPlaying(false);
      const mediaError = video.error;
      let msg = 'Unable to play this video format.';
      if (mediaError?.code === 3) msg = 'Video decoding error occurred.';
      if (mediaError?.code === 4) msg = 'Format or codec not supported by browser.';
      setError(msg);
    };

    const onEnterPip = () => setIsPip(true);
    const onLeavePip = () => setIsPip(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('seeking', onSeeking);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);
    video.addEventListener('enterpictureinpicture', onEnterPip);
    video.addEventListener('leavepictureinpicture', onLeavePip);

    return () => {
      clearBufferTimeout();
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
      video.removeEventListener('enterpictureinpicture', onEnterPip);
      video.removeEventListener('leavepictureinpicture', onLeavePip);
    };
  }, [currentVideo, isSeeking, playbackRate, isMuted, volume, settings.loop, onVideoEnd, debouncedSavePlaybackPosition]);

  // Clean up timers & AudioContext on unmount
  useEffect(() => {
    return () => {
      if (seekDebounceTimerRef.current) clearTimeout(seekDebounceTimerRef.current);
      if (seekRafRef.current) cancelAnimationFrame(seekRafRef.current);
      if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
      if (saveStorageTimerRef.current) clearTimeout(saveStorageTimerRef.current);
      if (activeSeekAccumulatorToastRef.current.timer) clearTimeout(activeSeekAccumulatorToastRef.current.timer);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    bufferedPercent,
    volume,
    isMuted,
    playbackRate,
    isBuffering,
    isSeeking,
    setIsSeeking,
    isPip,
    aspectRatio,
    setAspectRatio,
    videoWidth,
    videoHeight,
    isAudioOnly,
    setIsAudioOnly,
    error,
    setError,
    activeCue,
    togglePlay,
    play,
    pause,
    seekTo,
    seekRelative,
    updateVolume,
    changePlaybackRate,
    togglePip
  };
}
