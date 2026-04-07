-- ──────────────────────────────────────────────────────────────────
-- School Management API — Database Setup
-- Run this script once before starting the server, OR let the server
-- auto-create the table via initSchema() on first boot.
-- ──────────────────────────────────────────────────────────────────

-- Create the database (skip if it already exists)
CREATE DATABASE IF NOT EXISTS school_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE school_management;

-- Create the schools table
CREATE TABLE IF NOT EXISTS schools (
  id          INT          NOT NULL AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  address     VARCHAR(500) NOT NULL,
  latitude    FLOAT        NOT NULL,
  longitude   FLOAT        NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Optional seed data for quick testing ──────────────────────────
INSERT INTO schools (name, address, latitude, longitude) VALUES
  ('Delhi Public School',     'Sector 45, Noida, UP 201301',           28.5706,  77.3261),
  ('Ryan International School','C-37, Sector 31, Noida, UP 201301',    28.5742,  77.3410),
  ('St. Xavier''s High School','Patna, Bihar 800001',                   25.5941,  85.1376),
  ('Kendriya Vidyalaya',       'IIT Campus, Hauz Khas, New Delhi',     28.5450,  77.1926),
  ('Amity International',     'Sector 46, Gurugram, Haryana 122003',   28.4167,  77.0435);
