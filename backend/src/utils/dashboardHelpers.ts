import prisma from '../config/database';

// Interface for activity metrics
export interface ActivityMetrics {
  newRegistrations: number;
  newPosts: number;
  newComments: number;
  newLikes: number;
  totalActivity: number;
}

// Interface for trending score
export interface TrendingEventData {
  eventId: string;
  score: number;
  metrics: ActivityMetrics;
  growthIndicator?: string;
}

/**
 * Calculate trending score for an event based on recent activity
 * Higher score = more trending
 * 
 * Formula: (newRegistrations * 3) + (newPosts * 2) + (newComments * 1.5) + (newLikes * 1)
 */
export function calculateTrendingScore(metrics: ActivityMetrics): number {
  const { newRegistrations, newPosts, newComments, newLikes } = metrics;

  // Weighted scoring
  const score =
    (newRegistrations * 3) +  // Registration has highest weight
    (newPosts * 2) +           // Posts are important
    (newComments * 1.5) +      // Comments show engagement
    (newLikes * 1);            // Likes are nice to have

  return score;
}

/**
 * Get recent activity metrics for an event within specified days
 */
export async function getRecentActivityMetrics(
  eventId: string,
  days: number = 7
): Promise<ActivityMetrics> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get counts in parallel for better performance
  const [newRegistrations, newPosts, newComments, newLikes] = await Promise.all([
    // Count new registrations
    prisma.registration.count({
      where: {
        eventId,
        status: 'APPROVED',
        createdAt: { gte: startDate }
      }
    }),

    // Count new posts
    prisma.post.count({
      where: {
        eventId,
        createdAt: { gte: startDate }
      }
    }),

    // Count new comments on posts in this event
    prisma.comment.count({
      where: {
        post: { eventId },
        createdAt: { gte: startDate }
      }
    }),

    // Count new likes on posts in this event
    prisma.like.count({
      where: {
        post: { eventId },
        createdAt: { gte: startDate }
      }
    })
  ]);

  const totalActivity = newRegistrations + newPosts + newComments + newLikes;

  return {
    newRegistrations,
    newPosts,
    newComments,
    newLikes,
    totalActivity
  };
}

/**
 * OPTIMIZED: Get activity metrics for MULTIPLE events in batch
 * This solves the N+1 query problem by using groupBy instead of looping
 * 
 * Performance: 50 events × 4 queries = 200 queries → 4 queries total
 */
export async function getActivityMetricsForMultipleEvents(
  eventIds: string[],
  days: number = 7
): Promise<Map<string, ActivityMetrics>> {
  if (eventIds.length === 0) {
    return new Map();
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Execute all groupBy queries in parallel
  const [regCounts, postCounts, commentCounts, likeCounts] = await Promise.all([
    // Group registrations by eventId
    prisma.registration.groupBy({
      by: ['eventId'],
      where: {
        eventId: { in: eventIds },
        status: 'APPROVED',
        createdAt: { gte: startDate }
      },
      _count: { _all: true }
    }),

    // Group posts by eventId
    prisma.post.groupBy({
      by: ['eventId'],
      where: {
        eventId: { in: eventIds },
        createdAt: { gte: startDate }
      },
      _count: { _all: true }
    }),

    // Group comments by eventId (via post relation)
    prisma.$queryRaw<Array<{ eventId: string; count: bigint }>>`
      SELECT p."eventId", COUNT(c.id)::int as count
      FROM comments c
      INNER JOIN posts p ON c."postId" = p.id
      WHERE p."eventId" = ANY(${eventIds})
        AND c."createdAt" >= ${startDate}
      GROUP BY p."eventId"
    `,

    // Group likes by eventId (via post relation)
    prisma.$queryRaw<Array<{ eventId: string; count: bigint }>>`
      SELECT p."eventId", COUNT(l.id)::int as count
      FROM likes l
      INNER JOIN posts p ON l."postId" = p.id
      WHERE p."eventId" = ANY(${eventIds})
        AND l."createdAt" >= ${startDate}
      GROUP BY p."eventId"
    `
  ]);

  // Build lookup maps for fast access
  const regMap = new Map(regCounts.map(r => [r.eventId, r._count._all]));
  const postMap = new Map(postCounts.map(p => [p.eventId, p._count._all]));
  const commentMap = new Map(commentCounts.map(c => [c.eventId, Number(c.count)]));
  const likeMap = new Map(likeCounts.map(l => [l.eventId, Number(l.count)]));

  // Build final metrics map for all events
  const metricsMap = new Map<string, ActivityMetrics>();

  for (const eventId of eventIds) {
    const newRegistrations = regMap.get(eventId) || 0;
    const newPosts = postMap.get(eventId) || 0;
    const newComments = commentMap.get(eventId) || 0;
    const newLikes = likeMap.get(eventId) || 0;
    const totalActivity = newRegistrations + newPosts + newComments + newLikes;

    metricsMap.set(eventId, {
      newRegistrations,
      newPosts,
      newComments,
      newLikes,
      totalActivity
    });
  }

  return metricsMap;
}

/**
 * Generate growth indicator text for display
 * Example: "+20 thành viên / 24h"
 */
export function generateGrowthIndicator(metrics: ActivityMetrics, days: number): string | undefined {
  const { newRegistrations, newPosts, totalActivity } = metrics;

  // No activity = no indicator
  if (totalActivity === 0) return undefined;

  // Determine the most significant metric
  if (newRegistrations > 0) {
    const timeFrame = days === 1 ? '24h' : `${days} ngày`;
    return `+${newRegistrations} thành viên / ${timeFrame}`;
  }

  if (newPosts > 0) {
    const timeFrame = days === 1 ? '24h' : `${days} ngày`;
    return `+${newPosts} bài viết / ${timeFrame}`;
  }

  // Generic activity indicator
  const timeFrame = days === 1 ? '24h' : `${days} ngày`;
  return `+${totalActivity} hoạt động / ${timeFrame}`;
}

/**
 * Filter and sort events by role with prioritization
 * This applies role-based filtering rules from PRD
 */
export function prioritizeEventsByRole(
  events: any[],
  userId: string,
  role: string
): any[] {
  if (role === 'ADMIN') {
    // Admin sees all, no prioritization
    return events;
  }

  if (role === 'EVENT_MANAGER') {
    // Prioritize events managed by this user
    const myEvents = events.filter(e => e.managerId === userId);
    const otherEvents = events.filter(e => e.managerId !== userId);
    return [...myEvents, ...otherEvents];
  }

  if (role === 'VOLUNTEER') {
    // Prioritize events user is registered for
    const registeredEvents = events.filter(e =>
      e.registrations?.some((r: any) => r.userId === userId)
    );
    const otherEvents = events.filter(e =>
      !e.registrations?.some((r: any) => r.userId === userId)
    );
    return [...registeredEvents, ...otherEvents];
  }

  return events;
}

/**
 * Build where clause for events based on user role
 */
export function getEventWhereClause(userId: string, role: string): any {
  if (role === 'ADMIN') {
    // Admin can see all events
    return {};
  }

  // For VOLUNTEER and EVENT_MANAGER, only show approved events
  return {
    status: 'APPROVED'
  };
}

/**
 * Calculate statistics for new posts and comments in last 24 hours
 */
export async function getRecentDiscussionStats(eventId: string): Promise<{
  newPosts: number;
  newComments: number;
  lastActivityAt: Date | null;
}> {
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);

  const [newPosts, newComments, lastPost] = await Promise.all([
    // Count new posts
    prisma.post.count({
      where: {
        eventId,
        createdAt: { gte: last24Hours }
      }
    }),

    // Count new comments
    prisma.comment.count({
      where: {
        post: { eventId },
        createdAt: { gte: last24Hours }
      }
    }),

    // Get most recent post or comment
    prisma.post.findFirst({
      where: { eventId },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    })
  ]);

  return {
    newPosts,
    newComments,
    lastActivityAt: lastPost?.updatedAt || null
  };
}

/**
 * OPTIMIZED: Get discussion stats for MULTIPLE events in batch
 * This solves the N+1 query problem for active events
 * 
 * Performance: 20 events × 3 queries = 60 queries → 3 queries total
 */
export async function getDiscussionStatsForMultipleEvents(
  eventIds: string[]
): Promise<Map<string, { newPosts: number; newComments: number; lastActivityAt: Date | null }>> {
  if (eventIds.length === 0) {
    return new Map();
  }

  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);

  // Execute all queries in parallel
  const [newPostCounts, newCommentCounts, lastActivities] = await Promise.all([
    // Group new posts by eventId
    prisma.post.groupBy({
      by: ['eventId'],
      where: {
        eventId: { in: eventIds },
        createdAt: { gte: last24Hours }
      },
      _count: { _all: true }
    }),

    // Group new comments by eventId (via post relation)
    prisma.$queryRaw<Array<{ eventId: string; count: bigint }>>`
      SELECT p."eventId", COUNT(c.id)::int as count
      FROM comments c
      INNER JOIN posts p ON c."postId" = p.id
      WHERE p."eventId" = ANY(${eventIds})
        AND c."createdAt" >= ${last24Hours}
      GROUP BY p."eventId"
    `,

    // Get most recent activity per event
    prisma.$queryRaw<Array<{ eventId: string; updatedAt: Date }>>`
      SELECT "eventId", MAX("updatedAt") as "updatedAt"
      FROM posts
      WHERE "eventId" = ANY(${eventIds})
      GROUP BY "eventId"
    `
  ]);

  // Build lookup maps
  const postCountMap = new Map(newPostCounts.map(p => [p.eventId, p._count._all]));
  const commentCountMap = new Map(newCommentCounts.map(c => [c.eventId, Number(c.count)]));
  const lastActivityMap = new Map(lastActivities.map(a => [a.eventId, a.updatedAt]));

  // Build final stats map for all events
  const statsMap = new Map();

  for (const eventId of eventIds) {
    statsMap.set(eventId, {
      newPosts: postCountMap.get(eventId) || 0,
      newComments: commentCountMap.get(eventId) || 0,
      lastActivityAt: lastActivityMap.get(eventId) || null
    });
  }

  return statsMap;
}
