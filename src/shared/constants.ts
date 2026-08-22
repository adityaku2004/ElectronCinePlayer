export const SUPPORTED_VIDEO_EXTENSIONS = [
  'mp4',
  'mkv',
  'webm',
  'mov',
  'avi',
  'm4v',
  'mpeg',
  'mpg',
  'ogv',
  'ts',
  'wmv',
  'flv',
  '3gp'
];

export const SUPPORTED_SUBTITLE_EXTENSIONS = [
  'srt',
  'vtt',
  'ass',
  'ssa',
  'sub',
  'sbv'
];

export const ALL_SUPPORTED_MEDIA_EXTENSIONS = [
  ...SUPPORTED_VIDEO_EXTENSIONS,
  ...SUPPORTED_SUBTITLE_EXTENSIONS
];

export const IPC_CHANNELS = {
  // Window controls
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_RESTORE: 'window:restore',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:is-maximized',
  WINDOW_IS_FULLSCREEN: 'window:is-fullscreen',
  WINDOW_SET_ALWAYS_ON_TOP: 'window:set-always-on-top',
  WINDOW_GET_ALWAYS_ON_TOP: 'window:get-always-on-top',
  WINDOW_STATE_CHANGED: 'window:state-changed',

  // Dialogs & Files
  DIALOG_OPEN_FILE: 'dialog:open-file',
  DIALOG_OPEN_FOLDER: 'dialog:open-folder',
  DIALOG_SHOW_MESSAGE: 'dialog:show-message',
  DIALOG_SHOW_NOTIFICATION: 'dialog:show-notification',
  FS_SCAN_DIRECTORY: 'fs:scan-directory',
  FS_GET_FILE_INFO: 'fs:get-file-info',
  FS_GET_MEDIA_URL: 'fs:get-media-url',
  FS_READ_SUBTITLE_FILE: 'fs:read-subtitle-file',

  // App & Power
  APP_GET_INFO: 'app:get-info',
  POWER_SET_PLAYING: 'power:set-playing',

  // Store & Persistence
  STORE_GET: 'store:get',
  STORE_SET: 'store:set',
  STORE_DELETE: 'store:delete',
  STORE_GET_HISTORY: 'store:get-history',
  STORE_SAVE_HISTORY: 'store:save-history',
  STORE_CLEAR_HISTORY: 'store:clear-history',
  STORE_DELETE_HISTORY_ITEM: 'store:delete-history-item',
  STORE_GET_LIBRARY_FOLDERS: 'store:get-library-folders',
  STORE_ADD_LIBRARY_FOLDER: 'store:add-library-folder',
  STORE_REMOVE_LIBRARY_FOLDER: 'store:remove-library-folder',

  // Events & Updater
  MENU_ACTION: 'app:menu-action',
  FILE_OPENED: 'app:file-opened',
  UPDATE_STATUS: 'updater:status',
  UPDATER_CHECK_FOR_UPDATES: 'updater:check-for-updates',
  UPDATER_INSTALL_UPDATE: 'updater:install-update'
} as const;

export const CUSTOM_MEDIA_PROTOCOL = 'media';
