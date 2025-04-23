-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 16, 2025 at 07:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `time_monitoring`
--

-- --------------------------------------------------------

--
-- Table structure for table `campaigns`
--

CREATE TABLE `campaigns` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `campaigns`
--

INSERT INTO `campaigns` (`id`, `name`, `date`, `created_at`) VALUES
('1', 'IT', '2025-04-01', '2025-04-16 17:01:12'),
('2', 'Chipotle', '2025-06-01', '2025-04-16 17:01:12'),
('3', 'HR', '2025-06-01', '2025-04-16 17:01:12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `employee_id` varchar(100) NOT NULL,
  `campaign` varchar(36) DEFAULT NULL,
  `role` enum('admin','pdd','agent') DEFAULT 'agent',
  `image` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `employee_id`, `campaign`, `role`, `image`, `password_hash`, `created_at`, `updated_at`) VALUES
('1', 'Admin User', 'admin@example.com', 'ADMIN001', '1', 'admin', NULL, '$2b$10$vzeUovoOESsMFs2QPu15qusj2hiDYDWyTiKPoW9PX6QoRJTv5cB9e', '2025-04-11 05:37:06', '2025-04-11 07:13:53'),
('2', 'John Doe', 'johndoe@example.com', '22-14234', '2', 'agent', NULL, '$2b$10$vzeUovoOESsMFs2QPu15qusj2hiDYDWyTiKPoW9PX6QoRJTv5cB9e', '2025-04-11 05:37:06', '2025-04-11 07:13:53'),
('3', 'Mark Sue', 'marksue@example.com', '22-01018', '2', 'pdd', NULL, '$2b$10$vzeUovoOESsMFs2QPu15qusj2hiDYDWyTiKPoW9PX6QoRJTv5cB9e', '2025-04-11 05:37:06', '2025-04-11 07:13:53');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_campaign` (`campaign`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_campaign` FOREIGN KEY (`campaign`) REFERENCES `campaigns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


-- Create activities table
CREATE TABLE `activities` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('work','auxiliary') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create timers table
CREATE TABLE `timers` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `activity_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `accumulated_seconds` int(11) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `start_time` datetime DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `activity_id` (`activity_id`),
  KEY `date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample activities
INSERT INTO `activities` (`id`, `name`, `type`) VALUES
(UUID(), 'Voice', 'work'),
(UUID(), 'Email', 'work'),
(UUID(), 'Data', 'work'),
(UUID(), 'Chat', 'work'),
(UUID(), 'Support', 'work'),
(UUID(), 'Break 1', 'auxiliary'),
(UUID(), 'Lunch', 'auxiliary'),
(UUID(), 'Break 2', 'auxiliary'),
(UUID(), 'Rest Room', 'auxiliary'),
(UUID(), 'Coaching', 'auxiliary'),
(UUID(), 'Training', 'auxiliary'),
(UUID(), 'Meeting', 'auxiliary'),
(UUID(), 'Technical', 'auxiliary');