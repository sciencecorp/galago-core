DROP INDEX IF EXISTS `plates_name_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `plates_barcode_unique`;--> statement-breakpoint
ALTER TABLE `plates` ADD `workcell_id` integer REFERENCES workcells(id);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_plate_name_per_workcell` ON `plates` (`name`,`workcell_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_plate_barcode_per_workcell` ON `plates` (`barcode`,`workcell_id`);