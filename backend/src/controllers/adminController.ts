import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import {
  determineCategory,
  autoAssignBib,
  manualAssignBib,
  isEligible,
  getRangeForCategory,
  type AgeCategory,
} from '../services/bibService';

export const getAllParticipants = async (req: Request, res: Response) => {
  const result = await query(
    `SELECT
      p.*,
      u.email,
      (SELECT role FROM user_roles WHERE user_id = p.id LIMIT 1) as role
     FROM profiles p
     JOIN users u ON p.id = u.id
     ORDER BY p.created_at DESC`
  );

  res.json({ participants: result.rows });
};

export const getParticipantById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await query(
    `SELECT
      p.*,
      u.email,
      (SELECT json_agg(role) FROM user_roles WHERE user_id = p.id) as roles
     FROM profiles p
     JOIN users u ON p.id = u.id
     WHERE p.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Участник не найден', 404);
  }

  res.json({ participant: result.rows[0] });
};

export const getAllRegistrations = async (req: Request, res: Response) => {
  const { event_id, payment_status } = req.query;

  let queryText = `
    SELECT
      r.*,
      p.first_name,
      p.last_name,
      p.patronymic,
      p.phone,
      p.city,
      u.email,
      e.name as event_name,
      d.name as distance_name,
      d.distance_km
    FROM event_registrations r
    JOIN profiles p ON r.user_id = p.id
    JOIN users u ON r.user_id = u.id
    JOIN events e ON r.event_id = e.id
    JOIN event_distances d ON r.distance_id = d.id
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (event_id) {
    queryText += ` AND r.event_id = $${paramIndex}`;
    params.push(event_id);
    paramIndex++;
  }

  if (payment_status) {
    queryText += ` AND r.payment_status = $${paramIndex}`;
    params.push(payment_status);
    paramIndex++;
  }

  queryText += ' ORDER BY r.created_at DESC';

  const result = await query(queryText, params);

  res.json({ registrations: result.rows });
};

export const updateRegistration = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { payment_status, bib_number } = req.body;

  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (payment_status) {
    updates.push(`payment_status = $${paramIndex}`);
    values.push(payment_status);
    paramIndex++;
  }

  if (bib_number !== undefined) {
    updates.push(`bib_number = $${paramIndex}`);
    values.push(bib_number);
    paramIndex++;
  }

  if (updates.length === 0) {
    throw new AppError('Нет данных для обновления', 400);
  }

  values.push(id);

  const result = await query(
    `UPDATE event_registrations
     SET ${updates.join(', ')}, updated_at = NOW()
     WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new AppError('Регистрация не найдена', 404);
  }

  res.json({ registration: result.rows[0] });
};

export const getAllHealthCertificates = async (req: Request, res: Response) => {
  const { status } = req.query;

  let queryText = `
    SELECT
      hc.*,
      p.first_name,
      p.last_name,
      p.patronymic,
      u.email
    FROM health_certificates hc
    JOIN profiles p ON hc.user_id = p.id
    JOIN users u ON hc.user_id = u.id
  `;

  const params: any[] = [];

  if (status) {
    queryText += ' WHERE hc.status = $1';
    params.push(status);
  }

  queryText += ' ORDER BY hc.created_at DESC';

  const result = await query(queryText, params);

  res.json({ certificates: result.rows });
};

export const updateHealthCertificate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'expired', 'pending'].includes(status)) {
    throw new AppError('Недопустимый статус', 400);
  }

  const result = await query(
    'UPDATE health_certificates SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Справка не найдена', 404);
  }

  res.json({ certificate: result.rows[0] });
};

export const getAllCorporateApplications = async (req: Request, res: Response) => {
  const { status } = req.query;

  let queryText = 'SELECT * FROM corporate_applications';
  const params: any[] = [];

  if (status) {
    queryText += ' WHERE status = $1';
    params.push(status);
  }

  queryText += ' ORDER BY created_at DESC';

  const result = await query(queryText, params);

  res.json({ applications: result.rows });
};

export const updateCorporateApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new AppError('Недопустимый статус', 400);
  }

  const result = await query(
    'UPDATE corporate_applications SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Заявка не найдена', 404);
  }

  res.json({ application: result.rows[0] });
};

const eventSchema = z.object({
  name: z.string().min(1),
  date: z.string(),
  location: z.string().min(1),
  status: z.enum(['upcoming', 'completed', 'cancelled']).optional(),
});

export const createEvent = async (req: Request, res: Response) => {
  const validData = eventSchema.parse(req.body);

  const result = await query(
    'INSERT INTO events (name, date, location, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [validData.name, validData.date, validData.location, validData.status || 'upcoming']
  );

  res.json({ event: result.rows[0] });
};

export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validData = eventSchema.partial().parse(req.body);

  const fields = Object.keys(validData);
  const values = Object.values(validData);

  if (fields.length === 0) {
    throw new AppError('Нет данных для обновления', 400);
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

  const result = await query(
    `UPDATE events SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  if (result.rows.length === 0) {
    throw new AppError('Мероприятие не найдено', 404);
  }

  res.json({ event: result.rows[0] });
};

export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Мероприятие не найдено', 404);
  }

  res.json({ success: true });
};

const distanceSchema = z.object({
  name: z.string().min(1),
  distance_km: z.number().positive(),
  price_kopecks: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const createDistance = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const validData = distanceSchema.parse(req.body);

  const result = await query(
    'INSERT INTO event_distances (event_id, name, distance_km, price_kopecks) VALUES ($1, $2, $3, $4) RETURNING *',
    [eventId, validData.name, validData.distance_km, validData.price_kopecks || 0]
  );

  res.json({ distance: result.rows[0] });
};

export const updateDistance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validData = distanceSchema.partial().parse(req.body);

  const fields = Object.keys(validData);
  const values = Object.values(validData);

  if (fields.length === 0) {
    throw new AppError('Нет данных для обновления', 400);
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

  const result = await query(
    `UPDATE event_distances SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  if (result.rows.length === 0) {
    throw new AppError('Дистанция не найдена', 404);
  }

  res.json({ distance: result.rows[0] });
};

export const deleteDistance = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await query('DELETE FROM event_distances WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Дистанция не найдена', 404);
  }

  res.json({ success: true });
};

const resultSchema = z.object({
  registration_id: z.string().uuid(),
  event_id: z.string().uuid(),
  distance_id: z.string().uuid(),
  place: z.number().int().positive().optional(),
  finish_time: z.string().optional(),
  category: z.string().optional(),
  category_place: z.number().int().positive().optional(),
});

export const createResult = async (req: Request, res: Response) => {
  const validData = resultSchema.parse(req.body);

  const result = await query(
    `INSERT INTO event_results
     (registration_id, event_id, distance_id, place, finish_time, category, category_place)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      validData.registration_id,
      validData.event_id,
      validData.distance_id,
      validData.place || null,
      validData.finish_time || null,
      validData.category || null,
      validData.category_place || null
    ]
  );

  res.json({ result: result.rows[0] });
};

export const updateResult = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validData = resultSchema.partial().parse(req.body);

  const fields = Object.keys(validData);
  const values = Object.values(validData);

  if (fields.length === 0) {
    throw new AppError('Нет данных для обновления', 400);
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

  const result = await query(
    `UPDATE event_results SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  if (result.rows.length === 0) {
    throw new AppError('Результат не найден', 404);
  }

  res.json({ result: result.rows[0] });
};

export const deleteResult = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await query('DELETE FROM event_results WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Результат не найден', 404);
  }

  res.json({ success: true });
};

/**
 * POST /api/admin/registrations/:id/assign-bib
 * Body: { bib_number?: number, category?: AgeCategory }
 *
 * - If bib_number provided → manual assignment by admin
 * - If only category provided → auto-assign next available in that category
 * - If neither → auto-assign based on participant's profile
 */
export const assignBib = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { bib_number, category } = req.body;

  // Load registration with participant profile and distance
  const regResult = await query(
    `SELECT r.*, p.date_of_birth, p.gender, d.distance_km, e.date as event_date
     FROM event_registrations r
     JOIN profiles p ON r.user_id = p.id
     JOIN event_distances d ON r.distance_id = d.id
     JOIN events e ON r.event_id = e.id
     WHERE r.id = $1`,
    [id],
  );

  if (regResult.rows.length === 0) throw new AppError('Регистрация не найдена', 404);

  const reg = regResult.rows[0];

  if (bib_number !== undefined) {
    // Manual assignment
    const cat: AgeCategory | undefined = category ?? reg.age_category ?? undefined;
    await manualAssignBib(id, reg.event_id, Number(bib_number), cat);
    const updated = await query('SELECT * FROM event_registrations WHERE id = $1', [id]);
    return res.json({ registration: updated.rows[0] });
  }

  // Auto-assignment
  if (!reg.date_of_birth || !reg.gender) {
    throw new AppError('Профиль участника не заполнен (дата рождения / пол)', 422);
  }

  const resolvedCategory: AgeCategory = category
    ?? determineCategory(reg.distance_km, reg.gender, reg.date_of_birth);

  const range = getRangeForCategory(resolvedCategory);
  if (range.manualOnly) {
    throw new AppError(
      `Категория ${resolvedCategory} — только ручное назначение. Укажите bib_number.`,
      422,
    );
  }

  const bib = await autoAssignBib(id, reg.event_id, resolvedCategory);
  if (bib === null) {
    throw new AppError(`Диапазон номеров для категории ${resolvedCategory} исчерпан`, 409);
  }

  const updated = await query('SELECT * FROM event_registrations WHERE id = $1', [id]);
  return res.json({ registration: updated.rows[0], bib_number: bib });
};

/**
 * POST /api/admin/registrations/:id/move-to-group-a
 * Перевести участника в группу А (или FA) и назначить номер вручную.
 * Body: { bib_number: number }
 */
export const moveToGroupA = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { bib_number } = req.body;

  if (bib_number === undefined || bib_number === null) {
    throw new AppError('Укажите bib_number для группы А', 400);
  }

  const regResult = await query(
    `SELECT r.*, p.gender, d.distance_km
     FROM event_registrations r
     JOIN profiles p ON r.user_id = p.id
     JOIN event_distances d ON r.distance_id = d.id
     WHERE r.id = $1`,
    [id],
  );
  if (regResult.rows.length === 0) throw new AppError('Регистрация не найдена', 404);

  const reg = regResult.rows[0];
  if (reg.distance_km < 100) {
    throw new AppError('Группа А доступна только для GRAND (114 км)', 422);
  }

  const groupA: AgeCategory = reg.gender === 'female' ? 'FA' : 'A';
  await manualAssignBib(id, reg.event_id, Number(bib_number), groupA);

  const updated = await query('SELECT * FROM event_registrations WHERE id = $1', [id]);
  return res.json({ registration: updated.rows[0] });
};

/**
 * POST /api/admin/events/:eventId/auto-assign-all
 * Автоматически назначает номера всем участникам события у которых нет номера
 * и bib_number_manual = false.
 */
export const autoAssignAll = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  const regs = await query(
    `SELECT r.id, r.event_id, p.date_of_birth, p.gender, d.distance_km
     FROM event_registrations r
     JOIN profiles p ON r.user_id = p.id
     JOIN event_distances d ON r.distance_id = d.id
     WHERE r.event_id = $1
       AND r.bib_number IS NULL
       AND r.bib_number_manual = false
       AND p.date_of_birth IS NOT NULL
       AND p.gender IS NOT NULL`,
    [eventId],
  );

  let assigned = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const reg of regs.rows) {
    try {
      const category = determineCategory(reg.distance_km, reg.gender, reg.date_of_birth);
      const range = getRangeForCategory(category);
      if (range.manualOnly) { skipped++; continue; }
      const bib = await autoAssignBib(reg.id, reg.event_id, category);
      if (bib !== null) assigned++;
      else { skipped++; errors.push(`Диапазон ${category} исчерпан`); }
    } catch (e: any) {
      errors.push(e.message);
    }
  }

  return res.json({ assigned, skipped, errors });
};

export const getUserRoles = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const result = await query('SELECT * FROM user_roles WHERE user_id = $1', [userId]);

  res.json({ roles: result.rows });
};

export const addUserRole = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['participant', 'organizer', 'moderator', 'admin'].includes(role)) {
    throw new AppError('Недопустимая роль', 400);
  }

  const result = await query(
    'INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO NOTHING RETURNING *',
    [userId, role]
  );

  res.json({ role: result.rows[0] || { user_id: userId, role } });
};

export const removeUserRole = async (req: Request, res: Response) => {
  const { userId, role } = req.params;

  const result = await query(
    'DELETE FROM user_roles WHERE user_id = $1 AND role = $2 RETURNING *',
    [userId, role]
  );

  if (result.rows.length === 0) {
    throw new AppError('Роль не найдена', 404);
  }

  res.json({ success: true });
};
