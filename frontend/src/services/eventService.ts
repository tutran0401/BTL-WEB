import api from '../lib/api';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  status: string;
  maxParticipants?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: string;
    fullName: string;
    email: string;
  };
  _count?: {
    registrations: number;
    posts: number;
  };
}

export const eventService = {
  getAllEvents: async (params?: any) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  // Alias for getAllEvents
  getEvents: async (params?: any) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  getEventById: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: any) => {
    const response = await api.post('/events', data);
    return response.data;
  },

  updateEvent: async (id: string, data: any) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  approveEvent: async (id: string) => {
    const response = await api.patch(`/events/${id}/approve`);
    return response.data;
  },

  rejectEvent: async (id: string) => {
    const response = await api.patch(`/events/${id}/reject`);
    return response.data;
  },

  // Update event status (approve or reject)
  updateEventStatus: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (status === 'APPROVED') {
      return await eventService.approveEvent(id);
    } else {
      return await eventService.rejectEvent(id);
    }
  },
};

