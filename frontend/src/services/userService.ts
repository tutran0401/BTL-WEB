import api from '../lib/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'ADMIN' | 'EVENT_MANAGER' | 'VOLUNTEER';
  accountStatus: 'ACTIVE' | 'LOCKED' | 'PENDING';
  createdAt: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateUserStatusData {
  accountStatus: 'ACTIVE' | 'LOCKED' | 'PENDING';
}

export const userService = {
  // Lấy danh sách users (Admin only)
  async getAllUsers(params?: {
    role?: string;
    accountStatus?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<UsersResponse> {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Cập nhật trạng thái user (Admin only)
  async updateUserStatus(userId: string, status: 'ACTIVE' | 'LOCKED' | 'PENDING'): Promise<User> {
    const response = await api.patch(`/users/${userId}/status`, { accountStatus: status });
    return response.data.user;
  },

  // Lấy thông tin profile
  async getProfile(): Promise<User> {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Cập nhật profile
  async updateProfile(data: {
    fullName?: string;
    phone?: string;
    avatar?: string;
  }): Promise<User> {
    const response = await api.put('/users/profile', data);
    return response.data.user;
  }
};
