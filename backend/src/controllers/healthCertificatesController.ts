import { Response } from 'express';
import { z } from 'zod';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { StorageService } from '../services/storage';

const baseCertificateSchema = z.object({
  issued_date: z.string(),
  expiry_date: z.string(),
  document_url: z.string().nullable().optional(),
  status: z.enum(['active', 'expired', 'pending']).nullable().optional(),
});

const validateDateRange = (data: { issued_date?: string; expiry_date?: string }) => {
  if (data.issued_date && data.expiry_date) {
    const issued = new Date(data.issued_date);
    const expiry = new Date(data.expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiry <= issued) {
      throw new AppError('Дата окончания должна быть позже даты выдачи', 400);
    }

    if (expiry < today) {
      throw new AppError('Нельзя добавить истекшую справку', 400);
    }

    const diffDays = (expiry.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 184) {
      throw new AppError('Срок действия справки не может превышать 6 месяцев. Проверьте указанные даты.', 400);
    }
  }
};

const certificateSchema = baseCertificateSchema.refine((data) => {
  if (data.issued_date && data.expiry_date) {
    const diffDays = (new Date(data.expiry_date).getTime() - new Date(data.issued_date).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 184;
  }
  return true;
}, { message: 'Срок действия справки не может превышать 6 месяцев', path: ['expiry_date'] });

export const getUserCertificates = async (req: AuthRequest, res: Response) => {
  const result = await query(
    'SELECT * FROM health_certificates WHERE user_id = $1 ORDER BY created_at DESC',
    [req.userId]
  );

  res.json({ certificates: result.rows });
};

export const createCertificate = async (req: AuthRequest, res: Response) => {
  const validData = certificateSchema.parse(req.body);

  const result = await query(
    `INSERT INTO health_certificates (user_id, issued_date, expiry_date, document_url, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.userId, validData.issued_date, validData.expiry_date, validData.document_url || null, validData.status || 'pending']
  );

  res.json({ certificate: result.rows[0] });
};

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('Файл не загружен', 400);
  }

  const fileUrl = StorageService.getFileUrl(req.userId!, req.file.filename);

  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
};

export const getCertificateById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query(
    'SELECT * FROM health_certificates WHERE id = $1 AND user_id = $2',
    [id, req.userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Справка не найдена', 404);
  }

  res.json({ certificate: result.rows[0] });
};

export const updateCertificate = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const validData = baseCertificateSchema.partial().parse(req.body);

  validateDateRange(validData);

  const fields = Object.keys(validData);
  const values = Object.values(validData);

  if (fields.length === 0) {
    throw new AppError('Нет данных для обновления', 400);
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

  const result = await query(
    `UPDATE health_certificates SET ${setClause}, updated_at = NOW()
     WHERE id = $1 AND user_id = $${fields.length + 2} RETURNING *`,
    [id, ...values, req.userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Справка не найдена', 404);
  }

  res.json({ certificate: result.rows[0] });
};

export const deleteCertificate = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const certResult = await query(
    'SELECT document_url FROM health_certificates WHERE id = $1 AND user_id = $2',
    [id, req.userId]
  );

  if (certResult.rows.length === 0) {
    throw new AppError('Справка не найдена', 404);
  }

  const documentUrl = certResult.rows[0].document_url;
  if (documentUrl) {
    await StorageService.deleteFileByUrl(documentUrl);
  }

  await query('DELETE FROM health_certificates WHERE id = $1 AND user_id = $2', [id, req.userId]);

  res.json({ success: true });
};
