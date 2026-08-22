import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { WatchHistoryItem } from '../../shared/types';
import { storeService } from '../services/storeService';

export function registerStoreIpc(): void {
  ipcMain.handle(IPC_CHANNELS.STORE_GET, (_event, key: string, defaultValue?: unknown) => {
    return storeService.get(key, defaultValue);
  });

  ipcMain.handle(IPC_CHANNELS.STORE_SET, (_event, key: string, value: unknown) => {
    storeService.set(key, value);
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.STORE_DELETE, (_event, key: string) => {
    storeService.delete(key);
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.STORE_GET_HISTORY, () => {
    return storeService.getWatchHistory();
  });

  ipcMain.handle(
    IPC_CHANNELS.STORE_SAVE_HISTORY,
    (_event, item: Omit<WatchHistoryItem, 'id'> & { id?: string }) => {
      return storeService.saveWatchHistory(item);
    }
  );

  ipcMain.handle(IPC_CHANNELS.STORE_CLEAR_HISTORY, () => {
    storeService.clearWatchHistory();
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.STORE_DELETE_HISTORY_ITEM, (_event, idOrPath: string) => {
    storeService.deleteWatchHistoryItem(idOrPath);
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.STORE_GET_LIBRARY_FOLDERS, () => {
    return storeService.getLibraryFolders();
  });

  ipcMain.handle(
    IPC_CHANNELS.STORE_ADD_LIBRARY_FOLDER,
    (_event, folderPath: string, name?: string) => {
      return storeService.addLibraryFolder(folderPath, name);
    }
  );

  ipcMain.handle(IPC_CHANNELS.STORE_REMOVE_LIBRARY_FOLDER, (_event, folderId: string) => {
    storeService.removeLibraryFolder(folderId);
    return true;
  });
}
