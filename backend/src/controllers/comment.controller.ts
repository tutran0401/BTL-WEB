import { Request, Response } from 'express';
import prisma from '../config/database';
import { io } from '../server';

// GET /api/comments/posts/:postId
export const getPostComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatar: true
            }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'asc' }
      }),
      prisma.comment.count({ where: { postId } })
    ]);

    res.json({
      comments,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/comments/posts/:postId
export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.userId;
    const { content } = req.body;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        event: {
          select: {
            id: true
          }
        }
      }
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: userId!,
        postId
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true
          }
        }
      }
    });

    // Emit socket events
    io.to(`event-${post.event.id}`).emit('new-comment', {
      postId,
      comment
    });
    // Also emit global event for dashboard
    io.emit('comment:created', {
      eventId: post.event.id,
      postId,
      comment
    });

    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/comments/:id
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          include: {
            event: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    // Check ownership or admin
    if (comment.authorId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.comment.delete({
      where: { id }
    });

    // Emit socket events
    io.to(`event-${comment.post.event.id}`).emit('comment-deleted', {
      postId: comment.postId,
      commentId: id
    });
    // Also emit global event for dashboard
    io.emit('comment:deleted', {
      eventId: comment.post.event.id,
      postId: comment.postId,
      commentId: id
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

