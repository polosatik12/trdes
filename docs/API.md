# API Documentation - Tour de Russie

## Base URL

```
Development: http://localhost:3000
Production: https://api.tourderussie.ru
```

## Authentication

API использует JWT токены для аутентификации.

### Получение токена

После успешного логина или регистрации сервер возвращает JWT токен:

```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Использование токена

Добавьте токен в заголовок Authorization:

```
Authorization: Bearer <token>
```

## Rate Limiting

- **API общий**: 100 запросов / 15 минут
- **Аутентификация**: 5 попыток / 15 минут
- **Email отправка**: 2 запроса / 1 минута
- **Загрузка файлов**: 10 загрузок / 1 час

## Endpoints

### Authentication

#### POST /api/auth/send-verification-code

Отправка кода верификации на email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true
}
```

**Errors:**
- `400` - Некорректный email
- `500` - Ошибка отправки письма

---

#### POST /api/auth/verify-code

Проверка кода верификации.

**Request:**
```json
{
  "email": "user@example.com",
  "code": "1234"
}
```

**Response:**
```json
{
  "success": true
}
```

**Errors:**
- `400` - Код не найден, истёк или неверный
- `400` - Превышено количество попыток

---

#### POST /api/auth/register

Регистрация нового пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt_token"
}
```

**Errors:**
- `400` - Пользователь уже существует
- `400` - Некорректные данные

---

#### POST /api/auth/login

Вход в систему.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt_token"
}
```

**Errors:**
- `401` - Неверный email или пароль

---

#### GET /api/auth/me

Получение текущего пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Иван",
    "last_name": "Иванов",
    "role": "participant"
  }
}
```

---

### Profile

#### GET /api/profile

Получение профиля текущего пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "first_name": "Иван",
    "last_name": "Иванов",
    "patronymic": "Иванович",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "phone": "+79001234567",
    "country": "Россия",
    "region": "Московская область",
    "city": "Москва",
    "participation_type": "individual",
    "team_name": null
  }
}
```

---

#### PUT /api/profile

Обновление профиля.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "first_name": "Иван",
  "last_name": "Иванов",
  "phone": "+79001234567",
  "city": "Москва"
}
```

**Response:**
```json
{
  "profile": { /* updated profile */ }
}
```

---

#### GET /api/profile/emergency-contacts

Получение экстренных контактов.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "contacts": [
    {
      "id": "uuid",
      "name": "Мария Иванова",
      "phone": "+79009876543",
      "relationship": "жена"
    }
  ]
}
```

---

### Events

#### GET /api/events

Получение списка мероприятий.

**Query Parameters:**
- `status` (optional): `upcoming`, `completed`, `cancelled`

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "name": "Tour de Russie: Суздаль",
      "date": "2026-06-07",
      "location": "Суздаль, Владимирская область",
      "status": "upcoming"
    }
  ]
}
```

---

#### GET /api/events/:id

Получение мероприятия по ID.

**Response:**
```json
{
  "event": {
    "id": "uuid",
    "name": "Tour de Russie: Суздаль",
    "date": "2026-06-07",
    "location": "Суздаль, Владимирская область",
    "status": "upcoming"
  }
}
```

---

#### GET /api/events/:id/distances

Получение дистанций мероприятия.

**Response:**
```json
{
  "distances": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "name": "Велогонка 114 км",
      "distance_km": 114,
      "price_kopecks": 500000
    }
  ]
}
```

---

#### GET /api/events/:id/results

Получение результатов мероприятия.

**Query Parameters:**
- `distance_id` (optional): фильтр по дистанции

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "bib_number": 123,
      "first_name": "Иван",
      "last_name": "Иванов",
      "city": "Москва",
      "team_name": "Team A",
      "distance_name": "Велогонка 114 км",
      "place": 1,
      "finish_time": "03:45:30",
      "category": "М 18-39",
      "category_place": 1
    }
  ]
}
```

---

### Registrations

#### GET /api/registrations

Получение регистраций текущего пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "registrations": [
    {
      "id": "uuid",
      "event_name": "Tour de Russie: Суздаль",
      "event_date": "2026-06-07",
      "distance_name": "Велогонка 114 км",
      "distance_km": 114,
      "payment_status": "paid",
      "bib_number": 123
    }
  ]
}
```

---

#### POST /api/registrations

Создание новой регистрации.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "event_id": "uuid",
  "distance_id": "uuid"
}
```

**Response:**
```json
{
  "registration": {
    "id": "uuid",
    "user_id": "uuid",
    "event_id": "uuid",
    "distance_id": "uuid",
    "payment_status": "pending"
  }
}
```

**Errors:**
- `400` - Уже зарегистрированы на эту дистанцию

---

### Health Certificates

#### GET /api/health-certificates

Получение справок о здоровье.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "certificates": [
    {
      "id": "uuid",
      "issued_date": "2026-01-01",
      "expiry_date": "2026-12-31",
      "status": "active",
      "document_url": "/uploads/user-id/document.pdf"
    }
  ]
}
```

---

#### POST /api/health-certificates/upload

Загрузка документа справки.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request:**
```
FormData:
  document: File (max 10MB, JPG/PNG/PDF)
```

**Response:**
```json
{
  "success": true,
  "url": "/uploads/user-id/document-123456.pdf",
  "filename": "document-123456.pdf",
  "size": 1024000
}
```

**Errors:**
- `400` - Недопустимый тип файла
- `400` - Файл слишком большой

---

### Corporate

#### POST /api/corporate/applications

Создание корпоративной заявки (публичный endpoint).

**Request:**
```json
{
  "company_name": "ООО Компания",
  "contact_person": "Иван Иванов",
  "email": "company@example.com",
  "phone": "+79001234567",
  "participants_count": 50,
  "message": "Хотим участвовать командой"
}
```

**Response:**
```json
{
  "application": {
    "id": "uuid",
    "status": "pending"
  }
}
```

---

### Admin (требуется роль admin/organizer)

#### GET /api/admin/participants

Получение всех участников.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "participants": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "Иван",
      "last_name": "Иванов",
      "phone": "+79001234567",
      "role": "participant"
    }
  ]
}
```

---

#### GET /api/admin/registrations

Получение всех регистраций.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `event_id` (optional)
- `payment_status` (optional)

**Response:**
```json
{
  "registrations": [
    {
      "id": "uuid",
      "first_name": "Иван",
      "last_name": "Иванов",
      "email": "user@example.com",
      "event_name": "Tour de Russie: Суздаль",
      "distance_name": "Велогонка 114 км",
      "payment_status": "paid",
      "bib_number": 123
    }
  ]
}
```

---

#### PUT /api/admin/registrations/:id

Обновление регистрации.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "payment_status": "paid",
  "bib_number": 123
}
```

---

#### GET /api/admin/health-certificates

Получение всех справок о здоровье.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): `active`, `expired`, `pending`

---

#### PUT /api/admin/health-certificates/:id

Обновление статуса справки.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "status": "active"
}
```

---

## Error Responses

Все ошибки возвращаются в формате:

```json
{
  "error": "Описание ошибки",
  "status": "error"
}
```

### HTTP Status Codes

- `200` - OK
- `400` - Bad Request (некорректные данные)
- `401` - Unauthorized (требуется аутентификация)
- `403` - Forbidden (недостаточно прав)
- `404` - Not Found
- `429` - Too Many Requests (превышен rate limit)
- `500` - Internal Server Error

## Examples

### JavaScript (axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавление токена
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Регистрация
const register = async (email, password) => {
  const { data } = await api.post('/api/auth/register', { email, password });
  localStorage.setItem('token', data.token);
  return data;
};

// Получение событий
const getEvents = async () => {
  const { data } = await api.get('/api/events');
  return data.events;
};
```

### cURL

```bash
# Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Получение профиля
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer <token>"

# Загрузка файла
curl -X POST http://localhost:3000/api/health-certificates/upload \
  -H "Authorization: Bearer <token>" \
  -F "document=@/path/to/file.pdf"
```
