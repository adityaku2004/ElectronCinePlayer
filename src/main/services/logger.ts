const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[CINE-MAIN:INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[CINE-MAIN:WARN] ${new Date().toISOString()} - ${message}`, ...args);
  },
  error: (message: string, error?: unknown) => {
    const errorMsg = error instanceof Error ? error.message : String(error || '');
    console.error(`[CINE-MAIN:ERROR] ${new Date().toISOString()} - ${message}: ${errorMsg}`);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.debug(`[CINE-MAIN:DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
};
