# ✅ Проверка перед перезапуском

## Что было исправлено:

### 1. API Client (src/lib/api.ts)
```javascript
baseURL: 'https://tourderussie.ru/api'  // ✓ Правильно
withCredentials: false                   // ✓ Исправлено (было true)
```

### 2. Все endpoints без дубликата /api:
- ✓ authAPI: /auth/login, /auth/register, /auth/send-verification-code
- ✓ eventsAPI: /events, /events/{id}/distances, /events/{id}/results  
- ✓ profileAPI: /profile, /profile/emergency-contacts
- ✓ registrationsAPI: /registrations
- ✓ healthCertificatesAPI: /health-certificates
- ✓ corporateAPI: /corporate/applications
- ✓ adminAPI: все админские endpoints

### 3. Environment (.env.local)
```
VITE_API_URL=https://tourderussie.ru/api  // ✓ Правильно
```

### 4. Fallback URLs исправлены:
- ✓ Contact.tsx
- ✓ CorporateApplicationForm.tsx
- ✓ SwaggerUI.tsx

### 5. Build
```
✓ built in 12.96s  // ✓ Успешно
```

---

## 🚀 Как перезапустить:

### Шаг 1: Остановить
В терминале где запущен `npm run dev`:
```bash
Ctrl+C
```

### Шаг 2: Запустить
```bash
cd c:/Users/Resteko/Desktop/dddtourderussie/indesign-to-html-main
npm run dev
```

### Шаг 3: Проверить
Откройте браузер:
```
http://localhost:8080/test-api.html
```

Нажмите кнопки для проверки API.

---

## 🧪 Тестирование

### Тест 1: API доступен
```bash
curl https://tourderussie.ru/api/events
```
Должен вернуть список событий.

### Тест 2: Отправка кода
```bash
curl -X POST https://tourderussie.ru/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```
Должен вернуть: `{"success":true}`

### Тест 3: В браузере
1. Откройте http://localhost:8080/test-api.html
2. Нажмите "Отправить код"
3. Должно показать ✅ Успех

---

## ❌ Если не работает

### Проверьте в DevTools (F12):

1. **Console** - выполните:
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```
   Должно показать: `https://tourderussie.ru/api`

2. **Network** - попробуйте зарегистрироваться:
   - Найдите запрос к `/auth/send-verification-code`
   - Проверьте Request URL
   - Должен быть: `https://tourderussie.ru/api/auth/send-verification-code`
   - НЕ должен быть: `https://tourderussie.ru/api/api/auth/...`

3. **Ошибка CORS?**
   Если видите ошибку типа:
   ```
   Access to fetch at '...' from origin 'http://localhost:8080' 
   has been blocked by CORS policy
   ```
   
   Это значит backend не настроен для localhost:8080.
   Покажите мне полную ошибку.

---

## 📝 Что делать дальше

После перезапуска сервера:

1. ✅ Тесты на /test-api.html работают → Попробуйте регистрацию
2. ❌ Тесты не работают → Покажите ошибку из DevTools
3. ❌ Регистрация не работает → Покажите ошибку из Network tab

