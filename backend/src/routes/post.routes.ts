import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createPostSchema } from '../validators/post.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/posts/events/:eventId - Lấy tất cả posts của một event
router.get('/events/:eventId', postController.getEventPosts);

// POST /api/posts/events/:eventId - Tạo post mới
router.post('/events/:eventId', validate(createPostSchema), postController.createPost);

// DELETE /api/posts/:id - Xóa post
router.delete('/:id', postController.deletePost);

// POST /api/posts/:id/like - Like/Unlike post
router.post('/:id/like', postController.toggleLike);

export default router;

