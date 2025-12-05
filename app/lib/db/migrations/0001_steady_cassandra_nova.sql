CREATE TABLE `districts` (
	`id` text PRIMARY KEY NOT NULL,
	`regency_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`regency_id`) REFERENCES `regencies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `provinces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `regencies` (
	`id` text PRIMARY KEY NOT NULL,
	`province_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`province_id`) REFERENCES `provinces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `villages` (
	`id` text PRIMARY KEY NOT NULL,
	`district_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`district_id`) REFERENCES `districts`(`id`) ON UPDATE no action ON DELETE no action
);
