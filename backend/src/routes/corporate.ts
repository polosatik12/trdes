import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as corporateController from '../controllers/corporateController';

const router = Router();

router.post('/applications', asyncHandler(corporateController.createApplication));

export default router;
