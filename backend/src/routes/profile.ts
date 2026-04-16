import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import * as profileController from '../controllers/profileController';

const router = Router();

router.get('/', authenticate, asyncHandler(profileController.getProfile));
router.put('/', authenticate, asyncHandler(profileController.updateProfile));
router.get('/emergency-contacts', authenticate, asyncHandler(profileController.getEmergencyContacts));
router.post('/emergency-contacts', authenticate, asyncHandler(profileController.createEmergencyContact));
router.put('/emergency-contacts/:id', authenticate, asyncHandler(profileController.updateEmergencyContact));
router.delete('/emergency-contacts/:id', authenticate, asyncHandler(profileController.deleteEmergencyContact));

export default router;
