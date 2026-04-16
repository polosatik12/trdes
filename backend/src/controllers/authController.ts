import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { sendVerificationCode as sendEmail } from '../services/email';
import { AuthRequest } from '../middleware/auth';

const emailSchema = z.string().email('Некорректный email');
const passwordSchema = z.string().min(6, 'Пароль должен быть не менее 6 символов');

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export const sendVerificationCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  const validEmail = emailSchema.parse(email);

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  await query('DELETE FROM email_verification_codes WHERE email = $1', [validEmail]);

  await query(
    'INSERT INTO email_verification_codes (email, code) VALUES ($1, $2)',
    [validEmail, code]
  );

  await sendEmail(validEmail, code);

  res.json({ success: true });
};

export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  const validEmail = emailSchema.parse(email);

  if (!code) {
    throw new AppError('Код обязателен', 400);
  }

  const result = await query(
    `SELECT * FROM email_verification_codes
     WHERE email = $1 AND used = false AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [validEmail]
  );

  if (result.rows.length === 0) {
    throw new AppError('Код не найден или истёк. Запросите новый.', 400);
  }

  const record = result.rows[0];

  if (record.attempts >= 5) {
    await query('UPDATE email_verification_codes SET used = true WHERE id = $1', [record.id]);
    throw new AppError('Превышено количество попыток. Запросите новый код.', 400);
  }

  if (record.code !== code) {
    await query(
      'UPDATE email_verification_codes SET attempts = attempts + 1 WHERE id = $1',
      [record.id]
    );
    const attemptsLeft = 4 - record.attempts;
    throw new AppError(`Неверный код. Осталось попыток: ${attemptsLeft}`, 400);
  }

  await query('UPDATE email_verification_codes SET used = true WHERE id = $1', [record.id]);

  res.json({ success: true });
};

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const validEmail = emailSchema.parse(email);
  const validPassword = passwordSchema.parse(password);

  const existingUser = await query('SELECT id FROM users WHERE email = $1', [validEmail]);

  if (existingUser.rows.length > 0) {
    throw new AppError('Пользователь с таким email уже существует', 400);
  }

  const hashedPassword = await bcrypt.hash(validPassword, 10);

  const userResult = await query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
    [validEmail, hashedPassword]
  );

  const user = userResult.rows[0];

  await query('INSERT INTO profiles (id) VALUES ($1)', [user.id]);

  await query('INSERT INTO user_roles (user_id, role) VALUES ($1, $2)', [user.id, 'participant']);

  // @ts-expect-error - JWT types issue with expiresIn
  const token = jwt.sign(
    { userId: user.id, role: 'participant' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    user: { id: user.id, email: user.email },
    token
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const validEmail = emailSchema.parse(email);

  if (!password) {
    throw new AppError('Пароль обязателен', 400);
  }

  const result = await query('SELECT id, email, password FROM users WHERE email = $1', [validEmail]);

  if (result.rows.length === 0) {
    throw new AppError('Неверный email или пароль', 401);
  }

  const user = result.rows[0];

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new AppError('Неверный email или пароль', 401);
  }

  const roleResult = await query(
    'SELECT role FROM user_roles WHERE user_id = $1 LIMIT 1',
    [user.id]
  );

  const role = roleResult.rows[0]?.role || 'participant';

  // @ts-expect-error - JWT types issue with expiresIn
  const token = jwt.sign(
    { userId: user.id, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    user: { id: user.id, email: user.email },
    token
  });
};

export const logout = async (req: AuthRequest, res: Response) => {
  res.json({ success: true });
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT u.id, u.email, p.*,
     (SELECT role FROM user_roles WHERE user_id = u.id LIMIT 1) as role
     FROM users u
     LEFT JOIN profiles p ON u.id = p.id
     WHERE u.id = $1`,
    [req.userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Пользователь не найден', 404);
  }

  res.json({ user: result.rows[0] });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Токен обязателен', 400);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    // @ts-expect-error - JWT types issue with expiresIn
    const newToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ token: newToken });
  } catch (error) {
    throw new AppError('Недействительный токен', 401);
  }
};

export const sendPasswordResetCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  const validEmail = emailSchema.parse(email);

  const existingUser = await query('SELECT id FROM users WHERE email = $1', [validEmail]);
  if (existingUser.rows.length === 0) {
    // Возвращаем успех даже если email не найден — для безопасности
    return res.json({ success: true });
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  await query('DELETE FROM email_verification_codes WHERE email = $1', [validEmail]);

  await query(
    'INSERT INTO email_verification_codes (email, code) VALUES ($1, $2)',
    [validEmail, code]
  );

  await sendEmail(validEmail, code);

  res.json({ success: true });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, new_password } = req.body;

  const validEmail = emailSchema.parse(email);

  if (!code) {
    throw new AppError('Код обязателен', 400);
  }

  if (!new_password || new_password.length < 6) {
    throw new AppError('Пароль должен быть не менее 6 символов', 400);
  }

  const result = await query(
    `SELECT * FROM email_verification_codes
     WHERE email = $1 AND used = false AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [validEmail]
  );

  if (result.rows.length === 0) {
    throw new AppError('Код не найден или истёк. Запросите новый.', 400);
  }

  const record = result.rows[0];

  if (record.attempts >= 5) {
    await query('UPDATE email_verification_codes SET used = true WHERE id = $1', [record.id]);
    throw new AppError('Превышено количество попыток. Запросите новый код.', 400);
  }

  if (record.code !== code) {
    await query(
      'UPDATE email_verification_codes SET attempts = attempts + 1 WHERE id = $1',
      [record.id]
    );
    const attemptsLeft = 4 - record.attempts;
    throw new AppError(`Неверный код. Осталось попыток: ${attemptsLeft}`, 400);
  }

  await query('UPDATE email_verification_codes SET used = true WHERE id = $1', [record.id]);

  const hashedPassword = await bcrypt.hash(new_password, 10);
  await query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, validEmail]);

  res.json({ success: true });
};
