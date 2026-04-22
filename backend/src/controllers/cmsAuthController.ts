import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';

const loginSchema = z.object({
  username: z.string().min(1, 'Имя пользователя обязательно'),
  password: z.string().min(1, 'Пароль обязателен'),
});

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '12h';

export const login = async (req: Request, res: Response) => {
  const { username, password } = loginSchema.parse(req.body);

  const result = await query(
    'SELECT * FROM cms_users WHERE username = $1',
    [username]
  );

  if (result.rows.length === 0) {
    throw new AppError('Неверное имя пользователя или пароль', 401);
  }

  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new AppError('Неверное имя пользователя или пароль', 401);
  }

  const token = jwt.sign(
    { cmsUserId: user.id, cmsUserRole: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    user: { id: user.id, username: user.username, role: user.role },
    token,
  });
};

export const changePassword = async (req: Request, res: Response) => {
  const schema = z.object({
    current_password: z.string().min(1),
    new_password: z.string().min(6, 'Минимум 6 символов'),
  });

  const { current_password, new_password } = schema.parse(req.body);
  const { cmsUserId } = req as any;

  const result = await query(
    'SELECT * FROM cms_users WHERE id = $1',
    [cmsUserId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Пользователь не найден', 404);
  }

  const user = result.rows[0];
  const isValid = await bcrypt.compare(current_password, user.password_hash);

  if (!isValid) {
    throw new AppError('Текущий пароль неверен', 400);
  }

  const hashed = await bcrypt.hash(new_password, 10);
  await query(
    'UPDATE cms_users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [hashed, cmsUserId]
  );

  res.json({ success: true });
};
