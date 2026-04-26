// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface User {
  id: string
  email: string
  name?: string
}

// API Types
export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

// JSONPlaceholder raw photo shape
export interface Photo {
  albumId: number
  id: number
  title: string
  url: string
  thumbnailUrl: string
}

// Normalized item shape consumed by the UI list — source-agnostic
export interface ListItem {
  id: string | number
  title: string
  subtitle?: string
  thumbnailUrl?: string
  badge?: string
}

// Adapter contract: any data source must implement this
export interface DataSourceAdapter<TRaw> {
  fetchItems(limit: number): Promise<TRaw[]>
  normalize(raw: TRaw): ListItem
}

// Route Types
export interface RouteConfig {
  path: string
  element: React.ReactNode
  children?: RouteConfig[]
}
