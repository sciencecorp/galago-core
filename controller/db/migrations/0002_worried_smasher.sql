PRAGMA foreign_keys=OFF;--> statement-breakpoint
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
	FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_nests`("id", "name", "row", "column", "tool_id", "hotel_id", "status", "created_at", "updated_at") SELECT "id", "name", "row", "column", "tool_id", "hotel_id", "status", "created_at", "updated_at" FROM `nests`;--> statement-breakpoint
DROP TABLE `nests`;--> statement-breakpoint
ALTER TABLE `__new_nests` RENAME TO `nests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_robot_arm_grip_params` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`width` integer NOT NULL,
	`speed` integer NOT NULL,
	`force` integer NOT NULL,
	`tool_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_robot_arm_grip_params`("id", "name", "width", "speed", "force", "tool_id", "created_at", "updated_at") SELECT "id", "name", "width", "speed", "force", "tool_id", "created_at", "updated_at" FROM `robot_arm_grip_params`;--> statement-breakpoint
DROP TABLE `robot_arm_grip_params`;--> statement-breakpoint
ALTER TABLE `__new_robot_arm_grip_params` RENAME TO `robot_arm_grip_params`;--> statement-breakpoint
CREATE TABLE `__new_robot_arm_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location_type` text NOT NULL,
	`coordinates` text NOT NULL,
	`tool_id` integer,
	`orientation` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_robot_arm_locations`("id", "name", "location_type", "coordinates", "tool_id", "orientation", "created_at", "updated_at") SELECT "id", "name", "location_type", "coordinates", "tool_id", "orientation", "created_at", "updated_at" FROM `robot_arm_locations`;--> statement-breakpoint
DROP TABLE `robot_arm_locations`;--> statement-breakpoint
ALTER TABLE `__new_robot_arm_locations` RENAME TO `robot_arm_locations`;--> statement-breakpoint
CREATE TABLE `__new_robot_arm_motion_profiles` (
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
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_robot_arm_motion_profiles`("id", "name", "speed", "speed2", "acceleration", "deceleration", "accel_ramp", "decel_ramp", "inrange", "straight", "tool_id", "created_at", "updated_at") SELECT "id", "name", "speed", "speed2", "acceleration", "deceleration", "accel_ramp", "decel_ramp", "inrange", "straight", "tool_id", "created_at", "updated_at" FROM `robot_arm_motion_profiles`;--> statement-breakpoint
DROP TABLE `robot_arm_motion_profiles`;--> statement-breakpoint
ALTER TABLE `__new_robot_arm_motion_profiles` RENAME TO `robot_arm_motion_profiles`;--> statement-breakpoint
CREATE TABLE `__new_robot_arm_sequences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`commands` text NOT NULL,
	`tool_id` integer,
	`labware` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_robot_arm_sequences`("id", "name", "description", "commands", "tool_id", "labware", "created_at", "updated_at") SELECT "id", "name", "description", "commands", "tool_id", "labware", "created_at", "updated_at" FROM `robot_arm_sequences`;--> statement-breakpoint
DROP TABLE `robot_arm_sequences`;--> statement-breakpoint
ALTER TABLE `__new_robot_arm_sequences` RENAME TO `robot_arm_sequences`;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_tool_name_per_workcell` ON `tools` (`name`,`workcell_id`);