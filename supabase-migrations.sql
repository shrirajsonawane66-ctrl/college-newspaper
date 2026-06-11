-- ============================================================
-- Campus TIMELINE — Supabase Schema Fixes
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add missing author_role column to articles table
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS author_role TEXT
  DEFAULT 'editor'
  CHECK (author_role IN ('admin', 'editor', 'contributor', 'reporter'));

UPDATE articles SET author_role = 'editor' WHERE author_role IS NULL;

-- 2. Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_published
  ON articles(is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_articles_created_at
  ON articles(created_at DESC);

-- 3. Reload PostgREST schema cache (pick ONE):
-- Option A (recommended):
NOTIFY pgrst, 'reload schema';
-- Option B (if Option A doesn't work):
-- SELECT pg_notify('pgrst', 'reload schema');

-- ============================================================
-- Storage bucket configuration
-- ============================================================

-- 4. Create or update the article-thumbnails bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-thumbnails', 'article-thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. Allow public read access to all files in the bucket
CREATE POLICY IF NOT EXISTS "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-thumbnails');

-- 6. Allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Authenticated upload access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-thumbnails');

-- 7. Allow authenticated users to delete their uploads
CREATE POLICY IF NOT EXISTS "Authenticated delete access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'article-thumbnails');
