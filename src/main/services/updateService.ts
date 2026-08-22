import { app } from 'electron';
import { UpdateStatus } from '../../shared/types';
import { logger } from './logger';

export class UpdateService {
  private status: UpdateStatus = { status: 'not-available' };
  private listeners: ((status: UpdateStatus) => void)[] = [];

  constructor() {
    logger.info(`UpdateService initialized for ${app.getName()} v${app.getVersion()}`);
  }

  public onStatusChange(listener: (status: UpdateStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(status: UpdateStatus) {
    this.status = status;
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        logger.error('Error dispatching update status to listener', err);
      }
    });
  }

  public async checkForUpdates(): Promise<UpdateStatus> {
    this.notify({ status: 'checking' });
    logger.info('Checking for updates...');

    // Desktop auto-update simulation / provider abstraction
    // In production with GitHub Releases/S3, electron-updater connects here
    try {
      // Simulate check response gracefully
      setTimeout(() => {
        this.notify({
          status: 'not-available',
          version: app.getVersion()
        });
      }, 1200);
      return this.status;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.notify({ status: 'error', error: errorMsg });
      return this.status;
    }
  }

  public async downloadUpdate(): Promise<void> {
    this.notify({ status: 'downloading', progress: 0 });
    logger.info('Downloading update...');
  }

  public async installUpdate(): Promise<void> {
    this.notify({ status: 'downloaded' });
    logger.info('Installing update and restarting...');
  }
}

export const updateService = new UpdateService();
