-- Migration: Add payments table
-- Tour de Russie - Платежи через Robokassa

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  robokassa_inv_id INTEGER, -- Invoice ID from Robokassa
  amount_kopecks INTEGER NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  robokassa_payment_method TEXT,
  robokassa_currency TEXT,
  robokassa_fee_kopecks INTEGER,
  paid_at TIMESTAMPTZ,
  metadata JSONB, -- cart items, promo code info, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_robokassa_inv_id ON payments(robokassa_inv_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE payments IS 'Платежи через Robokassa';
COMMENT ON COLUMN payments.robokassa_inv_id IS 'ID инвойса в Robokassa';
COMMENT ON COLUMN payments.amount_kopecks IS 'Сумма в копейках';
COMMENT ON COLUMN payments.metadata IS 'Дополнительные данные: корзина, промокод и т.д.';
