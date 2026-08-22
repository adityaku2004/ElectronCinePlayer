import { app, ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { AppInfo } from '../../shared/types';
import { powerService } from '../services/powerService';

export function registerPowerIpc(): void {
  ipcMain.handle(IPC_CHANNELS.POWER_SET_PLAYING, (_event, isPlaying: boolean) => {
    powerService.setPlaying(isPlaying);
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.APP_GET_INFO, (): AppInfo => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: (process.platform as 'win32' | 'darwin' | 'linux') || 'other',
      isPackaged: app.isPackaged,
      electronVersion: process.versions.electron || '',
      chromeVersion: process.versions.chrome || '',
      nodeVersion: process.versions.node || '',
      userDataPath: app.getPath('userData')
    };
  });
}
