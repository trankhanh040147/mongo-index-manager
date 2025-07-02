import api from './api';
    import { AuthLogin, AuthRegister } from '@/types/api';

    export const login = async (credentials: AuthLogin) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    };

    export const register = async (userData: AuthRegister) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    };

    export const getProfile = async () => {
      const response = await api.get('/auth/profile');
      return response.data;
    };
