export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
  };
}

export interface ApiError {
  detail: string;
}
