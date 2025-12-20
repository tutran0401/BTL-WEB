import { Request, Response } from 'express';
import prisma from '../config/database';
import { io } from '../server';

// GET /api/posts/events/:eventId
export const getEventPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    // Check if event exists and is approved
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.status !== 'APPROVED') {
      res.status(400).json({ error: 'Event is not approved yet' });
      return;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { eventId },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatar: true
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true
            }
          },
          likes: {
            where: { userId: req.user?.userId },
            select: { id: true }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.post.count({ where: { eventId } })
    ]);

    // Add isLiked field
    const postsWithLiked = posts.map(post => ({
      ...post,
      isLiked: post.likes.length > 0,
      likes: undefined // Remove likes array, only keep count
    }));

    res.json({
      posts: postsWithLiked,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get event posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/posts/events/:eventId
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.userId;
    const { content } = req.body;

    // Check if event exists and is approved
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.status !== 'APPROVED') {
      res.status(400).json({ error: 'Cannot post on unapproved event' });
      return;
    }

    // Handle uploaded images
    let imageUrl = null;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // For now, use only the first image
      // You can modify to support multiple images
      const file = req.files[0];
      imageUrl = `/uploads/${file.filename}`;
    }

    // Check if user is registered for event (optional check)
    // You can enable this if you want only registered users to post
    /*
    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: userId!,
          eventId
        }
      }
    });

    if (!registration) {
      res.status(403).json({ error: 'You must be registered for this event to post' });
      return;
    }
    */

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        authorId: userId!,
        eventId
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    // Thông báo cho Event Manager (nếu không phải chính manager post)
    if (event.managerId !== userId) {
      const { sendPushNotification } = await import('./notification.controller');
      await sendPushNotification(
        event.managerId,
        'Bài viết mới',
        `${(req.user as any)?.fullName || 'Một người dùng'} đã đăng bài viết mới trên sự kiện "${event.title}"`,
        { type: 'NEW_POST', eventId: event.id, postId: post.id }
      );

      io.emit(`user:${event.managerId}:notification`, {
        id: post.id,
        title: 'Bài viết mới',
        message: `${(req.user as any)?.fullName || 'Một người dùng'} đã đăng bài viết mới trên sự kiện "${event.title}"`,
        type: 'NEW_POST',
        isRead: false,
        createdAt: new Date().toISOString(),
        data: { eventId: event.id, postId: post.id }
      });
    }

    // Emit socket events
    io.to(`event-${eventId}`).emit('new-post', post);
    // Also emit global event for dashboard
    io.emit('post:created', {
      eventId,
      post
    });

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/posts/:id
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Check ownership or admin
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.post.delete({
      where: { id }
    });

    // Emit socket events
    io.to(`event-${post.eventId}`).emit('post-deleted', { postId: id });
    // Also emit global event for dashboard
    io.emit('post:updated', {
      eventId: post.eventId,
      postId: id,
      action: 'deleted'
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/posts/:id/like
export const toggleLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            fullName: true
          }
        },
        event: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: userId!,
          postId: id
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id }
      });

      // Emit socket events
      io.to(`event-${post.event.id}`).emit('post-unliked', { postId: id });
      // Also emit global event for dashboard
      io.emit('like:removed', {
        eventId: post.event.id,
        postId: id
      });

      res.json({ message: 'Post unliked', isLiked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: userId!,
          postId: id
        }
      });

      // Thông báo cho Post Author (nếu không phải chính author like)
      // Debouncing: Chỉ thông báo nếu đây là like đầu tiên hoặc đã qua 5 phút từ notification cuối
      if (post.authorId !== userId) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // Kiểm tra xem đã có notification like trong 5 phút gần đây chưa
        const recentLikeNotification = await prisma.notification.findFirst({
          where: {
            userId: post.authorId,
            type: 'NEW_LIKE',
            data: {
              path: ['postId'],
              equals: id
            },
            createdAt: {
              gte: fiveMinutesAgo
            }
          }
        });

        // Chỉ gửi notification nếu chưa có notification like gần đây
        if (!recentLikeNotification) {
          const { sendPushNotification } = await import('./notification.controller');
          await sendPushNotification(
            post.authorId,
            'Lượt thích mới',
            `${(req.user as any)?.fullName || 'Một người dùng'} đã thích bài viết của bạn`,
            { type: 'NEW_LIKE', eventId: post.event.id, postId: id }
          );

          io.emit(`user:${post.authorId}:notification`, {
            id: `like-${id}-${Date.now()}`,
            title: 'Lượt thích mới',
            message: `${(req.user as any)?.fullName || 'Một người dùng'} đã thích bài viết của bạn`,
            type: 'NEW_LIKE',
            isRead: false,
            createdAt: new Date().toISOString(),
            data: { eventId: post.event.id, postId: id }
          });
        }
      }

      // Emit socket events
      io.to(`event-${post.event.id}`).emit('post-liked', { postId: id });
      // Also emit global event for dashboard
      io.emit('like:created', {
        eventId: post.event.id,
        postId: id
      });

      res.json({ message: 'Post liked', isLiked: true });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

