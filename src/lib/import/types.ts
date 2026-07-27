export interface ParsedBookmark {
  tweetId?: string;
  url: string;
  text?: string;
  authorName?: string;
  authorUsername?: string;
  postDate?: Date;
  bookmarkedDate?: Date;
  rawMetadata?: Record<string, unknown>;
}
