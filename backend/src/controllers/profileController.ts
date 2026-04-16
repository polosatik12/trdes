import { Response } from 'express';
import { z } from 'zod';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  patronymic: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  participation_type: z.string().optional(),
  team_name: z.string().optional(),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  phone: z.string().min(1, 'Телефон обязателен'),
  relationship: z.string().optional(),
});

export const getProfile = async (req: AuthRequest, res: Response) => {
  const result = await query('SELECT * FROM profiles WHERE id = $1', [req.userId]);

  if (result.rows.length === 0) {
    throw new AppError('Профиль не найден', 404);
  }

  res.json({ profile: result.rows[0] });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const validData = profileSchema.parse(req.body);

  const fields = Object.keys(validData);
  const values = Object.values(validData);

  if (fields.length === 0) {
    throw new AppError('Нет данных для обновления', 400);
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

  const result = await query(
    `UPDATE profiles SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [req.userId, ...values]
  );

  res.json({ profile: result.rows[0] });
};

export const getEmergencyContacts = async (req: AuthRequest, res: Response) => {
  const result = await query(
    'SELECT * FROM emergency_contacts WHERE user_id = $1 ORDER BY created_at DESC',
    [req.userId]
  );

  res.json({ contacts: result.rows });
};

export const createEmergencyContact = async (req: AuthRequest, res: Response) => {
  const validData = emergencyContactSchema.parse(req.body);

  const result = await query(
    `INSERT INTO emergency_contacts (user_id, name, phone, relationship)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [req.userId, validData.name, validData.phone, validData.relationship || null]
  );

  res.json({ contact: result.rows[0] });
};

export const updateEmergencyContact = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const validData = emergencyContactSchema.parse(req.body);

  const result = await query(
    `UPDATE emergency_contacts
     SET name = $1, phone = $2, relationship = $3, updated_at = NOW()
     WHERE id = $4 AND user_id = $5 RETURNING *`,
    [validData.name, validData.phone, validData.relationship || null, id, req.userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Контакт не найден', 404);
  }

  res.json({ contact: result.rows[0] });
};

export const deleteEmergencyContact = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query(
    'DELETE FROM emergency_contacts WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, req.userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Контакт не найден', 404);
  }

  res.json({ success: true });
};
