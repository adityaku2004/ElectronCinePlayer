import { protocol, net } from 'electron';
import path from 'path';
import { pathToFileURL } from 'url';
import { CUSTOM_MEDIA_PROTOCOL } from '../../shared/constants';
import { logger } from '../services/logger';

export function registerMediaPrivilegedScheme() {
  try {
    protocol.registerSchemesAsPrivileged([
      {
        scheme: CUSTOM_MEDIA_PROTOCOL,
        privileges: {
          standard: true,
          secure: true,
          supportFetchAPI: true,
          stream: true,
          bypassCSP: true,
          corsEnabled: true
        }
      }
    ]);
    logger.info(`Privileged scheme registered for '${CUSTOM_MEDIA_PROTOCOL}://'`);
  } catch (err) {
    logger.error('Failed to register privileged scheme', err);
  }
}

export function setupMediaProtocolHandler() {
  try {
    // Protocol handler for media:// - streaming local files with native byte-range support
    protocol.handle(CUSTOM_MEDIA_PROTOCOL, (request) => {
      try {
        const rawUrl = request.url;
        // Parse the url: media://path/to/video.mp4 or media://C:/path/to/video.mp4
        let filePath = rawUrl.replace(new RegExp(`^${CUSTOM_MEDIA_PROTOCOL}:/{1,3}`), '');

        // Decode URI components
        filePath = decodeURIComponent(filePath);

        // On Windows, if path looks like 'c:/path' or 'C:/path'
        if (process.platform === 'win32' && /^[a-zA-Z]:[/\\]/.test(filePath)) {
          // Normalize Windows path
          filePath = path.normalize(filePath);
        } else if (!filePath.startsWith('/')) {
          filePath = '/' + filePath;
        }

        const fileUrl = pathToFileURL(filePath).toString();
        logger.debug(`Streaming media protocol: ${rawUrl} -> ${fileUrl}`);

        return net.fetch(fileUrl, {
          headers: request.headers,
          method: request.method
        });
      } catch (err) {
        logger.error(`Error handling media protocol for ${request.url}`, err);
        return new Response('Media file not found or inaccessible', { status: 404 });
      }
    });

    logger.info(`Media protocol '${CUSTOM_MEDIA_PROTOCOL}://' handler active`);
  } catch (err) {
    logger.error('Failed to register media protocol handler', err);
  }
}
