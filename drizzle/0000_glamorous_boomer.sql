CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`content` text,
	`checksum` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
