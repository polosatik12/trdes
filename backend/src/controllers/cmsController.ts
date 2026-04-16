import { Request, Response } from 'express';
import { z } from 'zod';
import { query, getClient } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { CMSAuthRequest } from '../middleware/cmsAuth';

// ==================== Public API ====================

export const getPageBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  const pageResult = await query(
    'SELECT * FROM cms_pages WHERE slug = $1 AND is_published = true',
    [slug]
  );

  if (pageResult.rows.length === 0) {
    throw new AppError('Страница не найдена', 404);
  }

  const page = pageResult.rows[0];

  const blocksResult = await query(
    'SELECT id, page_id, block_type, sort_order, data, is_visible FROM cms_blocks WHERE page_id = $1 AND is_visible = true ORDER BY sort_order',
    [page.id]
  );

  res.json({
    page: { id: page.id, slug: page.slug, title: page.title },
    blocks: blocksResult.rows,
  });
};

// ==================== Admin API ====================

// --- Pages ---

export const getAllPages = async (_req: CMSAuthRequest, res: Response) => {
  const result = await query(
    `SELECT p.*, COUNT(b.id) as block_count
     FROM cms_pages p
     LEFT JOIN cms_blocks b ON p.id = b.page_id
     GROUP BY p.id
     ORDER BY p.created_at DESC`
  );

  res.json({ pages: result.rows });
};

export const getPageById = async (req: CMSAuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query('SELECT * FROM cms_pages WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Страница не найдена', 404);
  }

  const blocksResult = await query(
    'SELECT * FROM cms_blocks WHERE page_id = $1 ORDER BY sort_order',
    [id]
  );

  res.json({ page: result.rows[0], blocks: blocksResult.rows });
};

const pageSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Только латиница, цифры и дефисы'),
  title: z.string().min(1),
  is_published: z.boolean().optional().default(true),
});

export const createPage = async (req: CMSAuthRequest, res: Response) => {
  const { slug, title, is_published } = pageSchema.parse(req.body);

  const result = await query(
    'INSERT INTO cms_pages (slug, title, is_published) VALUES ($1, $2, $3) RETURNING *',
    [slug, title, is_published]
  );

  res.status(201).json({ page: result.rows[0] });
};

export const updatePage = async (req: CMSAuthRequest, res: Response) => {
  const { id } = req.params;
  const data = pageSchema.partial().parse(req.body);

  const fields = Object.keys(data);
  const values = Object.values(data);

  if (fields.length === 0) {
    throw new AppError('Нет данных для обновления', 400);
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

  const result = await query(
    `UPDATE cms_pages SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  if (result.rows.length === 0) {
    throw new AppError('Страница не найдена', 404);
  }

  res.json({ page: result.rows[0] });
};

export const deletePage = async (req: CMSAuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query('DELETE FROM cms_pages WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Страница не найдена', 404);
  }

  res.json({ success: true });
};

// --- Blocks ---

export const createBlock = async (req: CMSAuthRequest, res: Response) => {
  const schema = z.object({
    page_id: z.string().uuid(),
    block_type: z.string().min(1),
    sort_order: z.number().int().optional().default(0),
    data: z.record(z.unknown()).optional().default({}),
    is_visible: z.boolean().optional().default(true),
  });

  const { page_id, block_type, sort_order, data, is_visible } = schema.parse(req.body);

  const pageExists = await query('SELECT id FROM cms_pages WHERE id = $1', [page_id]);
  if (pageExists.rows.length === 0) {
    throw new AppError('Страница не найдена', 404);
  }

  const result = await query(
    'INSERT INTO cms_blocks (page_id, block_type, sort_order, data, is_visible) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [page_id, block_type, sort_order, data, is_visible]
  );

  res.status(201).json({ block: result.rows[0] });
};

export const updateBlock = async (req: CMSAuthRequest, res: Response) => {
  const { id } = req.params;
  const schema = z.object({
    block_type: z.string().min(1).optional(),
    sort_order: z.number().int().optional(),
    data: z.record(z.unknown()).optional(),
    is_visible: z.boolean().optional(),
  });

  const data = schema.parse(req.body);
  const fields = Object.keys(data);
  const values = Object.values(data);

  if (fields.length === 0) {
    throw new AppError('Нет данных для обновления', 400);
  }

  // Save version history before updating data
  if ('data' in data) {
    const currentBlock = await query('SELECT data FROM cms_blocks WHERE id = $1', [id]);
    if (currentBlock.rows.length > 0) {
      const userId = (req as any).cmsUserId;
      await query(
        'INSERT INTO cms_versions (block_id, previous_data, changed_by) VALUES ($1, $2, $3)',
        [id, currentBlock.rows[0].data, userId || 'unknown']
      );
    }
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

  const result = await query(
    `UPDATE cms_blocks SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  if (result.rows.length === 0) {
    throw new AppError('Блок не найден', 404);
  }

  res.json({ block: result.rows[0] });
};

export const deleteBlock = async (req: CMSAuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query('DELETE FROM cms_blocks WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Блок не найден', 404);
  }

  res.json({ success: true });
};

export const reorderBlocks = async (req: CMSAuthRequest, res: Response) => {
  const schema = z.object({
    block_ids: z.array(z.string().uuid()),
  });

  const { block_ids } = schema.parse(req.body);

  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < block_ids.length; i++) {
      await client.query('UPDATE cms_blocks SET sort_order = $1 WHERE id = $2', [i, block_ids[i]]);
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// --- News (stored as CMS page with blocks) ---

export const getAllNews = async (req: CMSAuthRequest, res: Response) => {
  const result = await query(
    `SELECT * FROM cms_pages WHERE slug LIKE 'news/%' ORDER BY created_at DESC`
  );

  res.json({ news: result.rows });
};

export const getNewsById = async (req: CMSAuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query('SELECT * FROM cms_pages WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Новость не найдена', 404);
  }

  const blocksResult = await query(
    'SELECT * FROM cms_blocks WHERE page_id = $1 ORDER BY sort_order',
    [id]
  );

  res.json({ news: result.rows[0], blocks: blocksResult.rows });
};

const newsSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  is_published: z.boolean().optional().default(false),
});

export const createNews = async (req: CMSAuthRequest, res: Response) => {
  const { title, slug, is_published } = newsSchema.parse(req.body);

  const result = await query(
    'INSERT INTO cms_pages (slug, title, is_published) VALUES ($1, $2, $3) RETURNING *',
    [`news/${slug}`, title, is_published]
  );

  res.status(201).json({ news: result.rows[0] });
};

export const updateNews = async (req: CMSAuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, slug, is_published } = newsSchema.partial().parse(req.body);

  const fields: string[] = [];
  const values: any[] = [];
  let idx = 2;

  if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
  if (slug !== undefined) { fields.push(`slug = $${idx++}`); values.push(`news/${slug}`); }
  if (is_published !== undefined) { fields.push(`is_published = $${idx++}`); values.push(is_published); }

  if (fields.length === 0) {
    throw new AppError('Нет данных для обновления', 400);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE cms_pages SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new AppError('Новость не найдена', 404);
  }

  res.json({ news: result.rows[0] });
};

export const deleteNews = async (req: CMSAuthRequest, res: Response) => {
  const { id } = req.params;

  // Delete blocks first (cascade should handle this, but be explicit)
  await query('DELETE FROM cms_blocks WHERE page_id = $1', [id]);

  const result = await query(
    'DELETE FROM cms_pages WHERE id = $1 AND slug LIKE $2 RETURNING id',
    [id, 'news/%']
  );

  if (result.rows.length === 0) {
    throw new AppError('Новость не найдена', 404);
  }

  res.json({ success: true });
};
