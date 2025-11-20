import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users/profile - Lấy thông tin profile của user hiện tại
router.get('/profile', userController.getProfile);

// PUT /api/users/profile - Cập nhật profile
router.put('/profile', userController.updateProfile);

// Admin only routes
router.get('/', authorize(Role.ADMIN), userController.getAllUsers);
router.patch('/:id/status', authorize(Role.ADMIN), userController.updateUserStatus);

export default router;

