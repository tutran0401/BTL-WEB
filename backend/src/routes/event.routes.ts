import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createEventSchema, updateEventSchema } from '../validators/event.validator';
import { Role } from '@prisma/client';

const router = Router();

// Public routes with optional authentication (để admin có thể filter theo status)
router.get('/', optionalAuthenticate, eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Authenticated routes
router.use(authenticate);

// Event Manager routes
router.post(
  '/',
  authorize(Role.EVENT_MANAGER, Role.ADMIN),
  validate(createEventSchema),
  eventController.createEvent
);

router.put(
  '/:id',
  authorize(Role.EVENT_MANAGER, Role.ADMIN),
  validate(updateEventSchema),
  eventController.updateEvent
);

router.delete(
  '/:id',
  authorize(Role.EVENT_MANAGER, Role.ADMIN),
  eventController.deleteEvent
);

// Admin routes
router.patch(
  '/:id/approve',
  authorize(Role.ADMIN),
  eventController.approveEvent
);

router.patch(
  '/:id/reject',
  authorize(Role.ADMIN),
  eventController.rejectEvent
);

export default router;

