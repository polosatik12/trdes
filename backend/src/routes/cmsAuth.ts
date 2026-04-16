import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as cmsAuthController from '../controllers/cmsAuthController';
import { cmsAuthenticate } from '../middleware/cmsAuth';

const router = Router();

router.post('/login', asyncHandler(cmsAuthController.login));
router.post('/change-password', cmsAuthenticate, asyncHandler(cmsAuthController.changePassword));

export default router;
