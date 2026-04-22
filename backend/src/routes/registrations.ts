import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import * as registrationsController from '../controllers/registrationsController';

const router = Router();

router.get('/', authenticate, asyncHandler(registrationsController.getUserRegistrations));
router.post('/corporate-group', authenticate, asyncHandler(registrationsController.createCorporateGroupRegistration));
router.post('/', authenticate, asyncHandler(registrationsController.createRegistration));
router.get('/:id', authenticate, asyncHandler(registrationsController.getRegistrationById));
router.put('/:id', authenticate, asyncHandler(registrationsController.updateRegistration));

export default router;
