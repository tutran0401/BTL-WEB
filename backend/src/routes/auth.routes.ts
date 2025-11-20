import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

// POST /api/auth/register - Đăng ký tài khoản
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login - Đăng nhập
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/logout - Đăng xuất (optional, for future use)
router.post('/logout', authController.logout);

export default router;

