-- ============================================================================
-- LodgeMe Complete Database Setup Script (Updated)
-- Includes all modifications: password column, role enum fix, images column
-- Run this on a fresh MySQL installation
-- ============================================================================

CREATE DATABASE IF NOT EXISTS lodgeme_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lodgeme_db;

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  openId        VARCHAR(64)  NOT NULL UNIQUE,
  name          TEXT,
  email         VARCHAR(320),
  password      VARCHAR(255) NOT NULL DEFAULT '',
  loginMethod   VARCHAR(64),
  role          ENUM('user', 'admin', 'tenant', 'landlord') NOT NULL DEFAULT 'tenant',
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  lastSignedIn  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_openId (openId),
  INDEX idx_role   (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. PROPERTIES TABLE  (includes images column)
-- ============================================================================
CREATE TABLE IF NOT EXISTS properties (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  landlordId    INT          NOT NULL,
  name          VARCHAR(255) NOT NULL,
  city          VARCHAR(100) NOT NULL,
  neighborhood  VARCHAR(100) NOT NULL,
  latitude      DECIMAL(10, 8),
  longitude     DECIMAL(11, 8),
  description   TEXT,
  totalRooms    INT          NOT NULL DEFAULT 0,
  occupiedRooms INT          NOT NULL DEFAULT 0,
  amenities     JSON,
  images        JSON,
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (landlordId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_landlordId          (landlordId),
  INDEX idx_city                (city),
  INDEX idx_neighborhood        (neighborhood),
  INDEX idx_city_neighborhood   (city, neighborhood)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. ROOMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS rooms (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  propertyId      INT          NOT NULL,
  roomNumber      VARCHAR(50)  NOT NULL,
  roomType        ENUM('single', 'double', 'studio', 'apartment') NOT NULL,
  capacity        INT          NOT NULL,
  monthlyRent     DECIMAL(10, 2) NOT NULL,
  cautionDeposit  DECIMAL(10, 2),
  isAvailable     BOOLEAN DEFAULT TRUE,
  description     TEXT,
  images          JSON,
  createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_propertyId  (propertyId),
  INDEX idx_available   (isAvailable),
  INDEX idx_roomType    (roomType),
  UNIQUE KEY unique_property_room (propertyId, roomNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. BOOKINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  guestId     INT  NOT NULL,
  roomId      INT  NOT NULL,
  startDate   DATE NOT NULL,
  endDate     DATE,
  status      ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
  createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (guestId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (roomId)  REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_guestId      (guestId),
  INDEX idx_roomId       (roomId),
  INDEX idx_status       (status),
  INDEX idx_startDate    (startDate),
  INDEX idx_guest_status (guestId, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  bookingId     INT            NOT NULL,
  landlordId    INT            NOT NULL,
  amount        DECIMAL(10, 2) NOT NULL,
  paymentDate   DATE           NOT NULL,
  paymentMethod ENUM('cash', 'mobile_money', 'bank_transfer', 'other') DEFAULT 'cash',
  receiptNumber VARCHAR(100)   UNIQUE,
  notes         TEXT,
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (bookingId)  REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (landlordId) REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_bookingId    (bookingId),
  INDEX idx_landlordId   (landlordId),
  INDEX idx_paymentDate  (paymentDate),
  INDEX idx_paymentMethod(paymentMethod),
  INDEX idx_landlord_date(landlordId, paymentDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. INVOICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  bookingId  INT            NOT NULL,
  landlordId INT            NOT NULL,
  amount     DECIMAL(10, 2) NOT NULL,
  dueDate    DATE           NOT NULL,
  paidDate   DATE,
  status     ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  createdAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (bookingId)  REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (landlordId) REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_bookingId     (bookingId),
  INDEX idx_landlordId    (landlordId),
  INDEX idx_status        (status),
  INDEX idx_dueDate       (dueDate),
  INDEX idx_landlord_status (landlordId, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. MAINTENANCE TICKETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenanceTickets (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  roomId            INT  NOT NULL,
  reportedByUserId  INT  NOT NULL,
  title             VARCHAR(255) NOT NULL,
  description       TEXT,
  priority          ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status            ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  createdAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (roomId)           REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (reportedByUserId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_roomId           (roomId),
  INDEX idx_reportedByUserId (reportedByUserId),
  INDEX idx_status           (status),
  INDEX idx_priority         (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. VISIT REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS visitRequests (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  propertyId    INT  NOT NULL,
  guestId       INT  NOT NULL,
  requestedDate DATE NOT NULL,
  requestedTime TIME,
  notes         TEXT,
  status        ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (guestId)    REFERENCES users(id)      ON DELETE CASCADE,
  INDEX idx_propertyId (propertyId),
  INDEX idx_guestId    (guestId),
  INDEX idx_status     (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  propertyId INT NOT NULL,
  userId     INT NOT NULL,
  rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  createdAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (userId)     REFERENCES users(id)      ON DELETE CASCADE,
  INDEX idx_propertyId (propertyId),
  INDEX idx_userId     (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Done — verify tables created
-- ============================================================================
SHOW TABLES;
