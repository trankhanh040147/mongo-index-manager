import axios from 'axios';
    import { useAuthStore } from '@/store/authStore';

    const api = axios.create({
      baseURL: '/api/v1', // This will be proxied by Vite during development
    });

    api.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // TODO: Add response interceptor to handle token refresh on 401 errors

    export default api;
