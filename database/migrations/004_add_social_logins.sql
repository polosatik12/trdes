-- Migration: Add social login support (Yandex OAuth)
-- Tour de Russie - Социальные логины

CREATE TABLE IF NOT EXISTS user_social_logins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('yandex', 'google', 'vk')),
  provider_user_id TEXT NOT NULL,
  provider_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, provider)
);

CREATE INDEX idx_user_social_logins_user_id ON user_social_logins(user_id);
CREATE INDEX idx_user_social_logins_provider ON user_social_logins(provider, provider_user_id);

COMMENT ON TABLE user_social_logins IS 'Привязка социальных аккаунтов к пользователям';
COMMENT ON COLUMN user_social_logins.provider IS 'Провайдер: yandex, google, vk';
COMMENT ON COLUMN user_social_logins.provider_user_id IS 'ID пользователя в социальной сети';
