import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import * as yandexAuthController from '../controllers/yandexAuthController';

const router = Router();

// Public: get Yandex OAuth URL
router.get('/url', asyncHandler(yandexAuthController.getYandexAuthUrl));

// Public: Yandex OAuth callback
router.get('/callback', asyncHandler(yandexAuthController.yandexCallback));

// Public: exchange code for JWT (called from frontend)
router.post('/exchange', asyncHandler(yandexAuthController.yandexExchange));

// Authenticated: link/unlink Yandex account
router.post('/link', authenticate, asyncHandler(yandexAuthController.linkYandexAccount));
router.delete('/unlink', authenticate, asyncHandler(yandexAuthController.unlinkYandexAccount));
router.get('/status', authenticate, asyncHandler(yandexAuthController.getYandexLinkStatus));

export default router;
