import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { getGallery, addGalleryItem, deleteGalleryItem, uploadGalleryFile, galleryUpload } from '../controllers/mediaGalleryController';

const router = Router();

router.get('/', asyncHandler(getGallery));
router.post('/', authenticate, requireRole('admin', 'organizer'), asyncHandler(addGalleryItem));
router.post('/upload', authenticate, requireRole('admin', 'organizer'), galleryUpload.single('file'), asyncHandler(uploadGalleryFile));
router.delete('/:id', authenticate, requireRole('admin', 'organizer'), asyncHandler(deleteGalleryItem));

export default router;
