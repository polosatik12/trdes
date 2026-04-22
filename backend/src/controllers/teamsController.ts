import { Request, Response } from 'express';
import { query } from '../utils/db';

export const getAmateurTeams = async (_req: Request, res: Response) => {
  const result = await query('SELECT id, name FROM amateur_teams ORDER BY name', []);
  res.json({ teams: result.rows });
};
