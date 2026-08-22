import { ElectronAPI } from '../preload/types';

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
