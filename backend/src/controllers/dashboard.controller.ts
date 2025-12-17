import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

// GET /api/dashboard
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Sự kiện mới công bố (approved events)
    const newEvents = await prisma.event.findMany({
      where: { 
        status: 'APPROVED'
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        manager: {
          select: {
            id: true,
            fullName: true
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

    // Sự kiện có tin bài mới (events with recent posts)
    const eventsWithRecentPosts = await prisma.event.findMany({
      where: {
        status: 'APPROVED',
        posts: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        }
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
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

    // Sự kiện thu hút (events with most activity)
    const trendingEvents = await prisma.event.findMany({
      where: { 
        status: 'APPROVED'
      },
      take: 5,
      include: {
        _count: {
          select: {
            registrations: {
              where: {
                status: 'APPROVED',
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
              }
            },
            posts: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
              }
            }
          }
        }
      }
    });

    // Sort by activity
    const sortedTrendingEvents = trendingEvents.sort((a, b) => {
      const activityA = a._count.registrations + a._count.posts;
      const activityB = b._count.registrations + b._count.posts;
      return activityB - activityA;
    });

    // User-specific data
    let userStats: any = null;

    if (userRole === 'VOLUNTEER') {
      userStats = {
        totalRegistrations: await prisma.registration.count({
          where: { userId }
        }),
        completedEvents: await prisma.registration.count({
          where: { userId, status: 'COMPLETED' }
        }),
        upcomingEvents: await prisma.registration.count({
          where: {
            userId,
            status: 'APPROVED',
            event: {
              startDate: { gte: new Date() }
            }
          }
        })
      };
    } else if (userRole === 'EVENT_MANAGER') {
      userStats = {
        totalEvents: await prisma.event.count({
          where: { managerId: userId }
        }),
        approvedEvents: await prisma.event.count({
          where: { managerId: userId, status: 'APPROVED' }
        }),
        pendingEvents: await prisma.event.count({
          where: { managerId: userId, status: 'PENDING' }
        }),
        totalParticipants: await prisma.registration.count({
          where: {
            event: { managerId: userId },
            status: 'APPROVED'
          }
        })
      };
    }

    res.json({
      newEvents,
      eventsWithRecentPosts,
      trendingEvents: sortedTrendingEvents,
      userStats
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/dashboard/admin
export const getAdminDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalRegistrations,
      pendingEvents,
      activeEvents,
      completedEvents,
      usersByRole,
      eventsByCategory,
      recentUsers,
      recentEvents
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.registration.count(),
      prisma.event.count({ where: { status: 'PENDING' } }),
      prisma.event.count({ where: { status: 'APPROVED' } }),
      prisma.event.count({ where: { status: 'COMPLETED' } }),
      
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      
      // Events by category
      prisma.event.groupBy({
        by: ['category'],
        _count: true,
        where: { status: 'APPROVED' }
      }),
      
      // Recent users
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          accountStatus: true,
          createdAt: true
        }
      }),
      
      // Recent events
      prisma.event.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          manager: {
            select: {
              id: true,
              fullName: true
            }
          },
          _count: {
            select: {
              registrations: {
                where: { status: 'APPROVED' }
              }
            }
          }
        }
      })
    ]);

    res.json({
      stats: {
        totalUsers,
        totalEvents,
        totalRegistrations,
        pendingEvents,
        activeEvents,
        completedEvents
      },
      usersByRole,
      eventsByCategory,
      recentUsers,
      recentEvents
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/dashboard/export/events
export const exportEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const format = req.query.format as string || 'json';
    const events = await prisma.event.findMany({
      include: {
        manager: { select: { fullName: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const formatDate = (date: Date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `"${day}/${month}/${year}"`;
      };
      
      const csvRows = [
        ['ID', 'Tiêu đề', 'Mô tả', 'Địa điểm', 'Ngày bắt đầu', 'Ngày kết thúc', 'Danh mục', 'Trạng thái', 'Người quản lý', 'Số người đăng ký'].join(','),
        ...events.map(e => [
          e.id,
          `"${e.title.replace(/"/g, '""')}"`,
          `"${e.description.replace(/"/g, '""')}"`,
          `"${e.location.replace(/"/g, '""')}"`,
          formatDate(e.startDate),
          formatDate(e.endDate),
          e.category,
          e.status,
          `"${e.manager.fullName.replace(/"/g, '""')}"`,
          e._count.registrations,
        ].join(','))
      ];
      
      const csv = csvRows.join('\n');
      const bom = '\uFEFF'; // UTF-8 BOM
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="events.csv"');
      res.send(bom + csv);
    } else {
      res.json(events);
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/export/users
export const exportUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const format = req.query.format as string || 'json';
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        accountStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const formatDate = (date: Date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `"${day}/${month}/${year}"`;
      };
      
      const csvRows = [
        ['ID', 'Email', 'Họ tên', 'Số điện thoại', 'Vai trò', 'Trạng thái', 'Ngày tạo'].join(','),
        ...users.map(u => [
          u.id,
          u.email,
          `"${u.fullName.replace(/"/g, '""')}"`,
          u.phone ? `"'${u.phone}"` : '""',
          u.role,
          u.accountStatus,
          formatDate(u.createdAt),
        ].join(','))
      ];
      
      const csv = csvRows.join('\n');
      const bom = '\uFEFF'; // UTF-8 BOM
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
      res.send(bom + csv);
    } else {
      res.json(users);
    }
  } catch (error) {
    next(error);
  }
};

