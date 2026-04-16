import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { robokassaIpWhitelist } from '../middleware/robokassaIp';
import * as paymentsController from '../controllers/paymentsController';

const router = Router();

// User routes (require auth)
router.post('/', authenticate, asyncHandler(paymentsController.createPayment));
router.get('/', authenticate, asyncHandler(paymentsController.getUserPayments));
router.get('/:id', authenticate, asyncHandler(paymentsController.getPaymentById));

// Robokassa callbacks (no auth required, IP whitelisted in production)
router.post('/robokassa/result', robokassaIpWhitelist, asyncHandler(paymentsController.robokassaResultUrl));
router.get('/robokassa/success', asyncHandler(paymentsController.robokassaSuccessUrl));
router.get('/robokassa/fail', asyncHandler(paymentsController.robokassaFailUrl));

export default router;
