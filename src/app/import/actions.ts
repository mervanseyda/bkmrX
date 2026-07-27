'use server';

import { db } from '@/db';
import {
  authors,
  bookmarkTags,
  bookmarks,
  categories,
  importJobs,
  reviewActions,
  similarityGroupMembers,
  similarityGroups,
  tags,
} from '@/db/schema';
import { ParsedBookmark } from '@/lib/import/types';
import { calculateUsefulnessScore, detectContentType } from '@/lib/analysis/heuristics';
import { normalizeUrl } from '@/lib/analysis/duplicates';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function processImport(filename: string, items: ParsedBookmark[]) {
  if (typeof filename !== 'string' || !filename.trim() || !Array.isArray(items) || items.length === 0 || items.length > 50_000) {
    return { success: false, error: 'Geçersiz veya çok büyük içe aktarma isteği.' };
  }

  const jobId = crypto.randomUUID();
  let successCount = 0;
  let errorCount = 0;

  try {
    // İş tanımı ekle
    await db.insert(importJobs).values({
      id: jobId,
      filename: filename.trim().slice(0, 255),
      importedAt: new Date(),
      status: 'processing',
      totalCount: items.length,
    });

    // Mevcut verileri kontrol et (kopya tespiti için DB deki url'ler)
    const existingBookmarks = await db.select({ url: bookmarks.url, tweetId: bookmarks.tweetId }).from(bookmarks);
    const existingUrls = new Set(existingBookmarks.map(b => normalizeUrl(b.url)).filter(Boolean));
    const existingTweetIds = new Set(existingBookmarks.map(b => b.tweetId).filter(Boolean));

    // Batch insertion
    const batchSize = 100;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // Insert authors first
      const uniqueAuthors = new Map<string, { username: string, name: string }>();
      batch.forEach(item => {
        if (item.authorUsername) {
          uniqueAuthors.set(item.authorUsername, { 
            username: item.authorUsername, 
            name: item.authorName || item.authorUsername 
          });
        }
      });
      if (uniqueAuthors.size > 0) {
        try {
          await db.insert(authors).values(Array.from(uniqueAuthors.values())).onConflictDoNothing();
        } catch (e) {
          console.error("Failed to insert authors", e);
        }
      }

      const valuesToInsert = batch.map(item => {
        // Zaten var mı kontrol et
        const normalizedUrl = normalizeUrl(item.url);
        const isDuplicate = Boolean(existingUrls.has(normalizedUrl) || (item.tweetId && existingTweetIds.has(item.tweetId)));
        existingUrls.add(normalizedUrl);
        if (item.tweetId) existingTweetIds.add(item.tweetId);
        
        const heuristics = calculateUsefulnessScore(item);
        const contentType = detectContentType(item.text || '', item.url);

        return {
          id: crypto.randomUUID(),
          tweetId: item.tweetId,
          url: item.url,
          text: item.text,
          authorName: item.authorName,
          authorUsername: item.authorUsername,
          postDate: item.postDate,
          importedDate: new Date(),
          bookmarkedDate: item.bookmarkedDate,
          year: item.postDate ? new Date(item.postDate).getFullYear() : null,
          contentType: contentType,
          status: 'unreviewed',
          usefulnessScore: heuristics.score,
          duplicateFlag: isDuplicate, // Eğer daha önce import edildiyse kopya say
          sourceImportId: jobId,
          rawSourceMetadata: JSON.stringify(item.rawMetadata || {}),
        };
      });

      try {
        await db.insert(bookmarks).values(valuesToInsert).onConflictDoNothing();
        successCount += valuesToInsert.length;
      } catch (err) {
        console.error('Batch insert error', err);
        errorCount += valuesToInsert.length;
      }
    }

    // İş tanımını güncelle
    await db.update(importJobs).set({
      status: errorCount === 0 ? 'success' : 'partial',
      successCount,
      errorCount,
    }).where(eq(importJobs.id, jobId));

    return { success: true, successCount, errorCount, total: items.length };
  } catch (error) {
    console.error('Import processing failed', error);
    await db.update(importJobs).set({ status: 'failed' }).where(eq(importJobs.id, jobId));
    return { success: false, error: 'İçe aktarma sırasında kritik bir hata oluştu.' };
  }
}

export async function resetLocalData() {
  try {
    await db.delete(reviewActions);
    await db.delete(bookmarkTags);
    await db.delete(similarityGroupMembers);
    await db.delete(similarityGroups);
    await db.delete(bookmarks);
    await db.delete(authors);
    await db.delete(tags);
    await db.delete(categories);
    await db.delete(importJobs);

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to reset local data', error);
    return { success: false, error: 'Yerel veriler sıfırlanamadı.' };
  }
}
