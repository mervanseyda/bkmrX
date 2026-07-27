import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Tablolar

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(), // uuid
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  isSystem: integer('is_system', { mode: 'boolean' }).default(false).notNull(), // Önceden tanımlı kategoriler
});

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const authors = sqliteTable('authors', {
  username: text('username').primaryKey(), // Twitter username
  name: text('name').notNull(),
  topics: text('topics'), // JSON array of topics
});

export const importJobs = sqliteTable('import_jobs', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  importedAt: integer('imported_at', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull(), // success, partial, failed
  totalCount: integer('total_count').default(0).notNull(),
  successCount: integer('success_count').default(0).notNull(),
  errorCount: integer('error_count').default(0).notNull(),
});

export const bookmarks = sqliteTable('bookmarks', {
  id: text('id').primaryKey(), // uuid
  tweetId: text('tweet_id'),
  url: text('url').notNull(),
  text: text('text'),
  authorName: text('author_name'),
  authorUsername: text('author_username').references(() => authors.username),
  postDate: integer('post_date', { mode: 'timestamp' }),
  importedDate: integer('imported_date', { mode: 'timestamp' }).notNull(),
  bookmarkedDate: integer('bookmarked_date', { mode: 'timestamp' }),
  year: integer('year'),
  language: text('language'),
  contentType: text('content_type'), // article, video, github, tool, thread, image, short
  status: text('status').default('unreviewed').notNull(), // unreviewed, keep, delete_candidate, export_to_raindrop, undecided, archived
  usefulnessScore: integer('usefulness_score').default(0), // 0-100
  confidenceScore: integer('confidence_score').default(0), // 0-100
  outdatedFlag: integer('outdated_flag', { mode: 'boolean' }).default(false),
  inaccessibleFlag: integer('inaccessible_flag', { mode: 'boolean' }).default(false),
  duplicateFlag: integer('duplicate_flag', { mode: 'boolean' }).default(false),
  notes: text('notes'),
  categoryId: text('category_id').references(() => categories.id),
  sourceImportId: text('source_import_id').references(() => importJobs.id),
  rawSourceMetadata: text('raw_source_metadata'), // JSON string
});

export const bookmarkTags = sqliteTable('bookmark_tags', {
  bookmarkId: text('bookmark_id').notNull().references(() => bookmarks.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
});

export const similarityGroups = sqliteTable('similarity_groups', {
  id: text('id').primaryKey(),
  name: text('name'),
  bestCandidateId: text('best_candidate_id').references(() => bookmarks.id),
});

export const similarityGroupMembers = sqliteTable('similarity_group_members', {
  groupId: text('group_id').notNull().references(() => similarityGroups.id, { onDelete: 'cascade' }),
  bookmarkId: text('bookmark_id').notNull().references(() => bookmarks.id, { onDelete: 'cascade' }),
});

export const reviewActions = sqliteTable('review_actions', {
  id: text('id').primaryKey(),
  bookmarkId: text('bookmark_id').notNull().references(() => bookmarks.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // keep, delete_candidate, export_to_raindrop, undecided
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

// İlişkiler

export const bookmarksRelations = relations(bookmarks, ({ one, many }) => ({
  author: one(authors, {
    fields: [bookmarks.authorUsername],
    references: [authors.username],
  }),
  category: one(categories, {
    fields: [bookmarks.categoryId],
    references: [categories.id],
  }),
  sourceImport: one(importJobs, {
    fields: [bookmarks.sourceImportId],
    references: [importJobs.id],
  }),
  tags: many(bookmarkTags),
}));

export const bookmarkTagsRelations = relations(bookmarkTags, ({ one }) => ({
  bookmark: one(bookmarks, {
    fields: [bookmarkTags.bookmarkId],
    references: [bookmarks.id],
  }),
  tag: one(tags, {
    fields: [bookmarkTags.tagId],
    references: [tags.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  bookmarks: many(bookmarks),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  bookmarks: many(bookmarkTags),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  bookmarks: many(bookmarks),
}));

export const similarityGroupsRelations = relations(similarityGroups, ({ many }) => ({
  members: many(similarityGroupMembers),
}));

export const similarityGroupMembersRelations = relations(similarityGroupMembers, ({ one }) => ({
  group: one(similarityGroups, {
    fields: [similarityGroupMembers.groupId],
    references: [similarityGroups.id],
  }),
  bookmark: one(bookmarks, {
    fields: [similarityGroupMembers.bookmarkId],
    references: [bookmarks.id],
  }),
}));
