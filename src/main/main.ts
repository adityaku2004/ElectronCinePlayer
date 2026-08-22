import { app, BrowserWindow, globalShortcut } from 'electron';
import path from 'path';
import { IPC_CHANNELS } from '../shared/constants';
import { MenuAction } from '../shared/types';
import { registerMediaPrivilegedScheme, setupMediaProtocolHandler } from './fileSystem/mediaProtocol';
import { registerAllIpcHandlers } from './ipc';
import { setupAppMenu } from './menus/appMenu';
import { destroySystemTray, setupSystemTray } from './menus/trayMenu';
import { logger } from './services/logger';
import { powerService } from './services/powerService';
import { createMainWindow, getMainWindow } from './windows/mainWindow';

// Step 1: Register custom privileged scheme before app ready
registerMediaPrivilegedScheme();

// Step 2: Enforce Single Instance Lock
const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  logger.warn('Another instance is already running. Exiting...');
  app.quit();
} else {
  // Store file path if launched with a file argument on macOS
  let fileToOpenOnStartup: string | null = null;

  // Handle file association on macOS (open-file event)
  app.on('open-file', (event, filePath) => {
    event.preventDefault();
    logger.info(`Received open-file event for: ${filePath}`);
    const win = getMainWindow();
    if (win && win.webContents) {
      win.webContents.send(IPC_CHANNELS.FILE_OPENED, filePath);
    } else {
      fileToOpenOnStartup = filePath;
    }
  });

  // Handle second instance launch (e.g. user double-clicks video in file explorer while player is open)
  app.on('second-instance', (_event, commandLine) => {
    logger.info('Second instance launched with commandLine:', commandLine);
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      if (!win.isVisible()) win.show();
      win.focus();

      // Find possible video file path in CLI arguments
      const lastArg = commandLine[commandLine.length - 1];
      if (lastArg && !lastArg.startsWith('--') && !lastArg.startsWith('-')) {
        const ext = path.extname(lastArg).toLowerCase();
        if (['.mp4', '.mkv', '.webm', '.mov', '.avi', '.m4v', '.ts'].includes(ext)) {
          win.webContents.send(IPC_CHANNELS.FILE_OPENED, lastArg);
        }
      }
    }
  });

  // Step 3: Application Initialization
  app.whenReady().then(async () => {
    logger.info(`Starting Cine Media Player on ${process.platform}...`);

    // Setup Custom Media Protocol for high-perf byte-range streaming
    setupMediaProtocolHandler();

    // Register all IPC listeners
    registerAllIpcHandlers();

    // Setup Native Menu and System Tray
    setupAppMenu();
    setupSystemTray();

    // Create Main Window
    const mainWindow = createMainWindow();

    // Register safe global media keys if available
    try {
      const sendAction = (action: MenuAction) => {
        const win = getMainWindow();
        if (win && !win.isDestroyed()) {
          win.webContents.send(IPC_CHANNELS.MENU_ACTION, action);
        }
      };

      globalShortcut.register('MediaPlayPause', () => sendAction('play-pause'));
      globalShortcut.register('MediaNextTrack', () => sendAction('next'));
      globalShortcut.register('MediaPreviousTrack', () => sendAction('prev'));
      globalShortcut.register('MediaStop', () => sendAction('stop'));
    } catch {
      // Non-critical if media keys are unavailable
    }

    // If a file was opened during cold startup
    mainWindow.webContents.once('did-finish-load', () => {
      // Check command line arguments for video file on Windows/Linux
      const cliArgs = process.argv.slice(1);
      const videoArg = cliArgs.find((arg) => {
        const ext = path.extname(arg).toLowerCase();
        return ['.mp4', '.mkv', '.webm', '.mov', '.avi', '.m4v', '.ts'].includes(ext);
      });

      const targetPath = fileToOpenOnStartup || videoArg;
      if (targetPath) {
        logger.info(`Opening startup file: ${targetPath}`);
        mainWindow.webContents.send(IPC_CHANNELS.FILE_OPENED, targetPath);
        fileToOpenOnStartup = null;
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });

  // Step 4: Application Lifecycle
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    (app as unknown as { isQuitting?: boolean }).isQuitting = true;
    globalShortcut.unregisterAll();
    powerService.cleanup();
    destroySystemTray();
    logger.info('Application quitting cleanly.');
  });
}
