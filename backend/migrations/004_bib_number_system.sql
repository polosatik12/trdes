-- Система номеров участников

-- Диапазоны номеров для каждой дистанции/категории
CREATE TABLE IF NOT EXISTS bib_number_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_distance_id UUID NOT NULL REFERENCES event_distances(id) ON DELETE CASCADE,
  category_code TEXT NOT NULL, -- A, M1, M2, M3, M4, M5, FA, F1, F2, F3, F4, MM, MF, IM, IF
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  min_age INT,
  max_age INT,
  range_start INT NOT NULL,
  range_end INT NOT NULL,
  reserved_count INT NOT NULL DEFAULT 0, -- количество забронированных номеров (не авто)
  is_group_a BOOLEAN NOT NULL DEFAULT false, -- группа А (ручное назначение)
  UNIQUE(event_distance_id, category_code)
);

CREATE INDEX IF NOT EXISTS idx_bib_ranges_distance ON bib_number_ranges(event_distance_id);
CREATE INDEX IF NOT EXISTS idx_bib_ranges_category ON bib_number_ranges(category_code);

-- Текущий последний выданный номер в каждой категории
CREATE TABLE IF NOT EXISTS bib_number_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_distance_id UUID NOT NULL REFERENCES event_distances(id) ON DELETE CASCADE,
  category_code TEXT NOT NULL,
  last_assigned_number INT NOT NULL DEFAULT 0,
  UNIQUE(event_distance_id, category_code)
);

-- Обновляем corporate_member_registrations
ALTER TABLE corporate_member_registrations
  ADD COLUMN IF NOT EXISTS bib_number INT,
  ADD COLUMN IF NOT EXISTS bib_category TEXT,
  ADD COLUMN IF NOT EXISTS is_group_a BOOLEAN NOT NULL DEFAULT false;
