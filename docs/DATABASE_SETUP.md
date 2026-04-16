# Техническое задание для развертывания базы данных Tour de Russie

## Требования к системе

### PostgreSQL
- **Версия**: PostgreSQL 14 или выше
- **Расширения**: uuid-ossp (для генерации UUID)
- **Кодировка**: UTF-8
- **Locale**: ru_RU.UTF-8 (рекомендуется)

### Ресурсы сервера
- **RAM**: минимум 2GB, рекомендуется 4GB+
- **Диск**: минимум 20GB SSD
- **CPU**: 2+ ядра

## Создание базы данных

### 1. Подключение к PostgreSQL

```bash
# Подключение от имени postgres
sudo -u postgres psql
```

### 2. Создание пользователя и базы данных

```sql
-- Создание пользователя
CREATE USER tour_de_russie_user WITH PASSWORD 'your_secure_password_here';

-- Создание базы данных
CREATE DATABASE tour_de_russie
  WITH OWNER = tour_de_russie_user
  ENCODING = 'UTF8'
  LC_COLLATE = 'ru_RU.UTF-8'
  LC_CTYPE = 'ru_RU.UTF-8'
  TEMPLATE = template0;

-- Предоставление прав
GRANT ALL PRIVILEGES ON DATABASE tour_de_russie TO tour_de_russie_user;

-- Подключение к базе
\c tour_de_russie

-- Предоставление прав на схему public
GRANT ALL ON SCHEMA public TO tour_de_russie_user;
```

### 3. Запуск миграций

```bash
# Из корня проекта
psql -U tour_de_russie_user -d tour_de_russie -f database/init.sql
```

Или через переменную окружения:

```bash
export DATABASE_URL="postgresql://tour_de_russie_user:your_password@localhost:5432/tour_de_russie"
psql $DATABASE_URL -f database/init.sql
```

## Структура базы данных

### Таблицы

1. **users** - Пользователи (аутентификация)
   - id (UUID, PK)
   - email (TEXT, UNIQUE)
   - password (TEXT, хешированный)
   - created_at, updated_at

2. **profiles** - Профили пользователей
   - id (UUID, PK, FK → users)
   - first_name, last_name, patronymic
   - date_of_birth, gender
   - phone, country, region, city
   - avatar_url, participation_type, team_name

3. **user_roles** - Роли пользователей
   - id (UUID, PK)
   - user_id (FK → users)
   - role (ENUM: participant, organizer, moderator, admin)

4. **emergency_contacts** - Экстренные контакты
   - id (UUID, PK)
   - user_id (FK → users)
   - name, phone, relationship

5. **health_certificates** - Справки о здоровье
   - id (UUID, PK)
   - user_id (FK → users)
   - issued_date, expiry_date
   - status (ENUM: active, expired, pending)
   - document_url

6. **user_consents** - Согласия пользователей
   - id (UUID, PK)
   - user_id (FK → users)
   - consent_type (ENUM: privacy_policy, waiver, photo_consent, terms_of_service)
   - accepted_at, document_version

7. **events** - Мероприятия
   - id (UUID, PK)
   - name, date, location
   - status (upcoming, completed, cancelled)

8. **event_distances** - Дистанции мероприятий
   - id (UUID, PK)
   - event_id (FK → events)
   - name, distance_km, price_kopecks

9. **event_registrations** - Регистрации на события
   - id (UUID, PK)
   - user_id (FK → users)
   - event_id (FK → events)
   - distance_id (FK → event_distances)
   - bib_number, payment_status

10. **event_results** - Результаты
    - id (UUID, PK)
    - registration_id (FK → event_registrations)
    - event_id, distance_id
    - place, finish_time, category, category_place

11. **corporate_applications** - Корпоративные заявки
    - id (UUID, PK)
    - company_name, contact_person, email, phone
    - participants_count, message
    - status (pending, approved, rejected)

12. **email_verification_codes** - Коды верификации email
    - id (UUID, PK)
    - email, code
    - created_at, expires_at
    - used, attempts

13. **newsletter_subscribers** - Подписчики рассылки
    - id (UUID, PK)
    - email, consented_at

### Индексы

Созданы индексы для оптимизации запросов:
- users(email)
- user_roles(user_id)
- emergency_contacts(user_id)
- health_certificates(user_id, status)
- events(date, status)
- event_registrations(user_id, event_id, payment_status)
- И другие...

## Настройка прав доступа

### Для production окружения

```sql
-- Отзываем все права на схему public
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Даём права только нашему пользователю
GRANT USAGE ON SCHEMA public TO tour_de_russie_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO tour_de_russie_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tour_de_russie_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO tour_de_russie_user;

-- Для будущих объектов
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO tour_de_russie_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO tour_de_russie_user;
```

## Настройка PostgreSQL для production

### postgresql.conf

```ini
# Память
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
maintenance_work_mem = 128MB

# Логирование
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000  # логировать запросы > 1 сек

# Производительность
max_connections = 100
random_page_cost = 1.1  # для SSD
effective_io_concurrency = 200  # для SSD

# Автовакуум
autovacuum = on
autovacuum_max_workers = 3
```

### pg_hba.conf

```
# TYPE  DATABASE        USER                    ADDRESS         METHOD
local   all             postgres                                peer
local   tour_de_russie  tour_de_russie_user                     md5
host    tour_de_russie  tour_de_russie_user     127.0.0.1/32    md5
host    tour_de_russie  tour_de_russie_user     ::1/128         md5
```

## Бэкапы

### Настройка автоматических бэкапов

```bash
#!/bin/bash
# /usr/local/bin/backup-tour-de-russie.sh

BACKUP_DIR="/var/backups/postgresql/tour_de_russie"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="tour_de_russie"
DB_USER="tour_de_russie_user"

mkdir -p $BACKUP_DIR

# Создание бэкапа
pg_dump -U $DB_USER -Fc $DB_NAME > $BACKUP_DIR/backup_$DATE.dump

# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "backup_*.dump" -mtime +30 -delete

# Логирование
echo "$(date): Backup completed - backup_$DATE.dump" >> $BACKUP_DIR/backup.log
```

### Cron задача

```bash
# Ежедневный бэкап в 3:00
0 3 * * * /usr/local/bin/backup-tour-de-russie.sh
```

### Восстановление из бэкапа

```bash
# Восстановление
pg_restore -U tour_de_russie_user -d tour_de_russie -c backup_20260227_030000.dump
```

## Мониторинг

### Полезные запросы для мониторинга

```sql
-- Размер базы данных
SELECT pg_size_pretty(pg_database_size('tour_de_russie'));

-- Размер таблиц
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Активные подключения
SELECT count(*) FROM pg_stat_activity WHERE datname = 'tour_de_russie';

-- Медленные запросы
SELECT
  pid,
  now() - query_start AS duration,
  query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '5 seconds';
```

## Рекомендации по российским хостингам

### Managed PostgreSQL сервисы

1. **Timeweb Cloud**
   - PostgreSQL 14, 15, 16
   - Автоматические бэкапы
   - Мониторинг
   - От 500₽/месяц

2. **Selectel**
   - Managed PostgreSQL
   - Репликация
   - Автобэкапы
   - От 800₽/месяц

3. **Yandex Cloud**
   - Managed Service for PostgreSQL
   - Высокая доступность
   - Автоматическое масштабирование
   - От 1000₽/месяц

4. **VK Cloud**
   - PostgreSQL кластеры
   - Автобэкапы
   - Мониторинг
   - От 700₽/месяц

### VPS для самостоятельной установки

1. **Timeweb VDS**
   - От 200₽/месяц
   - SSD диски
   - Дата-центры в России

2. **Selectel Cloud**
   - От 300₽/месяц
   - Гибкая конфигурация

## Безопасность

### Рекомендации

1. **Сильные пароли**: используйте пароли длиной 20+ символов
2. **Firewall**: ограничьте доступ к порту 5432 только с IP backend сервера
3. **SSL**: включите SSL соединения в production
4. **Регулярные обновления**: обновляйте PostgreSQL для получения патчей безопасности
5. **Аудит**: включите логирование всех подключений и запросов

### Включение SSL

```ini
# postgresql.conf
ssl = on
ssl_cert_file = '/path/to/server.crt'
ssl_key_file = '/path/to/server.key'
```

## Проверка установки

```bash
# Проверка подключения
psql -U tour_de_russie_user -d tour_de_russie -c "SELECT version();"

# Проверка таблиц
psql -U tour_de_russie_user -d tour_de_russie -c "\dt"

# Проверка данных
psql -U tour_de_russie_user -d tour_de_russie -c "SELECT * FROM events;"
```

## Поддержка

При возникновении проблем проверьте:
1. Логи PostgreSQL: `/var/log/postgresql/`
2. Права доступа к файлам
3. Настройки firewall
4. Доступность порта 5432
