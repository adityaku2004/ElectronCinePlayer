import fs from 'fs/promises';
import path from 'path';
import { CUSTOM_MEDIA_PROTOCOL, SUPPORTED_VIDEO_EXTENSIONS, SUPPORTED_SUBTITLE_EXTENSIONS } from '../../shared/constants';
import { DirectoryScanResult, MediaFileInfo } from '../../shared/types';
import { logger } from '../services/logger';

export function getMediaProtocolUrl(filePath: string): string {
  // Convert standard file path to media:// URL
  const normalized = filePath.replace(/\\/g, '/');
  return `${CUSTOM_MEDIA_PROTOCOL}://${encodeURI(normalized)}`;
}

export async function getFileInfo(filePath: string): Promise<MediaFileInfo | null> {
  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) return null;

    const ext = path.extname(filePath).toLowerCase().replace(/^\./, '');
    const name = path.basename(filePath);

    return {
      name,
      path: filePath,
      extension: ext,
      size: stats.size,
      modifiedDate: stats.mtimeMs,
      mediaUrl: getMediaProtocolUrl(filePath)
    };
  } catch (err) {
    logger.error(`Error reading file info for ${filePath}`, err);
    return null;
  }
}

export async function scanDirectory(
  dirPath: string,
  maxDepth: number = 2,
  currentDepth: number = 0
): Promise<DirectoryScanResult> {
  const result: MediaFileInfo[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase().replace(/^\./, '');
        if (SUPPORTED_VIDEO_EXTENSIONS.includes(ext) || SUPPORTED_SUBTITLE_EXTENSIONS.includes(ext)) {
          try {
            const stats = await fs.stat(fullPath);
            result.push({
              name: entry.name,
              path: fullPath,
              extension: ext,
              size: stats.size,
              modifiedDate: stats.mtimeMs,
              mediaUrl: getMediaProtocolUrl(fullPath)
            });
          } catch {
            // Ignore unreadable file
          }
        }
      } else if (entry.isDirectory() && currentDepth < maxDepth && !entry.name.startsWith('.')) {
        // Asynchronously scan subdirectories
        const subResult = await scanDirectory(fullPath, maxDepth, currentDepth + 1);
        if (subResult.success && subResult.files.length > 0) {
          result.push(...subResult.files);
        }
      }
    }

    // Sort files by modified date descending (newest first)
    result.sort((a, b) => b.modifiedDate - a.modifiedDate);

    return {
      success: true,
      folderPath: dirPath,
      files: result
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error(`Directory scan error in ${dirPath}`, err);
    return {
      success: false,
      folderPath: dirPath,
      files: [],
      error: errorMsg
    };
  }
}
