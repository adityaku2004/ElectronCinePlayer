import { LibraryFolder, MediaFileInfo, MenuAction, WatchHistoryItem, WindowState } from '../shared/types';
import { PlaylistItem } from '../types';
import { cleanTitleFromFilename, generateId } from '../utils/fileHelpers';

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);
};

export const electronAPI = () => window.electronAPI;

// Helper to convert MediaFileInfo from Electron filesystem to PlaylistItem
export function mediaFileInfoToPlaylistItem(fileInfo: MediaFileInfo): PlaylistItem {
  const url = fileInfo.mediaUrl || `media://${encodeURI(fileInfo.path.replace(/\\/g, '/'))}`;
  const isMkv = fileInfo.extension.toLowerCase() === 'mkv';

  return {
    id: `native_${generateId()}`,
    title: cleanTitleFromFilename(fileInfo.name),
    url,
    dateAdded: fileInfo.modifiedDate || Date.now(),
    duration: fileInfo.duration,
    metadata: {
      filename: fileInfo.name,
      fileSize: fileInfo.size,
      resolution: fileInfo.resolution,
      codec: fileInfo.codec,
      videoType: isMkv ? 'video/x-matroska (MKV Container)' : `video/${fileInfo.extension}`
    },
    subtitleTracks: [],
    selectedSubtitleTrackId: null
  };
}

// Native Dialogs & Filesystem
export async function openNativeVideoFiles(): Promise<PlaylistItem[]> {
  if (!window.electronAPI) return [];

  const res = await window.electronAPI.openFileDialog({ multiSelections: true });
  if (res.canceled || !res.files || res.files.length === 0) {
    return [];
  }

  return res.files
    .filter((f) => !['srt', 'vtt', 'ass', 'ssa', 'sub'].includes(f.extension.toLowerCase()))
    .map(mediaFileInfoToPlaylistItem);
}

export async function openNativeFolder(): Promise<{
  folder: LibraryFolder | null;
  items: PlaylistItem[];
}> {
  if (!window.electronAPI) return { folder: null, items: [] };

  const res = await window.electronAPI.openFolderDialog();
  if (res.canceled || !res.folderPath) {
    return { folder: null, items: [] };
  }

  // Save to persistent library
  const savedFolder = await window.electronAPI.addLibraryFolder(
    res.folderPath,
    res.folderName
  );

  const videoFiles = (res.files || []).filter(
    (f) => !['srt', 'vtt', 'ass', 'ssa', 'sub'].includes(f.extension.toLowerCase())
  );

  const items = videoFiles.map(mediaFileInfoToPlaylistItem);

  return {
    folder: savedFolder,
    items
  };
}

export async function scanLibraryFolder(folderPath: string): Promise<PlaylistItem[]> {
  if (!window.electronAPI) return [];

  const res = await window.electronAPI.scanDirectory(folderPath);
  if (!res.success || !res.files) return [];

  const videoFiles = res.files.filter(
    (f) => !['srt', 'vtt', 'ass', 'ssa', 'sub'].includes(f.extension.toLowerCase())
  );

  return videoFiles.map(mediaFileInfoToPlaylistItem);
}

export async function getSingleFileInfo(filePath: string): Promise<PlaylistItem | null> {
  if (!window.electronAPI) return null;

  const info = await window.electronAPI.getFileInfo(filePath);
  if (!info) return null;

  return mediaFileInfoToPlaylistItem(info);
}

// Watch History & Continue Watching
export async function fetchWatchHistory(): Promise<WatchHistoryItem[]> {
  if (!window.electronAPI) {
    // Fallback to localStorage for web preview
    try {
      const raw = localStorage.getItem('cine_desktop_watch_history');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  return window.electronAPI.getWatchHistory();
}

export async function recordWatchHistory(item: {
  filePath: string;
  title: string;
  position: number;
  duration: number;
  completed?: boolean;
}): Promise<void> {
  if (!item.filePath || item.duration <= 0) return;

  if (window.electronAPI) {
    await window.electronAPI.saveWatchHistory({
      filePath: item.filePath,
      title: item.title,
      position: item.position,
      duration: item.duration,
      lastPlayed: Date.now(),
      completed: item.completed
    });
  } else {
    // Fallback to localStorage
    try {
      const history = await fetchWatchHistory();
      const isCompleted = item.completed ?? (item.position / item.duration >= 0.9);
      const updatedItem: WatchHistoryItem = {
        id: `wh_${Date.now()}`,
        filePath: item.filePath,
        title: item.title,
        position: item.position,
        duration: item.duration,
        lastPlayed: Date.now(),
        completed: isCompleted
      };
      const filtered = history.filter((h) => h.filePath !== item.filePath);
      filtered.unshift(updatedItem);
      localStorage.setItem('cine_desktop_watch_history', JSON.stringify(filtered.slice(0, 100)));
    } catch {}
  }
}

export async function clearWatchHistory(): Promise<void> {
  if (window.electronAPI) {
    await window.electronAPI.clearWatchHistory();
  } else {
    localStorage.removeItem('cine_desktop_watch_history');
  }
}

export async function deleteWatchHistoryItem(idOrPath: string): Promise<void> {
  if (window.electronAPI) {
    await window.electronAPI.deleteWatchHistoryItem(idOrPath);
  } else {
    try {
      const history = await fetchWatchHistory();
      const filtered = history.filter((h) => h.id !== idOrPath && h.filePath !== idOrPath);
      localStorage.setItem('cine_desktop_watch_history', JSON.stringify(filtered));
    } catch {}
  }
}

// Media Library Folders
export async function fetchLibraryFolders(): Promise<LibraryFolder[]> {
  if (!window.electronAPI) {
    try {
      const raw = localStorage.getItem('cine_desktop_library_folders');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  return window.electronAPI.getLibraryFolders();
}

export async function addLibraryFolder(path: string, name?: string): Promise<LibraryFolder | null> {
  if (window.electronAPI) {
    return window.electronAPI.addLibraryFolder(path, name);
  }
  return null;
}

export async function removeLibraryFolder(folderId: string): Promise<void> {
  if (window.electronAPI) {
    await window.electronAPI.removeLibraryFolder(folderId);
  } else {
    try {
      const folders = await fetchLibraryFolders();
      const filtered = folders.filter((f) => f.id !== folderId);
      localStorage.setItem('cine_desktop_library_folders', JSON.stringify(filtered));
    } catch {}
  }
}

// Window Controls
export async function windowMinimize(): Promise<void> {
  if (window.electronAPI) {
    await window.electronAPI.minimizeWindow();
  }
}

export async function windowMaximize(): Promise<void> {
  if (window.electronAPI) {
    await window.electronAPI.maximizeWindow();
  }
}

export async function windowClose(): Promise<void> {
  if (window.electronAPI) {
    await window.electronAPI.closeWindow();
  }
}

export async function setAlwaysOnTop(val: boolean): Promise<boolean> {
  if (window.electronAPI) {
    return window.electronAPI.setAlwaysOnTop(val);
  }
  return false;
}

export async function getAlwaysOnTop(): Promise<boolean> {
  if (window.electronAPI) {
    return window.electronAPI.getAlwaysOnTop();
  }
  return false;
}

export async function setPowerPlaying(isPlaying: boolean): Promise<void> {
  if (window.electronAPI) {
    await window.electronAPI.setPlayingState(isPlaying);
  }
}

export async function sendNativeNotification(title: string, body: string): Promise<boolean> {
  if (window.electronAPI) {
    return window.electronAPI.showNotification({ title, body });
  }
  return false;
}
