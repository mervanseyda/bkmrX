'use server';

import { db } from '@/db';
import { bookmarks, categories, tags, bookmarkTags } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import Papa from 'papaparse';

export async function generateRaindropCsv() {
  const items = await db.select({
    id: bookmarks.id,
    url: bookmarks.url,
    text: bookmarks.text,
    notes: bookmarks.notes,
    categoryId: bookmarks.categoryId,
    postDate: bookmarks.postDate,
  }).from(bookmarks).where(eq(bookmarks.status, 'export_to_raindrop'));

  if (items.length === 0) {
    return { success: false, error: 'Dışa aktarılacak kayıt bulunamadı.' };
  }

  // Fetch categories to map IDs to folder names
  const allCategories = await db.select().from(categories);
  const categoryMap = new Map(allCategories.map(c => [c.id, c.name]));

  // Fetch tags
  const bIds = items.map(i => i.id);
  const bTags = await db.select({
    bookmarkId: bookmarkTags.bookmarkId,
    tagName: tags.name,
  }).from(bookmarkTags)
    .innerJoin(tags, eq(bookmarkTags.tagId, tags.id))
    .where(inArray(bookmarkTags.bookmarkId, bIds));

  const tagMap = new Map<string, string[]>();
  for (const bt of bTags) {
    if (!tagMap.has(bt.bookmarkId)) tagMap.set(bt.bookmarkId, []);
    tagMap.get(bt.bookmarkId)!.push(bt.tagName);
  }

  // Raindrop format: folder, title, note, url, tags, created
  const csvData = items.map(item => ({
    url: item.url,
    folder: item.categoryId ? categoryMap.get(item.categoryId) || 'Uncategorized' : 'Uncategorized',
    title: item.text ? (item.text.substring(0, 100) + (item.text.length > 100 ? '...' : '')) : 'Bookmark',
    note: item.notes || '',
    tags: tagMap.get(item.id)?.join(',') || '',
    created: item.postDate ? new Date(item.postDate).toISOString() : new Date().toISOString()
  }));

  const csvString = Papa.unparse(csvData);
  return { success: true, csv: csvString };
}

export async function generateTwitterDeletionScript() {
  const items = await db.select({
    tweetId: bookmarks.tweetId,
  }).from(bookmarks).where(inArray(bookmarks.status, ['deleted', 'delete_candidate']));

  const tweetIds = items.map(i => i.tweetId).filter(Boolean);

  if (tweetIds.length === 0) {
    return { success: false, error: 'Silinecek yer işareti bulunamadı.' };
  }

  const script = `
// Twitter Bookmark Deletion Script
(async function() {
  const tweetIds = ${JSON.stringify(tweetIds)};
  console.log("[bkmrX] Starting deletion of " + tweetIds.length + " bookmarks...");

  const ct0Match = document.cookie.match(/(?:^|;\\s*)ct0=([^;]*)/);
  if (!ct0Match) {
    console.error("CSRF token (ct0) not found in cookies. Are you logged in?");
    return;
  }
  const ct0 = ct0Match[1];
  
  const bearerToken = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

  let deleteHash = 'WlhlQO-GmzXhB7R5Jb5K6w';
  try {
    const html = await fetch('https://x.com/').then(res => res.text());
    const jsUrls = [...html.matchAll(/https:\\/\\/abs\\.twimg\\.com\\/responsive-web\\/client-web\\/main\\.[^"]+\\.js/g)].map(m => m[0]);
    
    if (jsUrls.length > 0) {
      const js = await fetch(jsUrls[0]).then(res => res.text());
      const hashMatch = js.match(/queryId:"([^"]+)",operationName:"DeleteBookmark"/);
      if (hashMatch) {
        deleteHash = hashMatch[1];
        console.log("[bkmrX] Found latest DeleteBookmark hash:", deleteHash);
      }
    }
  } catch (e) {
    console.warn("Could not auto-detect hash, using fallback", e);
  }

  let successCount = 0;
  for (let i = 0; i < tweetIds.length; i++) {
    const tweetId = tweetIds[i];
    try {
      const res = await fetch(\`https://x.com/i/api/graphql/\${deleteHash}/DeleteBookmark\`, {
        method: 'POST',
        headers: {
          'authorization': \`Bearer \${bearerToken}\`,
          'content-type': 'application/json',
          'x-csrf-token': ct0,
          'x-twitter-active-user': 'yes',
          'x-twitter-auth-type': 'OAuth2Session',
          'x-twitter-client-language': 'en'
        },
        body: JSON.stringify({
          variables: { tweet_id: tweetId },
          queryId: deleteHash
        }),
        credentials: 'include'
      });
      
      const json = await res.json();
      if (json.data && json.data.tweet_bookmark_delete === 'Done') {
        successCount++;
        console.log(\`[\${i+1}/\${tweetIds.length}] Deleted tweet \${tweetId}\`);
      } else {
        console.error(\`[\${i+1}/\${tweetIds.length}] Failed to delete \${tweetId}:\`, json);
      }
      
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(\`[\${i+1}/\${tweetIds.length}] Error deleting \${tweetId}:\`, e);
    }
  }
  
  console.log("[bkmrX] Finished! Successfully deleted " + successCount + " out of " + tweetIds.length + " bookmarks.");
})();
`;

  return { success: true, script };
}

export async function markDeletionsAsCompleted() {
  try {
    await db.update(bookmarks)
      .set({ status: 'purged' })
      .where(inArray(bookmarks.status, ['deleted', 'delete_candidate']));
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to mark deletions as completed:", error);
    return { success: false, error: 'Veritabanı hatası.' };
  }
}
