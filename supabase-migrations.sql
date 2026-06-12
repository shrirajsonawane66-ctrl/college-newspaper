-- ============================================================
-- WCCBM TIMELINE — Complete Supabase Schema
-- Run ALL of this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 0. Confirm article_id type compatibility
-- ============================================================
-- Run this separately to check types:
-- SELECT
--   (SELECT data_type FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'id') AS articles_id_type,
--   (SELECT data_type FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'article_id') AS comments_article_id_type;
-- If they don't match (e.g. bigint vs integer), cast in the frontend.

-- ============================================================
-- 1. Standardize comments table schema
-- ============================================================

-- Migrate data from old/duplicate columns into canonical ones
UPDATE comments SET author_name = username WHERE author_name IS NULL AND username IS NOT NULL;
UPDATE comments SET content = comment WHERE content IS NULL AND comment IS NOT NULL;

-- Drop duplicate columns
ALTER TABLE comments DROP COLUMN IF EXISTS username;
ALTER TABLE comments DROP COLUMN IF EXISTS comment;

-- Ensure required columns have proper constraints
ALTER TABLE comments ALTER COLUMN article_id SET NOT NULL;
ALTER TABLE comments ALTER COLUMN author_name SET NOT NULL;
ALTER TABLE comments ALTER COLUMN author_name SET DEFAULT 'Anonymous';
ALTER TABLE comments ALTER COLUMN content SET NOT NULL;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- 2. Articles — add missing columns
-- ============================================================
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_role TEXT
  DEFAULT 'editor'
  CHECK (author_role IN ('admin', 'editor', 'contributor', 'reporter'));

UPDATE articles SET author_role = 'editor' WHERE author_role IS NULL;

-- ============================================================
-- 3. Performance indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_articles_published
  ON articles(is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_articles_created_at
  ON articles(created_at DESC);

-- ============================================================
-- 4. Storage bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY IF NOT EXISTS "Public read access article-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

CREATE POLICY IF NOT EXISTS "Authenticated upload access article-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images');

CREATE POLICY IF NOT EXISTS "Authenticated delete access article-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'article-images');

-- ============================================================
-- 5. Comments — RLS policies
-- ============================================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view comments" ON comments;
CREATE POLICY "Allow public read approved comments" ON comments
  FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Public can insert comments" ON comments;
CREATE POLICY "Allow public insert comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow admin manage comments" ON comments
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Reload PostgREST schema cache again after policy changes
NOTIFY pgrst, 'reload schema';
