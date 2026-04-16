import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import * as adminController from '../controllers/adminController';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin', 'organizer'));

router.get('/participants', asyncHandler(adminController.getAllParticipants));
router.get('/participants/:id', asyncHandler(adminController.getParticipantById));

router.get('/registrations', asyncHandler(adminController.getAllRegistrations));
router.put('/registrations/:id', asyncHandler(adminController.updateRegistration));
router.post('/registrations/:id/assign-bib', asyncHandler(adminController.assignBib));
router.post('/registrations/:id/move-to-group-a', asyncHandler(adminController.moveToGroupA));
router.post('/events/:eventId/auto-assign-all', asyncHandler(adminController.autoAssignAll));

router.get('/health-certificates', asyncHandler(adminController.getAllHealthCertificates));
router.put('/health-certificates/:id', asyncHandler(adminController.updateHealthCertificate));

router.get('/corporate-applications', asyncHandler(adminController.getAllCorporateApplications));
router.put('/corporate-applications/:id', asyncHandler(adminController.updateCorporateApplication));

router.post('/events', requireRole('admin'), asyncHandler(adminController.createEvent));
router.put('/events/:id', requireRole('admin'), asyncHandler(adminController.updateEvent));
router.delete('/events/:id', requireRole('admin'), asyncHandler(adminController.deleteEvent));

router.post('/events/:eventId/distances', requireRole('admin'), asyncHandler(adminController.createDistance));
router.put('/distances/:id', requireRole('admin'), asyncHandler(adminController.updateDistance));
router.delete('/distances/:id', requireRole('admin'), asyncHandler(adminController.deleteDistance));

router.post('/results', asyncHandler(adminController.createResult));
router.put('/results/:id', asyncHandler(adminController.updateResult));
router.delete('/results/:id', asyncHandler(adminController.deleteResult));

router.get('/users/:userId/roles', requireRole('admin'), asyncHandler(adminController.getUserRoles));
router.post('/users/:userId/roles', requireRole('admin'), asyncHandler(adminController.addUserRole));
router.delete('/users/:userId/roles/:role', requireRole('admin'), asyncHandler(adminController.removeUserRole));

export default router;
