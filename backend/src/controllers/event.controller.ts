import { Request, Response } from 'express';
import prisma from '../config/database';
import { sendPushNotification } from './notification.controller';
import { io } from '../server';

// GET /api/events
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      category,
      search,
      startDate,
      endDate,
      page = '1',
      limit = '10'
    } = req.query;

    const where: any = {};

    // Logic phân quyền xem events
    // KHÔNG hiển thị các sự kiện bị từ chối (REJECTED) cho tất cả user roles
    if (req.user?.role === 'ADMIN') {
      // Admin có thể filter theo status, nhưng loại bỏ REJECTED
      if (status) {
        where.status = status;
      } else {
        // Nếu không có filter status, admin sẽ thấy tất cả TRỪ REJECTED
        where.status = { not: 'REJECTED' };
      }
    } else if (req.user?.role === 'EVENT_MANAGER') {
      // Event Manager có thể xem events của chính họ (PENDING, APPROVED - không có REJECTED)
      // và các events APPROVED của người khác
      if (status) {
        // Nếu có filter status, áp dụng filter đó
        where.status = status;
      } else {
        // Loại bỏ REJECTED
        where.status = { not: 'REJECTED' };
      }
    } else {
      // Volunteer hoặc không đăng nhập chỉ thấy events đã approve
      where.status = 'APPROVED';
    }

    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (startDate) {
      where.startDate = { gte: new Date(startDate as string) };
    }
    if (endDate) {
      where.endDate = { lte: new Date(endDate as string) };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    let events, total;

    if (req.user?.role === 'EVENT_MANAGER' && !status) {
      // Event Manager xem tất cả events của họ (TRỪ REJECTED) + events APPROVED của người khác
      const [allEvents, count] = await Promise.all([
        prisma.event.findMany({
          where,
          include: {
            manager: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            },
            _count: {
              select: {
                registrations: {
                  where: { status: { in: ['APPROVED', 'COMPLETED'] } }
                },
                posts: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.event.count({ where })
      ]);

      // Filter: ((events của họ) VÀ (không phải REJECTED)) HOẶC (events APPROVED)
      const filteredEvents = allEvents.filter(event =>
        (event.managerId === req.user?.userId && event.status !== 'REJECTED') || event.status === 'APPROVED'
      );

      // Áp dụng pagination cho kết quả đã filter
      events = filteredEvents.slice(skip, skip + take);
      total = filteredEvents.length;
    } else {
      // Admin hoặc Volunteer: query bình thường
      [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          include: {
            manager: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            },
            _count: {
              select: {
                registrations: {
                  where: { status: { in: ['APPROVED', 'COMPLETED'] } }
                },
                posts: true
              }
            }
          },
          skip,
          take,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.event.count({ where })
      ]);
    }

    res.json({
      events,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/events/:id
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        _count: {
          select: {
            registrations: {
              where: { status: { in: ['APPROVED', 'COMPLETED'] } }
            },
            posts: true
          }
        }
      }
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Không cho phép truy cập vào sự kiện REJECTED
    // (Chỉ event manager của sự kiện đó hoặc admin mới có thể xem)
    if (event.status === 'REJECTED') {
      // Cho phép manager của event hoặc admin xem
      if (userRole !== 'ADMIN' && event.managerId !== userId) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }
    }

    // Kiểm tra quyền xem sự kiện PENDING
    if (event.status === 'PENDING') {
      // Chỉ admin hoặc event manager của sự kiện đó mới có thể xem
      if (userRole !== 'ADMIN' && event.managerId !== userId) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/events
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      category,
      maxParticipants,
      imageUrl
    } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        category,
        maxParticipants,
        imageUrl,
        managerId: userId!,
        status: 'PENDING'
      },
      include: {
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Event created successfully. Waiting for admin approval.',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/events/:id
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Check ownership
    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.managerId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Prepare update data
    let updateData = { ...req.body };

    // Nếu là Event Manager và sự kiện đang ở trạng thái REJECTED
    // Khi update, tự động chuyển về PENDING để admin duyệt lại
    if (userRole === 'EVENT_MANAGER' && event.status === 'REJECTED') {
      updateData.status = 'PENDING';
      console.log(`🔄 Event ${id} status changed from REJECTED to PENDING for re-approval`);
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        _count: {
          select: {
            registrations: {
              where: { status: { in: ['APPROVED', 'COMPLETED'] } }
            },
            posts: true
          }
        }
      }
    });

    // Emit global event for dashboard
    io.emit('event:updated', {
      eventId: id,
      event: updatedEvent
    });

    // Nếu chuyển từ REJECTED sang PENDING, gửi thông báo đặc biệt
    if (event.status === 'REJECTED' && updatedEvent.status === 'PENDING') {
      // Thông báo cho event manager
      await sendPushNotification(
        event.managerId,
        'Sự kiện đã được gửi lại',
        `Sự kiện "${updatedEvent.title}" đã được gửi lại để admin xem xét.`,
        { type: 'EVENT_RESUBMITTED', eventId: updatedEvent.id }
      );

      // Emit socket event
      io.emit(`user:${event.managerId}:notification`, {
        id: updatedEvent.id,
        title: 'Sự kiện đã được gửi lại',
        message: `Sự kiện "${updatedEvent.title}" đã được gửi lại để admin xem xét.`,
        type: 'EVENT_RESUBMITTED',
        isRead: false,
        createdAt: new Date().toISOString(),
        data: { eventId: updatedEvent.id }
      });

      res.json({
        message: 'Sự kiện đã được cập nhật và gửi lại để admin duyệt',
        event: updatedEvent
      });
    } else {
      res.json({
        message: 'Event updated successfully',
        event: updatedEvent
      });
    }
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/events/:id
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Check ownership
    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.managerId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.event.delete({
      where: { id }
    });

    // Emit global event for dashboard
    io.emit('event:deleted', {
      eventId: id
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/events/:id/approve
export const approveEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await prisma.event.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: {
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        _count: {
          select: {
            registrations: {
              where: { status: 'APPROVED' }
            },
            posts: true
          }
        }
      }
    });

    // Send notification to event manager
    await sendPushNotification(
      event.managerId,
      'Sự kiện được duyệt',
      `Sự kiện "${event.title}" của bạn đã được phê duyệt và công khai.`,
      { type: 'EVENT_APPROVED', eventId: event.id }
    );

    // Emit socket event for real-time notification
    io.emit(`user:${event.managerId}:notification`, {
      id: event.id,
      title: 'Sự kiện được duyệt',
      message: `Sự kiện "${event.title}" của bạn đã được phê duyệt và công khai.`,
      type: 'EVENT_APPROVED',
      isRead: false,
      createdAt: new Date().toISOString(),
      data: { eventId: event.id }
    });

    // Emit to manager for real-time event list update
    io.emit(`user:${event.managerId}:event:updated`, {
      event,
      action: 'approved'
    });

    // Emit global event for all users to see new approved event
    io.emit('event:approved', {
      event
    });

    res.json({
      message: 'Event approved successfully',
      event
    });
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/events/:id/reject
export const rejectEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await prisma.event.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        _count: {
          select: {
            registrations: {
              where: { status: 'APPROVED' }
            },
            posts: true
          }
        }
      }
    });

    // Send notification to event manager
    await sendPushNotification(
      event.managerId,
      'Sự kiện bị từ chối',
      `Sự kiện "${event.title}" của bạn đã bị từ chối.`,
      { type: 'EVENT_REJECTED', eventId: event.id }
    );

    // Emit socket event for real-time notification
    io.emit(`user:${event.managerId}:notification`, {
      id: event.id,
      title: 'Sự kiện bị từ chối',
      message: `Sự kiện "${event.title}" của bạn đã bị từ chối.`,
      type: 'EVENT_REJECTED',
      isRead: false,
      createdAt: new Date().toISOString(),
      data: { eventId: event.id }
    });

    // Emit to manager for real-time event list update
    io.emit(`user:${event.managerId}:event:updated`, {
      event,
      action: 'rejected'
    });

    // Emit global event for dashboard
    io.emit('event:rejected', {
      eventId: event.id
    });

    res.json({
      message: 'Event rejected',
      event
    });
  } catch (error) {
    console.error('Reject event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

