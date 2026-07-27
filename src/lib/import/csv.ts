import Papa from 'papaparse';
import { ParsedBookmark } from './types';
import { getPostDateFromTweetId } from './tweet-date';

export function parseCsvBookmarks(csvString: string): ParsedBookmark[] {
  const parsed = Papa.parse<Record<string, string>>(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.error('CSV Parsing errors:', parsed.errors);
  }

  return parsed.data.map((item) => {
    // Normalization for common CSV headers
    const url = item.url || item.link || item.URL;
    const text = item.text || item.title || item.note || item.Title;
    const authorName = item.author || item.authorName || item.Author;
    const authorUsername = item.username || item.authorUsername || item.Username;
    const tweetId = item.tweetId || item.id_str || item.id;
    
    let postDate: Date | undefined;
    const dateStr = item.created_at || item.date || item.created || item.Date;
    if (dateStr) {
      postDate = new Date(dateStr);
    }

    return {
      url: url || (tweetId ? `https://twitter.com/i/web/status/${tweetId}` : ''),
      text,
      authorName,
      authorUsername,
      tweetId,
      postDate: postDate && !Number.isNaN(postDate.getTime()) ? postDate : getPostDateFromTweetId(tweetId),
      rawMetadata: item,
    };
  }).filter(b => b.url || b.tweetId);
}
