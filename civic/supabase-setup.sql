-- ============================================
-- CivicPulse Supabase Database Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create the reports table
CREATE TABLE IF NOT EXISTS reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  image_url TEXT,
  description TEXT,
  location TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'Low',
  status TEXT NOT NULL DEFAULT 'Reported',
  estimated_time TEXT,
  assigned_worker TEXT,
  assigned_worker_id UUID,
  completion_proof_url TEXT,
  before_image_url TEXT,
  after_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (but allow all operations for prototype)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 3. Create an open policy for the prototype
-- (In production, restrict this to authenticated users)
CREATE POLICY "Allow all operations on reports"
  ON reports
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Create the storage bucket for issue images
-- Go to Storage in Supabase dashboard and create a bucket named "reports-images"
-- Set it to PUBLIC bucket so images can be accessed via public URLs.
-- Inside the bucket, create two folders: "reports" and "proofs"

-- 5. Storage policy (run in SQL editor)
-- Allow public uploads to the reports-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports-images', 'reports-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Allow public uploads to reports-images bucket"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'reports-images');

CREATE POLICY "Allow public read from reports-images bucket"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'reports-images');
