import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Generate random promo code
function generateCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Validate promo code (public endpoint)
export const validatePromoCode = async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    throw new AppError('Промокод обязателен', 400);
  }

  const result = await query(
    `SELECT * FROM promo_codes
     WHERE UPPER(code) = UPPER($1)
     AND is_active = true
     AND (expires_at IS NULL OR expires_at > NOW())
     AND (max_uses IS NULL OR used_count < max_uses)`,
    [code]
  );

  if (result.rows.length === 0) {
    throw new AppError('Промокод не найден или недействителен', 404);
  }

  const promo = result.rows[0];

  res.json({
    code: promo.code,
    discount_percent: promo.discount_percent,
    description: promo.description,
  });
};

// Increment usage count (called when order is placed)
export const usePromoCode = async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    throw new AppError('Промокод обязателен', 400);
  }

  const result = await query(
    'UPDATE promo_codes SET used_count = used_count + 1 WHERE UPPER(code) = UPPER($1) RETURNING *',
    [code]
  );

  if (result.rows.length === 0) {
    throw new AppError('Промокод не найден', 404);
  }

  res.json({ success: true, used_count: result.rows[0].used_count });
};

// Admin: Get all promo codes
export const getAllPromoCodes = async (req: AuthRequest, res: Response) => {
  const result = await query(
    'SELECT * FROM promo_codes ORDER BY created_at DESC'
  );

  res.json({ promo_codes: result.rows });
};

// Admin: Create promo code
const createPromoSchema = z.object({
  discount_percent: z.number().int().min(1).max(100),
  description: z.string().optional(),
  max_uses: z.number().int().min(1).optional().nullable(),
  expires_at: z.string().optional().nullable(),
  code: z.string().min(1).optional(), // If not provided, auto-generate
  length: z.number().int().min(4).max(16).optional().default(8),
});

export const createPromoCode = async (req: AuthRequest, res: Response) => {
  const validData = createPromoSchema.parse(req.body);

  const code = validData.code
    ? validData.code.toUpperCase()
    : generateCode(validData.length);

  // Check if code already exists
  const existing = await query(
    'SELECT id FROM promo_codes WHERE UPPER(code) = UPPER($1)',
    [code]
  );

  if (existing.rows.length > 0) {
    throw new AppError('Промокод уже существует', 400);
  }

  const result = await query(
    `INSERT INTO promo_codes (code, discount_percent, description, max_uses, expires_at, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      code,
      validData.discount_percent,
      validData.description || null,
      validData.max_uses || null,
      validData.expires_at || null,
      req.userId || null,
    ]
  );

  res.status(201).json({ promo_code: result.rows[0] });
};

// Admin: Update promo code
const updatePromoSchema = z.object({
  discount_percent: z.number().int().min(1).max(100).optional(),
  description: z.string().optional(),
  max_uses: z.number().int().min(1).optional().nullable(),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
});

export const updatePromoCode = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const validData = updatePromoSchema.parse(req.body);

  const fields = Object.keys(validData);
  const values = Object.values(validData);

  if (fields.length === 0) {
    throw new AppError('Нет данных для обновления', 400);
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

  const result = await query(
    `UPDATE promo_codes SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  if (result.rows.length === 0) {
    throw new AppError('Промокод не найден', 404);
  }

  res.json({ promo_code: result.rows[0] });
};

// Admin: Delete promo code
export const deletePromoCode = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query('DELETE FROM promo_codes WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Промокод не найден', 404);
  }

  res.json({ success: true });
};
