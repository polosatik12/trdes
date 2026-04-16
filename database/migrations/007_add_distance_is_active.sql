-- Migration 007: add is_active to event_distances
ALTER TABLE event_distances
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_event_distances_is_active ON event_distances(is_active);
