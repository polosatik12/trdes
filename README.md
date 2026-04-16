# Tour de Russie - Frontend

Фронтенд проект для Tour de Russie на React + TypeScript + Vite.

## Установка на сервере

### 1. Установите Node.js
Убедитесь, что установлена версия Node.js 18 или выше:
```bash
node --version
```

### 2. Установите зависимости
```bash
npm install
```

### 3. Настройте переменные окружения
Создайте файл `.env.production` в корне проекта:
```bash
VITE_API_URL=https://tourderussie.ru/api
VITE_FRONTEND_URL=https://tourderussie.ru
```

### 4. Соберите проект
```bash
npm run build
```

Папка `dist` будет содержать готовые статические файлы для деплоя.

### 5. Настройте веб-сервер
Настройте nginx или apache для обслуживания файлов из папки `dist`.

Пример конфигурации nginx:
```nginx
server {
    listen 80;
    server_name tourderussie.ru;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Локальная разработка

### 1. Создайте файл `.env.local`
```bash
VITE_API_URL=http://localhost:3000/api
VITE_FRONTEND_URL=http://localhost:8080
```

### 2. Запустите dev-сервер
```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:8080`

## Структура проекта

```
├── src/
│   ├── components/     # React компоненты
│   ├── pages/          # Страницы приложения
│   ├── lib/            # Утилиты и API клиент
│   ├── assets/         # Изображения и SVG
│   ├── data/           # Статические данные
│   └── App.tsx         # Главный компонент
├── public/             # Статические файлы
│   ├── documents/      # PDF документы
│   ├── fonts/          # Шрифты
│   └── images/         # Изображения
├── dist/               # Собранный проект (после build)
└── .env.production     # Переменные окружения для продакшена
```

## Подключение к бекенду

Фронтенд использует переменную окружения `VITE_API_URL` для подключения к API.

Все API запросы идут через `src/lib/api.ts`, который предоставляет методы для:
- Аутентификации (`/api/auth`)
- Профиля пользователя (`/api/profile`)
- Событий (`/api/events`)
- Регистраций (`/api/registrations`)
- Корпоративных заявок (`/api/corporate`)

## Технологии

- **Vite** - сборщик и dev-сервер
- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **shadcn/ui** - UI компоненты
- **React Router** - маршрутизация
- **React Hook Form** - формы
- **Zod** - валидация

## Команды

```bash
npm run dev          # Запуск dev-сервера
npm run build        # Сборка для продакшена
npm run preview      # Предпросмотр собранного проекта
npm run lint         # Проверка кода
```

## Деплой

После выполнения `npm run build` загрузите содержимое папки `dist` на ваш сервер.

Убедитесь, что:
1. Веб-сервер настроен на обслуживание SPA (все запросы перенаправляются на index.html)
2. API доступен по адресу, указанному в `VITE_API_URL`
3. CORS настроен на бекенде для вашего домена
