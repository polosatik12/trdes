import { Response } from 'express';
import { z } from 'zod';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { determineCategory, isEligible } from '../services/bibService';

const registrationSchema = z.object({
  event_id: z.string().uuid(),
  distance_id: z.string().uuid(),
});

export const getUserRegistrations = async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT
      r.*,
      e.name as event_name,
      e.date as event_date,
      e.location as event_location,
      d.name as distance_name,
      d.distance_km
    FROM event_registrations r
    JOIN events e ON r.event_id = e.id
    JOIN event_distances d ON r.distance_id = d.id
    WHERE r.user_id = $1
    ORDER BY e.date DESC`,
    [req.userId]
  );

  res.json({ registrations: result.rows });
};

export const createRegistration = async (req: AuthRequest, res: Response) => {
  const validData = registrationSchema.parse(req.body);

  const existing = await query(
    'SELECT id FROM event_registrations WHERE user_id = $1 AND distance_id = $2',
    [req.userId, validData.distance_id]
  );

  if (existing.rows.length > 0) {
    throw new AppError('Вы уже зарегистрированы на эту дистанцию', 400);
  }

  // Проверяем возраст: участник должен быть 18+ на дату старта
  const profileResult = await query(
    'SELECT date_of_birth, gender FROM profiles WHERE id = $1',
    [req.userId]
  );
  const profile = profileResult.rows[0];

  const eventResult = await query(
    'SELECT e.date, d.distance_km FROM events e JOIN event_distances d ON d.event_id = e.id WHERE d.id = $1',
    [validData.distance_id]
  );
  if (eventResult.rows.length === 0) {
    throw new AppError('Дистанция не найдена', 404);
  }
  const { date: eventDate, distance_km } = eventResult.rows[0];

  if (!profile?.date_of_birth) {
    throw new AppError('Укажите дату рождения в профиле перед регистрацией', 422);
  }
  if (!isEligible(profile.date_of_birth, eventDate)) {
    throw new AppError('Участие разрешено только для лиц 18 лет и старше на дату старта', 422);
  }

  // Определяем категорию
  let age_category: string | null = null;
  if (profile.gender) {
    age_category = determineCategory(distance_km, profile.gender, profile.date_of_birth);
  }

  const result = await query(
    `INSERT INTO event_registrations (user_id, event_id, distance_id, payment_status, age_category)
     VALUES ($1, $2, $3, 'pending', $4) RETURNING *`,
    [req.userId, validData.event_id, validData.distance_id, age_category]
  );

  res.json({ registration: result.rows[0] });
};

export const getRegistrationById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query(
    `SELECT
      r.*,
      e.name as event_name,
      e.date as event_date,
      e.location as event_location,
      d.name as distance_name,
      d.distance_km,
      d.price_kopecks
    FROM event_registrations r
    JOIN events e ON r.event_id = e.id
    JOIN event_distances d ON r.distance_id = d.id
    WHERE r.id = $1 AND r.user_id = $2`,
    [id, req.userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Регистрация не найдена', 404);
  }

  res.json({ registration: result.rows[0] });
};

export const updateRegistration = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { payment_status } = req.body;

  if (!['pending', 'paid', 'refunded'].includes(payment_status)) {
    throw new AppError('Недопустимый статус оплаты', 400);
  }

  const result = await query(
    `UPDATE event_registrations
     SET payment_status = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 RETURNING *`,
    [payment_status, id, req.userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Регистрация не найдена', 404);
  }

  res.json({ registration: result.rows[0] });
};
