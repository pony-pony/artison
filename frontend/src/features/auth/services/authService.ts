import { apiClient } from '../../../shared/services/apiClient';
import type { User, LoginCredentials, RegisterData, AuthToken } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    // OAuth2PasswordRequestForm expects username field for email
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    const response = await apiClient.post<AuthToken>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
