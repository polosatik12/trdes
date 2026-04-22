import { Response } from 'express';
import { z } from 'zod';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const profileSchema = z.object({
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  patronymic: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  gender: z.enum(['male', 'female']).nullable().optional(),
  phone: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  participation_type: z.string().nullable().optional(),
  team_name: z.string().nullable().optional(),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  phone: z.string().min(1, 'Телефон обязателен'),
  relationship: z.string().nullable().optional(),
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

const VALID_CONSENT_TYPES = ['privacy_policy', 'waiver', 'photo_consent', 'terms_of_service', 'personal_data_consent'];

export const getConsents = async (req: AuthRequest, res: Response) => {
  const result = await query(
    'SELECT consent_type, accepted_at, document_version FROM user_consents WHERE user_id = $1',
    [req.userId]
  );
  res.json({ consents: result.rows });
};

export const createConsent = async (req: AuthRequest, res: Response) => {
  const { consent_type, document_version } = req.body;

  if (!VALID_CONSENT_TYPES.includes(consent_type)) {
    throw new AppError('Недопустимый тип документа', 400);
  }

  const result = await query(
    `INSERT INTO user_consents (user_id, consent_type, document_version)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, consent_type) DO UPDATE SET accepted_at = NOW(), document_version = $3
     RETURNING consent_type, accepted_at, document_version`,
    [req.userId, consent_type, document_version || '1.0']
  );

  res.json({ consent: result.rows[0] });
};
