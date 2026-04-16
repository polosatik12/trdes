import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../utils/db';

const applicationSchema = z.object({
  company_name: z.string().min(1, 'Название компании обязательно'),
  contact_person: z.string().min(1, 'Контактное лицо обязательно'),
  email: z.string().email('Некорректный email'),
  phone: z.string().min(1, 'Телефон обязателен'),
  participants_count: z.number().int().positive('Количество участников должно быть положительным'),
  message: z.string().optional(),
});

export const createApplication = async (req: Request, res: Response) => {
  const validData = applicationSchema.parse(req.body);

  const result = await query(
    `INSERT INTO corporate_applications
     (company_name, contact_person, email, phone, participants_count, message, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
    [
      validData.company_name,
      validData.contact_person,
      validData.email,
      validData.phone,
      validData.participants_count,
      validData.message || null
    ]
  );

  res.json({ application: result.rows[0] });
};
