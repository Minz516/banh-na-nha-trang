import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Send cookies (JWT token) with requests
});

// Interceptor for responses
apiClient.interceptors.response.use(
  (response) => {
    // We unwrap Express JS standard { success: true, data: T } 
    return response.data?.data ?? response.data;
  },
  (error) => {
    // If backend returns 401 Unauthorized, automatically log out
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error.response?.data?.error || error);
  }
);
