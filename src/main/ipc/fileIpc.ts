import { ipcMain } from 'electron';
import fs from 'fs/promises';
import { IPC_CHANNELS } from '../../shared/constants';
import { NativeNotificationOptions } from '../../shared/types';
import {
  showNativeMessageBox,
  showNativeNotification,
  showOpenFileDialog,
  showOpenFolderDialog
} from '../dialogs/nativeDialogs';
import { getFileInfo, getMediaProtocolUrl, scanDirectory } from '../fileSystem/scanner';
import { logger } from '../services/logger';
import { getMainWindow } from '../windows/mainWindow';

export function registerFileIpc(): void {
  // Native Open File Dialog
  ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_FILE, async (_event, options) => {
    const win = getMainWindow();
    return showOpenFileDialog(win, options);
  });

  // Native Open Folder Dialog
  ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_FOLDER, async (_event, options) => {
    const win = getMainWindow();
    return showOpenFolderDialog(win, options);
  });

  // Native Message Box
  ipcMain.handle(IPC_CHANNELS.DIALOG_SHOW_MESSAGE, async (_event, options) => {
    const win = getMainWindow();
    return showNativeMessageBox(win, options);
  });

  // Native Notification
  ipcMain.handle(IPC_CHANNELS.DIALOG_SHOW_NOTIFICATION, (_event, options: NativeNotificationOptions) => {
    return showNativeNotification(options);
  });

  // Filesystem Scan Directory
  ipcMain.handle(IPC_CHANNELS.FS_SCAN_DIRECTORY, async (_event, folderPath: string) => {
    return scanDirectory(folderPath, 3);
  });

  // Get File Info
  ipcMain.handle(IPC_CHANNELS.FS_GET_FILE_INFO, async (_event, filePath: string) => {
    return getFileInfo(filePath);
  });

  // Convert File Path to Media Protocol URL
  ipcMain.handle(IPC_CHANNELS.FS_GET_MEDIA_URL, (_event, filePath: string) => {
    return getMediaProtocolUrl(filePath);
  });

  // Read External Subtitle File safely
  ipcMain.handle(IPC_CHANNELS.FS_READ_SUBTITLE_FILE, async (_event, filePath: string) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (err) {
      logger.error(`Failed to read subtitle file: ${filePath}`, err);
      throw err;
    }
  });
}
