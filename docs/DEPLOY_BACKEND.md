# Развёртывание бэкенда Tour de Russie на сервере

## 1. Подготовка сервера

### Требования
- Ubuntu 20.04+ / Debian 11+
- Node.js 18+ (LTS)
- PostgreSQL 14+
- PM2 (`npm install -g pm2`)
- Nginx

### Установка зависимостей
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs postgresql nginx
sudo npm install -g pm2
```

---

## 2. Развёртывание кода

```bash
# Создаём директорию
sudo mkdir -p /var/www/tour-de-russie
sudo chown -R $USER:$USER /var/www/tour-de-russie
cd /var/www/tour-de-russie

# Клонируем репозиторий (или копируем файлы)
git clone <YOUR_REPO_URL> .

# Устанавливаем зависимости бэкенда
cd backend
npm install

# Собираем TypeScript
npm run build
```

---

## 3. Настройка переменных окружения

Создайте файл `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tour_de_russie
DB_USER=tour_de_russie_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production

# SMTP
SMTP_HOST=smtp.beget.com
SMTP_PORT=465
SMTP_USER=qaut@tourderussie.ru
SMTP_PASSWORD=your_smtp_password
SMTP_FROM="Tour de Russie <qaut@tourderussie.ru>"

# Frontend URL (для CORS)
FRONTEND_URL=https://tourderussie.ru

# Robokassa
ROBOKASSA_MERCHANT_LOGIN=your_merchant_login
ROBOKASSA_PASSWORD_1=your_password_1
ROBOKASSA_PASSWORD_2=your_password_2
ROBOKASSA_URL=https://auth.robokassa.ru/Merchant/Index.aspx
ROBOKASSA_API_URL=https://services.robokassa.ru/InvoiceServiceWebApi/api
ROBOKASSA_TEST_MODE=false

# Yandex OAuth
YANDEX_CLIENT_ID=your_yandex_client_id
YANDEX_CLIENT_SECRET=your_yandex_client_secret
YANDEX_REDIRECT_URI=https://tourderussie.ru/auth/yandex/callback

# Verification
VERIFICATION_CODE_EXPIRY_MINUTES=10
VERIFICATION_CODE_MAX_ATTEMPTS=5
```

---

## 4. Создание базы данных и накатка миграций

### 4.1. Создание БД и пользователя

```bash
sudo -u postgres psql
```

```sql
-- Создание пользователя
CREATE USER tour_de_russie_user WITH PASSWORD 'your_secure_password';

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

### 4.2. Накатка миграций (строго по порядку!)

```bash
cd /var/www/tour-de-russie

# 1. Основная схема (таблицы users, profiles, events, registrations и т.д.)
psql -U tour_de_russie_user -d tour_de_russie -f database/init.sql

# 2. Корпоративные аккаунты (таблицы corporate_accounts, corporate_members)
psql -U tour_de_russie_user -d tour_de_russie -f database/migrations/001_add_corporate_accounts.sql

# 3. Промокоды (таблица promo_codes)
psql -U tour_de_russie_user -d tour_de_russie -f database/migrations/002_add_promo_codes.sql

# 4. Платежи (таблица payments)
psql -U tour_de_russie_user -d tour_de_russie -f database/migrations/003_add_payments.sql

# 5. Социальные логины (таблица user_social_logins для Яндекс OAuth)
psql -U tour_de_russie_user -d tour_de_russie -f database/migrations/004_add_social_logins.sql
```

### 4.3. Проверка

```bash
psql -U tour_de_russie_user -d tour_de_russie -c "\dt"
```

Должны быть видны все таблицы: `users`, `profiles`, `events`, `corporate_accounts`, `promo_codes`, `payments` и т.д.

---

## 5. Запуск бэкенда через PM2

### 5.1. Создание директории для логов

```bash
cd /var/www/tour-de-russie/backend
mkdir -p logs
```

### 5.2. Создание ecosystem файла

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tour-de-russie-api',
    script: './dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
};
EOF
```

### 5.3. Запуск

```bash
cd /var/www/tour-de-russie/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5.4. Проверка

```bash
pm2 status
pm2 logs tour-de-russie-api
curl http://localhost:3000/health
```

---

## 6. Настройка Nginx

### 6.1. Создание конфигурации

```bash
sudo nano /etc/nginx/sites-available/tourderussie
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.tourderussie.ru;

    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Статические файлы (загруженные документы, CMS ассеты)
    location /uploads {
        alias /var/www/tour-de-russie/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Frontend
server {
    listen 80;
    server_name tourderussie.ru www.tourderussie.ru;

    root /var/www/html/tourderussie;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

### 6.2. Активация

```bash
sudo ln -s /etc/nginx/sites-available/tourderussie /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6.3. SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tourderussie.ru -d www.tourderussie.ru -d api.tourderussie.ru
```

---

## 7. Настройка Robokassa в личном кабинете

В [кабинете Robokassa](https://merchant.roboxchange.com/) в настройках магазина:

| Параметр | Значение |
|---|---|
| **ResultURL** | `https://api.tourderussie.ru/api/payments/robokassa/result` (POST) |
| **SuccessURL** | `https://tourderussie.ru/dashboard/payments/success` (GET) |
| **FailURL** | `https://tourderussie.ru/dashboard/payments/failed` (GET) |
| **Алгоритм хеша** | MD5 (по умолчанию) |

---

## 8. Настройка Яндекс OAuth

### 8.1. Создание приложения в Яндекс ID

1. Зайди в [Яндекс OAuth](https://oauth.yandex.ru/)
2. Нажми **«Создать приложение»**
3. Заполни:
   - **Название**: Tour de Russie
   - **Платформы**: Web-сервисы
   - **Redirect URI**: `https://tourderussie.ru/auth/yandex/callback`
   - **Разрешения (scopes)**:
     - `login:email` — доступ к email
     - `login:info` — доступ к базовой информации (имя)
4. Нажми **«Создать»**
5. Скопируй **ID приложения** и **Пароль приложения**

### 8.2. Заполнение переменных

В `backend/.env`:

```env
YANDEX_CLIENT_ID=ID_приложения_из_кабинета_Яндекс
YANDEX_CLIENT_SECRET=Пароль_приложения_из_кабинета_Яндекс
YANDEX_REDIRECT_URI=https://tourderussie.ru/auth/yandex/callback
```

### 8.3. Как работает

1. Пользователь нажимает «Войти через Яндекс» на странице входа
2. Перенаправляется на Яндекс OAuth → авторизуется
3. Яндекс возвращает код на `/auth/yandex/callback`
4. Бэкенд обменивает код на токен → получает email и имя
5. Если пользователь уже есть — входит, если нет — создаёт аккаунт
6. Перенаправляет на `/dashboard`

---

## 8. Swagger для тестирования API

Бэкенд не имеет встроенного Swagger. Для тестирования эндпоинтов используйте:

### Вариант A: Postman / Insomnia
Импортируйте коллекцию из `docs/API.md` — там описаны все эндпоинты.

### Вариант B: curl

```bash
# Health check
curl https://api.tourderussie.ru/health

# Регистрация
curl -X POST https://api.tourderussie.ru/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Вход
curl -X POST https://api.tourderussie.ru/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Получение событий
curl https://api.tourderussie.ru/api/events

# Валидация промокода
curl -X POST https://api.tourderussie.ru/api/promo-codes/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"EARLY2026"}'
```

### Вариант C: Добавить Swagger в бэкенд (опционально)

Если нужен Swagger UI на сервере:

```bash
cd /var/www/tour-de-russie/backend
npm install swagger-jsdoc swagger-ui-express
```

Затем добавить в `backend/src/index.ts`:

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Tour de Russie API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

Swagger будет доступен по `https://api.tourderussie.ru/api-docs`

---

## 9. Полезные команды

```bash
# Статус PM2
pm2 status

# Логи
pm2 logs tour-de-russie-api

# Перезапуск
pm2 restart tour-de-russie-api

# Мониторинг
pm2 monit

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Проверка подключения к БД
psql -U tour_de_russie_user -d tour_de_russie -c "SELECT count(*) FROM users;"
```

---

## 10. Обновление бэкенда

```bash
cd /var/www/tour-de-russie
git pull
cd backend
npm install
npm run build
pm2 restart tour-de-russie-api
```

---

## 11. Бэкапы

```bash
# Бэкап базы данных
pg_dump -U tour_de_russie_user -Fc tour_de_russie > /var/backups/tour_de_russie_$(date +%Y%m%d).dump

# Восстановление
pg_restore -U tour_de_russie_user -d tour_de_russie -c /var/backups/tour_de_russie_20260416.dump
```
