-- Migration 005: bib number categories and manual override flag
-- Run: psql -U tour_de_russie_user -d tour_de_russie -f database/migrations/005_add_bib_categories.sql

-- Возрастная категория участника (рассчитывается на 31 декабря текущего года)
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS age_category TEXT,
  ADD COLUMN IF NOT EXISTS bib_number_manual BOOLEAN NOT NULL DEFAULT false;

-- Индекс для быстрого поиска занятых номеров в диапазоне
CREATE INDEX IF NOT EXISTS idx_event_registrations_bib_event
  ON event_registrations(event_id, bib_number)
  WHERE bib_number IS NOT NULL;

COMMENT ON COLUMN event_registrations.age_category IS
  'Категория: A, M1-M6 / FA, F1-F4 / MM, MF / IM, IF. Рассчитывается при регистрации.';
COMMENT ON COLUMN event_registrations.bib_number_manual IS
  'true = номер задан вручную администратором, не перезаписывается автоматикой';
