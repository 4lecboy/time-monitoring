-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 14, 2025 at 03:44 PM
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

-- --------------------------------------------------------

--
-- Table structure for table `daily_stats`
--

CREATE TABLE `campaigns` (
  `id` varchar(36) NOT NULL,
  `name` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(), 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `employee_id` varchar(100) NOT NULL,
  `campaign` varchar(100) DEFAULT NULL,
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
('1', 'Admin User', 'admin@example.com', 'ADMIN001', 'IT', 'admin', NULL, '$2b$10$vzeUovoOESsMFs2QPu15qusj2hiDYDWyTiKPoW9PX6QoRJTv5cB9e', '2025-04-11 13:37:06', '2025-04-11 15:13:53');
('2', 'John Doe', 'johndoe@example.com', '22-14234', 'Chipotle', 'agent', NULL, '$2b$10$vzeUovoOESsMFs2QPu15qusj2hiDYDWyTiKPoW9PX6QoRJTv5cB9e', '2025-04-11 13:37:06', '2025-04-11 15:13:53');
('3', 'Mark Sue', 'marksue@example.com', '22-01018', 'Chipotle', 'PDD', NULL, '$2b$10$vzeUovoOESsMFs2QPu15qusj2hiDYDWyTiKPoW9PX6QoRJTv5cB9e', '2025-04-11 13:37:06', '2025-04-11 15:13:53');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `campaigns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `date` (`date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `employee_id` (`employee_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
