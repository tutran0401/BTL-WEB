import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Middleware xác thực JWT
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('🔐 Auth middleware - checking token...');
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('Full auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No token provided');
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    console.log('Extracted token (first 30 chars):', token.substring(0, 30) + '...');
    console.log('Token length:', token.length);
    
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    console.log('✅ Token valid, user:', decoded.email);

    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error instanceof Error ? error.message : error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware kiểm tra vai trò
export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

// Middleware kiểm tra tài khoản active
export const checkAccountStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const prisma = (await import('../config/database')).default;
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { accountStatus: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.accountStatus === 'LOCKED') {
      res.status(403).json({ error: 'Your account has been locked. Please contact administrator.' });
      return;
    }

    if (user.accountStatus === 'PENDING') {
      res.status(403).json({ error: 'Your account is pending approval.' });
      return;
    }

    next();
  } catch (error) {
    console.error('Check account status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware xác thực tùy chọn (không bắt buộc, nhưng nếu có token thì validate)
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Không có token, tiếp tục nhưng req.user = undefined
      next();
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      req.user = decoded;
    } catch (error) {
      // Token không hợp lệ, bỏ qua và tiếp tục
      req.user = undefined;
    }

    next();
  } catch (error) {
    next(); // Có lỗi nhưng vẫn cho qua
  }
};

