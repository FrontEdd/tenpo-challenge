import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { ROUTES } from '@config/constants'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={ROUTES.PUBLIC.LOGIN} replace />,
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: ROUTES.PUBLIC.LOGIN,
        lazy: () => import('@pages/LoginPage').then(m => ({ Component: m.LoginPage })),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/app',
        element: <Navigate to={ROUTES.PRIVATE.HOME} replace />,
      },
      {
        path: ROUTES.PRIVATE.HOME,
        lazy: () => import('@pages/HomePage').then(m => ({ Component: m.HomePage })),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.PUBLIC.LOGIN} replace />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
