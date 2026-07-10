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
    // If backend returns 401 Unauthorized, the session is no longer valid server-side —
    // reset local state only (no server round trip; the cookie is already gone/expired).
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error.response?.data?.error || error);
  }
);
