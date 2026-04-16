import { Request, Response } from 'express';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';

export const createContactRequest = async (req: Request, res: Response) => {
  const { name, email, phone, message, type } = req.body;

  if (!name || !email || !message) {
    throw new AppError('Имя, email и сообщение обязательны', 400);
  }

  const result = await query(
    `INSERT INTO contact_requests (name, email, phone, message, type)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, email, phone || null, message, type || 'individual']
  );

  res.json({ success: true, request: result.rows[0] });
};

export const getAllContactRequests = async (_req: Request, res: Response) => {
  const result = await query(
    `SELECT * FROM contact_requests ORDER BY created_at DESC`
  );
  res.json({ requests: result.rows });
};
