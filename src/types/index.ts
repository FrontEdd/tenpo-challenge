// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

// API Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface Photo {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

// Route Types
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}
