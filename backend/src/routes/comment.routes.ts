import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createCommentSchema } from '../validators/comment.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/comments/posts/:postId - Lấy tất cả comments của một post
router.get('/posts/:postId', commentController.getPostComments);

// POST /api/comments/posts/:postId - Tạo comment mới
router.post('/posts/:postId', validate(createCommentSchema), commentController.createComment);

// DELETE /api/comments/:id - Xóa comment
router.delete('/:id', commentController.deleteComment);

export default router;

