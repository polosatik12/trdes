# CMS Admin Panel — Design Spec

## Overview

Блочная CMS (как WordPress Gutenberg) для управления всем контентом сайта Tour de Russie. Отдельная админка с собственной авторизацией, формами редактирования и превью.

## Architecture

### Storage
- PostgreSQL — 5 новых таблиц: `cms_pages`, `cms_blocks`, `cms_assets`, `cms_users`, `cms_versions`
- Файлы хранятся в `uploads/cms/`

### Block Types
| Type | Data | Used On |
|------|------|---------|
| `hero` | title, subtitle, backgroundImage, ctaText, ctaLink | Home, Events |
| `image_slider` | images[{src,alt}], autoPlay, speed | Home, Events |
| `text_section` | title, content, image?, alignment | Reglament, About |
| `image_gallery` | images[{src,alt}], columns | Media, Events |
| `card_grid` | title, cards[{image,title,text,link}] | Home, Partners |
| `info_bar` | items[{icon,label,value}] | Events |
| `cta_banner` | title, subtitle, buttonText, buttonLink, backgroundImage | Any |
| `partners_grid` | title, partners[{logo,name,url}] | Partners |
| `embed` | url, type, title | Route maps |
| `spacer` | height | Any |

### CMS Auth
- Отдельная таблица `cms_users` с bcrypt паролями
- Роли: `admin` (полный доступ), `editor` (только контент)
- JWT-токен, отдельный от основного
- Логин на `/cms/login`

### API Endpoints
```
POST   /api/cms/auth/login
POST   /api/cms/auth/logout

GET    /api/cms/pages                          — список страниц
GET    /api/cms/page/:slug                     — публичный: страница с блоками
GET    /api/cms/pages/:id                      — админ: страница по ID
POST   /api/cms/pages                          — создать страницу
PUT    /api/cms/pages/:id                      — обновить страницу
DELETE /api/cms/pages/:id                      — удалить страницу

GET    /api/cms/pages/:id/blocks               — блоки страницы
PUT    /api/cms/pages/:id/blocks               — обновить все блоки (порядок + данные)
POST   /api/cms/blocks                         — создать блок
PUT    /api/cms/blocks/:id                     — обновить блок
DELETE /api/cms/blocks/:id                     — удалить блок

GET    /api/cms/assets                         — список файлов
POST   /api/cms/assets                         — загрузить файл
DELETE /api/cms/assets/:id                     — удалить файл

POST   /api/cms/preview                        — рендер превью блока (без сохранения)
```

### Frontend CMS Pages
- `/cms/login` — логин
- `/cms` — список страниц (dashboard)
- `/cms/pages/:id` — редактор страницы (аккордеон блоков, drag&drop)
- `/cms/news` — список новостей
- `/cms/news/new` и `/cms/news/:id` — редактор новостей
- `/cms/media` — медиатека (grid файлов с upload)

### Frontend Integration
- `CMSBlockRenderer` — компонент, маппит block_type → React-компонент
- Страницы загружают данные через `GET /api/cms/page/:slug`
- Fallback: если CMS-данные недоступны, рендерить статический контент
