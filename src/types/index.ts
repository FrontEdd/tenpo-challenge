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

// Art Institute of Chicago raw artwork shape
export interface Artwork {
  id: number
  title: string
  artist_display: string | null
  date_display: string | null
  image_id: string | null
  medium_display: string | null
  place_of_origin: string | null
  thumbnail: {
    lqip: string
    width: number
    height: number
    alt_text: string
  } | null
  artwork_type_title: string | null
  department_title: string | null
  color: { h: number; l: number; s: number } | null
  colorfulness: number
}

// Art medium categories used for filtering
export type MediumCategory =
  | 'Painting'
  | 'Print'
  | 'Drawing'
  | 'Photography'
  | 'Object'
  | 'Media'
  | 'Other'

// Normalized item shape consumed by the UI — source-agnostic
export interface ListItem {
  id: string | number
  title: string
  subtitle?: string        // artist name (first line of artist_display)
  imageUrl?: string        // full IIIF image URL
  lqip?: string            // base64 blur placeholder for progressive image load
  imageAlt?: string        // alt text for accessibility
  badge?: string           // medium category label
  meta?: string            // date + place concatenated
  mediumCategory?: MediumCategory
  origin?: string          // place_of_origin (for future origin filter)
  accentColor?: string     // hsl() string from artwork dominant color
  mediumDisplay?: string   // raw medium display text (for hover tooltip)
  artworkType?: string     // artwork_type_title
}

// Active filters state
export interface ArtworkFilters {
  search: string
  mediumCategory: MediumCategory | 'all'
  sortBy: 'default' | 'date-asc' | 'date-desc' | 'title-az'
}

// Adapter contract: any data source must implement this
export interface DataSourceAdapter<TRaw> {
  fetchItems(page: number, limit: number): Promise<TRaw[]>
  normalize(raw: TRaw): ListItem
}

// Route Types
export interface RouteConfig {
  path: string
  element: React.ReactNode
  children?: RouteConfig[]
}
