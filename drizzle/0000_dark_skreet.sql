CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`price_cents` integer NOT NULL,
	`old_price_cents` integer,
	`price_suffix` text,
	`currency` text DEFAULT 'RON',
	`image_url` text,
	`product_url` text,
	`affiliate_url` text,
	`source_name` text,
	`source_url` text,
	`source_type` text DEFAULT 'manual',
	`available` integer DEFAULT true,
	`rating` real,
	`tags` text,
	`lat` real,
	`lng` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`suggested_price` integer,
	`url` text,
	`submitter_name` text,
	`status` text DEFAULT 'pending',
	`admin_notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
