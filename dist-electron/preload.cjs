// src/preload/preload.ts
var import_electron = require("electron");

// src/shared/constants.ts
var SUPPORTED_VIDEO_EXTENSIONS = [
  "mp4",
  "mkv",
  "webm",
  "mov",
  "avi",
  "m4v",
  "mpeg",
  "mpg",
  "ogv",
  "ts",
  "wmv",
  "flv",
  "3gp"
];
var SUPPORTED_SUBTITLE_EXTENSIONS = [
  "srt",
  "vtt",
  "ass",
  "ssa",
  "sub",
  "sbv"
];
var ALL_SUPPORTED_MEDIA_EXTENSIONS = [
  ...SUPPORTED_VIDEO_EXTENSIONS,
  ...SUPPORTED_SUBTITLE_EXTENSIONS
];
var IPC_CHANNELS = {
  // Window controls
  WINDOW_MINIMIZE: "window:minimize",
  WINDOW_MAXIMIZE: "window:maximize",
  WINDOW_RESTORE: "window:restore",
  WINDOW_CLOSE: "window:close",
  WINDOW_IS_MAXIMIZED: "window:is-maximized",
  WINDOW_IS_FULLSCREEN: "window:is-fullscreen",
  WINDOW_SET_ALWAYS_ON_TOP: "window:set-always-on-top",
  WINDOW_GET_ALWAYS_ON_TOP: "window:get-always-on-top",
  WINDOW_STATE_CHANGED: "window:state-changed",
  // Dialogs & Files
  DIALOG_OPEN_FILE: "dialog:open-file",
  DIALOG_OPEN_FOLDER: "dialog:open-folder",
  DIALOG_SHOW_MESSAGE: "dialog:show-message",
  DIALOG_SHOW_NOTIFICATION: "dialog:show-notification",
  FS_SCAN_DIRECTORY: "fs:scan-directory",
  FS_GET_FILE_INFO: "fs:get-file-info",
  FS_GET_MEDIA_URL: "fs:get-media-url",
  FS_READ_SUBTITLE_FILE: "fs:read-subtitle-file",
  // App & Power
  APP_GET_INFO: "app:get-info",
  POWER_SET_PLAYING: "power:set-playing",
  // Store & Persistence
  STORE_GET: "store:get",
  STORE_SET: "store:set",
  STORE_DELETE: "store:delete",
  STORE_GET_HISTORY: "store:get-history",
  STORE_SAVE_HISTORY: "store:save-history",
  STORE_CLEAR_HISTORY: "store:clear-history",
  STORE_DELETE_HISTORY_ITEM: "store:delete-history-item",
  STORE_GET_LIBRARY_FOLDERS: "store:get-library-folders",
  STORE_ADD_LIBRARY_FOLDER: "store:add-library-folder",
  STORE_REMOVE_LIBRARY_FOLDER: "store:remove-library-folder",
  // Events & Updater
  MENU_ACTION: "app:menu-action",
  FILE_OPENED: "app:file-opened",
  UPDATE_STATUS: "updater:status",
  UPDATER_CHECK_FOR_UPDATES: "updater:check-for-updates",
  UPDATER_INSTALL_UPDATE: "updater:install-update"
};

// src/preload/preload.ts
var api = {
  isElectron: true,
  platform: process.platform || "other",
  getAppInfo: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.APP_GET_INFO),
  // Window Controls
  minimizeWindow: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
  isMaximized: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED),
  setAlwaysOnTop: (flag) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.WINDOW_SET_ALWAYS_ON_TOP, flag),
  getAlwaysOnTop: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.WINDOW_GET_ALWAYS_ON_TOP),
  onWindowStateChange: (callback) => {
    const handler = (_event, state) => callback(state);
    import_electron.ipcRenderer.on(IPC_CHANNELS.WINDOW_STATE_CHANGED, handler);
    return () => {
      import_electron.ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_STATE_CHANGED, handler);
    };
  },
  // Native Dialogs & Filesystem
  openFileDialog: (options) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FILE, options),
  openFolderDialog: (options) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FOLDER, options),
  scanDirectory: (folderPath) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.FS_SCAN_DIRECTORY, folderPath),
  getFileInfo: (filePath) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.FS_GET_FILE_INFO, filePath),
  getMediaUrl: (filePath) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.FS_GET_MEDIA_URL, filePath),
  readSubtitleFile: (filePath) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.FS_READ_SUBTITLE_FILE, filePath),
  // Notifications & UI Prompts
  showMessage: (options) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SHOW_MESSAGE, options),
  showNotification: (options) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SHOW_NOTIFICATION, options),
  // Power Management
  setPlayingState: (isPlaying) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.POWER_SET_PLAYING, isPlaying),
  // Persistence
  getStoreValue: (key, defaultValue) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.STORE_GET, key, defaultValue),
  setStoreValue: (key, value) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.STORE_SET, key, value),
  getWatchHistory: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.STORE_GET_HISTORY),
  saveWatchHistory: (item) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.STORE_SAVE_HISTORY, item),
  clearWatchHistory: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.STORE_CLEAR_HISTORY),
  deleteWatchHistoryItem: (idOrPath) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.STORE_DELETE_HISTORY_ITEM, idOrPath),
  getLibraryFolders: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.STORE_GET_LIBRARY_FOLDERS),
  addLibraryFolder: (folderPath, name) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.STORE_ADD_LIBRARY_FOLDER, folderPath, name),
  removeLibraryFolder: (folderId) => import_electron.ipcRenderer.invoke(IPC_CHANNELS.STORE_REMOVE_LIBRARY_FOLDER, folderId),
  // Auto Updater
  checkForUpdates: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.UPDATER_CHECK_FOR_UPDATES),
  installUpdate: () => import_electron.ipcRenderer.invoke(IPC_CHANNELS.UPDATER_INSTALL_UPDATE),
  // Events from Main Process
  onMenuAction: (callback) => {
    const handler = (_event, action) => callback(action);
    import_electron.ipcRenderer.on(IPC_CHANNELS.MENU_ACTION, handler);
    return () => {
      import_electron.ipcRenderer.removeListener(IPC_CHANNELS.MENU_ACTION, handler);
    };
  },
  onFileOpened: (callback) => {
    const handler = (_event, filePath) => callback(filePath);
    import_electron.ipcRenderer.on(IPC_CHANNELS.FILE_OPENED, handler);
    return () => {
      import_electron.ipcRenderer.removeListener(IPC_CHANNELS.FILE_OPENED, handler);
    };
  },
  onUpdateStatus: (callback) => {
    const handler = (_event, status) => callback(status);
    import_electron.ipcRenderer.on(IPC_CHANNELS.UPDATE_STATUS, handler);
    return () => {
      import_electron.ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_STATUS, handler);
    };
  }
};
import_electron.contextBridge.exposeInMainWorld("electronAPI", api);
