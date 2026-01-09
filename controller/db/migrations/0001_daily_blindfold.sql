CREATE TABLE `app_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`value` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `forms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`fields` text NOT NULL,
	`background_color` text,
	`font_color` text,
	`workcell_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_form_name_per_workcell` ON `forms` (`name`,`workcell_id`);--> statement-breakpoint
CREATE TABLE `hotels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`image_url` text,
	`rows` integer NOT NULL,
	`columns` integer NOT NULL,
	`workcell_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `labware` (
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
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_labware_name_per_workcell` ON `labware` (`name`,`workcell_id`);--> statement-breakpoint
CREATE TABLE `nests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`row` integer,
	`column` integer,
	`tool_id` integer,
	`hotel_id` integer,
	`status` text DEFAULT 'empty' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plate_nest_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plate_id` integer,
	`nest_id` integer,
	`action` text NOT NULL,
	`timestamp` text DEFAULT (datetime('now')) NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`plate_id`) REFERENCES `plates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`nest_id`) REFERENCES `nests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`barcode` text NOT NULL,
	`plate_type` text NOT NULL,
	`nest_id` integer,
	`status` text DEFAULT 'stored' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`nest_id`) REFERENCES `nests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `protocols` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`workcell_id` integer,
	`description` text,
	`commands` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reagents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`expiration_date` text NOT NULL,
	`volume` real NOT NULL,
	`well_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`well_id`) REFERENCES `wells`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `robot_arm_grip_params` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`width` integer NOT NULL,
	`speed` integer NOT NULL,
	`force` integer NOT NULL,
	`tool_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `robot_arm_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location_type` text NOT NULL,
	`coordinates` text NOT NULL,
	`tool_id` integer,
	`orientation` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `robot_arm_motion_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`speed` real NOT NULL,
	`speed2` real NOT NULL,
	`acceleration` real NOT NULL,
	`deceleration` real NOT NULL,
	`accel_ramp` real NOT NULL,
	`decel_ramp` real NOT NULL,
	`inrange` real NOT NULL,
	`straight` integer NOT NULL,
	`tool_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `robot_arm_sequences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`commands` text NOT NULL,
	`tool_id` integer,
	`labware` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `script_folders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`parent_id` integer,
	`workcell_id` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `script_folders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_folder_name_per_workcell` ON `script_folders` (`name`,`parent_id`,`workcell_id`);--> statement-breakpoint
CREATE TABLE `scripts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`language` text DEFAULT 'python' NOT NULL,
	`folder_id` integer,
	`workcell_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`folder_id`) REFERENCES `script_folders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_script_name_per_workcell` ON `scripts` (`name`,`workcell_id`);--> statement-breakpoint
CREATE TABLE `tools` (
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
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `variables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`value` text NOT NULL,
	`type` text NOT NULL,
	`workcell_id` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`workcell_id`) REFERENCES `workcells`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `unique_variable_name_per_workcell` ON `variables` (`name`,`workcell_id`);--> statement-breakpoint
CREATE TABLE `wells` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`row` text NOT NULL,
	`column` integer NOT NULL,
	`plate_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`plate_id`) REFERENCES `plates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workcells` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`description` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workcells_name_unique` ON `workcells` (`name`);