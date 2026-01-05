PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_plates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`barcode` text,
	`plate_type` text NOT NULL,
	`nest_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`nest_id`) REFERENCES `nests`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_plates`("id", "name", "barcode", "plate_type", "nest_id", "created_at", "updated_at") SELECT "id", "name", "barcode", "plate_type", "nest_id", "created_at", "updated_at" FROM `plates`;--> statement-breakpoint
DROP TABLE `plates`;--> statement-breakpoint
ALTER TABLE `__new_plates` RENAME TO `plates`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `plates_name_unique` ON `plates` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `plates_barcode_unique` ON `plates` (`barcode`);