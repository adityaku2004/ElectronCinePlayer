import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
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
import { ElectronAPI } from './types';

const api: ElectronAPI = {
  isElectron: true,
  platform: (process.platform as 'win32' | 'darwin' | 'linux') || 'other',

  getAppInfo: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_INFO),

  // Window Controls
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
  isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_SET_ALWAYS_ON_TOP, flag),
  getAlwaysOnTop: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_GET_ALWAYS_ON_TOP),

  onWindowStateChange: (callback: (state: WindowState) => void) => {
    const handler = (_event: IpcRendererEvent, state: WindowState) => callback(state);
    ipcRenderer.on(IPC_CHANNELS.WINDOW_STATE_CHANGED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_STATE_CHANGED, handler);
    };
  },

  // Native Dialogs & Filesystem
  openFileDialog: (options) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FILE, options),
  openFolderDialog: (options) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FOLDER, options),
  scanDirectory: (folderPath: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_SCAN_DIRECTORY, folderPath),
  getFileInfo: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_GET_FILE_INFO, filePath),
  getMediaUrl: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_GET_MEDIA_URL, filePath),
  readSubtitleFile: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_READ_SUBTITLE_FILE, filePath),

  // Notifications & UI Prompts
  showMessage: (options) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SHOW_MESSAGE, options),
  showNotification: (options: NativeNotificationOptions) =>
    ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SHOW_NOTIFICATION, options),

  // Power Management
  setPlayingState: (isPlaying: boolean) =>
    ipcRenderer.invoke(IPC_CHANNELS.POWER_SET_PLAYING, isPlaying),

  // Persistence
  getStoreValue: <T = unknown>(key: string, defaultValue?: T) =>
    ipcRenderer.invoke(IPC_CHANNELS.STORE_GET, key, defaultValue),
  setStoreValue: <T = unknown>(key: string, value: T) =>
    ipcRenderer.invoke(IPC_CHANNELS.STORE_SET, key, value),
  getWatchHistory: () => ipcRenderer.invoke(IPC_CHANNELS.STORE_GET_HISTORY),
  saveWatchHistory: (item) => ipcRenderer.invoke(IPC_CHANNELS.STORE_SAVE_HISTORY, item),
  clearWatchHistory: () => ipcRenderer.invoke(IPC_CHANNELS.STORE_CLEAR_HISTORY),
  deleteWatchHistoryItem: (idOrPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.STORE_DELETE_HISTORY_ITEM, idOrPath),

  getLibraryFolders: () => ipcRenderer.invoke(IPC_CHANNELS.STORE_GET_LIBRARY_FOLDERS),
  addLibraryFolder: (folderPath: string, name?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.STORE_ADD_LIBRARY_FOLDER, folderPath, name),
  removeLibraryFolder: (folderId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.STORE_REMOVE_LIBRARY_FOLDER, folderId),

  // Auto Updater
  checkForUpdates: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATER_CHECK_FOR_UPDATES),
  installUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATER_INSTALL_UPDATE),

  // Events from Main Process
  onMenuAction: (callback: (action: MenuAction) => void) => {
    const handler = (_event: IpcRendererEvent, action: MenuAction) => callback(action);
    ipcRenderer.on(IPC_CHANNELS.MENU_ACTION, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.MENU_ACTION, handler);
    };
  },

  onFileOpened: (callback: (filePath: string | string[]) => void) => {
    const handler = (_event: IpcRendererEvent, filePath: string | string[]) => callback(filePath);
    ipcRenderer.on(IPC_CHANNELS.FILE_OPENED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.FILE_OPENED, handler);
    };
  },

  onUpdateStatus: (callback: (status: UpdateStatus) => void) => {
    const handler = (_event: IpcRendererEvent, status: UpdateStatus) => callback(status);
    ipcRenderer.on(IPC_CHANNELS.UPDATE_STATUS, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_STATUS, handler);
    };
  }
};

contextBridge.exposeInMainWorld('electronAPI', api);
