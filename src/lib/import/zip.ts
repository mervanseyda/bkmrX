import JSZip from 'jszip';
import { ParsedBookmark } from './types';
import { parseJsonBookmarks } from './json';

export async function parseZipBookmarks(zipBuffer: ArrayBuffer): Promise<ParsedBookmark[]> {
  try {
    const zip = await JSZip.loadAsync(zipBuffer);
    
    // Look for data/bookmarks.js or bookmarks.json
    const bookmarkFile =
      zip.file('data/bookmarks.js') ||
      zip.file('data/bookmark.js') ||
      zip.file('bookmarks.js') ||
      zip.file('bookmark.js') ||
      zip.file('bookmarks.json') ||
      zip.file('data/bookmarks.json');
    
    if (!bookmarkFile) {
      throw new Error('ZIP içinde bookmarks.js veya bookmark.js bulunamadı.');
    }

    const content = await bookmarkFile.async('string');

    return parseJsonBookmarks(content);
  } catch (error) {
    console.error('ZIP Parsing error:', error);
    throw error;
  }
}
