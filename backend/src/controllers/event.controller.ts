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
    if (req.user?.role === 'ADMIN') {
      // Admin có thể filter theo status bất kỳ
      if (status) {
        where.status = status;
      }
      // Nếu không có filter status, admin sẽ thấy tất cả
    } else if (req.user?.role === 'EVENT_MANAGER') {
      // Event Manager có thể xem TẤT CẢ events của chính họ (PENDING, APPROVED, REJECTED)
      // và các events APPROVED của người khác
      if (status) {
        // Nếu có filter status, áp dụng filter đó
        where.status = status;
      }
      // Không filter status ở đây, sẽ filter sau khi query
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
      // Event Manager xem tất cả events của họ + events APPROVED của người khác
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
                  where: { status: 'APPROVED' }
                },
                posts: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.event.count({ where })
      ]);

      // Filter: (events của họ) HOẶC (events APPROVED)
      const filteredEvents = allEvents.filter(event => 
        event.managerId === req.user?.userId || event.status === 'APPROVED'
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
                  where: { status: 'APPROVED' }
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

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: req.body,
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

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
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
      { type: 'event_approved', eventId: event.id }
    );

    // Emit socket event for real-time notification
    io.emit(`user:${event.managerId}:notification`, {
      id: event.id,
      title: 'Sự kiện được duyệt',
      message: `Sự kiện "${event.title}" của bạn đã được phê duyệt và công khai.`,
      type: 'event_approved',
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
      { type: 'event_rejected', eventId: event.id }
    );

    // Emit socket event for real-time notification
    io.emit(`user:${event.managerId}:notification`, {
      id: event.id,
      title: 'Sự kiện bị từ chối',
      message: `Sự kiện "${event.title}" của bạn đã bị từ chối.`,
      type: 'event_rejected',
      data: { eventId: event.id }
    });

    // Emit to manager for real-time event list update
    io.emit(`user:${event.managerId}:event:updated`, {
      event,
      action: 'rejected'
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

