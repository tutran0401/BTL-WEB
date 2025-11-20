import { Request, Response } from 'express';
import prisma from '../config/database';

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

    if (existingRegistration) {
      res.status(400).json({ error: 'Already registered for this event' });
      return;
    }

    // Create registration
    const registration = await prisma.registration.create({
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

    // TODO: Send notification to event manager

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

    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: 'CANCELLED' }
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
            title: true
          }
        }
      }
    });

    // TODO: Send notification to volunteer

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
            title: true
          }
        }
      }
    });

    // TODO: Send notification to volunteer

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
            title: true
          }
        }
      }
    });

    // TODO: Send notification to volunteer

    res.json({
      message: 'Registration marked as completed',
      registration
    });
  } catch (error) {
    console.error('Mark as completed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

