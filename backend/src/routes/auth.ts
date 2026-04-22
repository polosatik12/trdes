import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter, emailLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/send-verification-code', emailLimiter, asyncHandler(authController.sendVerificationCode));
router.post('/verify-code', asyncHandler(authController.verifyCode));
router.post('/register', authLimiter, asyncHandler(authController.register));
router.post('/login', authLimiter, asyncHandler(authController.login));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.get('/me', authenticate, asyncHandler(authController.getCurrentUser));
router.post('/refresh', asyncHandler(authController.refreshToken));
router.post('/change-email', authenticate, authLimiter, asyncHandler(authController.changeEmail));
router.post('/reset-password', asyncHandler(authController.resetPassword));

export default router;
