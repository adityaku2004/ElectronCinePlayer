import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { updateService } from '../services/updateService';
import { getMainWindow } from '../windows/mainWindow';

export function registerUpdateIpc(): void {
  ipcMain.handle(IPC_CHANNELS.UPDATER_CHECK_FOR_UPDATES, async () => {
    return updateService.checkForUpdates();
  });

  ipcMain.handle('updater:download-update', async () => {
    return updateService.downloadUpdate();
  });

  ipcMain.handle(IPC_CHANNELS.UPDATER_INSTALL_UPDATE, async () => {
    return updateService.installUpdate();
  });

  updateService.onStatusChange((status) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.UPDATE_STATUS, status);
    }
  });
}
