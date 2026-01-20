ALTER TABLE `nests` ADD `robot_accessible` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `nests` ADD `nest_type` text DEFAULT 'storage' NOT NULL;--> statement-breakpoint
ALTER TABLE `nests` ADD `z_offset` real;--> statement-breakpoint
ALTER TABLE `nests` ADD `reference_nest_id` integer REFERENCES nests(id);--> statement-breakpoint
ALTER TABLE `nests` ADD `robot_arm_location_id` integer REFERENCES robot_arm_locations(id);--> statement-breakpoint
ALTER TABLE `robot_arm_locations` ADD `source_nest_id` integer REFERENCES nests(id);--> statement-breakpoint
CREATE INDEX idx_nests_robot_accessible ON nests(robot_accessible);--> statement-breakpoint
CREATE INDEX idx_nests_reference ON nests(reference_nest_id);--> statement-breakpoint
CREATE INDEX idx_robot_arm_locations_source_nest ON robot_arm_locations(source_nest_id);