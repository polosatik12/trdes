import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { createContactRequest, getAllContactRequests } from '../controllers/contactController';

const router = Router();

router.post('/', asyncHandler(createContactRequest));
router.get('/', authenticate, requireRole('admin', 'organizer'), asyncHandler(getAllContactRequests));

export default router;
