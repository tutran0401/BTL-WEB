import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/notifications - Lấy danh sách notifications của user
router.get('/', notificationController.getMyNotifications);

// PATCH /api/notifications/:id/read - Đánh dấu đã đọc
router.patch('/:id/read', notificationController.markAsRead);

// PATCH /api/notifications/read-all - Đánh dấu tất cả đã đọc
router.patch('/read-all', notificationController.markAllAsRead);

// POST /api/notifications/subscribe - Đăng ký Web Push
router.post('/subscribe', notificationController.subscribeToPush);

export default router;

