import api from '../lib/api';

// Activity metrics from backend
export interface ActivityMetrics {
  newRegistrations: number;
  newPosts: number;
  newComments: number;
  newLikes: number;
  totalActivity: number;
}

// Discussion stats for active events
export interface DiscussionStats {
  newPosts: number;
  newComments: number;
  lastActivityAt: string | null;
}

// Base event interface
export interface DashboardEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  status: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  manager: {
    id: string;
    fullName: string;
  };
  _count: {
    registrations: number;
    posts: number;
  };
}

// Active event with discussion stats
export interface ActiveEvent extends DashboardEvent {
  discussionStats: DiscussionStats;
}

// Trending event with metrics
export interface TrendingEvent extends DashboardEvent {
  trendingScore: number;
  growthIndicator?: string;
  recentMetrics: ActivityMetrics;
}

// User stats for different roles
export interface VolunteerStats {
  totalRegistrations: number;
  completedEvents: number;
  upcomingEvents: number;
  totalHours: number;
}

export interface ManagerStats {
  totalEvents: number;
  approvedEvents: number;
  pendingEvents: number;
  totalParticipants: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  pendingEvents: number;
}

export type UserStats = VolunteerStats | ManagerStats | AdminDashboardStats;

// Main dashboard response
export interface DashboardResponse {
  newEvents: DashboardEvent[];
  activeEvents: ActiveEvent[];
  trendingEvents: TrendingEvent[];
  userStats: UserStats | null;
}

// Admin stats interface
export interface AdminStats {
  stats: {
    totalUsers: number;
    totalEvents: number;
    totalRegistrations: number;
    pendingEvents: number;
    activeEvents: number;
    completedEvents: number;
  };
  usersByRole: Array<{
    role: string;
    _count: number;
  }>;
  eventsByCategory: Array<{
    category: string;
    _count: number;
  }>;
  recentUsers: Array<{
    id: string;
    email: string;
    fullName: string;
    role: string;
    accountStatus: string;
    createdAt: string;
  }>;
  recentEvents: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    manager: {
      id: string;
      fullName: string;
    };
    _count: {
      registrations: number;
    };
  }>;
}

export const dashboardService = {
  // Get dashboard data (new structure)
  async getDashboard(): Promise<DashboardResponse> {
    const response = await api.get('/dashboard');
    return response.data;
  },

  // Get admin dashboard
  async getAdminDashboard(): Promise<AdminStats> {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  // Export events
  async exportEvents(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await api.get(`/dashboard/export/events?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Export users
  async exportUsers(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await api.get(`/dashboard/export/users?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
