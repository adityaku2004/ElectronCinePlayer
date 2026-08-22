import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, Pin, PinOff, Film } from 'lucide-react';
import {
  isElectron,
  windowMinimize,
  windowMaximize,
  windowClose,
  setAlwaysOnTop,
  getAlwaysOnTop
} from '../../services/electronService';

interface TitleBarProps {
  title?: string;
  onOpenSettings?: () => void;
  onOpenShortcuts?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ title }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [alwaysOnTop, setAlwaysOnTopState] = useState(false);
  const electronAvailable = isElectron();

  useEffect(() => {
    if (!electronAvailable || !window.electronAPI) return;

    // Check initial states
    getAlwaysOnTop().then(setAlwaysOnTopState);
    window.electronAPI.isMaximized().then(setIsMaximized);

    // Listen to window state updates
    const cleanup = window.electronAPI.onWindowStateChange((state) => {
      setIsMaximized(state.isMaximized);
    });

    return () => cleanup();
  }, [electronAvailable]);

  const handleToggleAlwaysOnTop = async () => {
    const next = !alwaysOnTop;
    const res = await setAlwaysOnTop(next);
    setAlwaysOnTopState(res);
  };

  return (
    <div
      className="w-full h-8 bg-[#0b0c10]/95 border-b border-white/10 flex items-center justify-between px-3 select-none text-xs text-gray-400 z-50 transition-colors"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: App Logo and Title */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center p-0.5 shadow-sm">
          <Film className="w-3 h-3 text-black fill-black" />
        </div>
        <span className="font-bold tracking-wider text-[11px] text-gray-300">
          CINE MEDIA PLAYER
        </span>
      </div>

      {/* Center: Current Playing Title */}
      <div className="flex-1 text-center truncate px-4 text-[11px] text-gray-400 font-medium">
        {title || 'Desktop Media Engine'}
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center gap-0.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {/* Always on Top Pin Button */}
        <button
          type="button"
          onClick={handleToggleAlwaysOnTop}
          className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
            alwaysOnTop ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
          title={alwaysOnTop ? 'Always on top (ON)' : 'Always on top (OFF)'}
        >
          {alwaysOnTop ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
        </button>

        {/* Minimize */}
        <button
          type="button"
          onClick={windowMinimize}
          className="p-1.5 rounded hover:bg-white/10 hover:text-white transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Maximize / Restore */}
        <button
          type="button"
          onClick={windowMaximize}
          className="p-1.5 rounded hover:bg-white/10 hover:text-white transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={windowClose}
          className="p-1.5 rounded hover:bg-red-600 hover:text-white transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
