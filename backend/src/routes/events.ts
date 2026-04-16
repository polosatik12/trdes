import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as eventsController from '../controllers/eventsController';

const router = Router();

router.get('/', asyncHandler(eventsController.getEvents));
router.get('/:id', asyncHandler(eventsController.getEventById));
router.get('/:id/distances', asyncHandler(eventsController.getEventDistances));
router.get('/:id/results', asyncHandler(eventsController.getEventResults));

export default router;
