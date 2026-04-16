import { Request, Response } from 'express';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';

export const getEvents = async (req: Request, res: Response) => {
  const { status } = req.query;

  let queryText = 'SELECT * FROM events';
  const params: any[] = [];

  if (status) {
    queryText += ' WHERE status = $1';
    params.push(status);
  }

  queryText += ' ORDER BY date DESC';

  const result = await query(queryText, params);

  res.json({ events: result.rows });
};

export const getEventById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await query('SELECT * FROM events WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Мероприятие не найдено', 404);
  }

  res.json({ event: result.rows[0] });
};

export const getEventDistances = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await query(
    'SELECT * FROM event_distances WHERE event_id = $1 AND is_active = true ORDER BY distance_km DESC',
    [id]
  );

  res.json({ distances: result.rows });
};

export const getEventResults = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { distance_id } = req.query;

  let queryText = `
    SELECT
      r.*,
      reg.bib_number,
      p.first_name,
      p.last_name,
      p.patronymic,
      p.city,
      p.team_name,
      d.name as distance_name,
      d.distance_km
    FROM event_results r
    JOIN event_registrations reg ON r.registration_id = reg.id
    JOIN profiles p ON reg.user_id = p.id
    JOIN event_distances d ON r.distance_id = d.id
    WHERE r.event_id = $1
  `;

  const params: any[] = [id];

  if (distance_id) {
    queryText += ' AND r.distance_id = $2';
    params.push(distance_id);
  }

  queryText += ' ORDER BY r.place ASC NULLS LAST';

  const result = await query(queryText, params);

  res.json({ results: result.rows });
};
