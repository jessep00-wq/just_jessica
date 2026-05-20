CREATE TABLE `author_bio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bio` text,
	`photoUrl` varchar(500),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `author_bio_id` PRIMARY KEY(`id`)
);
