-- Migration: Add promo codes support
-- Tour de Russie - Промокоды

-- ============================================
-- TABLES
-- ============================================

-- Таблица промокодов
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  description TEXT,
  max_uses INTEGER, -- NULL = без ограничений
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ, -- NULL = без срока
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_is_active ON promo_codes(is_active);
CREATE INDEX idx_promo_codes_expires_at ON promo_codes(expires_at);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE promo_codes IS 'Промокоды для скидок на участие';
COMMENT ON COLUMN promo_codes.code IS 'Код промокода (уникальный)';
COMMENT ON COLUMN promo_codes.discount_percent IS 'Процент скидки (1-100)';
COMMENT ON COLUMN promo_codes.max_uses IS 'Максимальное количество использований (NULL = без ограничений)';
COMMENT ON COLUMN promo_codes.used_count IS 'Количество использований';
COMMENT ON COLUMN promo_codes.expires_at IS 'Срок действия (NULL = бессрочно)';
