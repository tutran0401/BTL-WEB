import api from '../lib/api';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'VOLUNTEER' | 'EVENT_MANAGER';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

