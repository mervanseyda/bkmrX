const TWITTER_EPOCH_MS = BigInt('1288834974657');

export function getPostDateFromTweetId(tweetId?: string): Date | undefined {
  if (!tweetId || !/^\d{15,20}$/.test(tweetId)) return undefined;

  try {
    const timestamp = Number((BigInt(tweetId) >> BigInt(22)) + TWITTER_EPOCH_MS);
    const date = new Date(timestamp);
    const earliestSnowflakeDate = Date.UTC(2010, 10, 4);
    const latestReasonableDate = Date.now() + 86_400_000;

    if (
      Number.isNaN(date.getTime()) ||
      timestamp < earliestSnowflakeDate ||
      timestamp > latestReasonableDate
    ) {
      return undefined;
    }

    return date;
  } catch {
    return undefined;
  }
}
