export const APP_CONFIG = {
  APP_NAME: 'Tenpo Challenge',
  API_BASE_URL: 'https://api.artic.edu/api/v1',
  API_TIMEOUT: 10000,
} as const

export const ARTIC = {
  IIIF_URL: 'https://www.artic.edu/iiif/2',
  IMAGE_WIDTH: '400',
  ITEMS_PER_PAGE: 100,
  TOTAL_ITEMS: 2000,
  FIELDS: 'id,title,artist_display,date_display,image_id,medium_display,place_of_origin,thumbnail,artwork_type_title,department_title,color,colorfulness',
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
