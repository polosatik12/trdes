import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { upload, handleUploadError } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';
import * as healthCertificatesController from '../controllers/healthCertificatesController';

const router = Router();

router.get('/', authenticate, asyncHandler(healthCertificatesController.getUserCertificates));
router.post('/', authenticate, asyncHandler(healthCertificatesController.createCertificate));
router.post('/upload', authenticate, uploadLimiter, upload.single('document'), handleUploadError, asyncHandler(healthCertificatesController.uploadDocument));
router.get('/:id', authenticate, asyncHandler(healthCertificatesController.getCertificateById));
router.put('/:id', authenticate, asyncHandler(healthCertificatesController.updateCertificate));
router.delete('/:id', authenticate, asyncHandler(healthCertificatesController.deleteCertificate));

export default router;
