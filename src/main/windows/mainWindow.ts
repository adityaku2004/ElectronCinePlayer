import { BrowserWindow, app, shell } from 'electron';
import path from 'path';
import { IPC_CHANNELS } from '../../shared/constants';
import { WindowState } from '../../shared/types';
import { logger } from '../services/logger';
import { storeService } from '../services/storeService';

let mainWindow: BrowserWindow | null = null;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function createMainWindow(): BrowserWindow {
  const savedState = storeService.getWindowState();
  const isDev = process.env.NODE_ENV !== 'production';

  const defaultWidth = 1100;
  const defaultHeight = 720;

  mainWindow = new BrowserWindow({
    width: savedState?.width || defaultWidth,
    height: savedState?.height || defaultHeight,
    x: savedState?.x,
    y: savedState?.y,
    minWidth: 880,
    minHeight: 520,
    backgroundColor: '#050505',
    show: false, // Show when ready to prevent flicker
    frame: process.platform !== 'darwin', // Frameless on Windows/Linux for custom sleek titlebar, or standard with titlebar overlay
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    title: 'Cine Media Player',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Required for custom preload protocol bridge
      webSecurity: true,
      autoplayPolicy: 'no-user-gesture-required'
    }
  });

  // Restore maximized state if saved
  if (savedState?.isMaximized) {
    mainWindow.maximize();
  }

  // Restore always on top state
  const savedAlwaysOnTop = storeService.get<boolean>('alwaysOnTop', false);
  if (savedAlwaysOnTop) {
    mainWindow.setAlwaysOnTop(true, 'floating');
  }

  // Notify renderer of current window state
  const broadcastWindowState = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const bounds = mainWindow.getBounds();
    const state: WindowState = {
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

  mainWindow.on('resize', broadcastWindowState);
  mainWindow.on('move', broadcastWindowState);
  mainWindow.on('maximize', broadcastWindowState);
  mainWindow.on('unmaximize', broadcastWindowState);
  mainWindow.on('enter-full-screen', broadcastWindowState);
  mainWindow.on('leave-full-screen', broadcastWindowState);

  // Prevent external link navigation in the same window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Show gracefully when DOM is rendered
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      broadcastWindowState();
      logger.info('Main window shown');
    }
  });

  // Handle Close behavior (check if minimize to tray is enabled)
  mainWindow.on('close', (event) => {
    const minimizeToTray = storeService.get<boolean>('minimizeToTray', false);
    // If not quitting app and minimizeToTray is on, hide instead of close
    if (minimizeToTray && !(app as unknown as { isQuitting?: boolean }).isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      logger.info('Window minimized to tray');
      return false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Load URL: in dev, load Vite dev server; in production, load index.html from dist
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return mainWindow;
}
