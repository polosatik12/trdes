-- Migration: Add corporate accounts support
-- Tour de Russie - Корпоративные аккаунты

-- ============================================
-- TABLES
-- ============================================

-- Таблица корпоративных аккаунтов (организации)
CREATE TABLE IF NOT EXISTS corporate_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  company_full_name TEXT NOT NULL,
  company_short_name TEXT NOT NULL,
  ogrn CHAR(13) NOT NULL,
  inn VARCHAR(12) NOT NULL,
  kpp VARCHAR(9) NOT NULL,
  bank_details TEXT NOT NULL,
  postal_address TEXT NOT NULL,
  coordinator_name TEXT NOT NULL,
  coordinator_phone TEXT NOT NULL,
  coordinator_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_corporate_accounts_user_id ON corporate_accounts(user_id);
CREATE INDEX idx_corporate_accounts_inn ON corporate_accounts(inn);
CREATE INDEX idx_corporate_accounts_ogrn ON corporate_accounts(ogrn);
CREATE INDEX idx_corporate_accounts_status ON corporate_accounts(status);

-- Таблица участников корпоративного аккаунта
CREATE TABLE IF NOT EXISTS corporate_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_account_id UUID REFERENCES corporate_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  patronymic TEXT,
  date_of_birth DATE NOT NULL,
  gender gender_type NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  position TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (corporate_account_id, email)
);

CREATE INDEX idx_corporate_members_corporate_account_id ON corporate_members(corporate_account_id);
CREATE INDEX idx_corporate_members_user_id ON corporate_members(user_id);
CREATE INDEX idx_corporate_members_status ON corporate_members(status);

-- ============================================
-- TRIGGERS
-- ============================================

-- Триггер для auto-update updated_at в corporate_accounts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_corporate_accounts_updated_at
  BEFORE UPDATE ON corporate_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_corporate_members_updated_at
  BEFORE UPDATE ON corporate_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE corporate_accounts IS 'Корпоративные аккаунты (организации)';
COMMENT ON TABLE corporate_members IS 'Участники корпоративного аккаунта (сотрудники)';
COMMENT ON COLUMN corporate_accounts.company_full_name IS 'Полное наименование организации';
COMMENT ON COLUMN corporate_accounts.company_short_name IS 'Краткое наименование организации';
COMMENT ON COLUMN corporate_accounts.ogrn IS 'Основной государственный регистрационный номер';
COMMENT ON COLUMN corporate_accounts.inn IS 'Идентификационный номер налогоплательщика';
COMMENT ON COLUMN corporate_accounts.kpp IS 'Код причины постановки на учёт';
COMMENT ON COLUMN corporate_accounts.bank_details IS 'Банковские реквизиты';
COMMENT ON COLUMN corporate_accounts.postal_address IS 'Адрес для корреспонденции';
COMMENT ON COLUMN corporate_accounts.coordinator_name IS 'ФИО координатора';
COMMENT ON COLUMN corporate_accounts.coordinator_phone IS 'Телефон координатора';
COMMENT ON COLUMN corporate_accounts.coordinator_email IS 'Email координатора';
