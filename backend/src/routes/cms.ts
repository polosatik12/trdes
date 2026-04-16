import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { cmsAuthenticate, cmsRequireRole } from '../middleware/cmsAuth';
import { cmsUpload } from '../middleware/cmsUpload';
import * as cmsController from '../controllers/cmsController';
import * as cmsAssetsController from '../controllers/cmsAssetsController';

const router = Router();

// Public routes (read-only, for frontend rendering)
router.get('/page/:slug', asyncHandler(cmsController.getPageBySlug));

// Admin routes — all require CMS auth
router.use('/admin', cmsAuthenticate);

// Pages
router.get('/admin/pages', asyncHandler(cmsController.getAllPages));
router.get('/admin/pages/:id', asyncHandler(cmsController.getPageById));
router.post('/admin/pages', cmsRequireRole('admin'), asyncHandler(cmsController.createPage));
router.put('/admin/pages/:id', cmsRequireRole('admin'), asyncHandler(cmsController.updatePage));
router.delete('/admin/pages/:id', cmsRequireRole('admin'), asyncHandler(cmsController.deletePage));

// Blocks
router.post('/admin/blocks', cmsRequireRole('admin'), asyncHandler(cmsController.createBlock));
router.put('/admin/blocks/:id', cmsRequireRole('admin'), asyncHandler(cmsController.updateBlock));
router.delete('/admin/blocks/:id', cmsRequireRole('admin'), asyncHandler(cmsController.deleteBlock));
router.post('/admin/blocks/reorder', cmsRequireRole('admin'), asyncHandler(cmsController.reorderBlocks));

// News
router.get('/admin/news', asyncHandler(cmsController.getAllNews));
router.get('/admin/news/:id', asyncHandler(cmsController.getNewsById));
router.post('/admin/news', asyncHandler(cmsController.createNews));
router.put('/admin/news/:id', asyncHandler(cmsController.updateNews));
router.delete('/admin/news/:id', cmsRequireRole('admin'), asyncHandler(cmsController.deleteNews));

// Assets (media library)
router.get('/admin/assets', asyncHandler(cmsAssetsController.getAllAssets));
router.post('/admin/assets', cmsUpload.single('file'), asyncHandler(cmsAssetsController.uploadAsset));
router.delete('/admin/assets/:id', asyncHandler(cmsAssetsController.deleteAsset));

export default router;
