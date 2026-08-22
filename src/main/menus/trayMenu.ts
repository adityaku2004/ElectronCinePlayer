import { app, Menu, nativeImage, NativeImage, Tray } from 'electron';
import path from 'path';
import { IPC_CHANNELS } from '../../shared/constants';
import { MenuAction } from '../../shared/types';
import { logger } from '../services/logger';
import { storeService } from '../services/storeService';
import { getMainWindow } from '../windows/mainWindow';

let tray: Tray | null = null;

export function setupSystemTray(): Tray | null {
  try {
    // Generate a clean native icon representation for the tray
    // 16x16 or 24x24 icon
    const iconPath = path.join(__dirname, '../public/favicon.ico');
    let trayIcon: NativeImage;

    try {
      trayIcon = nativeImage.createFromPath(iconPath);
      if (trayIcon.isEmpty()) {
        trayIcon = nativeImage.createEmpty();
      }
    } catch {
      trayIcon = nativeImage.createEmpty();
    }

    tray = new Tray(trayIcon);
    tray.setToolTip('Cine Media Player');

    const sendAction = (action: MenuAction) => {
      const win = getMainWindow();
      if (win && !win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.MENU_ACTION, action);
      }
    };

    const updateContextMenu = () => {
      if (!tray) return;
      const win = getMainWindow();
      const isVisible = win ? win.isVisible() : false;
      const isAlwaysOnTop = storeService.get<boolean>('alwaysOnTop', false);

      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Cine Media Player',
          enabled: false
        },
        { type: 'separator' },
        {
          label: '▶ Play / ⏸ Pause',
          click: () => sendAction('play-pause')
        },
        {
          label: '⏭ Next Track',
          click: () => sendAction('next')
        },
        {
          label: '⏮ Previous Track',
          click: () => sendAction('prev')
        },
        { type: 'separator' },
        {
          label: isVisible ? 'Hide Player' : 'Show Player',
          click: () => {
            if (win) {
              if (isVisible) {
                win.hide();
              } else {
                win.show();
                win.focus();
              }
              updateContextMenu();
            }
          }
        },
        {
          label: 'Always on Top',
          type: 'checkbox',
          checked: isAlwaysOnTop,
          click: (item) => {
            if (win) {
              win.setAlwaysOnTop(item.checked, 'floating');
              storeService.set('alwaysOnTop', item.checked);
              sendAction('toggle-always-on-top');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          click: () => {
            (app as unknown as { isQuitting?: boolean }).isQuitting = true;
            app.quit();
          }
        }
      ]);

      tray.setContextMenu(contextMenu);
    };

    tray.on('double-click', () => {
      const win = getMainWindow();
      if (win) {
        if (win.isVisible()) {
          win.focus();
        } else {
          win.show();
          win.focus();
        }
      }
    });

    updateContextMenu();
    logger.info('System tray initialized');
    return tray;
  } catch (err) {
    logger.error('Failed to setup system tray', err);
    return null;
  }
}

export function destroySystemTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
