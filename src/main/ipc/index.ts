import { registerFileIpc } from './fileIpc';
import { registerPowerIpc } from './powerIpc';
import { registerStoreIpc } from './storeIpc';
import { registerUpdateIpc } from './updateIpc';
import { registerWindowIpc } from './windowIpc';

export function registerAllIpcHandlers(): void {
  registerWindowIpc();
  registerFileIpc();
  registerStoreIpc();
  registerPowerIpc();
  registerUpdateIpc();
}
