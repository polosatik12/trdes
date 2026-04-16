# Руководство по развертыванию Tour de Russie

## Архитектура

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Nginx     │─────▶│   Node.js    │─────▶│ PostgreSQL   │
│  (Reverse   │      │   Backend    │      │   Database   │
│   Proxy)    │      │  (Express)   │      │              │
└─────────────┘      └──────────────┘      └──────────────┘
       │
       ▼
┌─────────────┐
│   React     │
│  Frontend   │
│  (Static)   │
└─────────────┘
```

## Требования к серверу

### Минимальные требования
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **CPU**: 2 ядра
- **RAM**: 4GB
- **Disk**: 40GB SSD
- **Network**: 100 Mbit/s

### Рекомендуемые требования
- **CPU**: 4 ядра
- **RAM**: 8GB
- **Disk**: 80GB SSD
- **Network**: 1 Gbit/s

### Программное обеспечение
- Node.js 18+ (LTS)
- PostgreSQL 14+
- Nginx 1.18+
- PM2 (для управления процессами)
- Git

## Установка зависимостей

### Ubuntu/Debian

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 14
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-14

# Nginx
sudo apt install -y nginx

# PM2
sudo npm install -g pm2

# Git
sudo apt install -y git
```

## Развертывание Backend

### 1. Клонирование репозитория

```bash
cd /var/www
sudo git clone <YOUR_REPO_URL> tour-de-russie
sudo chown -R $USER:$USER tour-de-russie
cd tour-de-russie
```

### 2. Установка зависимостей backend

```bash
cd backend
npm install
```

### 3. Настройка окружения

```bash
cp .env.example .env
nano .env
```

Заполните переменные:

```env
# Database
DATABASE_URL=postgresql://tour_de_russie_user:PASSWORD@localhost:5432/tour_de_russie
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
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=noreply@tourderussie.ru
SMTP_PASSWORD=your_smtp_password
SMTP_FROM="Tour de Russie <noreply@tourderussie.ru>"

# Frontend URL
FRONTEND_URL=https://tourderussie.ru

# Verification
VERIFICATION_CODE_EXPIRY_MINUTES=10
VERIFICATION_CODE_MAX_ATTEMPTS=5
```

### 4. Сборка backend

```bash
npm run build
```

### 5. Настройка PM2

```bash
# Создание ecosystem файла
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

# Создание директории для логов
mkdir -p logs

# Запуск приложения
pm2 start ecosystem.config.js

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

### 6. Проверка работы

```bash
# Статус
pm2 status

# Логи
pm2 logs tour-de-russie-api

# Мониторинг
pm2 monit

# Тест API
curl http://localhost:3000/health
```

## Развертывание Frontend

### 1. Установка зависимостей

```bash
cd /var/www/tour-de-russie
npm install
```

### 2. Настройка окружения

```bash
nano .env
```

```env
VITE_API_URL=https://api.tourderussie.ru
```

### 3. Сборка production

```bash
npm run build
```

Статические файлы будут в директории `dist/`

### 4. Копирование в Nginx директорию

```bash
sudo mkdir -p /var/www/html/tourderussie
sudo cp -r dist/* /var/www/html/tourderussie/
sudo chown -R www-data:www-data /var/www/html/tourderussie
```

## Настройка Nginx

### 1. Создание конфигурации

```bash
sudo nano /etc/nginx/sites-available/tourderussie
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.tourderussie.ru;

    client_max_body_size 10M;

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

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Статические файлы (загруженные документы)
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

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 2. Активация конфигурации

```bash
sudo ln -s /etc/nginx/sites-available/tourderussie /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL сертификаты (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификатов
sudo certbot --nginx -d tourderussie.ru -d www.tourderussie.ru -d api.tourderussie.ru

# Автообновление
sudo certbot renew --dry-run
```

После установки SSL Nginx автоматически обновит конфигурацию.

## Настройка Firewall

```bash
# UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Проверка
sudo ufw status
```

## Мониторинг и логирование

### PM2 мониторинг

```bash
# Установка PM2 Plus (опционально)
pm2 link <secret_key> <public_key>

# Веб-интерфейс
pm2 web
```

### Логи Nginx

```bash
# Access log
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log
```

### Логи приложения

```bash
# PM2 логи
pm2 logs tour-de-russie-api

# Логи в файлах
tail -f /var/www/tour-de-russie/backend/logs/out.log
tail -f /var/www/tour-de-russie/backend/logs/err.log
```

### Мониторинг PostgreSQL

```bash
# Подключение
sudo -u postgres psql

# Активные подключения
SELECT count(*) FROM pg_stat_activity WHERE datname = 'tour_de_russie';

# Размер БД
SELECT pg_size_pretty(pg_database_size('tour_de_russie'));
```

## Обновление приложения

### Backend

```bash
cd /var/www/tour-de-russie/backend
git pull
npm install
npm run build
pm2 restart tour-de-russie-api
```

### Frontend

```bash
cd /var/www/tour-de-russie
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/html/tourderussie/
```

### База данных (миграции)

```bash
cd /var/www/tour-de-russie
psql -U tour_de_russie_user -d tour_de_russie -f database/migration_new.sql
```

## Резервное копирование

### Скрипт автоматического бэкапа

```bash
sudo nano /usr/local/bin/backup-tour-de-russie.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/tour-de-russie"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR/{database,uploads,code}

# База данных
pg_dump -U tour_de_russie_user -Fc tour_de_russie > $BACKUP_DIR/database/db_$DATE.dump

# Загруженные файлы
tar -czf $BACKUP_DIR/uploads/uploads_$DATE.tar.gz -C /var/www/tour-de-russie/backend uploads/

# Код (опционально)
tar -czf $BACKUP_DIR/code/code_$DATE.tar.gz -C /var/www tour-de-russie/

# Удаление старых бэкапов (>30 дней)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "$(date): Backup completed" >> $BACKUP_DIR/backup.log
```

```bash
sudo chmod +x /usr/local/bin/backup-tour-de-russie.sh

# Cron (ежедневно в 3:00)
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/backup-tour-de-russie.sh") | crontab -
```

## Troubleshooting

### Backend не запускается

```bash
# Проверка логов
pm2 logs tour-de-russie-api --lines 100

# Проверка порта
sudo netstat -tulpn | grep 3000

# Проверка переменных окружения
pm2 env 0
```

### Ошибки подключения к БД

```bash
# Проверка PostgreSQL
sudo systemctl status postgresql

# Проверка подключения
psql -U tour_de_russie_user -d tour_de_russie -c "SELECT 1;"

# Логи PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Nginx ошибки

```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск
sudo systemctl restart nginx

# Логи
sudo tail -f /var/log/nginx/error.log
```

## Производительность

### Оптимизация Node.js

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'tour-de-russie-api',
    script: './dist/index.js',
    instances: 'max', // Использовать все CPU
    exec_mode: 'cluster',
    node_args: '--max-old-space-size=2048' // Увеличить heap
  }]
};
```

### Оптимизация Nginx

```nginx
# nginx.conf
worker_processes auto;
worker_connections 2048;

# Кэширование
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

# В server блоке
location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout http_500 http_502 http_503;
}
```

## Безопасность

### Рекомендации

1. **Регулярные обновления**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Fail2ban** (защита от брутфорса)
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

3. **Ограничение rate limit в Nginx**
   ```nginx
   limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

   location /api/ {
       limit_req zone=api_limit burst=20 nodelay;
   }
   ```

4. **Мониторинг безопасности**
   - Установите Lynis для аудита безопасности
   - Настройте уведомления о подозрительной активности

## Контакты поддержки

При возникновении проблем:
1. Проверьте логи (PM2, Nginx, PostgreSQL)
2. Проверьте документацию в `/docs`
3. Создайте issue в репозитории проекта
