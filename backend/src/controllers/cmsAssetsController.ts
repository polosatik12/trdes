import { Response } from 'express';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { CMSAuthRequest } from '../middleware/cmsAuth';

export const getAllAssets = async (_req: CMSAuthRequest, res: Response) => {
  const result = await query(
    'SELECT * FROM cms_assets ORDER BY created_at DESC'
  );

  res.json({ assets: result.rows });
};

export const uploadAsset = async (req: CMSAuthRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('Файл не загружен', 400);
  }

  const fileUrl = `/uploads/cms/${req.file.filename}`;

  const result = await query(
    'INSERT INTO cms_assets (original_name, file_url, mime_type, file_size) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.file.originalname, fileUrl, req.file.mimetype, req.file.size]
  );

  res.status(201).json({ asset: result.rows[0] });
};

export const deleteAsset = async (req: CMSAuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query('SELECT * FROM cms_assets WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Файл не найден', 404);
  }

  const asset = result.rows[0];
  const filename = asset.file_url.split('/').pop();
  if (filename) {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'uploads', 'cms', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await query('DELETE FROM cms_assets WHERE id = $1', [id]);

  res.json({ success: true });
};
