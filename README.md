# Tenpo Challenge — Frontend

React + TypeScript application for the Tenpo technical challenge.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 7 + SWC |
| Styles | Tailwind CSS 3 |
| State | Zustand (with localStorage persistence) |
| Routing | React Router v7 |
| HTTP | Axios |
| List virtualization | TanStack Virtual v3 |

---

## Prerequisites

- Node.js >= 22.x
- npm >= 9.x

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/FrontEdd/tenpo-challenge.git
cd tenpo-challenge

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Login credentials:** any valid email + any password of at least 6 characters (fake auth — no backend required).

> The gallery loads 100 artworks instantly from a local seed file, then progressively fetches the remaining 1,900 from the Art Institute of Chicago API in the background.

---

## Available Scripts

```bash
npm run dev        # Start dev server (HMR)
npm run build      # Production build (tsc + vite)
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
npm run lint:fix   # Auto-fix ESLint issues
npm run format     # Format code with Prettier
```

---

## Project Structure

```
src/
├── components/
│   └── common/         # Reusable UI components (LoginForm, ListItemCard)
├── config/             # Axios instance, app constants, route definitions
├── hooks/              # useAuth — thin wrapper over the Zustand store
├── layouts/            # PublicLayout (login shell) · PrivateLayout (app shell)
├── pages/              # LoginPage · HomePage
├── routes/             # AppRouter · PublicRoute guard · ProtectedRoute guard
├── services/
│   ├── adapters/       # Data source adapters (photoAdapter, ...)
│   └── listService.ts  # Single entry point consumed by HomePage
├── store/              # authStore (Zustand + persist)
└── types/              # Shared TypeScript interfaces
```

---

## Architecture Decisions

### Public / Private context

Routes are split into two independent trees, each with its own layout:

```
/ → redirect /login

PublicRoute  →  PublicLayout  →  /login
                                 /forgot-password  (extendable)

ProtectedRoute  →  PrivateLayout  →  /app/home
                                     /app/profile  (extendable)
                                     /app/settings (extendable)
```

`PublicRoute` redirects authenticated users to `/app/home`.
`ProtectedRoute` redirects unauthenticated users to `/login`.
Adding a new module (public or private) requires only a new entry in `AppRouter.tsx` — no other file changes.

### Token storage

The auth token is stored in **localStorage** via Zustand's `persist` middleware (key: `auth-storage`). This keeps the session alive across browser tabs and page refreshes without requiring server-side sessions. The Axios request interceptor reads the token on every request and injects it as a `Bearer` Authorization header automatically.

### Data source — Art Institute of Chicago API

The home gallery fetches 2,000 artworks from the [Art Institute of Chicago public API](https://api.artic.edu/docs/) using the IIIF image protocol:

```
Image URL: https://www.artic.edu/iiif/2/{image_id}/full/400,/0/default.jpg
```

A **seed file** (`docs/artworks-pag.json`) provides the first 100 artworks as a local import, enabling instant first render with zero network wait. Pages 2–20 are fetched progressively in the background with an AbortController for clean cancellation on unmount.

The **Adapter pattern** (`DataSourceAdapter<TRaw>`) decouples the data source from the UI. Swapping to a different API requires only creating a new adapter and updating one line in `listService.ts`.

### Why TanStack Virtual for the gallery grid

Rendering 2,000 DOM nodes simultaneously causes layout thrashing and memory pressure. TanStack Virtual **virtualizes by row** — each virtual row contains N artwork cards (responsive: 1–4 columns via ResizeObserver). Only the visible rows are mounted, keeping DOM nodes constant (~4–6 rows + overscan) regardless of how many artworks are loaded. The grid feels native and continuous with no pagination or infinite-scroll triggers.

### Logout strategy

Logout is handled by `useAuth().logout()`, which:

1. Calls `useAuthStore.logout()` — zeroes out `token`, `user` and `isAuthenticated` in the Zustand store.
2. The persist middleware immediately syncs the cleared state to localStorage.
3. `ProtectedRoute` re-evaluates `isAuthenticated` (now `false`) on the next render and issues a `<Navigate to="/login" replace />`.
4. The Axios 401 interceptor provides a secondary safety net: any request that returns 401 also clears localStorage and hard-redirects to `/login`.

The session is fully cleaned in a single synchronous operation — no race conditions, no stale token left in storage.

### Scalable data source (Adapter pattern)

`listService.ts` exposes a single `fetchListItems()` function. Internally it delegates to an **adapter** that implements the `DataSourceAdapter<TRaw>` interface:

```ts
interface DataSourceAdapter<TRaw> {
  fetchItems(limit: number): Promise<TRaw[]>
  normalize(raw: TRaw): ListItem          // maps any raw shape → UI ListItem
}
```

Currently `photoAdapter` targets JSONPlaceholder `/photos`. Switching to a different API requires only:

1. Creating `src/services/adapters/newAdapter.ts` implementing the interface.
2. Changing one line in `listService.ts`: `const activeAdapter = newAdapter`.

No component code changes required.

---

## Theoretical improvement: making backend calls more efficient

The current implementation fetches all 2 000 items in a single request on every page load. Two complementary strategies would make this significantly more efficient in production:

### 1 — HTTP response caching with ETags

The server attaches an `ETag` (content hash) to the response. On subsequent requests the client sends `If-None-Match: <etag>`. If the data has not changed the server returns `304 Not Modified` with an empty body — saving bandwidth and backend processing. The browser's native HTTP cache handles this transparently; no client-side code change is needed beyond respecting cache headers.

### 2 — Server-driven pagination + client-side cache (React Query / SWR)

Instead of one large request, the API exposes paginated endpoints (`GET /items?page=1&limit=50`). The client fetches only the visible window of data on demand, using a library such as **TanStack Query** to:

- Cache each page result in memory and deduplicate concurrent requests.
- Serve cached pages instantly on revisit while revalidating in the background (`stale-while-revalidate`).
- Prefetch the next page while the user scrolls, making navigation feel instantaneous.

This reduces initial payload from ~500 KB to ~12 KB per page, while keeping perceived performance high through prefetching and background revalidation.
