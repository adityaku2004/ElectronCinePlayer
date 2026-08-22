import { BrowserWindow, dialog, Notification } from 'electron';
import path from 'path';
import {
  ALL_SUPPORTED_MEDIA_EXTENSIONS,
  SUPPORTED_SUBTITLE_EXTENSIONS,
  SUPPORTED_VIDEO_EXTENSIONS
} from '../../shared/constants';
import {
  MediaFileInfo,
  NativeNotificationOptions,
  OpenFileDialogResult,
  OpenFolderDialogResult
} from '../../shared/types';
import { getFileInfo, scanDirectory } from '../fileSystem/scanner';
import { logger } from '../services/logger';

export async function showOpenFileDialog(
  window: BrowserWindow | null,
  options?: { multiSelections?: boolean; defaultPath?: string }
): Promise<OpenFileDialogResult> {
  try {
    const dialogOptions: Electron.OpenDialogOptions = {
      title: 'Open Video or Media File',
      defaultPath: options?.defaultPath,
      properties: ['openFile'],
      filters: [
        {
          name: 'All Supported Media & Subtitles',
          extensions: ALL_SUPPORTED_MEDIA_EXTENSIONS
        },
        {
          name: 'Video Files (*.mp4, *.mkv, *.webm, *.mov, *.avi, *.m4v, *.ts)',
          extensions: SUPPORTED_VIDEO_EXTENSIONS
        },
        {
          name: 'Subtitle Files (*.srt, *.vtt, *.ass, *.ssa, *.sub)',
          extensions: SUPPORTED_SUBTITLE_EXTENSIONS
        },
        {
          name: 'All Files (*.*)',
          extensions: ['*']
        }
      ]
    };

    if (options?.multiSelections !== false) {
      dialogOptions.properties?.push('multiSelections');
    }

    const result = window
      ? await dialog.showOpenDialog(window, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions);

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true, filePaths: [], files: [] };
    }

    const files: MediaFileInfo[] = [];
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
    logger.error('Error opening file dialog', err);
    return { canceled: true, filePaths: [], files: [] };
  }
}

export async function showOpenFolderDialog(
  window: BrowserWindow | null,
  options?: { defaultPath?: string }
): Promise<OpenFolderDialogResult> {
  try {
    const dialogOptions: Electron.OpenDialogOptions = {
      title: 'Select Media Folder to Add to Library',
      defaultPath: options?.defaultPath,
      properties: ['openDirectory', 'createDirectory']
    };

    const result = window
      ? await dialog.showOpenDialog(window, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions);

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true, files: [] };
    }

    const folderPath = result.filePaths[0];
    const folderName = path.basename(folderPath);

    logger.info(`Folder selected: ${folderPath}, scanning media contents...`);
    const scan = await scanDirectory(folderPath, 3);

    return {
      canceled: false,
      folderPath,
      folderName,
      files: scan.files
    };
  } catch (err) {
    logger.error('Error opening folder dialog', err);
    return { canceled: true, files: [] };
  }
}

export async function showNativeMessageBox(
  window: BrowserWindow | null,
  options: {
    type?: 'info' | 'error' | 'warning' | 'question';
    title?: string;
    message: string;
    detail?: string;
    buttons?: string[];
  }
): Promise<number> {
  try {
    const dialogOptions: Electron.MessageBoxOptions = {
      type: options.type || 'info',
      title: options.title || 'Cine Media Player',
      message: options.message,
      detail: options.detail,
      buttons: options.buttons || ['OK'],
      defaultId: 0,
      cancelId: (options.buttons?.length || 1) - 1
    };

    const res = window
      ? await dialog.showMessageBox(window, dialogOptions)
      : await dialog.showMessageBox(dialogOptions);

    return res.response;
  } catch (err) {
    logger.error('Error displaying message box', err);
    return 0;
  }
}

export function showNativeNotification(options: NativeNotificationOptions): boolean {
  try {
    if (!Notification.isSupported()) {
      return false;
    }

    const notification = new Notification({
      title: options.title,
      body: options.body,
      silent: options.silent ?? false
    });

    notification.show();
    return true;
  } catch (err) {
    logger.error('Error showing native notification', err);
    return false;
  }
}
