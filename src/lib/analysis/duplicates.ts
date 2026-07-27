import { ParsedBookmark } from '../import/types';

export function normalizeUrl(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    parsed.hash = ''; // Remove fragments
    parsed.searchParams.delete('utm_source');
    parsed.searchParams.delete('utm_medium');
    parsed.searchParams.delete('utm_campaign');
    let normalized = parsed.toString().replace(/\/$/, '');
    
    // Convert mobile twitter / x.com to standard twitter
    normalized = normalized.replace('mobile.twitter.com', 'twitter.com');
    normalized = normalized.replace('x.com', 'twitter.com');
    
    return normalized.toLowerCase();
  } catch {
    return url.toLowerCase().trim();
  }
}

export function detectDuplicates(bookmarks: ParsedBookmark[]) {
  const urlMap = new Map<string, ParsedBookmark[]>();
  const duplicates = [];

  for (const b of bookmarks) {
    if (!b.url) continue;
    const nUrl = normalizeUrl(b.url);
    if (!urlMap.has(nUrl)) {
      urlMap.set(nUrl, []);
    }
    urlMap.get(nUrl)?.push(b);
  }

  for (const [url, group] of urlMap.entries()) {
    if (group.length > 1) {
      duplicates.push({ url, items: group });
    }
  }

  return duplicates;
}
