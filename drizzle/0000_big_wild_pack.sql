CREATE TABLE `authors` (
	`username` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`topics` text
);
--> statement-breakpoint
CREATE TABLE `bookmark_tags` (
	`bookmark_id` text NOT NULL,
	`tag_id` text NOT NULL,
	FOREIGN KEY (`bookmark_id`) REFERENCES `bookmarks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`tweet_id` text,
	`url` text NOT NULL,
	`text` text,
	`author_name` text,
	`author_username` text,
	`post_date` integer,
	`imported_date` integer NOT NULL,
	`bookmarked_date` integer,
	`year` integer,
	`language` text,
	`content_type` text,
	`status` text DEFAULT 'unreviewed' NOT NULL,
	`usefulness_score` integer DEFAULT 0,
	`confidence_score` integer DEFAULT 0,
	`outdated_flag` integer DEFAULT false,
	`inaccessible_flag` integer DEFAULT false,
	`duplicate_flag` integer DEFAULT false,
	`notes` text,
	`category_id` text,
	`source_import_id` text,
	`raw_source_metadata` text,
	FOREIGN KEY (`author_username`) REFERENCES `authors`(`username`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_import_id`) REFERENCES `import_jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`is_system` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `import_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`imported_at` integer NOT NULL,
	`status` text NOT NULL,
	`total_count` integer DEFAULT 0 NOT NULL,
	`success_count` integer DEFAULT 0 NOT NULL,
	`error_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `review_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`bookmark_id` text NOT NULL,
	`action` text NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`bookmark_id`) REFERENCES `bookmarks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `similarity_group_members` (
	`group_id` text NOT NULL,
	`bookmark_id` text NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `similarity_groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`bookmark_id`) REFERENCES `bookmarks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `similarity_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`best_candidate_id` text,
	FOREIGN KEY (`best_candidate_id`) REFERENCES `bookmarks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);