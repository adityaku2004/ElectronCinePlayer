import { Menu, MenuItemConstructorOptions, app, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { MenuAction } from '../../shared/types';
import { storeService } from '../services/storeService';
import { getMainWindow } from '../windows/mainWindow';

export function setupAppMenu(): Menu {
  const isMac = process.platform === 'darwin';

  const sendAction = (action: MenuAction) => {
    const win = getMainWindow() || BrowserWindow.getFocusedWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.MENU_ACTION, action);
    }
  };

  // Build Recent files submenu dynamically from store
  const watchHistory = storeService.getWatchHistory().slice(0, 8);
  const recentSubmenu: MenuItemConstructorOptions[] = watchHistory.length > 0
    ? [
        ...watchHistory.map((item) => ({
          label: item.title,
          click: () => {
            const win = getMainWindow();
            if (win) {
              win.webContents.send(IPC_CHANNELS.FILE_OPENED, item.filePath);
            }
          }
        })),
        { type: 'separator' },
        {
          label: 'Clear Recent History',
          click: () => {
            storeService.clearWatchHistory();
            setupAppMenu(); // Refresh menu
          }
        }
      ]
    : [{ label: 'No Recent Videos', enabled: false }];

  const template: MenuItemConstructorOptions[] = [
    // App Menu on macOS
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              {
                label: `About ${app.name}`,
                click: () => sendAction('about')
              },
              { type: 'separator' },
              {
                label: 'Preferences...',
                accelerator: 'CmdOrCtrl+,',
                click: () => sendAction('open-settings')
              },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          } as MenuItemConstructorOptions
        ]
      : []),

    // File Menu
    {
      label: '&File',
      submenu: [
        {
          label: 'Open &Video File...',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendAction('open-file')
        },
        {
          label: 'Open &Folder to Library...',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => sendAction('open-folder')
        },
        {
          label: 'Open &Recent',
          submenu: recentSubmenu
        },
        { type: 'separator' },
        {
          label: 'Playlist & Queue',
          accelerator: 'CmdOrCtrl+L',
          click: () => sendAction('open-playlist')
        },
        {
          label: 'Bookmarks & Chapters',
          accelerator: 'CmdOrCtrl+B',
          click: () => sendAction('open-bookmarks')
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    // Playback Menu
    {
      label: '&Playback',
      submenu: [
        {
          label: 'Play / Pause',
          accelerator: 'Space',
          click: () => sendAction('play-pause')
        },
        {
          label: 'Previous Video',
          accelerator: 'P',
          click: () => sendAction('prev')
        },
        {
          label: 'Next Video',
          accelerator: 'N',
          click: () => sendAction('next')
        },
        { type: 'separator' },
        {
          label: 'Seek Forward (10s)',
          accelerator: 'Right',
          click: () => sendAction('seek-forward')
        },
        {
          label: 'Seek Backward (10s)',
          accelerator: 'Left',
          click: () => sendAction('seek-backward')
        },
        { type: 'separator' },
        {
          label: 'Volume Up',
          accelerator: 'Up',
          click: () => sendAction('volume-up')
        },
        {
          label: 'Volume Down',
          accelerator: 'Down',
          click: () => sendAction('volume-down')
        },
        {
          label: 'Mute / Unmute',
          accelerator: 'M',
          click: () => sendAction('mute')
        },
        { type: 'separator' },
        {
          label: 'Audio Equalizer & 200% Boost',
          accelerator: 'CmdOrCtrl+E',
          click: () => sendAction('open-equalizer')
        },
        {
          label: 'Take Video Snapshot',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendAction('take-screenshot')
        }
      ]
    },

    // View Menu
    {
      label: '&View',
      submenu: [
        {
          label: 'Toggle Fullscreen',
          accelerator: isMac ? 'Ctrl+Cmd+F' : 'F11',
          click: () => sendAction('toggle-fullscreen')
        },
        {
          label: 'Picture-in-Picture',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => sendAction('toggle-pip')
        },
        {
          label: 'Always on Top',
          type: 'checkbox',
          checked: storeService.get<boolean>('alwaysOnTop', false),
          click: (menuItem) => {
            const win = getMainWindow();
            if (win) {
              const nextState = menuItem.checked;
              win.setAlwaysOnTop(nextState, 'floating');
              storeService.set('alwaysOnTop', nextState);
              sendAction('toggle-always-on-top');
            }
          }
        },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' }
      ]
    },

    // Settings Menu
    {
      label: '&Settings',
      submenu: [
        {
          label: 'Player Preferences...',
          accelerator: 'CmdOrCtrl+,',
          click: () => sendAction('open-settings')
        },
        {
          label: 'Keyboard Shortcuts Reference',
          accelerator: 'CmdOrCtrl+/',
          click: () => sendAction('open-shortcuts')
        }
      ]
    },

    // Help Menu
    {
      label: '&Help',
      submenu: [
        {
          label: 'Keyboard Hotkeys Guide',
          click: () => sendAction('open-shortcuts')
        },
        { type: 'separator' },
        {
          label: 'About Cine Media Player',
          click: () => sendAction('about')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  return menu;
}
