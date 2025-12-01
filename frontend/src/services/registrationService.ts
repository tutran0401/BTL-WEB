import api from '../lib/api';

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  event?: {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    category: string;
    imageUrl?: string;
    status: string;
  };
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
}

export const registrationService = {
  // Đăng ký tham gia sự kiện
  registerForEvent: async (eventId: string) => {
    const response = await api.post(`/registrations/events/${eventId}/register`);
    return response.data;
  },

  // Hủy đăng ký
  cancelRegistration: async (eventId: string) => {
    const response = await api.delete(`/registrations/events/${eventId}/cancel`);
    return response.data;
  },

  // Lấy danh sách đăng ký của tôi
  getMyRegistrations: async (status?: string) => {
    const response = await api.get('/registrations/my-registrations', {
      params: { status }
    });
    return response.data;
  },

  // Lấy danh sách đăng ký của một sự kiện (dành cho manager)
  getEventRegistrations: async (eventId: string, status?: string) => {
    const response = await api.get(`/registrations/events/${eventId}/registrations`, {
      params: { status }
    });
    return response.data;
  },

  // Phê duyệt đăng ký
  approveRegistration: async (registrationId: string) => {
    const response = await api.patch(`/registrations/${registrationId}/approve`);
    return response.data;
  },

  // Từ chối đăng ký
  rejectRegistration: async (registrationId: string) => {
    const response = await api.patch(`/registrations/${registrationId}/reject`);
    return response.data;
  },

  // Đánh dấu hoàn thành
  markAsCompleted: async (registrationId: string) => {
    const response = await api.patch(`/registrations/${registrationId}/complete`);
    return response.data;
  },
};
