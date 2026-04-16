-- Migration 008: media gallery
CREATE TABLE IF NOT EXISTS media_gallery (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_slug TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  url        TEXT NOT NULL,
  title      TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_gallery_event_slug ON media_gallery(event_slug, type);
