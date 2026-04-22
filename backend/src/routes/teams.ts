import { Router } from 'express';
import { getAmateurTeams } from '../controllers/teamsController';

const router = Router();

router.get('/', getAmateurTeams);

export default router;
