-- Create activities table
CREATE TABLE IF NOT EXISTS `activities` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `type` ENUM('work', 'auxiliary') NOT NULL,
  `description` VARCHAR(255),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_activity_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create timers table with indexes for performance
CREATE TABLE IF NOT EXISTS `timers` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `activity_id` VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `accumulated_seconds` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT FALSE,
  `start_time` DATETIME NULL,
  `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_activity_date` (`user_id`, `activity_id`, `date`),
  INDEX `idx_user_date` (`user_id`, `date`),
  INDEX `idx_active_timers` (`user_id`, `is_active`),
  INDEX `idx_activity` (`activity_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create aggregated daily stats table for faster reporting
CREATE TABLE IF NOT EXISTS `daily_stats` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `work_seconds` INT UNSIGNED NOT NULL DEFAULT 0,
  `auxiliary_seconds` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_seconds` INT UNSIGNED NOT NULL DEFAULT 0,
  `work_percent` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `last_calculated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date` (`user_id`, `date`),
  INDEX `idx_date` (`date`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed data for activities
INSERT INTO `activities` (`id`, `name`, `type`, `description`) VALUES
('1', 'Voice', 'work', 'Voice calls with customers'),
('2', 'Email', 'work', 'Email correspondence'),
('3', 'Data', 'work', 'Data entry and processing'),
('4', 'Chat', 'work', 'Live chat support'),
('5', 'Support', 'work', 'Customer support tasks'),
('6', 'Break 1', 'auxiliary', 'Morning break'),
('7', 'Lunch', 'auxiliary', 'Lunch break'),
('8', 'Break 2', 'auxiliary', 'Afternoon break'),
('9', 'Rest Room', 'auxiliary', 'Rest room break'),
('10', 'Coaching', 'auxiliary', 'One-on-one coaching'),
('11', 'Training', 'auxiliary', 'Training sessions'),
('12', 'Meeting', 'auxiliary', 'Team meetings'),
('13', 'Technical', 'auxiliary', 'Technical issues');