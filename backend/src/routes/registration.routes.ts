import { Router } from 'express';
import * as registrationController from '../controllers/registration.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Volunteer routes
router.post('/events/:eventId/register', registrationController.registerForEvent);
router.delete('/events/:eventId/cancel', registrationController.cancelRegistration);
router.get('/my-registrations', registrationController.getMyRegistrations);

// Event Manager routes
router.get(
  '/events/:eventId/registrations',
  authorize(Role.EVENT_MANAGER, Role.ADMIN),
  registrationController.getEventRegistrations
);

router.patch(
  '/:registrationId/approve',
  authorize(Role.EVENT_MANAGER, Role.ADMIN),
  registrationController.approveRegistration
);

router.patch(
  '/:registrationId/reject',
  authorize(Role.EVENT_MANAGER, Role.ADMIN),
  registrationController.rejectRegistration
);

router.patch(
  '/:registrationId/complete',
  authorize(Role.EVENT_MANAGER, Role.ADMIN),
  registrationController.markAsCompleted
);

export default router;

