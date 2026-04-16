import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import * as promoCodesController from '../controllers/promoCodesController';

const router = Router();

// Public: validate promo code
router.post('/validate', asyncHandler(promoCodesController.validatePromoCode));

// Public: increment usage (called on checkout)
router.post('/use', asyncHandler(promoCodesController.usePromoCode));

// Admin routes — require admin/organizer role
router.use(authenticate);
router.use(requireRole('admin', 'organizer'));

router.get('/', asyncHandler(promoCodesController.getAllPromoCodes));
router.post('/', asyncHandler(promoCodesController.createPromoCode));
router.put('/:id', asyncHandler(promoCodesController.updatePromoCode));
router.delete('/:id', asyncHandler(promoCodesController.deletePromoCode));

export default router;
