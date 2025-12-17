import { Request, Response } from 'express';
import prisma from '../config/database';
import { sendPushNotification } from './notification.controller';
import { io } from '../server';

// POST /api/registrations/events/:eventId/register
export const registerForEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.userId;

    // Check if event exists and is approved
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.status !== 'APPROVED') {
      res.status(400).json({ error: 'Event is not approved yet' });
      return;
    }

    // Check if max participants reached
    if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
      res.status(400).json({ error: 'Event is full' });
      return;
    }

    // Check if already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: userId!,
          eventId
        }
      }
    });

    let registration;

    if (existingRegistration) {
      // Không cho phép đăng ký lại nếu đã có registration (kể cả REJECTED)
      res.status(400).json({ 
        error: existingRegistration.status === 'REJECTED' 
          ? 'Your registration was rejected. You cannot register again for this event.'
          : 'Already registered for this event' 
      });
      return;
    } else {
      // Create new registration (chỉ khi chưa có registration hoặc đã cancel trước đó - đã bị xóa)
      registration = await prisma.registration.create({
        data: {
          userId: userId!,
          eventId,
          status: 'PENDING'
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true
            }
          }
        }
      });
    }

    // Send notification to event manager
    await sendPushNotification(
      event.managerId,
      'Đăng ký mới',
      `${(req.user as any)?.fullName || 'Một tình nguyện viên'} đã đăng ký tham gia sự kiện "${event.title}"`,
      { type: 'new_registration', eventId: event.id, registrationId: registration.id }
    );

    // Emit socket event for real-time notification
    io.emit(`user:${event.managerId}:notification`, {
      id: registration.id,
      title: 'Đăng ký mới',
      message: `${(req.user as any)?.fullName || 'Một tình nguyện viên'} đã đăng ký tham gia sự kiện "${event.title}"`,
      type: 'new_registration',
      data: { eventId: event.id, registrationId: registration.id }
    });

    // Emit to event room
    io.to(`event-${eventId}`).emit('new-registration', {
      registrationId: registration.id,
      eventId: event.id,
      eventTitle: event.title,
      userName: (req.user as any)?.fullName || 'Unknown'
    });

    res.status(201).json({
      message: 'Registration successful. Waiting for approval.',
      registration
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/registrations/events/:eventId/cancel
export const cancelRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.userId;

    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: userId!,
          eventId
        }
      }
    });

    if (!registration) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    if (registration.status === 'COMPLETED') {
      res.status(400).json({ error: 'Cannot cancel completed registration' });
      return;
    }

    // XÓA HOÀN TOÀN registration thay vì chỉ đổi status
    await prisma.registration.delete({
      where: { id: registration.id }
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/registrations/my-registrations
export const getMyRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { status } = req.query;

    const where: any = { userId };
    if (status) where.status = status;

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            startDate: true,
            endDate: true,
            category: true,
            imageUrl: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ registrations });
  } catch (error) {
    console.error('Get my registrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/registrations/events/:eventId/registrations
export const getEventRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { status } = req.query;

    // Check if user is event manager or admin
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.managerId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const where: any = { eventId };
    if (status) where.status = status;

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ registrations });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/registrations/:registrationId/approve
export const approveRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { registrationId } = req.params;

    const registration = await prisma.registration.update({
      where: { id: registrationId },
      data: { status: 'APPROVED' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            managerId: true
          }
        }
      }
    });

    // Send notification to volunteer
    await sendPushNotification(
      registration.userId,
      'Đăng ký được duyệt',
      `Đăng ký tham gia sự kiện "${registration.event.title}" của bạn đã được chấp nhận.`,
      { type: 'registration_approved', eventId: registration.event.id }
    );

    // Emit socket event to volunteer for real-time notification
    io.emit(`user:${registration.userId}:notification`, {
      id: registration.id,
      title: 'Đăng ký được duyệt',
      message: `Đăng ký tham gia sự kiện "${registration.event.title}" của bạn đã được chấp nhận.`,
      type: 'registration_approved',
      data: { eventId: registration.event.id, registrationId: registration.id }
    });

    // Emit to volunteer for real-time registration update
    io.emit(`user:${registration.userId}:registration:updated`, {
      registration,
      action: 'approved'
    });

    // Emit to event room for real-time update
    io.to(`event-${registration.eventId}`).emit('registration:updated', {
      registration,
      action: 'approved'
    });

    // Emit to manager for real-time update
    io.emit(`user:${registration.event.managerId}:registration:updated`, {
      registration,
      action: 'approved'
    });

    res.json({
      message: 'Registration approved successfully',
      registration
    });
  } catch (error) {
    console.error('Approve registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/registrations/:registrationId/reject
export const rejectRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { registrationId } = req.params;

    const registration = await prisma.registration.update({
      where: { id: registrationId },
      data: { status: 'REJECTED' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            managerId: true
          }
        }
      }
    });

    // Send notification to volunteer
    await sendPushNotification(
      registration.userId,
      'Đăng ký bị từ chối',
      `Đăng ký tham gia sự kiện "${registration.event.title}" của bạn đã bị từ chối.`,
      { type: 'registration_rejected', eventId: registration.event.id }
    );

    // Emit socket event to volunteer for real-time notification
    io.emit(`user:${registration.userId}:notification`, {
      id: registration.id,
      title: 'Đăng ký bị từ chối',
      message: `Đăng ký tham gia sự kiện "${registration.event.title}" của bạn đã bị từ chối.`,
      type: 'registration_rejected',
      data: { eventId: registration.event.id, registrationId: registration.id }
    });

    // Emit to volunteer for real-time registration update
    io.emit(`user:${registration.userId}:registration:updated`, {
      registration,
      action: 'rejected'
    });

    // Emit to event room for real-time update
    io.to(`event-${registration.eventId}`).emit('registration:updated', {
      registration,
      action: 'rejected'
    });

    // Emit to manager for real-time update
    io.emit(`user:${registration.event.managerId}:registration:updated`, {
      registration,
      action: 'rejected'
    });

    res.json({
      message: 'Registration rejected',
      registration
    });
  } catch (error) {
    console.error('Reject registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/registrations/:registrationId/complete
export const markAsCompleted = async (req: Request, res: Response): Promise<void> => {
  try {
    const { registrationId } = req.params;

    const registration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: 'COMPLETED',
        isCompleted: true,
        completedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            managerId: true
          }
        }
      }
    });

    // Send notification to volunteer
    await sendPushNotification(
      registration.userId,
      'Hoàn thành sự kiện',
      `Chúc mừng! Bạn đã hoàn thành sự kiện "${registration.event.title}".`,
      { type: 'event_completed', eventId: registration.event.id }
    );

    // Emit socket event to volunteer for real-time notification
    io.emit(`user:${registration.userId}:notification`, {
      id: registration.id,
      title: 'Hoàn thành sự kiện',
      message: `Chúc mừng! Bạn đã hoàn thành sự kiện "${registration.event.title}".`,
      type: 'event_completed',
      data: { eventId: registration.event.id, registrationId: registration.id }
    });

    // Emit to volunteer for real-time registration update
    io.emit(`user:${registration.userId}:registration:updated`, {
      registration,
      action: 'completed'
    });

    // Emit to event room for real-time update
    io.to(`event-${registration.eventId}`).emit('registration:updated', {
      registration,
      action: 'completed'
    });

    // Emit to manager for real-time update
    io.emit(`user:${registration.event.managerId}:registration:updated`, {
      registration,
      action: 'completed'
    });

    res.json({
      message: 'Registration marked as completed',
      registration
    });
  } catch (error) {
    console.error('Mark as completed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

