import { powerSaveBlocker } from 'electron';
import { logger } from './logger';

export class PowerService {
  private blockerId: number | null = null;

  public setPlaying(isPlaying: boolean): void {
    if (isPlaying) {
      if (this.blockerId === null || !powerSaveBlocker.isStarted(this.blockerId)) {
        this.blockerId = powerSaveBlocker.start('prevent-display-sleep');
        logger.info(`PowerSaveBlocker started (id: ${this.blockerId}) to keep display awake during playback`);
      }
    } else {
      if (this.blockerId !== null && powerSaveBlocker.isStarted(this.blockerId)) {
        powerSaveBlocker.stop(this.blockerId);
        logger.info(`PowerSaveBlocker stopped (id: ${this.blockerId})`);
        this.blockerId = null;
      }
    }
  }

  public cleanup(): void {
    if (this.blockerId !== null && powerSaveBlocker.isStarted(this.blockerId)) {
      powerSaveBlocker.stop(this.blockerId);
      this.blockerId = null;
    }
  }
}

export const powerService = new PowerService();
