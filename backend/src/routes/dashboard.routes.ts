import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/dashboard - Dashboard cho tất cả users
router.get('/', dashboardController.getDashboard);

// GET /api/dashboard/admin - Dashboard cho admin
router.get('/admin', authorize(Role.ADMIN), dashboardController.getAdminDashboard);

// GET /api/dashboard/export/events - Export events (CSV/JSON)
router.get(
  '/export/events',
  authorize(Role.ADMIN),
  dashboardController.exportEvents
);

// GET /api/dashboard/export/users - Export users (CSV/JSON)
router.get(
  '/export/users',
  authorize(Role.ADMIN),
  dashboardController.exportUsers
);

export default router;

