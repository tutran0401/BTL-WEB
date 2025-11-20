import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - logout user
          useAuthStore.getState().logout();
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Bạn không có quyền truy cập.');
          break;
        case 404:
          toast.error('Không tìm thấy dữ liệu.');
          break;
        case 500:
          toast.error('Lỗi server. Vui lòng thử lại sau.');
          break;
        default:
          toast.error(data?.error || 'Có lỗi xảy ra.');
      }
    } else if (error.request) {
      toast.error('Không thể kết nối đến server.');
    }

    return Promise.reject(error);
  }
);

export default api;

