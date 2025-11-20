import { Request, Response } from 'express';
import prisma from '../config/database';
import webpush from 'web-push';

// Configure web push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@volunteerhub.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// GET /api/notifications
export const getMyNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { page = '1', limit = '20', isRead } = req.query;

    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId, isRead: false }
      })
    ]);

    res.json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/notifications/subscribe
export const subscribeToPush = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      res.status(400).json({ error: 'Invalid subscription data' });
      return;
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint }
    });

    if (existingSubscription) {
      res.json({ message: 'Already subscribed' });
      return;
    }

    await prisma.pushSubscription.create({
      data: {
        userId: userId!,
        endpoint,
        keys
      }
    });

    res.json({ message: 'Subscribed to push notifications successfully' });
  } catch (error) {
    console.error('Subscribe to push error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to send push notification
export const sendPushNotification = async (
  userId: string,
  title: string,
  message: string,
  data?: any
) => {
  try {
    // Save notification to database
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: data?.type || 'general',
        data
      }
    });

    // Get user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    // Send push notification to all subscriptions
    const notifications = subscriptions.map(sub => {
      return webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys as any
        },
        JSON.stringify({
          title,
          body: message,
          data
        })
      ).catch((error: any) => {
        console.error('Push notification error:', error);
        // If subscription is invalid, delete it
        if (error.statusCode === 410) {
          prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
      });
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error('Send push notification error:', error);
  }
};

