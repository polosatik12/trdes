-- Расширенные поля для новостей (cms_pages с slug LIKE 'news/%')
ALTER TABLE cms_pages
  ADD COLUMN IF NOT EXISTS featured_image TEXT,
  ADD COLUMN IF NOT EXISTS excerpt TEXT,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
