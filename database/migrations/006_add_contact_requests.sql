-- Migration 006: contact_requests table
CREATE TABLE IF NOT EXISTS contact_requests (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'individual' CHECK (type IN ('individual', 'corporate')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at DESC);
