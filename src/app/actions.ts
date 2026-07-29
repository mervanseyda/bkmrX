'use server';

import { db } from '@/db';
import { bookmarks, reviewActions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const bookmarkStatusSchema = z.enum([
  'unreviewed',
  'keep',
  'delete_candidate',
  'export_to_raindrop',
  'export_and_keep',
  'export_and_delete',
  'undecided',
]);

export async function updateBookmarkStatus(bookmarkId: string, status: string) {
  const parsedId = z.string().uuid().safeParse(bookmarkId);
  const parsedStatus = bookmarkStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) {
    return { success: false, error: 'Geçersiz yer işareti veya durum.' };
  }

  try {
    await db.update(bookmarks).set({ status: parsedStatus.data }).where(eq(bookmarks.id, parsedId.data));
    
    // Log the review action
    await db.insert(reviewActions).values({
      id: crypto.randomUUID(),
      bookmarkId: parsedId.data,
      action: parsedStatus.data,
      timestamp: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update status', error);
    return { success: false, error: 'Veritabanı hatası' };
  }
}

export async function bulkUpdateBookmarkStatus(bookmarkIds: string[], status: string) {
  const parsedStatus = bookmarkStatusSchema.safeParse(status);
  if (!parsedStatus.success || !Array.isArray(bookmarkIds) || bookmarkIds.length === 0) {
    return { success: false, error: 'Geçersiz parametreler.' };
  }

  const validIds = bookmarkIds
    .map(id => z.string().uuid().safeParse(id))
    .filter(res => res.success)
    .map(res => res.data as string);

  if (validIds.length === 0) {
    return { success: false, error: 'Geçerli id bulunamadı.' };
  }

  try {
    for (const id of validIds) {
      await db.update(bookmarks).set({ status: parsedStatus.data }).where(eq(bookmarks.id, id));
      
      await db.insert(reviewActions).values({
        id: crypto.randomUUID(),
        bookmarkId: id,
        action: parsedStatus.data,
        timestamp: new Date()
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to bulk update status', error);
    return { success: false, error: 'Veritabanı hatası' };
  }
}
