import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { logger } from '../services/logger';
import { storeService } from '../services/storeService';
import { getMainWindow } from '../windows/mainWindow';

export function registerWindowIpc(): void {
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.minimize();
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.close();
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => {
    const win = getMainWindow();
    return win ? win.isMaximized() : false;
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_SET_ALWAYS_ON_TOP, (_event, flag: boolean) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.setAlwaysOnTop(flag, 'floating');
      storeService.set('alwaysOnTop', flag);
      logger.info(`Always on top set to: ${flag}`);
      return flag;
    }
    return false;
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_GET_ALWAYS_ON_TOP, () => {
    const win = getMainWindow();
    return win ? win.isAlwaysOnTop() : storeService.get<boolean>('alwaysOnTop', false);
  });
}
