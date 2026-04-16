import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';

// ── Upload setup ──────────────────────────────────────────────
const galleryDir = path.join(process.cwd(), 'uploads', 'gallery');
if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, galleryDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `gallery-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new AppError('Разрешены: JPG, PNG, WebP, MP4, MOV, WebM', 400));
};

export const galleryUpload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });

// ── Handlers ──────────────────────────────────────────────────
export const getGallery = async (req: Request, res: Response) => {
  const { event_slug, type } = req.query;
  let q = 'SELECT * FROM media_gallery WHERE 1=1';
  const params: any[] = [];
  if (event_slug) { q += ` AND event_slug = $${params.length + 1}`; params.push(event_slug); }
  if (type)       { q += ` AND type = $${params.length + 1}`;       params.push(type); }
  q += ' ORDER BY sort_order ASC, created_at DESC';
  const result = await query(q, params);
  res.json({ items: result.rows });
};

export const addGalleryItem = async (req: Request, res: Response) => {
  const { event_slug, type, url, title, sort_order } = req.body;
  if (!event_slug || !type || !url) throw new AppError('event_slug, type и url обязательны', 400);
  const result = await query(
    `INSERT INTO media_gallery (event_slug, type, url, title, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [event_slug, type, url, title || null, sort_order || 0]
  );
  res.json({ item: result.rows[0] });
};

export const uploadGalleryFile = async (req: Request, res: Response) => {
  if (!req.file) throw new AppError('Файл не загружен', 400);
  const { event_slug, type, title } = req.body;
  if (!event_slug || !type) throw new AppError('event_slug и type обязательны', 400);

  const url = `/uploads/gallery/${req.file.filename}`;
  const result = await query(
    `INSERT INTO media_gallery (event_slug, type, url, title) VALUES ($1,$2,$3,$4) RETURNING *`,
    [event_slug, type, url, title || null]
  );
  res.json({ item: result.rows[0] });
};

export const deleteGalleryItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await query('DELETE FROM media_gallery WHERE id = $1 RETURNING *', [id]);
  if (result.rows.length === 0) throw new AppError('Не найдено', 404);
  // Удаляем файл если он локальный
  const url: string = result.rows[0].url;
  if (url.startsWith('/uploads/gallery/')) {
    const filePath = path.join(process.cwd(), url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  res.json({ success: true });
};
