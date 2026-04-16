import { Response } from 'express';
import { z } from 'zod';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { StorageService } from '../services/storage';

const certificateSchema = z.object({
  issued_date: z.string(),
  expiry_date: z.string(),
  document_url: z.string().optional(),
});

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
     VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
    [req.userId, validData.issued_date, validData.expiry_date, validData.document_url || null]
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
  const validData = certificateSchema.partial().parse(req.body);

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
