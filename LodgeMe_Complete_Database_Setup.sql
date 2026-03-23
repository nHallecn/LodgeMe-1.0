-- ============================================================================
-- LodgeMe Complete Database Setup Script
-- Rental Marketplace Platform for Cameroon
-- This script creates the database and all 15 tables
-- ============================================================================

-- ============================================================================
-- CREATE DATABASE
-- ============================================================================
CREATE DATABASE IF NOT EXISTS lodgeme_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the newly created database
USE lodgeme_db;

-- ============================================================================
-- 1. USERS TABLE (Core authentication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_openId (openId),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. PROPERTIES TABLE (Minicités and Residential Complexes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  landlordId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  neighborhood VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  totalRooms INT NOT NULL DEFAULT 0,
  occupiedRooms INT NOT NULL DEFAULT 0,
  amenities JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (landlordId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_landlordId (landlordId),
  INDEX idx_city (city),
  INDEX idx_neighborhood (neighborhood),
  INDEX idx_city_neighborhood (city, neighborhood)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. ROOMS TABLE (Individual Rental Units)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  propertyId INT NOT NULL,
  roomNumber VARCHAR(50) NOT NULL,
  roomType ENUM('single', 'double', 'studio', 'apartment') NOT NULL,
  capacity INT NOT NULL,
  monthlyRent DECIMAL(10, 2) NOT NULL,
  cautionDeposit DECIMAL(10, 2),
  isAvailable BOOLEAN DEFAULT TRUE,
  description TEXT,
  images JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_propertyId (propertyId),
  INDEX idx_available (isAvailable),
  INDEX idx_roomType (roomType),
  UNIQUE KEY unique_property_room (propertyId, roomNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. BOOKINGS TABLE (Rental Agreements)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guestId INT NOT NULL,
  roomId INT NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE,
  status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (guestId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_guestId (guestId),
  INDEX idx_roomId (roomId),
  INDEX idx_status (status),
  INDEX idx_startDate (startDate),
  INDEX idx_guest_status (guestId, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. PAYMENTS TABLE (Offline Payment Recording)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bookingId INT NOT NULL,
  landlordId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paymentDate DATE NOT NULL,
  paymentMethod ENUM('cash', 'mobile_money', 'bank_transfer', 'other') DEFAULT 'cash',
  receiptNumber VARCHAR(100) UNIQUE,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (landlordId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_bookingId (bookingId),
  INDEX idx_landlordId (landlordId),
  INDEX idx_paymentDate (paymentDate),
  INDEX idx_paymentMethod (paymentMethod),
  INDEX idx_landlord_date (landlordId, paymentDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. INVOICES TABLE (Rent Invoicing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bookingId INT NOT NULL,
  landlordId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  dueDate DATE NOT NULL,
  paidDate DATE,
  status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (landlordId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_bookingId (bookingId),
  INDEX idx_landlordId (landlordId),
  INDEX idx_status (status),
  INDEX idx_dueDate (dueDate),
  INDEX idx_landlord_status (landlordId, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. MAINTENANCE TICKETS TABLE (Issue Reporting and Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenanceTickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roomId INT NOT NULL,
  reportedByUserId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (reportedByUserId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_roomId (roomId),
  INDEX idx_reportedByUserId (reportedByUserId),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_status_priority (status, priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. VISIT REQUESTS TABLE (Property Viewing Scheduling)
-- ============================================================================
CREATE TABLE IF NOT EXISTS visitRequests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  propertyId INT NOT NULL,
  guestId INT NOT NULL,
  requestedDate DATE NOT NULL,
  requestedTime TIME,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (guestId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_propertyId (propertyId),
  INDEX idx_guestId (guestId),
  INDEX idx_status (status),
  INDEX idx_requestedDate (requestedDate),
  INDEX idx_guest_status (guestId, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. REVIEWS TABLE (Ratings and Feedback)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bookingId INT NOT NULL,
  reviewerId INT NOT NULL,
  revieweeId INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewerId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (revieweeId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_bookingId (bookingId),
  INDEX idx_reviewerId (reviewerId),
  INDEX idx_revieweeId (revieweeId),
  INDEX idx_rating (rating),
  UNIQUE KEY unique_booking_reviewer (bookingId, reviewerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. UTILITY CONFIGURATION TABLE (Meter Settings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS utilityConfiguration (
  id INT AUTO_INCREMENT PRIMARY KEY,
  propertyId INT NOT NULL,
  utilityType ENUM('electricity', 'water') NOT NULL,
  meterType ENUM('individual', 'shared') DEFAULT 'individual',
  unitRate DECIMAL(10, 2),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_propertyId (propertyId),
  UNIQUE KEY unique_property_utility (propertyId, utilityType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. METER READINGS TABLE (Utility Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS meterReadings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roomId INT NOT NULL,
  utilityType ENUM('electricity', 'water') NOT NULL,
  readingDate DATE NOT NULL,
  previousReading DECIMAL(10, 2),
  currentReading DECIMAL(10, 2) NOT NULL,
  unitsConsumed DECIMAL(10, 2),
  amount DECIMAL(10, 2),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_roomId (roomId),
  INDEX idx_utilityType (utilityType),
  INDEX idx_readingDate (readingDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. FAVORITES TABLE (Saved Properties)
-- ============================================================================
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guestId INT NOT NULL,
  propertyId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (guestId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_guestId (guestId),
  INDEX idx_propertyId (propertyId),
  UNIQUE KEY unique_guest_property (guestId, propertyId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. NOTIFICATIONS TABLE (System Notifications)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('booking', 'payment', 'maintenance', 'review', 'visit', 'general') DEFAULT 'general',
  isRead BOOLEAN DEFAULT FALSE,
  relatedId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_isRead (isRead),
  INDEX idx_type (type),
  INDEX idx_user_read (userId, isRead)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. MESSAGES TABLE (In-App Messaging)
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId INT NOT NULL,
  recipientId INT NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipientId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_senderId (senderId),
  INDEX idx_recipientId (recipientId),
  INDEX idx_isRead (isRead),
  INDEX idx_recipient_read (recipientId, isRead)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 15. TRANSACTIONS TABLE (Financial Records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('payment_received', 'payment_made', 'refund', 'fee', 'other') DEFAULT 'other',
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  referenceId INT,
  referenceType ENUM('booking', 'payment', 'invoice', 'maintenance'),
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- END OF DATABASE SETUP
-- ============================================================================
-- Database: lodgeme_db
-- Total Tables: 15
-- Character Set: utf8mb4 (supports emojis and international characters)
-- Engine: InnoDB (supports transactions and foreign keys)
-- ============================================================================
