import { apiClient } from '../../../shared/services/apiClient';
import type { User, LoginCredentials, RegisterData, AuthToken } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    // Send as JSON, not FormData
    const response = await apiClient.post<AuthToken>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    return response.data;
  },

  async register(data: RegisterData): Promise<User> {
    // Send without username if it's empty - backend will auto-generate
    const payload = data.username ? data : {
      email: data.email,
      password: data.password,
      is_creator: data.is_creator,
    };
    
    const response = await apiClient.post<User>('/auth/register', payload);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
  },
};
