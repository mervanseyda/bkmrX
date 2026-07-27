import { describe, expect, it } from 'vitest';
import { parseCsvBookmarks } from './csv';
import { parseJsonBookmarks } from './json';
import { getPostDateFromTweetId } from './tweet-date';

describe('bookmark imports', () => {
  it('parses the bookmarks.js format from an X archive', () => {
    const result = parseJsonBookmarks(
      'window.YTD.bookmarks.part0 = [{"bookmark":{"tweetId":"123456"}}];',
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      tweetId: '123456',
      url: 'https://twitter.com/i/web/status/123456',
    });
  });

  it('accepts the singular bookmark.js wrapper variant', () => {
    const result = parseJsonBookmarks(
      'window.YTD.bookmark.part0 = [{"bookmark":{"tweetId":"789"}}];',
    );

    expect(result[0]?.tweetId).toBe('789');
  });

  it('does not create a URL containing an undefined tweet ID', () => {
    expect(parseJsonBookmarks('[{"title":"Incomplete"}]')).toEqual([]);
  });

  it('normalizes common CSV headers', () => {
    const result = parseCsvBookmarks('URL,Title,Username\nhttps://x.com/example/status/1,Example,example');

    expect(result[0]).toMatchObject({
      url: 'https://x.com/example/status/1',
      text: 'Example',
      authorUsername: 'example',
    });
  });

  it('derives a post date from a Twitter snowflake ID', () => {
    const twitterEpoch = BigInt('1288834974657');
    const expectedTimestamp = BigInt(Date.UTC(2020, 0, 1));
    const syntheticTweetId = ((expectedTimestamp - twitterEpoch) << BigInt(22)).toString();

    expect(getPostDateFromTweetId(syntheticTweetId)?.toISOString()).toBe('2020-01-01T00:00:00.000Z');
  });
});
