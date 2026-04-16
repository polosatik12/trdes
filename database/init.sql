-- Tour de Russie 
-- PostgreSQL 14+

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- Роли пользователей
CREATE TYPE app_role AS ENUM ('participant', 'organizer', 'moderator', 'admin');

-- Пол
CREATE TYPE gender_type AS ENUM ('male', 'female');

-- Типы согласий
CREATE TYPE consent_type AS ENUM ('privacy_policy', 'waiver', 'photo_consent', 'terms_of_service');

-- Статус справки о здоровье
CREATE TYPE health_certificate_status AS ENUM ('active', 'expired', 'pending');

-- Статус корпоративной заявки
CREATE TYPE corporate_application_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================
-- TABLES
-- ============================================

-- Таблица пользователей (аутентификация)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Таблица профилей пользователей
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  patronymic TEXT,
  date_of_birth DATE,
  gender gender_type,
  phone TEXT,
  country TEXT DEFAULT 'Россия',
  region TEXT,
  city TEXT,
  avatar_url TEXT,
  participation_type TEXT,
  team_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица ролей (ОТДЕЛЬНО для безопасности!)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'participant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Таблица экстренных контактов
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);

-- Таблица справок о здоровье
CREATE TABLE health_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  issued_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status health_certificate_status NOT NULL DEFAULT 'pending',
  document_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_certificates_user_id ON health_certificates(user_id);
CREATE INDEX idx_health_certificates_status ON health_certificates(status);

-- Таблица согласий и вейверов
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  consent_type consent_type NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  document_version TEXT DEFAULT '1.0',
  UNIQUE (user_id, consent_type)
);

CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);

-- Таблица мероприятий
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);

-- Таблица дистанций мероприятия
CREATE TABLE event_distances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  distance_km INTEGER NOT NULL,
  price_kopecks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_distances_event_id ON event_distances(event_id);

-- Таблица регистраций (участник оплатил дистанцию -> попадает в списки)
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  distance_id UUID NOT NULL REFERENCES event_distances(id) ON DELETE CASCADE,
  bib_number INTEGER,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, distance_id)
);

CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_payment_status ON event_registrations(payment_status);

-- Таблица результатов (заполняется после гонки)
CREATE TABLE event_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  distance_id UUID NOT NULL REFERENCES event_distances(id) ON DELETE CASCADE,
  place INTEGER,
  finish_time INTERVAL,
  category TEXT,
  category_place INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(registration_id)
);

CREATE INDEX idx_event_results_event_id ON event_results(event_id);
CREATE INDEX idx_event_results_distance_id ON event_results(distance_id);

-- Таблица корпоративных заявок
CREATE TABLE corporate_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  participants_count INTEGER NOT NULL,
  message TEXT,
  status corporate_application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_corporate_applications_status ON corporate_applications(status);

-- Таблица для хранения кодов верификации email
CREATE TABLE email_verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  used BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_email_verification_codes_email ON email_verification_codes(email);
CREATE INDEX idx_email_verification_codes_expires_at ON email_verification_codes(expires_at);

-- Таблица подписчиков рассылки
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Создаём профиль
  INSERT INTO profiles (id)
  VALUES (NEW.id);

  -- Назначаем роль participant по умолчанию
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'participant');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Функция проверки роли
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Функция для очистки истёкших кодов верификации
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM email_verification_codes
  WHERE expires_at < NOW() OR used = true;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Триггеры для auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_certificates_updated_at
  BEFORE UPDATE ON health_certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Триггер создания профиля при регистрации
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SEED DATA (тестовые данные)
-- ============================================

-- Добавим тестовое мероприятие для Суздаля
INSERT INTO events (id, name, date, location, status) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tour de Russie: Суздаль', '2026-06-07', 'Суздаль, Владимирская область', 'upcoming');

INSERT INTO event_distances (id, event_id, name, distance_km, price_kopecks) VALUES
  ('d1a1a1a1-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Велогонка 114 км', 114, 500000),
  ('d2b2b2b2-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Велогонка 60 км', 60, 400000),
  ('d3c3c3c3-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Велогонка 25 км', 25, 300000);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Таблица пользователей для аутентификации';
COMMENT ON TABLE profiles IS 'Профили пользователей с персональными данными';
COMMENT ON TABLE user_roles IS 'Роли пользователей в системе';
COMMENT ON TABLE events IS 'Мероприятия (велогонки)';
COMMENT ON TABLE event_distances IS 'Дистанции для каждого мероприятия';
COMMENT ON TABLE event_registrations IS 'Регистрации участников на дистанции';
COMMENT ON TABLE event_results IS 'Результаты участников после завершения гонки';
COMMENT ON TABLE health_certificates IS 'Справки о здоровье участников';
COMMENT ON TABLE corporate_applications IS 'Заявки на корпоративное участие';
COMMENT ON TABLE email_verification_codes IS 'Коды для верификации email при регистрации';
