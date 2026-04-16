-- ============================================
-- CivicPulse Database Schema
-- Paste this entire script into Supabase SQL Editor
-- ============================================

-- 1. USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. REPORTS TABLE
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  image_url TEXT,
  description TEXT,
  location TEXT,
  issue_type TEXT,
  severity TEXT,
  status TEXT NOT NULL DEFAULT 'Reported',
  estimated_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster lookups by user
CREATE INDEX idx_reports_user_id ON reports(user_id);

-- Index for filtering by status
CREATE INDEX idx_reports_status ON reports(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access (adjust as needed for production)
CREATE POLICY "Allow all access on users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access on reports"
  ON reports FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Migration: Add columns required by app code
-- Run this AFTER initial schema creation
-- ============================================
ALTER TABLE reports ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS assigned_worker TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS completion_proof_url TEXT;
