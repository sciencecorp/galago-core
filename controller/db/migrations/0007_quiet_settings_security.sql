CREATE TABLE `app_secrets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`encrypted_value` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_secrets_name_unique` ON `app_secrets` (`name`);
--> statement-breakpoint
CREATE TABLE `app_audit_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`target_type` text NOT NULL,
	`target_name` text,
	`details` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `app_audit_events_action_idx` ON `app_audit_events` (`action`);
--> statement-breakpoint
CREATE INDEX `app_audit_events_created_at_idx` ON `app_audit_events` (`created_at`);
