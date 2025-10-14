export const APP_CONFIG = {
  APP_NAME: 'Tenpo Challenge',
  API_BASE_URL: 'https://jsonplaceholder.typicode.com',
  API_TIMEOUT: 10000,
} as const

export const ROUTES = {
  PUBLIC: {
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
  },
  PRIVATE: {
    HOME: '/app/home',
    PROFILE: '/app/profile',
    SETTINGS: '/app/settings',
  },
} as const

export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
} as const
