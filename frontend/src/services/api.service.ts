import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import type { LoginCredentials, RegisterData, LoginResponse, User } from '../types/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Importante para enviar cookies HttpOnly
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        // Lança o erro com o objeto completo para ser processado depois
        const error = new Error(JSON.stringify(errorData));
        error.name = 'ApiError';
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao conectar com o servidor');
    }
  }

  // Auth endpoints
  async register(data: RegisterData): Promise<User> {
    return this.request<User>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return this.request<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>(API_ENDPOINTS.AUTH.ME, {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();
