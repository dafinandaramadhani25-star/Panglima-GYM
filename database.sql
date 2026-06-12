-- SQL Dump for GymStock Database Setup
-- You can import this file directly into your local MySQL server (using phpMyAdmin, MySQL Workbench, DBeaver, or CMD)

CREATE DATABASE IF NOT EXISTS `gymstock` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gymstock`;

-- 1. Table: user_profiles
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `uid` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(255) DEFAULT NULL,
  `role` VARCHAR(255) NOT NULL DEFAULT 'Staff',
  `password` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial user profiles (Default admin password is 'panglimagym2026')
INSERT INTO `user_profiles` (`uid`, `email`, `display_name`, `role`, `password`) VALUES
('user-1', 'dafinandaramadhani25@gmail.com', 'Dafina Ramadhani', 'Admin', 'panglimagym2026'),
('user-2', 'ahmad@gymstock.com', 'Ahmad Muzakir', 'Staff', 'staffpassword2026'),
('user-3', 'budi@gymstock.com', 'Budi Santoso', 'Staff', 'staffpassword22')
ON DUPLICATE KEY UPDATE `email`=`email`;


-- 2. Table: gym_items
CREATE TABLE IF NOT EXISTS `gym_items` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(255) DEFAULT NULL,
  `serial` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(255) DEFAULT NULL,
  `condition` VARCHAR(255) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `total_stock` INT NOT NULL DEFAULT '0',
  `image_url` TEXT DEFAULT NULL,
  `qr_code_url` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `updated_at` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial gym equipment items
INSERT INTO `gym_items` (`id`, `name`, `brand`, `serial`, `category`, `condition`, `location`, `total_stock`, `image_url`, `qr_code_url`, `description`, `updated_at`) VALUES
('item-1', 'Treadmill Commercial T600', 'Matrix Fitness', 'MX-TRD-48902-A', 'Cardio', 'Good', 'Area Kardio Barat', 5, 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=300&auto=format&fit=crop', 'MOCK-QR-MATRIX-T600', 'Treadmill performansi tinggi dengan motor AC 4.2HP, konsol LED terang, dan sistem peredam kejut Ultimate Deck.', '2026-06-01T10:00:00Z'),
('item-2', 'Smith Machine Series 700', 'Life Fitness', 'LF-SM-93108-B', 'Strength', 'In Repairs', 'Zon Bebas Beban Tengah', 2, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=300&auto=format&fit=crop', 'MOCK-QR-SMITH-700', 'Sistem pengaman lintasan bar 7 derajat natural dengan bantalan linier presisi tinggi demi keamanan latihan kekuatan.', '2026-06-03T14:30:00Z'),
('item-3', 'Olympic Hex Trap Bar 20kg', 'Rogue Fitness', 'RG-HEX-10293-F', 'Free Weights', 'Good', 'Zon Angkat Berat Utama', 8, 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=300&auto=format&fit=crop', 'MOCK-QR-ROGUE-HEX', 'Bilah hex bar lapis kromium industrial berkualitas tinggi, sangat direkomendasikan untuk sesi deadlift presisi tinggi.', '2026-06-04T08:15:00Z')
ON DUPLICATE KEY UPDATE `id`=`id`;


-- 3. Table: maintenance_schedules
CREATE TABLE IF NOT EXISTS `maintenance_schedules` (
  `id` VARCHAR(255) NOT NULL,
  `item_id` VARCHAR(255) NOT NULL,
  `item_name` VARCHAR(255) DEFAULT NULL,
  `next_service_date` VARCHAR(255) DEFAULT NULL,
  `maintenance_type` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`item_id`) REFERENCES `gym_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial maintenance schedules
INSERT INTO `maintenance_schedules` (`id`, `item_id`, `item_name`, `next_service_date`, `maintenance_type`, `status`) VALUES
('maint-1', 'item-2', 'Smith Machine Series 700', '2026-06-10', 'Lubrikasi Lintasan Rel & Kalibrasi Kabel', 'Mendatang'),
('maint-2', 'item-3', 'Olympic Hex Trap Bar 20kg', '2026-06-15', 'Inspeksi Keretakan Pengunci Kerah Logam', 'Mendatang')
ON DUPLICATE KEY UPDATE `id`=`id`;


-- 4. Table: stock_logs
CREATE TABLE IF NOT EXISTS `stock_logs` (
  `id` VARCHAR(255) NOT NULL,
  `type` VARCHAR(255) NOT NULL,
  `item_id` VARCHAR(255) NOT NULL,
  `item_name` VARCHAR(255) DEFAULT NULL,
  `quantity` INT NOT NULL DEFAULT '0',
  `user_email` VARCHAR(255) DEFAULT NULL,
  `user_name` VARCHAR(255) DEFAULT NULL,
  `destination_or_source` VARCHAR(255) DEFAULT NULL,
  `created_at` VARCHAR(255) DEFAULT NULL,
  `updated_at` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial activity logs
INSERT INTO `stock_logs` (`id`, `type`, `item_id`, `item_name`, `quantity`, `user_email`, `user_name`, `destination_or_source`, `created_at`, `updated_at`) VALUES
('log-1', 'Masuk', 'item-3', 'Olympic Hex Trap Bar 20kg', 3, 'dafinandaramadhani25@gmail.com', 'Dafina Ramadhani', 'Pemasok Rogue Jakarta Barat', '2026-06-04T08:15:00Z', '2026-06-04T08:15:00Z')
ON DUPLICATE KEY UPDATE `id`=`id`;
