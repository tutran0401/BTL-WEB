import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import {
  getEventWhereClause,
  prioritizeEventsByRole,
  getRecentActivityMetrics,
  calculateTrendingScore,
  generateGrowthIndicator,
  getActivityMetricsForMultipleEvents
} from '../utils/dashboardHelpers';

// Configuration constants for dashboard limits
const QUERY_LIMITS = {
  NEW_EVENTS: 50,        // Fetch pool (was 20)
  ACTIVE_EVENTS: 30,     // Fetch pool (was 20)
  TRENDING_POOL: 100     // Fetch pool (was 50) - for scoring
};

const DISPLAY_LIMITS = {
  INITIAL: 6,            // Initial display (was 5)
  LOAD_MORE: 6           // Per load more request
};

// GET /api/dashboard
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Pagination params from query string
    const {
      newEventsOffset = 0,
      activeEventsOffset = 0,
      trendingEventsOffset = 0
    } = req.query;

    // Parse to numbers
    const offsets = {
      newEvents: parseInt(String(newEventsOffset), 10) || 0,
      activeEvents: parseInt(String(activeEventsOffset), 10) || 0,
      trendingEvents: parseInt(String(trendingEventsOffset), 10) || 0
    };

    // Build base where clause based on role
    const baseWhere = getEventWhereClause(userId, userRole);

    // Include registrations for volunteer prioritization
    const includeRegistrations = userRole === 'VOLUNTEER' ? {
      registrations: {
        where: { userId, status: 'APPROVED' as const },
        select: { userId: true }
      }
    } : {};

    // Execute all queries in parallel for better performance
    const [
      allNewEvents,
      allActiveEvents,
      allTrendingCandidates,
      userStats
    ] = await Promise.all([
      // 1. NEW EVENTS - Sự kiện mới công bố
      prisma.event.findMany({
        where: {
          ...baseWhere,
          // Only events approved in last 30 days
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        take: QUERY_LIMITS.NEW_EVENTS, // Increased from 20 to 50
        orderBy: { createdAt: 'desc' },
        include: {
          manager: {
            select: {
              id: true,
              fullName: true
            }
          },
          ...includeRegistrations,
          _count: {
            select: {
              registrations: {
                where: { status: 'APPROVED' }
              },
              posts: true
            }
          }
        }
      }),

      // 2. ACTIVE EVENTS - Sự kiện đang diễn ra
      prisma.event.findMany({
        where: {
          ...baseWhere,
          // Events that are currently ongoing
          startDate: {
            lte: new Date() // Started already or starting now
          },
          endDate: {
            gte: new Date() // Not ended yet
          }
        },
        take: QUERY_LIMITS.ACTIVE_EVENTS, // Increased from 20 to 30
        orderBy: { startDate: 'asc' }, // Soonest events first
        include: {
          manager: {
            select: {
              id: true,
              fullName: true
            }
          },
          ...includeRegistrations,
          _count: {
            select: {
              registrations: {
                where: { status: 'APPROVED' }
              },
              posts: true
            }
          }
        }
      }),

      // 3. TRENDING CANDIDATES - Get all approved events for trending calculation
      prisma.event.findMany({
        where: baseWhere,
        take: QUERY_LIMITS.TRENDING_POOL, // Increased from 50 to 100
        orderBy: { createdAt: 'desc' }, // FIX: Added orderBy for deterministic results
        include: {
          manager: {
            select: {
              id: true,
              fullName: true
            }
          },
          ...includeRegistrations,
          _count: {
            select: {
              registrations: {
                where: { status: 'APPROVED' }
              },
              posts: true
            }
          }
        }
      }),

      // 4. USER STATS
      getUserStats(userId, userRole)
    ]);

    // PRIORITIZE by role (get full prioritized lists)
    const newEventsPrioritized = prioritizeEventsByRole(allNewEvents, userId, userRole);
    const activeEventsPrioritized = prioritizeEventsByRole(allActiveEvents, userId, userRole);

    // OPTIMIZED: Calculate trending scores using batch function
    const trendingEventIds = allTrendingCandidates.map(e => e.id);
    const metricsMap = await getActivityMetricsForMultipleEvents(trendingEventIds, 7);

    const trendingWithScores = allTrendingCandidates.map((event) => {
      const metrics = metricsMap.get(event.id) || {
        newRegistrations: 0,
        newPosts: 0,
        newComments: 0,
        newLikes: 0,
        totalActivity: 0
      };
      const score = calculateTrendingScore(metrics);
      const growthIndicator = generateGrowthIndicator(metrics, 7);

      return {
        ...event,
        trendingScore: score,
        growthIndicator,
        recentMetrics: metrics
      };
    });

    // Sort by trending score and filter
    const topTrending = trendingWithScores
      .filter(e => e.trendingScore > 0) // Only events with activity
      .sort((a, b) => b.trendingScore - a.trendingScore);

    // Prioritize trending events by role
    const trendingPrioritized = prioritizeEventsByRole(topTrending, userId, userRole);

    // Paginate with offsets - slice based on offset + limit
    const newEvents = newEventsPrioritized.slice(
      offsets.newEvents,
      offsets.newEvents + DISPLAY_LIMITS.LOAD_MORE
    );
    const activeEvents = activeEventsPrioritized.slice(
      offsets.activeEvents,
      offsets.activeEvents + DISPLAY_LIMITS.LOAD_MORE
    );
    const trendingEvents = trendingPrioritized.slice(
      offsets.trendingEvents,
      offsets.trendingEvents + DISPLAY_LIMITS.LOAD_MORE
    );

    // Response with pagination metadata
    res.json({
      newEvents,
      activeEvents,
      trendingEvents,
      userStats,
      // Pagination metadata
      pagination: {
        newEvents: {
          offset: offsets.newEvents,
          limit: DISPLAY_LIMITS.LOAD_MORE,
          hasMore: newEventsPrioritized.length > offsets.newEvents + DISPLAY_LIMITS.LOAD_MORE
        },
        activeEvents: {
          offset: offsets.activeEvents,
          limit: DISPLAY_LIMITS.LOAD_MORE,
          hasMore: activeEventsPrioritized.length > offsets.activeEvents + DISPLAY_LIMITS.LOAD_MORE
        },
        trendingEvents: {
          offset: offsets.trendingEvents,
          limit: DISPLAY_LIMITS.LOAD_MORE,
          hasMore: trendingPrioritized.length > offsets.trendingEvents + DISPLAY_LIMITS.LOAD_MORE
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to get user-specific statistics
async function getUserStats(userId: string, userRole: string) {
  if (userRole === 'VOLUNTEER') {
    const [totalRegistrations, completedEvents, upcomingEvents, totalHours] = await Promise.all([
      prisma.registration.count({
        where: { userId }
      }),
      prisma.registration.count({
        where: { userId, status: 'COMPLETED' }
      }),
      prisma.registration.count({
        where: {
          userId,
          status: 'APPROVED',
          event: {
            startDate: { gte: new Date() }
          }
        }
      }),
      // Calculate total volunteer hours (completed events)
      prisma.registration.count({
        where: { userId, isCompleted: true }
      })
    ]);

    return {
      totalRegistrations,
      completedEvents,
      upcomingEvents,
      totalHours: totalHours * 4 // Assume 4 hours per event
    };
  }

  if (userRole === 'EVENT_MANAGER') {
    const [totalEvents, approvedEvents, pendingEvents, totalParticipants] = await Promise.all([
      prisma.event.count({
        where: { managerId: userId }
      }),
      prisma.event.count({
        where: { managerId: userId, status: 'APPROVED' }
      }),
      prisma.event.count({
        where: { managerId: userId, status: 'PENDING' }
      }),
      prisma.registration.count({
        where: {
          event: { managerId: userId },
          status: 'APPROVED'
        }
      })
    ]);

    return {
      totalEvents,
      approvedEvents,
      pendingEvents,
      totalParticipants
    };
  }

  // ADMIN stats
  if (userRole === 'ADMIN') {
    const [totalUsers, totalEvents, totalRegistrations, pendingEvents] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.registration.count(),
      prisma.event.count({ where: { status: 'PENDING' } })
    ]);

    return {
      totalUsers,
      totalEvents,
      totalRegistrations,
      pendingEvents
    };
  }

  return null;
}

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
          // Sử dụng tab (\t) để Excel hiểu đây là văn bản và giữ số 0 đầu
          u.phone ? `"\t${u.phone}"` : '""',
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

