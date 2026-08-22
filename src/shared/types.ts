export interface MediaFileInfo {
  name: string;
  path: string;
  extension: string;
  size: number;
  modifiedDate: number;
  mediaUrl?: string; // media:// protocol URL or file path for secure playback
  duration?: number;
  resolution?: string;
  codec?: string;
}

export interface WatchHistoryItem {
  id: string;
  filePath: string;
  title: string;
  position: number; // in seconds
  duration: number; // in seconds
  lastPlayed: number; // timestamp ms
  completed: boolean; // true if played >= 90%
  fileSize?: number;
  thumbnailUrl?: string;
}

export interface LibraryFolder {
  id: string;
  path: string;
  name: string;
  addedAt: number;
  fileCount: number;
  lastScanned?: number;
}

export interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
  isFullScreen: boolean;
}

export interface AppInfo {
  name: string;
  version: string;
  platform: 'win32' | 'darwin' | 'linux' | 'other';
  isPackaged: boolean;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  userDataPath: string;
}

export interface NativeNotificationOptions {
  title: string;
  body: string;
  silent?: boolean;
  icon?: string;
}

export interface DialogFilter {
  name: string;
  extensions: string[];
}

export interface OpenFileDialogResult {
  canceled: boolean;
  filePaths: string[];
  files: MediaFileInfo[];
}

export interface OpenFolderDialogResult {
  canceled: boolean;
  folderPath?: string;
  folderName?: string;
  files: MediaFileInfo[];
}

export interface DirectoryScanResult {
  success: boolean;
  folderPath: string;
  files: MediaFileInfo[];
  error?: string;
}

export type MenuAction =
  | 'open-file'
  | 'open-folder'
  | 'play-pause'
  | 'stop'
  | 'next'
  | 'prev'
  | 'seek-forward'
  | 'seek-backward'
  | 'volume-up'
  | 'volume-down'
  | 'mute'
  | 'toggle-fullscreen'
  | 'toggle-pip'
  | 'toggle-always-on-top'
  | 'open-settings'
  | 'open-shortcuts'
  | 'open-equalizer'
  | 'open-playlist'
  | 'open-bookmarks'
  | 'take-screenshot'
  | 'about';

export interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  releaseNotes?: string;
  progress?: number;
  error?: string;
}
