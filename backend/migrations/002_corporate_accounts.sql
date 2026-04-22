-- Corporate Accounts Tables

-- Corporate Accounts (организации)
CREATE TABLE IF NOT EXISTS corporate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_full_name TEXT NOT NULL,
  company_short_name TEXT NOT NULL,
  ogrn TEXT,
  inn TEXT NOT NULL UNIQUE,
  kpp TEXT,
  bank_details JSONB,
  postal_address TEXT,
  coordinator_name TEXT NOT NULL,
  coordinator_phone TEXT NOT NULL,
  coordinator_email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Corporate Members (участники корпоративного аккаунта)
CREATE TABLE IF NOT EXISTS corporate_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  patronymic TEXT,
  date_of_birth DATE,
  gender TEXT,
  phone TEXT,
  email TEXT,
  position TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'rejected')),
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_corporate_accounts_user_id ON corporate_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_corporate_accounts_inn ON corporate_accounts(inn);
CREATE INDEX IF NOT EXISTS idx_corporate_members_account_id ON corporate_members(corporate_account_id);

-- Updated_at triggers
CREATE TRIGGER update_corporate_accounts_updated_at
  BEFORE UPDATE ON corporate_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_corporate_members_updated_at
  BEFORE UPDATE ON corporate_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
