CREATE DATABASE ussf;
use ussf;

CREATE USER ussf IDENTIFIED BY "secret"; GRANT ALL ON *.* TO ussf;
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE `players` (
	`player_id` int(11) NOT NULL AUTO_INCREMENT,
	`player_name` varchar(255) NOT NULL,
	`current_team` varchar(255) NOT NULL,
	`link` varchar(255) NOT NULL,
	`wage` int(11), -- euros
	`cluster` varchar(255) NOT NULL,
	`quality` tinyint(1) NOT NULL,
	`international` tinyint(1) NOT NULL,
	PRIMARY KEY (`player_id`),
	KEY `cluster__quality__wage` (`cluster`, `quality`, `wage`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;
