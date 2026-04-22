-- Расширенные поля для corporate_members (как в profiles)
ALTER TABLE corporate_members
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Россия',
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Таблица регистраций участников корпоративного аккаунта на события
CREATE TABLE IF NOT EXISTS corporate_member_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_member_id UUID NOT NULL REFERENCES corporate_members(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_distance_id UUID NOT NULL REFERENCES event_distances(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  amount NUMERIC(10, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cm_reg_member ON corporate_member_registrations(corporate_member_id);
CREATE INDEX IF NOT EXISTS idx_cm_reg_event ON corporate_member_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_cm_reg_distance ON corporate_member_registrations(event_distance_id);

CREATE TRIGGER update_cm_reg_updated_at
  BEFORE UPDATE ON corporate_member_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
