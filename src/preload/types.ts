import {
  AppInfo,
  DirectoryScanResult,
  LibraryFolder,
  MediaFileInfo,
  MenuAction,
  NativeNotificationOptions,
  OpenFileDialogResult,
  OpenFolderDialogResult,
  UpdateStatus,
  WatchHistoryItem,
  WindowState
} from '../shared/types';

export interface ElectronAPI {
  // App info & Environment
  isElectron: boolean;
  platform: 'win32' | 'darwin' | 'linux' | 'other';
  getAppInfo: () => Promise<AppInfo>;

  // Window Controls
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<boolean>;
  getAlwaysOnTop: () => Promise<boolean>;
  onWindowStateChange: (callback: (state: WindowState) => void) => () => void;

  // Native Dialogs & Filesystem
  openFileDialog: (options?: { multiSelections?: boolean; defaultPath?: string }) => Promise<OpenFileDialogResult>;
  openFolderDialog: (options?: { defaultPath?: string }) => Promise<OpenFolderDialogResult>;
  scanDirectory: (folderPath: string) => Promise<DirectoryScanResult>;
  getFileInfo: (filePath: string) => Promise<MediaFileInfo | null>;
  getMediaUrl: (filePath: string) => Promise<string>;
  readSubtitleFile: (filePath: string) => Promise<string>;

  // Notifications & UI Prompts
  showMessage: (options: {
    type?: 'info' | 'error' | 'warning' | 'question';
    title?: string;
    message: string;
    detail?: string;
    buttons?: string[];
  }) => Promise<number>;
  showNotification: (options: NativeNotificationOptions) => Promise<boolean>;

  // Power Management (Keep Awake while playing)
  setPlayingState: (isPlaying: boolean) => Promise<void>;

  // Persistence (Store, History, Library Folders)
  getStoreValue: <T = unknown>(key: string, defaultValue?: T) => Promise<T>;
  setStoreValue: <T = unknown>(key: string, value: T) => Promise<void>;
  getWatchHistory: () => Promise<WatchHistoryItem[]>;
  saveWatchHistory: (item: Omit<WatchHistoryItem, 'id'> & { id?: string }) => Promise<WatchHistoryItem>;
  clearWatchHistory: () => Promise<void>;
  deleteWatchHistoryItem: (idOrPath: string) => Promise<void>;

  getLibraryFolders: () => Promise<LibraryFolder[]>;
  addLibraryFolder: (folderPath: string, name?: string) => Promise<LibraryFolder>;
  removeLibraryFolder: (folderId: string) => Promise<void>;

  // Auto Updater
  checkForUpdates: () => Promise<UpdateStatus>;
  installUpdate: () => Promise<void>;

  // Listeners from Main Process
  onMenuAction: (callback: (action: MenuAction) => void) => () => void;
  onFileOpened: (callback: (filePath: string | string[]) => void) => () => void;
  onUpdateStatus: (callback: (status: UpdateStatus) => void) => () => void;
}
