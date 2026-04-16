import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import * as analytics from '../controllers/analyticsController';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin', 'organizer'));

router.get('/overview',  asyncHandler(analytics.getOverview));
router.get('/geography', asyncHandler(analytics.getGeography));
router.get('/activity',  asyncHandler(analytics.getActivity));
router.get('/events',    asyncHandler(analytics.getEventAnalytics));
router.get('/finance',   asyncHandler(analytics.getFinance));
router.get('/export',    asyncHandler(analytics.exportCSV));

export default router;
