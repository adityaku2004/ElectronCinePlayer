import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { LibraryFolder, WatchHistoryItem, WindowState } from '../../shared/types';
import { logger } from './logger';

interface AppStoreSchema {
  windowState?: WindowState;
  watchHistory: WatchHistoryItem[];
  libraryFolders: LibraryFolder[];
  alwaysOnTop?: boolean;
  minimizeToTray?: boolean;
  customData: Record<string, unknown>;
}

const DEFAULT_STORE: AppStoreSchema = {
  watchHistory: [],
  libraryFolders: [],
  alwaysOnTop: false,
  minimizeToTray: false,
  customData: {}
};

export class StoreService {
  private storePath: string = '';
  private data: AppStoreSchema = DEFAULT_STORE;
  private isLoaded: boolean = false;
  private saveDebounceTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const userDataPath = app.getPath('userData');
      this.storePath = path.join(userDataPath, 'cine-player-data.json');
      this.load();
    } catch (err) {
      logger.error('Failed to resolve store path', err);
    }
  }

  private load() {
    try {
      if (fs.existsSync(this.storePath)) {
        const raw = fs.readFileSync(this.storePath, 'utf-8');
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
      logger.error('Failed to load store, initializing with defaults', err);
      this.data = { ...DEFAULT_STORE };
      this.isLoaded = true;
    }
  }

  private saveSync() {
    try {
      const dir = path.dirname(this.storePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.storePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      logger.error('Failed to save store synchronously', err);
    }
  }

  private scheduleSave() {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    this.saveDebounceTimer = setTimeout(async () => {
      try {
        const dir = path.dirname(this.storePath);
        if (!fs.existsSync(dir)) {
          await fs.promises.mkdir(dir, { recursive: true });
        }
        await fs.promises.writeFile(
          this.storePath,
          JSON.stringify(this.data, null, 2),
          'utf-8'
        );
      } catch (err) {
        logger.error('Failed to save store asynchronously', err);
      }
    }, 200);
  }

  // Generic Key/Value Store
  public get<T = unknown>(key: string, defaultValue?: T): T {
    if (!this.isLoaded) this.load();
    if (key in this.data) {
      return (this.data as unknown as Record<string, unknown>)[key] as T;
    }
    if (key in this.data.customData) {
      return this.data.customData[key] as T;
    }
    return defaultValue as T;
  }

  public set<T = unknown>(key: string, value: T): void {
    if (!this.isLoaded) this.load();
    if (['windowState', 'watchHistory', 'libraryFolders', 'alwaysOnTop', 'minimizeToTray'].includes(key)) {
      (this.data as unknown as Record<string, unknown>)[key] = value;
    } else {
      this.data.customData[key] = value;
    }
    this.scheduleSave();
  }

  public delete(key: string): void {
    if (!this.isLoaded) this.load();
    if (key in this.data.customData) {
      delete this.data.customData[key];
      this.scheduleSave();
    }
  }

  // Window State
  public getWindowState(): WindowState | undefined {
    return this.data.windowState;
  }

  public saveWindowState(state: WindowState): void {
    this.data.windowState = state;
    this.scheduleSave();
  }

  // Watch History & Continue Watching
  public getWatchHistory(): WatchHistoryItem[] {
    if (!this.isLoaded) this.load();
    return [...(this.data.watchHistory || [])].sort((a, b) => b.lastPlayed - a.lastPlayed);
  }

  public saveWatchHistory(item: Omit<WatchHistoryItem, 'id'> & { id?: string }): WatchHistoryItem {
    if (!this.isLoaded) this.load();

    const history = this.data.watchHistory || [];
    const existingIndex = history.findIndex(
      (h) => h.filePath === item.filePath || (item.id && h.id === item.id)
    );

    // Auto mark as completed if >= 90% played
    const isCompleted = item.duration > 0 ? (item.position / item.duration) >= 0.9 : false;
    const completed = item.completed ?? isCompleted;

    const historyItem: WatchHistoryItem = {
      id: item.id || (existingIndex !== -1 ? history[existingIndex].id : `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
      filePath: item.filePath,
      title: item.title || path.basename(item.filePath),
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
      // Limit watch history to 200 items
      if (history.length >= 200) {
        history.pop();
      }
      history.unshift(historyItem);
    }

    this.data.watchHistory = history;
    this.scheduleSave();
    return historyItem;
  }

  public clearWatchHistory(): void {
    this.data.watchHistory = [];
    this.scheduleSave();
  }

  public deleteWatchHistoryItem(idOrPath: string): void {
    if (!this.data.watchHistory) return;
    this.data.watchHistory = this.data.watchHistory.filter(
      (h) => h.id !== idOrPath && h.filePath !== idOrPath
    );
    this.scheduleSave();
  }

  // Media Library Folders
  public getLibraryFolders(): LibraryFolder[] {
    if (!this.isLoaded) this.load();
    return this.data.libraryFolders || [];
  }

  public addLibraryFolder(folderPath: string, name?: string): LibraryFolder {
    if (!this.isLoaded) this.load();
    const existing = (this.data.libraryFolders || []).find((f) => f.path === folderPath);
    if (existing) {
      return existing;
    }

    const newFolder: LibraryFolder = {
      id: `lib_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      path: folderPath,
      name: name || path.basename(folderPath) || folderPath,
      addedAt: Date.now(),
      fileCount: 0,
      lastScanned: Date.now()
    };

    this.data.libraryFolders = [...(this.data.libraryFolders || []), newFolder];
    this.scheduleSave();
    return newFolder;
  }

  public updateLibraryFolder(folderId: string, updates: Partial<LibraryFolder>): void {
    if (!this.data.libraryFolders) return;
    this.data.libraryFolders = this.data.libraryFolders.map((f) =>
      f.id === folderId ? { ...f, ...updates } : f
    );
    this.scheduleSave();
  }

  public removeLibraryFolder(folderId: string): void {
    if (!this.data.libraryFolders) return;
    this.data.libraryFolders = this.data.libraryFolders.filter((f) => f.id !== folderId && f.path !== folderId);
    this.scheduleSave();
  }
}

export const storeService = new StoreService();
