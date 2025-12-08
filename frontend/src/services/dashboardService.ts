import api from '../lib/api';

export interface AdminStats {
  stats: {
    totalUsers: number;
    totalEvents: number;
    totalRegistrations: number;
    pendingEvents: number;
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
  // Lấy thống kê dashboard chung
  async getDashboard(): Promise<any> {
    const response = await api.get('/dashboard');
    return response.data;
  },

  // Lấy thống kê admin dashboard
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
