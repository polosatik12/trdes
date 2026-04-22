# Тестовый аккаунт для личного кабинета

## Учетные данные

```
Email: test@tourderussie.ru
Пароль: Test123!@#
Имя: Тестовый
Фамилия: Пользователь
Дата рождения: 01.01.1990
```

## SQL скрипт для создания тестового пользователя

Выполните этот SQL запрос в вашей базе данных PostgreSQL:

```sql
-- Создание тестового пользователя
-- Пароль: Test123!@# (хеш bcrypt)
-- ВАЖНО: Замените хеш ниже на реальный, сгенерированный через bcrypt
INSERT INTO users (
  email,
  password,
  created_at,
  updated_at
) VALUES (
  'test@tourderussie.ru',
  '$2b$10$YourActualBcryptHashHere',  -- Замените на реальный хеш
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Создание профиля для тестового пользователя
-- Замените {user_id} на ID, полученный из предыдущего запроса
INSERT INTO profiles (
  id,
  first_name,
  last_name,
  date_of_birth,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM users WHERE email = 'test@tourderussie.ru'),
  'Тестовый',
  'Пользователь',
  '1990-01-01',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Роль participant создается автоматически через триггер handle_new_user()
```

## Альтернативный способ: Через Node.js скрипт

Если у вас есть доступ к серверу с бекендом, создайте файл `create-test-user.js`:

```javascript
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'tour_de_russie',
  user: 'your_db_user',
  password: 'your_db_password'
});

async function createTestUser() {
  const email = 'test@tourderussie.ru';
  const password = 'Test123!@#';
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // Создаем пользователя
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, email_verified, created_at, updated_at)
       VALUES ($1, $2, true, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id`,
      [email, passwordHash]
    );

    const userId = userResult.rows[0].id;

    // Создаем профиль
    await pool.query(
      `INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET first_name = $2, last_name = $3, date_of_birth = $4`,
      [userId, 'Тестовый', 'Пользователь', '1990-01-01']
    );

    console.log('✅ Тестовый пользователь создан успешно!');
    console.log('Email:', email);
    console.log('Пароль:', password);
  } catch (error) {
    console.error('❌ Ошибка при создании пользователя:', error);
  } finally {
    await pool.end();
  }
}

createTestUser();
```

Запустите скрипт:
```bash
node create-test-user.js
```

## Проверка работы

После создания тестового пользователя:

1. Откройте https://tourderussie.ru/login
2. Введите:
   - Email: `test@tourderussie.ru`
   - Пароль: `Test123!@#`
3. Нажмите "Войти"
4. Вы должны попасть в личный кабинет

## Примечания

- Пароль соответствует всем требованиям валидации:
  - Минимум 8 символов ✓
  - Содержит заглавные буквы (T) ✓
  - Содержит строчные буквы (est) ✓
  - Содержит цифры (123) ✓
  - Содержит спецсимволы (!@#) ✓

- Email помечен как подтвержденный (`email_verified = true`), поэтому не требуется верификация

- Дата рождения установлена на 01.01.1990 (возраст 36 лет, что соответствует требованию 18+)

## Безопасность

⚠️ **ВАЖНО**: Этот аккаунт предназначен только для тестирования.

- Не используйте его в продакшене
- Удалите или измените пароль перед запуском в production
- Используйте сильные уникальные пароли для реальных аккаунтов
