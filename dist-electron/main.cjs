var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main/main.ts
var import_electron14 = require("electron");
var import_path7 = __toESM(require("path"), 1);

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
var CUSTOM_MEDIA_PROTOCOL = "media";

// src/main/fileSystem/mediaProtocol.ts
var import_electron = require("electron");
var import_path = __toESM(require("path"), 1);
var import_url = require("url");

// src/main/services/logger.ts
var isDev = process.env.NODE_ENV !== "production";
var logger = {
  info: (message, ...args) => {
    console.log(`[CINE-MAIN:INFO] ${(/* @__PURE__ */ new Date()).toISOString()} - ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[CINE-MAIN:WARN] ${(/* @__PURE__ */ new Date()).toISOString()} - ${message}`, ...args);
  },
  error: (message, error) => {
    const errorMsg = error instanceof Error ? error.message : String(error || "");
    console.error(`[CINE-MAIN:ERROR] ${(/* @__PURE__ */ new Date()).toISOString()} - ${message}: ${errorMsg}`);
  },
  debug: (message, ...args) => {
    if (isDev) {
      console.debug(`[CINE-MAIN:DEBUG] ${(/* @__PURE__ */ new Date()).toISOString()} - ${message}`, ...args);
    }
  }
};

// src/main/fileSystem/mediaProtocol.ts
function registerMediaPrivilegedScheme() {
  try {
    import_electron.protocol.registerSchemesAsPrivileged([
      {
        scheme: CUSTOM_MEDIA_PROTOCOL,
        privileges: {
          standard: true,
          secure: true,
          supportFetchAPI: true,
          stream: true,
          bypassCSP: true,
          corsEnabled: true
        }
      }
    ]);
    logger.info(`Privileged scheme registered for '${CUSTOM_MEDIA_PROTOCOL}://'`);
  } catch (err) {
    logger.error("Failed to register privileged scheme", err);
  }
}
function setupMediaProtocolHandler() {
  try {
    import_electron.protocol.handle(CUSTOM_MEDIA_PROTOCOL, (request) => {
      try {
        const rawUrl = request.url;
        let filePath = rawUrl.replace(new RegExp(`^${CUSTOM_MEDIA_PROTOCOL}:/{1,3}`), "");
        filePath = decodeURIComponent(filePath);
        if (process.platform === "win32" && /^[a-zA-Z]:[/\\]/.test(filePath)) {
          filePath = import_path.default.normalize(filePath);
        } else if (!filePath.startsWith("/")) {
          filePath = "/" + filePath;
        }
        const fileUrl = (0, import_url.pathToFileURL)(filePath).toString();
        logger.debug(`Streaming media protocol: ${rawUrl} -> ${fileUrl}`);
        return import_electron.net.fetch(fileUrl, {
          headers: request.headers,
          method: request.method
        });
      } catch (err) {
        logger.error(`Error handling media protocol for ${request.url}`, err);
        return new Response("Media file not found or inaccessible", { status: 404 });
      }
    });
    logger.info(`Media protocol '${CUSTOM_MEDIA_PROTOCOL}://' handler active`);
  } catch (err) {
    logger.error("Failed to register media protocol handler", err);
  }
}

// src/main/ipc/fileIpc.ts
var import_electron5 = require("electron");
var import_promises2 = __toESM(require("fs/promises"), 1);

// src/main/dialogs/nativeDialogs.ts
var import_electron2 = require("electron");
var import_path3 = __toESM(require("path"), 1);

// src/main/fileSystem/scanner.ts
var import_promises = __toESM(require("fs/promises"), 1);
var import_path2 = __toESM(require("path"), 1);
function getMediaProtocolUrl(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return `${CUSTOM_MEDIA_PROTOCOL}://${encodeURI(normalized)}`;
}
async function getFileInfo(filePath) {
  try {
    const stats = await import_promises.default.stat(filePath);
    if (!stats.isFile()) return null;
    const ext = import_path2.default.extname(filePath).toLowerCase().replace(/^\./, "");
    const name = import_path2.default.basename(filePath);
    return {
      name,
      path: filePath,
      extension: ext,
      size: stats.size,
      modifiedDate: stats.mtimeMs,
      mediaUrl: getMediaProtocolUrl(filePath)
    };
  } catch (err) {
    logger.error(`Error reading file info for ${filePath}`, err);
    return null;
  }
}
async function scanDirectory(dirPath, maxDepth = 2, currentDepth = 0) {
  const result = [];
  try {
    const entries = await import_promises.default.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = import_path2.default.join(dirPath, entry.name);
      if (entry.isFile()) {
        const ext = import_path2.default.extname(entry.name).toLowerCase().replace(/^\./, "");
        if (SUPPORTED_VIDEO_EXTENSIONS.includes(ext) || SUPPORTED_SUBTITLE_EXTENSIONS.includes(ext)) {
          try {
            const stats = await import_promises.default.stat(fullPath);
            result.push({
              name: entry.name,
              path: fullPath,
              extension: ext,
              size: stats.size,
              modifiedDate: stats.mtimeMs,
              mediaUrl: getMediaProtocolUrl(fullPath)
            });
          } catch {
          }
        }
      } else if (entry.isDirectory() && currentDepth < maxDepth && !entry.name.startsWith(".")) {
        const subResult = await scanDirectory(fullPath, maxDepth, currentDepth + 1);
        if (subResult.success && subResult.files.length > 0) {
          result.push(...subResult.files);
        }
      }
    }
    result.sort((a, b) => b.modifiedDate - a.modifiedDate);
    return {
      success: true,
      folderPath: dirPath,
      files: result
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error(`Directory scan error in ${dirPath}`, err);
    return {
      success: false,
      folderPath: dirPath,
      files: [],
      error: errorMsg
    };
  }
}

// src/main/dialogs/nativeDialogs.ts
async function showOpenFileDialog(window, options) {
  try {
    const dialogOptions = {
      title: "Open Video or Media File",
      defaultPath: options?.defaultPath,
      properties: ["openFile"],
      filters: [
        {
          name: "All Supported Media & Subtitles",
          extensions: ALL_SUPPORTED_MEDIA_EXTENSIONS
        },
        {
          name: "Video Files (*.mp4, *.mkv, *.webm, *.mov, *.avi, *.m4v, *.ts)",
          extensions: SUPPORTED_VIDEO_EXTENSIONS
        },
        {
          name: "Subtitle Files (*.srt, *.vtt, *.ass, *.ssa, *.sub)",
          extensions: SUPPORTED_SUBTITLE_EXTENSIONS
        },
        {
          name: "All Files (*.*)",
          extensions: ["*"]
        }
      ]
    };
    if (options?.multiSelections !== false) {
      dialogOptions.properties?.push("multiSelections");
    }
    const result = window ? await import_electron2.dialog.showOpenDialog(window, dialogOptions) : await import_electron2.dialog.showOpenDialog(dialogOptions);
    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true, filePaths: [], files: [] };
    }
    const files = [];
    for (const filePath of result.filePaths) {
      const fileInfo = await getFileInfo(filePath);
      if (fileInfo) {
        files.push(fileInfo);
      }
    }
    return {
      canceled: false,
      filePaths: result.filePaths,
      files
    };
  } catch (err) {
    logger.error("Error opening file dialog", err);
    return { canceled: true, filePaths: [], files: [] };
  }
}
async function showOpenFolderDialog(window, options) {
  try {
    const dialogOptions = {
      title: "Select Media Folder to Add to Library",
      defaultPath: options?.defaultPath,
      properties: ["openDirectory", "createDirectory"]
    };
    const result = window ? await import_electron2.dialog.showOpenDialog(window, dialogOptions) : await import_electron2.dialog.showOpenDialog(dialogOptions);
    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true, files: [] };
    }
    const folderPath = result.filePaths[0];
    const folderName = import_path3.default.basename(folderPath);
    logger.info(`Folder selected: ${folderPath}, scanning media contents...`);
    const scan = await scanDirectory(folderPath, 3);
    return {
      canceled: false,
      folderPath,
      folderName,
      files: scan.files
    };
  } catch (err) {
    logger.error("Error opening folder dialog", err);
    return { canceled: true, files: [] };
  }
}
async function showNativeMessageBox(window, options) {
  try {
    const dialogOptions = {
      type: options.type || "info",
      title: options.title || "Cine Media Player",
      message: options.message,
      detail: options.detail,
      buttons: options.buttons || ["OK"],
      defaultId: 0,
      cancelId: (options.buttons?.length || 1) - 1
    };
    const res = window ? await import_electron2.dialog.showMessageBox(window, dialogOptions) : await import_electron2.dialog.showMessageBox(dialogOptions);
    return res.response;
  } catch (err) {
    logger.error("Error displaying message box", err);
    return 0;
  }
}
function showNativeNotification(options) {
  try {
    if (!import_electron2.Notification.isSupported()) {
      return false;
    }
    const notification = new import_electron2.Notification({
      title: options.title,
      body: options.body,
      silent: options.silent ?? false
    });
    notification.show();
    return true;
  } catch (err) {
    logger.error("Error showing native notification", err);
    return false;
  }
}

// src/main/windows/mainWindow.ts
var import_electron4 = require("electron");
var import_path5 = __toESM(require("path"), 1);

// src/main/services/storeService.ts
var import_electron3 = require("electron");
var import_fs = __toESM(require("fs"), 1);
var import_path4 = __toESM(require("path"), 1);
var DEFAULT_STORE = {
  watchHistory: [],
  libraryFolders: [],
  alwaysOnTop: false,
  minimizeToTray: false,
  customData: {}
};
var StoreService = class {
  constructor() {
    this.storePath = "";
    this.data = DEFAULT_STORE;
    this.isLoaded = false;
    this.saveDebounceTimer = null;
    this.init();
  }
  init() {
    try {
      const userDataPath = import_electron3.app.getPath("userData");
      this.storePath = import_path4.default.join(userDataPath, "cine-player-data.json");
      this.load();
    } catch (err) {
      logger.error("Failed to resolve store path", err);
    }
  }
  load() {
    try {
      if (import_fs.default.existsSync(this.storePath)) {
        const raw = import_fs.default.readFileSync(this.storePath, "utf-8");
        const parsed = JSON.parse(raw);
        this.data = {
          ...DEFAULT_STORE,
          ...parsed,
          customData: parsed.customData || {}
        };
      } else {
        this.data = { ...DEFAULT_STORE };
        this.saveSync();
      }
      this.isLoaded = true;
      logger.info(`Store initialized from ${this.storePath}`);
    } catch (err) {
      logger.error("Failed to load store, initializing with defaults", err);
      this.data = { ...DEFAULT_STORE };
      this.isLoaded = true;
    }
  }
  saveSync() {
    try {
      const dir = import_path4.default.dirname(this.storePath);
      if (!import_fs.default.existsSync(dir)) {
        import_fs.default.mkdirSync(dir, { recursive: true });
      }
      import_fs.default.writeFileSync(this.storePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      logger.error("Failed to save store synchronously", err);
    }
  }
  scheduleSave() {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    this.saveDebounceTimer = setTimeout(async () => {
      try {
        const dir = import_path4.default.dirname(this.storePath);
        if (!import_fs.default.existsSync(dir)) {
          await import_fs.default.promises.mkdir(dir, { recursive: true });
        }
        await import_fs.default.promises.writeFile(
          this.storePath,
          JSON.stringify(this.data, null, 2),
          "utf-8"
        );
      } catch (err) {
        logger.error("Failed to save store asynchronously", err);
      }
    }, 200);
  }
  // Generic Key/Value Store
  get(key, defaultValue) {
    if (!this.isLoaded) this.load();
    if (key in this.data) {
      return this.data[key];
    }
    if (key in this.data.customData) {
      return this.data.customData[key];
    }
    return defaultValue;
  }
  set(key, value) {
    if (!this.isLoaded) this.load();
    if (["windowState", "watchHistory", "libraryFolders", "alwaysOnTop", "minimizeToTray"].includes(key)) {
      this.data[key] = value;
    } else {
      this.data.customData[key] = value;
    }
    this.scheduleSave();
  }
  delete(key) {
    if (!this.isLoaded) this.load();
    if (key in this.data.customData) {
      delete this.data.customData[key];
      this.scheduleSave();
    }
  }
  // Window State
  getWindowState() {
    return this.data.windowState;
  }
  saveWindowState(state) {
    this.data.windowState = state;
    this.scheduleSave();
  }
  // Watch History & Continue Watching
  getWatchHistory() {
    if (!this.isLoaded) this.load();
    return [...this.data.watchHistory || []].sort((a, b) => b.lastPlayed - a.lastPlayed);
  }
  saveWatchHistory(item) {
    if (!this.isLoaded) this.load();
    const history = this.data.watchHistory || [];
    const existingIndex = history.findIndex(
      (h) => h.filePath === item.filePath || item.id && h.id === item.id
    );
    const isCompleted = item.duration > 0 ? item.position / item.duration >= 0.9 : false;
    const completed = item.completed ?? isCompleted;
    const historyItem = {
      id: item.id || (existingIndex !== -1 ? history[existingIndex].id : `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
      filePath: item.filePath,
      title: item.title || import_path4.default.basename(item.filePath),
      position: Math.max(0, item.position),
      duration: Math.max(0, item.duration),
      lastPlayed: item.lastPlayed || Date.now(),
      completed,
      fileSize: item.fileSize,
      thumbnailUrl: item.thumbnailUrl
    };
    if (existingIndex !== -1) {
      history[existingIndex] = historyItem;
    } else {
      if (history.length >= 200) {
        history.pop();
      }
      history.unshift(historyItem);
    }
    this.data.watchHistory = history;
    this.scheduleSave();
    return historyItem;
  }
  clearWatchHistory() {
    this.data.watchHistory = [];
    this.scheduleSave();
  }
  deleteWatchHistoryItem(idOrPath) {
    if (!this.data.watchHistory) return;
    this.data.watchHistory = this.data.watchHistory.filter(
      (h) => h.id !== idOrPath && h.filePath !== idOrPath
    );
    this.scheduleSave();
  }
  // Media Library Folders
  getLibraryFolders() {
    if (!this.isLoaded) this.load();
    return this.data.libraryFolders || [];
  }
  addLibraryFolder(folderPath, name) {
    if (!this.isLoaded) this.load();
    const existing = (this.data.libraryFolders || []).find((f) => f.path === folderPath);
    if (existing) {
      return existing;
    }
    const newFolder = {
      id: `lib_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      path: folderPath,
      name: name || import_path4.default.basename(folderPath) || folderPath,
      addedAt: Date.now(),
      fileCount: 0,
      lastScanned: Date.now()
    };
    this.data.libraryFolders = [...this.data.libraryFolders || [], newFolder];
    this.scheduleSave();
    return newFolder;
  }
  updateLibraryFolder(folderId, updates) {
    if (!this.data.libraryFolders) return;
    this.data.libraryFolders = this.data.libraryFolders.map(
      (f) => f.id === folderId ? { ...f, ...updates } : f
    );
    this.scheduleSave();
  }
  removeLibraryFolder(folderId) {
    if (!this.data.libraryFolders) return;
    this.data.libraryFolders = this.data.libraryFolders.filter((f) => f.id !== folderId && f.path !== folderId);
    this.scheduleSave();
  }
};
var storeService = new StoreService();

// src/main/windows/mainWindow.ts
var mainWindow = null;
function getMainWindow() {
  return mainWindow;
}
function createMainWindow() {
  const savedState = storeService.getWindowState();
  const isDev2 = process.env.NODE_ENV !== "production";
  const defaultWidth = 1100;
  const defaultHeight = 720;
  mainWindow = new import_electron4.BrowserWindow({
    width: savedState?.width || defaultWidth,
    height: savedState?.height || defaultHeight,
    x: savedState?.x,
    y: savedState?.y,
    minWidth: 880,
    minHeight: 520,
    backgroundColor: "#050505",
    show: false,
    // Show when ready to prevent flicker
    frame: process.platform !== "darwin",
    // Frameless on Windows/Linux for custom sleek titlebar, or standard with titlebar overlay
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    title: "Cine Media Player",
    webPreferences: {
      preload: import_path5.default.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      // Required for custom preload protocol bridge
      webSecurity: true,
      autoplayPolicy: "no-user-gesture-required"
    }
  });
  if (savedState?.isMaximized) {
    mainWindow.maximize();
  }
  const savedAlwaysOnTop = storeService.get("alwaysOnTop", false);
  if (savedAlwaysOnTop) {
    mainWindow.setAlwaysOnTop(true, "floating");
  }
  const broadcastWindowState = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const bounds = mainWindow.getBounds();
    const state = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: mainWindow.isMaximized(),
      isFullScreen: mainWindow.isFullScreen()
    };
    storeService.saveWindowState(state);
    mainWindow.webContents.send(IPC_CHANNELS.WINDOW_STATE_CHANGED, state);
  };
  mainWindow.on("resize", broadcastWindowState);
  mainWindow.on("move", broadcastWindowState);
  mainWindow.on("maximize", broadcastWindowState);
  mainWindow.on("unmaximize", broadcastWindowState);
  mainWindow.on("enter-full-screen", broadcastWindowState);
  mainWindow.on("leave-full-screen", broadcastWindowState);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:") || url.startsWith("http:")) {
      import_electron4.shell.openExternal(url);
    }
    return { action: "deny" };
  });
  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();
      broadcastWindowState();
      logger.info("Main window shown");
    }
  });
  mainWindow.on("close", (event) => {
    const minimizeToTray = storeService.get("minimizeToTray", false);
    if (minimizeToTray && !import_electron4.app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      logger.info("Window minimized to tray");
      return false;
    }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  if (isDev2 && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (isDev2) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile(import_path5.default.join(__dirname, "../dist/index.html"));
  }
  return mainWindow;
}

// src/main/ipc/fileIpc.ts
function registerFileIpc() {
  import_electron5.ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_FILE, async (_event, options) => {
    const win = getMainWindow();
    return showOpenFileDialog(win, options);
  });
  import_electron5.ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_FOLDER, async (_event, options) => {
    const win = getMainWindow();
    return showOpenFolderDialog(win, options);
  });
  import_electron5.ipcMain.handle(IPC_CHANNELS.DIALOG_SHOW_MESSAGE, async (_event, options) => {
    const win = getMainWindow();
    return showNativeMessageBox(win, options);
  });
  import_electron5.ipcMain.handle(IPC_CHANNELS.DIALOG_SHOW_NOTIFICATION, (_event, options) => {
    return showNativeNotification(options);
  });
  import_electron5.ipcMain.handle(IPC_CHANNELS.FS_SCAN_DIRECTORY, async (_event, folderPath) => {
    return scanDirectory(folderPath, 3);
  });
  import_electron5.ipcMain.handle(IPC_CHANNELS.FS_GET_FILE_INFO, async (_event, filePath) => {
    return getFileInfo(filePath);
  });
  import_electron5.ipcMain.handle(IPC_CHANNELS.FS_GET_MEDIA_URL, (_event, filePath) => {
    return getMediaProtocolUrl(filePath);
  });
  import_electron5.ipcMain.handle(IPC_CHANNELS.FS_READ_SUBTITLE_FILE, async (_event, filePath) => {
    try {
      const content = await import_promises2.default.readFile(filePath, "utf-8");
      return content;
    } catch (err) {
      logger.error(`Failed to read subtitle file: ${filePath}`, err);
      throw err;
    }
  });
}

// src/main/ipc/powerIpc.ts
var import_electron7 = require("electron");

// src/main/services/powerService.ts
var import_electron6 = require("electron");
var PowerService = class {
  constructor() {
    this.blockerId = null;
  }
  setPlaying(isPlaying) {
    if (isPlaying) {
      if (this.blockerId === null || !import_electron6.powerSaveBlocker.isStarted(this.blockerId)) {
        this.blockerId = import_electron6.powerSaveBlocker.start("prevent-display-sleep");
        logger.info(`PowerSaveBlocker started (id: ${this.blockerId}) to keep display awake during playback`);
      }
    } else {
      if (this.blockerId !== null && import_electron6.powerSaveBlocker.isStarted(this.blockerId)) {
        import_electron6.powerSaveBlocker.stop(this.blockerId);
        logger.info(`PowerSaveBlocker stopped (id: ${this.blockerId})`);
        this.blockerId = null;
      }
    }
  }
  cleanup() {
    if (this.blockerId !== null && import_electron6.powerSaveBlocker.isStarted(this.blockerId)) {
      import_electron6.powerSaveBlocker.stop(this.blockerId);
      this.blockerId = null;
    }
  }
};
var powerService = new PowerService();

// src/main/ipc/powerIpc.ts
function registerPowerIpc() {
  import_electron7.ipcMain.handle(IPC_CHANNELS.POWER_SET_PLAYING, (_event, isPlaying) => {
    powerService.setPlaying(isPlaying);
    return true;
  });
  import_electron7.ipcMain.handle(IPC_CHANNELS.APP_GET_INFO, () => {
    return {
      name: import_electron7.app.getName(),
      version: import_electron7.app.getVersion(),
      platform: process.platform || "other",
      isPackaged: import_electron7.app.isPackaged,
      electronVersion: process.versions.electron || "",
      chromeVersion: process.versions.chrome || "",
      nodeVersion: process.versions.node || "",
      userDataPath: import_electron7.app.getPath("userData")
    };
  });
}

// src/main/ipc/storeIpc.ts
var import_electron8 = require("electron");
function registerStoreIpc() {
  import_electron8.ipcMain.handle(IPC_CHANNELS.STORE_GET, (_event, key, defaultValue) => {
    return storeService.get(key, defaultValue);
  });
  import_electron8.ipcMain.handle(IPC_CHANNELS.STORE_SET, (_event, key, value) => {
    storeService.set(key, value);
    return true;
  });
  import_electron8.ipcMain.handle(IPC_CHANNELS.STORE_DELETE, (_event, key) => {
    storeService.delete(key);
    return true;
  });
  import_electron8.ipcMain.handle(IPC_CHANNELS.STORE_GET_HISTORY, () => {
    return storeService.getWatchHistory();
  });
  import_electron8.ipcMain.handle(
    IPC_CHANNELS.STORE_SAVE_HISTORY,
    (_event, item) => {
      return storeService.saveWatchHistory(item);
    }
  );
  import_electron8.ipcMain.handle(IPC_CHANNELS.STORE_CLEAR_HISTORY, () => {
    storeService.clearWatchHistory();
    return true;
  });
  import_electron8.ipcMain.handle(IPC_CHANNELS.STORE_DELETE_HISTORY_ITEM, (_event, idOrPath) => {
    storeService.deleteWatchHistoryItem(idOrPath);
    return true;
  });
  import_electron8.ipcMain.handle(IPC_CHANNELS.STORE_GET_LIBRARY_FOLDERS, () => {
    return storeService.getLibraryFolders();
  });
  import_electron8.ipcMain.handle(
    IPC_CHANNELS.STORE_ADD_LIBRARY_FOLDER,
    (_event, folderPath, name) => {
      return storeService.addLibraryFolder(folderPath, name);
    }
  );
  import_electron8.ipcMain.handle(IPC_CHANNELS.STORE_REMOVE_LIBRARY_FOLDER, (_event, folderId) => {
    storeService.removeLibraryFolder(folderId);
    return true;
  });
}

// src/main/ipc/updateIpc.ts
var import_electron10 = require("electron");

// src/main/services/updateService.ts
var import_electron9 = require("electron");
var UpdateService = class {
  constructor() {
    this.status = { status: "not-available" };
    this.listeners = [];
    logger.info(`UpdateService initialized for ${import_electron9.app.getName()} v${import_electron9.app.getVersion()}`);
  }
  onStatusChange(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  notify(status) {
    this.status = status;
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        logger.error("Error dispatching update status to listener", err);
      }
    });
  }
  async checkForUpdates() {
    this.notify({ status: "checking" });
    logger.info("Checking for updates...");
    try {
      setTimeout(() => {
        this.notify({
          status: "not-available",
          version: import_electron9.app.getVersion()
        });
      }, 1200);
      return this.status;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.notify({ status: "error", error: errorMsg });
      return this.status;
    }
  }
  async downloadUpdate() {
    this.notify({ status: "downloading", progress: 0 });
    logger.info("Downloading update...");
  }
  async installUpdate() {
    this.notify({ status: "downloaded" });
    logger.info("Installing update and restarting...");
  }
};
var updateService = new UpdateService();

// src/main/ipc/updateIpc.ts
function registerUpdateIpc() {
  import_electron10.ipcMain.handle(IPC_CHANNELS.UPDATER_CHECK_FOR_UPDATES, async () => {
    return updateService.checkForUpdates();
  });
  import_electron10.ipcMain.handle("updater:download-update", async () => {
    return updateService.downloadUpdate();
  });
  import_electron10.ipcMain.handle(IPC_CHANNELS.UPDATER_INSTALL_UPDATE, async () => {
    return updateService.installUpdate();
  });
  updateService.onStatusChange((status) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.UPDATE_STATUS, status);
    }
  });
}

// src/main/ipc/windowIpc.ts
var import_electron11 = require("electron");
function registerWindowIpc() {
  import_electron11.ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.minimize();
    }
  });
  import_electron11.ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });
  import_electron11.ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.close();
    }
  });
  import_electron11.ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => {
    const win = getMainWindow();
    return win ? win.isMaximized() : false;
  });
  import_electron11.ipcMain.handle(IPC_CHANNELS.WINDOW_SET_ALWAYS_ON_TOP, (_event, flag) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.setAlwaysOnTop(flag, "floating");
      storeService.set("alwaysOnTop", flag);
      logger.info(`Always on top set to: ${flag}`);
      return flag;
    }
    return false;
  });
  import_electron11.ipcMain.handle(IPC_CHANNELS.WINDOW_GET_ALWAYS_ON_TOP, () => {
    const win = getMainWindow();
    return win ? win.isAlwaysOnTop() : storeService.get("alwaysOnTop", false);
  });
}

// src/main/ipc/index.ts
function registerAllIpcHandlers() {
  registerWindowIpc();
  registerFileIpc();
  registerStoreIpc();
  registerPowerIpc();
  registerUpdateIpc();
}

// src/main/menus/appMenu.ts
var import_electron12 = require("electron");
function setupAppMenu() {
  const isMac = process.platform === "darwin";
  const sendAction = (action) => {
    const win = getMainWindow() || import_electron12.BrowserWindow.getFocusedWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.MENU_ACTION, action);
    }
  };
  const watchHistory = storeService.getWatchHistory().slice(0, 8);
  const recentSubmenu = watchHistory.length > 0 ? [
    ...watchHistory.map((item) => ({
      label: item.title,
      click: () => {
        const win = getMainWindow();
        if (win) {
          win.webContents.send(IPC_CHANNELS.FILE_OPENED, item.filePath);
        }
      }
    })),
    { type: "separator" },
    {
      label: "Clear Recent History",
      click: () => {
        storeService.clearWatchHistory();
        setupAppMenu();
      }
    }
  ] : [{ label: "No Recent Videos", enabled: false }];
  const template = [
    // App Menu on macOS
    ...isMac ? [
      {
        label: import_electron12.app.name,
        submenu: [
          {
            label: `About ${import_electron12.app.name}`,
            click: () => sendAction("about")
          },
          { type: "separator" },
          {
            label: "Preferences...",
            accelerator: "CmdOrCtrl+,",
            click: () => sendAction("open-settings")
          },
          { type: "separator" },
          { role: "services" },
          { type: "separator" },
          { role: "hide" },
          { role: "hideOthers" },
          { role: "unhide" },
          { type: "separator" },
          { role: "quit" }
        ]
      }
    ] : [],
    // File Menu
    {
      label: "&File",
      submenu: [
        {
          label: "Open &Video File...",
          accelerator: "CmdOrCtrl+O",
          click: () => sendAction("open-file")
        },
        {
          label: "Open &Folder to Library...",
          accelerator: "CmdOrCtrl+Shift+O",
          click: () => sendAction("open-folder")
        },
        {
          label: "Open &Recent",
          submenu: recentSubmenu
        },
        { type: "separator" },
        {
          label: "Playlist & Queue",
          accelerator: "CmdOrCtrl+L",
          click: () => sendAction("open-playlist")
        },
        {
          label: "Bookmarks & Chapters",
          accelerator: "CmdOrCtrl+B",
          click: () => sendAction("open-bookmarks")
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" }
      ]
    },
    // Playback Menu
    {
      label: "&Playback",
      submenu: [
        {
          label: "Play / Pause",
          accelerator: "Space",
          click: () => sendAction("play-pause")
        },
        {
          label: "Previous Video",
          accelerator: "P",
          click: () => sendAction("prev")
        },
        {
          label: "Next Video",
          accelerator: "N",
          click: () => sendAction("next")
        },
        { type: "separator" },
        {
          label: "Seek Forward (10s)",
          accelerator: "Right",
          click: () => sendAction("seek-forward")
        },
        {
          label: "Seek Backward (10s)",
          accelerator: "Left",
          click: () => sendAction("seek-backward")
        },
        { type: "separator" },
        {
          label: "Volume Up",
          accelerator: "Up",
          click: () => sendAction("volume-up")
        },
        {
          label: "Volume Down",
          accelerator: "Down",
          click: () => sendAction("volume-down")
        },
        {
          label: "Mute / Unmute",
          accelerator: "M",
          click: () => sendAction("mute")
        },
        { type: "separator" },
        {
          label: "Audio Equalizer & 200% Boost",
          accelerator: "CmdOrCtrl+E",
          click: () => sendAction("open-equalizer")
        },
        {
          label: "Take Video Snapshot",
          accelerator: "CmdOrCtrl+S",
          click: () => sendAction("take-screenshot")
        }
      ]
    },
    // View Menu
    {
      label: "&View",
      submenu: [
        {
          label: "Toggle Fullscreen",
          accelerator: isMac ? "Ctrl+Cmd+F" : "F11",
          click: () => sendAction("toggle-fullscreen")
        },
        {
          label: "Picture-in-Picture",
          accelerator: "CmdOrCtrl+Shift+P",
          click: () => sendAction("toggle-pip")
        },
        {
          label: "Always on Top",
          type: "checkbox",
          checked: storeService.get("alwaysOnTop", false),
          click: (menuItem) => {
            const win = getMainWindow();
            if (win) {
              const nextState = menuItem.checked;
              win.setAlwaysOnTop(nextState, "floating");
              storeService.set("alwaysOnTop", nextState);
              sendAction("toggle-always-on-top");
            }
          }
        },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" }
      ]
    },
    // Settings Menu
    {
      label: "&Settings",
      submenu: [
        {
          label: "Player Preferences...",
          accelerator: "CmdOrCtrl+,",
          click: () => sendAction("open-settings")
        },
        {
          label: "Keyboard Shortcuts Reference",
          accelerator: "CmdOrCtrl+/",
          click: () => sendAction("open-shortcuts")
        }
      ]
    },
    // Help Menu
    {
      label: "&Help",
      submenu: [
        {
          label: "Keyboard Hotkeys Guide",
          click: () => sendAction("open-shortcuts")
        },
        { type: "separator" },
        {
          label: "About Cine Media Player",
          click: () => sendAction("about")
        }
      ]
    }
  ];
  const menu = import_electron12.Menu.buildFromTemplate(template);
  import_electron12.Menu.setApplicationMenu(menu);
  return menu;
}

// src/main/menus/trayMenu.ts
var import_electron13 = require("electron");
var import_path6 = __toESM(require("path"), 1);
var tray = null;
function setupSystemTray() {
  try {
    const iconPath = import_path6.default.join(__dirname, "../public/favicon.ico");
    let trayIcon;
    try {
      trayIcon = import_electron13.nativeImage.createFromPath(iconPath);
      if (trayIcon.isEmpty()) {
        trayIcon = import_electron13.nativeImage.createEmpty();
      }
    } catch {
      trayIcon = import_electron13.nativeImage.createEmpty();
    }
    tray = new import_electron13.Tray(trayIcon);
    tray.setToolTip("Cine Media Player");
    const sendAction = (action) => {
      const win = getMainWindow();
      if (win && !win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.MENU_ACTION, action);
      }
    };
    const updateContextMenu = () => {
      if (!tray) return;
      const win = getMainWindow();
      const isVisible = win ? win.isVisible() : false;
      const isAlwaysOnTop = storeService.get("alwaysOnTop", false);
      const contextMenu = import_electron13.Menu.buildFromTemplate([
        {
          label: "Cine Media Player",
          enabled: false
        },
        { type: "separator" },
        {
          label: "\u25B6 Play / \u23F8 Pause",
          click: () => sendAction("play-pause")
        },
        {
          label: "\u23ED Next Track",
          click: () => sendAction("next")
        },
        {
          label: "\u23EE Previous Track",
          click: () => sendAction("prev")
        },
        { type: "separator" },
        {
          label: isVisible ? "Hide Player" : "Show Player",
          click: () => {
            if (win) {
              if (isVisible) {
                win.hide();
              } else {
                win.show();
                win.focus();
              }
              updateContextMenu();
            }
          }
        },
        {
          label: "Always on Top",
          type: "checkbox",
          checked: isAlwaysOnTop,
          click: (item) => {
            if (win) {
              win.setAlwaysOnTop(item.checked, "floating");
              storeService.set("alwaysOnTop", item.checked);
              sendAction("toggle-always-on-top");
            }
          }
        },
        { type: "separator" },
        {
          label: "Quit",
          click: () => {
            import_electron13.app.isQuitting = true;
            import_electron13.app.quit();
          }
        }
      ]);
      tray.setContextMenu(contextMenu);
    };
    tray.on("double-click", () => {
      const win = getMainWindow();
      if (win) {
        if (win.isVisible()) {
          win.focus();
        } else {
          win.show();
          win.focus();
        }
      }
    });
    updateContextMenu();
    logger.info("System tray initialized");
    return tray;
  } catch (err) {
    logger.error("Failed to setup system tray", err);
    return null;
  }
}
function destroySystemTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

// src/main/main.ts
registerMediaPrivilegedScheme();
var gotSingleInstanceLock = import_electron14.app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  logger.warn("Another instance is already running. Exiting...");
  import_electron14.app.quit();
} else {
  let fileToOpenOnStartup = null;
  import_electron14.app.on("open-file", (event, filePath) => {
    event.preventDefault();
    logger.info(`Received open-file event for: ${filePath}`);
    const win = getMainWindow();
    if (win && win.webContents) {
      win.webContents.send(IPC_CHANNELS.FILE_OPENED, filePath);
    } else {
      fileToOpenOnStartup = filePath;
    }
  });
  import_electron14.app.on("second-instance", (_event, commandLine) => {
    logger.info("Second instance launched with commandLine:", commandLine);
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      if (!win.isVisible()) win.show();
      win.focus();
      const lastArg = commandLine[commandLine.length - 1];
      if (lastArg && !lastArg.startsWith("--") && !lastArg.startsWith("-")) {
        const ext = import_path7.default.extname(lastArg).toLowerCase();
        if ([".mp4", ".mkv", ".webm", ".mov", ".avi", ".m4v", ".ts"].includes(ext)) {
          win.webContents.send(IPC_CHANNELS.FILE_OPENED, lastArg);
        }
      }
    }
  });
  import_electron14.app.whenReady().then(async () => {
    logger.info(`Starting Cine Media Player on ${process.platform}...`);
    setupMediaProtocolHandler();
    registerAllIpcHandlers();
    setupAppMenu();
    setupSystemTray();
    const mainWindow2 = createMainWindow();
    try {
      const sendAction = (action) => {
        const win = getMainWindow();
        if (win && !win.isDestroyed()) {
          win.webContents.send(IPC_CHANNELS.MENU_ACTION, action);
        }
      };
      import_electron14.globalShortcut.register("MediaPlayPause", () => sendAction("play-pause"));
      import_electron14.globalShortcut.register("MediaNextTrack", () => sendAction("next"));
      import_electron14.globalShortcut.register("MediaPreviousTrack", () => sendAction("prev"));
      import_electron14.globalShortcut.register("MediaStop", () => sendAction("stop"));
    } catch {
    }
    mainWindow2.webContents.once("did-finish-load", () => {
      const cliArgs = process.argv.slice(1);
      const videoArg = cliArgs.find((arg) => {
        const ext = import_path7.default.extname(arg).toLowerCase();
        return [".mp4", ".mkv", ".webm", ".mov", ".avi", ".m4v", ".ts"].includes(ext);
      });
      const targetPath = fileToOpenOnStartup || videoArg;
      if (targetPath) {
        logger.info(`Opening startup file: ${targetPath}`);
        mainWindow2.webContents.send(IPC_CHANNELS.FILE_OPENED, targetPath);
        fileToOpenOnStartup = null;
      }
    });
    import_electron14.app.on("activate", () => {
      if (import_electron14.BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });
  import_electron14.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      import_electron14.app.quit();
    }
  });
  import_electron14.app.on("before-quit", () => {
    import_electron14.app.isQuitting = true;
    import_electron14.globalShortcut.unregisterAll();
    powerService.cleanup();
    destroySystemTray();
    logger.info("Application quitting cleanly.");
  });
}
