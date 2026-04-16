-- ============================================
-- FIX: Row Level Security (RLS) Policies
-- Run this in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================

-- Step 1: Drop any existing restrictive policies
DROP POLICY IF EXISTS "Allow all operations on reports" ON reports;
DROP POLICY IF EXISTS "Allow public select on reports" ON reports;
DROP POLICY IF EXISTS "Allow public insert on reports" ON reports;
DROP POLICY IF EXISTS "Allow public update on reports" ON reports;

-- Step 2: Create permissive policies for all operations
-- SELECT - anyone can read reports
CREATE POLICY "Allow public select on reports"
  ON reports FOR SELECT
  USING (true);

-- INSERT - anyone can create reports
CREATE POLICY "Allow public insert on reports"
  ON reports FOR INSERT
  WITH CHECK (true);

-- UPDATE - anyone can update reports
CREATE POLICY "Allow public update on reports"
  ON reports FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Step 3: Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='location_lat') THEN
    ALTER TABLE reports ADD COLUMN location_lat DOUBLE PRECISION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='location_lng') THEN
    ALTER TABLE reports ADD COLUMN location_lng DOUBLE PRECISION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='estimated_time') THEN
    ALTER TABLE reports ADD COLUMN estimated_time TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='assigned_worker') THEN
    ALTER TABLE reports ADD COLUMN assigned_worker TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='completion_proof_url') THEN
    ALTER TABLE reports ADD COLUMN completion_proof_url TEXT;
  END IF;
END $$;

-- Done! Your reports table should now accept inserts and have all required columns.
