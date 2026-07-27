import { ParsedBookmark } from './types';
import { getPostDateFromTweetId } from './tweet-date';

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return typeof value === 'object' && value !== null ? value as UnknownRecord : {};
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return undefined;
}

export function parseJsonBookmarks(jsonString: string): ParsedBookmark[] {
  try {
    const cleaned = jsonString.replace(/^\s*window\.YTD\.bookmarks?\.part\d+\s*=\s*/, '').replace(/;\s*$/, '');
    const data: unknown = JSON.parse(cleaned);
    const root = asRecord(data);
    const items: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(root.bookmarks)
        ? root.bookmarks
        : Array.isArray(root.items)
          ? root.items
          : [];

    return items.map((rawItem) => {
      const item = asRecord(rawItem);
      const user = asRecord(item.user);
      const bookmark = asRecord(item.bookmark);
      let tweetId = asString(item.id_str) || asString(item.tweetId) || asString(item.id);
      let url = asString(item.url) || asString(item.link);
      const text = asString(item.text) || asString(item.full_text) || asString(item.title) || '';
      const authorName = asString(item.author) || asString(item.authorName) || asString(user.name);
      const authorUsername = asString(item.username) || asString(item.authorUsername) || asString(user.screen_name);
      
      let postDate: Date | undefined;
      const postDateValue = asString(item.created_at) || asString(item.date) || asString(item.postDate);
      if (postDateValue) {
        postDate = new Date(postDateValue);
      }

      let bookmarkedDate: Date | undefined;
      const bookmarkedDateValue = asString(item.bookmarked_at);
      if (bookmarkedDateValue) {
        bookmarkedDate = new Date(bookmarkedDateValue);
      }

      // X Archive JSON might have a specific structure like `{ bookmark: { tweetId: '...' } }`
      const archivedTweetId = asString(bookmark.tweetId);
      if (archivedTweetId) {
        tweetId = archivedTweetId;
        url = `https://twitter.com/i/web/status/${tweetId}`;
      }

      if (!url && tweetId) url = `https://twitter.com/i/web/status/${tweetId}`;

      const validPostDate = postDate && !Number.isNaN(postDate.getTime())
        ? postDate
        : getPostDateFromTweetId(tweetId);

      return {
        tweetId,
        url: url || '',
        text,
        authorName,
        authorUsername,
        postDate: validPostDate,
        bookmarkedDate: bookmarkedDate && !isNaN(bookmarkedDate.getTime()) ? bookmarkedDate : undefined,
        rawMetadata: item,
      };
    }).filter((b: ParsedBookmark) => b.url || b.tweetId);
  } catch (error) {
    console.error('Failed to parse JSON', error);
    return [];
  }
}
