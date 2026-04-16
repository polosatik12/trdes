-- CMS Admin Panel Tables

-- CMS Users (separate auth for admin panel)
CREATE TABLE IF NOT EXISTS cms_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CMS Pages metadata
CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CMS Blocks — each page is a collection of blocks
CREATE TABLE IF NOT EXISTS cms_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}',
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CMS Assets — uploaded files (images, PDFs, etc.)
CREATE TABLE IF NOT EXISTS cms_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CMS Versions — change history for blocks
CREATE TABLE IF NOT EXISTS cms_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES cms_blocks(id) ON DELETE CASCADE,
  previous_data JSONB NOT NULL,
  changed_by TEXT,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_cms_blocks_page_id ON cms_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_cms_blocks_sort_order ON cms_blocks(page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);

-- Seed: default admin user (password: admin123 — change immediately!)
INSERT INTO cms_users (username, password_hash, role)
VALUES ('admin', '$2a$10$DE.zVKYI6imwEGh8wyTkeu9Z2mG7RHCsdvNCox11O3CMxhWQfkjzm', 'admin')
ON CONFLICT (username) DO NOTHING;
