PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_forms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`fields` text NOT NULL,
	`background_color` text,
	`font_color` text,
	`workcell_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_forms`("id", "name", "fields", "background_color", "font_color", "workcell_id", "created_at", "updated_at") SELECT "id", "name", "fields", "background_color", "font_color", "workcell_id", "created_at", "updated_at" FROM `forms`;--> statement-breakpoint
DROP TABLE `forms`;--> statement-breakpoint
ALTER TABLE `__new_forms` RENAME TO `forms`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_form_name_per_workcell` ON `forms` (`name`,`workcell_id`);--> statement-breakpoint
CREATE TABLE `__new_hotels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`image_url` text,
	`rows` integer NOT NULL,
	`columns` integer NOT NULL,
	`workcell_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_hotels`("id", "name", "description", "image_url", "rows", "columns", "workcell_id", "created_at", "updated_at") SELECT "id", "name", "description", "image_url", "rows", "columns", "workcell_id", "created_at", "updated_at" FROM `hotels`;--> statement-breakpoint
DROP TABLE `hotels`;--> statement-breakpoint
ALTER TABLE `__new_hotels` RENAME TO `hotels`;--> statement-breakpoint
CREATE TABLE `__new_labware` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`number_of_rows` integer NOT NULL,
	`number_of_columns` integer NOT NULL,
	`z_offset` real DEFAULT 0 NOT NULL,
	`width` real DEFAULT 127.8,
	`height` real DEFAULT 14.5,
	`plate_lid_offset` real DEFAULT 0,
	`lid_offset` real DEFAULT 0,
	`stack_height` real DEFAULT 0,
	`has_lid` integer DEFAULT false,
	`workcell_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_labware`("id", "name", "description", "number_of_rows", "number_of_columns", "z_offset", "width", "height", "plate_lid_offset", "lid_offset", "stack_height", "has_lid", "workcell_id", "created_at", "updated_at") SELECT "id", "name", "description", "number_of_rows", "number_of_columns", "z_offset", "width", "height", "plate_lid_offset", "lid_offset", "stack_height", "has_lid", "workcell_id", "created_at", "updated_at" FROM `labware`;--> statement-breakpoint
DROP TABLE `labware`;--> statement-breakpoint
ALTER TABLE `__new_labware` RENAME TO `labware`;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_labware_name_per_workcell` ON `labware` (`name`,`workcell_id`);--> statement-breakpoint
CREATE TABLE `__new_nests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`row` integer,
	`column` integer,
	`tool_id` integer,
	`hotel_id` integer,
	`status` text DEFAULT 'empty' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_nests`("id", "name", "row", "column", "tool_id", "hotel_id", "status", "created_at", "updated_at") SELECT "id", "name", "row", "column", "tool_id", "hotel_id", "status", "created_at", "updated_at" FROM `nests`;--> statement-breakpoint
DROP TABLE `nests`;--> statement-breakpoint
ALTER TABLE `__new_nests` RENAME TO `nests`;--> statement-breakpoint
CREATE TABLE `__new_plate_nest_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plate_id` integer,
	`nest_id` integer,
	`action` text NOT NULL,
	`timestamp` text DEFAULT (datetime('now')) NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`plate_id`) REFERENCES `plates`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`nest_id`) REFERENCES `nests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_plate_nest_history`("id", "plate_id", "nest_id", "action", "timestamp", "created_at", "updated_at") SELECT "id", "plate_id", "nest_id", "action", "timestamp", "created_at", "updated_at" FROM `plate_nest_history`;--> statement-breakpoint
DROP TABLE `plate_nest_history`;--> statement-breakpoint
ALTER TABLE `__new_plate_nest_history` RENAME TO `plate_nest_history`;--> statement-breakpoint
CREATE TABLE `__new_plates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`barcode` text NOT NULL,
	`plate_type` text NOT NULL,
	`nest_id` integer,
	`status` text DEFAULT 'stored' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`nest_id`) REFERENCES `nests`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_plates`("id", "name", "barcode", "plate_type", "nest_id", "status", "created_at", "updated_at") SELECT "id", "name", "barcode", "plate_type", "nest_id", "status", "created_at", "updated_at" FROM `plates`;--> statement-breakpoint
DROP TABLE `plates`;--> statement-breakpoint
ALTER TABLE `__new_plates` RENAME TO `plates`;--> statement-breakpoint
CREATE TABLE `__new_protocols` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`workcell_id` integer,
	`description` text,
	`commands` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_protocols`("id", "name", "category", "workcell_id", "description", "commands", "created_at", "updated_at") SELECT "id", "name", "category", "workcell_id", "description", "commands", "created_at", "updated_at" FROM `protocols`;--> statement-breakpoint
DROP TABLE `protocols`;--> statement-breakpoint
ALTER TABLE `__new_protocols` RENAME TO `protocols`;--> statement-breakpoint
CREATE TABLE `__new_reagents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`expiration_date` text NOT NULL,
	`volume` real NOT NULL,
	`well_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`well_id`) REFERENCES `wells`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_reagents`("id", "name", "expiration_date", "volume", "well_id", "created_at", "updated_at") SELECT "id", "name", "expiration_date", "volume", "well_id", "created_at", "updated_at" FROM `reagents`;--> statement-breakpoint
DROP TABLE `reagents`;--> statement-breakpoint
ALTER TABLE `__new_reagents` RENAME TO `reagents`;--> statement-breakpoint
CREATE TABLE `__new_script_folders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`parent_id` integer,
	`workcell_id` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `script_folders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_script_folders`("id", "name", "parent_id", "workcell_id", "created_at", "updated_at") SELECT "id", "name", "parent_id", "workcell_id", "created_at", "updated_at" FROM `script_folders`;--> statement-breakpoint
DROP TABLE `script_folders`;--> statement-breakpoint
ALTER TABLE `__new_script_folders` RENAME TO `script_folders`;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_folder_name_per_workcell` ON `script_folders` (`name`,`parent_id`,`workcell_id`);--> statement-breakpoint
CREATE TABLE `__new_scripts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`language` text DEFAULT 'python' NOT NULL,
	`folder_id` integer,
	`workcell_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`folder_id`) REFERENCES `script_folders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_scripts`("id", "name", "content", "language", "folder_id", "workcell_id", "created_at", "updated_at") SELECT "id", "name", "content", "language", "folder_id", "workcell_id", "created_at", "updated_at" FROM `scripts`;--> statement-breakpoint
DROP TABLE `scripts`;--> statement-breakpoint
ALTER TABLE `__new_scripts` RENAME TO `scripts`;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_script_name_per_workcell` ON `scripts` (`name`,`workcell_id`);--> statement-breakpoint
CREATE TABLE `__new_tools` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`image_url` text,
	`ip` text NOT NULL,
	`port` integer NOT NULL,
	`config` text,
	`workcell_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tools`("id", "type", "name", "description", "image_url", "ip", "port", "config", "workcell_id", "created_at", "updated_at") SELECT "id", "type", "name", "description", "image_url", "ip", "port", "config", "workcell_id", "created_at", "updated_at" FROM `tools`;--> statement-breakpoint
DROP TABLE `tools`;--> statement-breakpoint
ALTER TABLE `__new_tools` RENAME TO `tools`;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_tool_name_per_workcell` ON `tools` (`name`,`workcell_id`);--> statement-breakpoint
CREATE TABLE `__new_wells` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`row` text NOT NULL,
	`column` integer NOT NULL,
	`plate_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`plate_id`) REFERENCES `plates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_wells`("id", "row", "column", "plate_id", "created_at", "updated_at") SELECT "id", "row", "column", "plate_id", "created_at", "updated_at" FROM `wells`;--> statement-breakpoint
DROP TABLE `wells`;--> statement-breakpoint
ALTER TABLE `__new_wells` RENAME TO `wells`;