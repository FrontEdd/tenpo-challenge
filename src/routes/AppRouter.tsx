import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { PublicLayout } from '@layouts/PublicLayout'
import { PrivateLayout } from '@layouts/PrivateLayout'
import { ROUTES } from '@config/constants'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to={ROUTES.PUBLIC.LOGIN} replace />,
    },
    {
      element: <PublicRoute />,
      children: [
        {
          element: <PublicLayout />,
          children: [
            {
              path: ROUTES.PUBLIC.LOGIN,
              lazy: () =>
                import('@pages/LoginPage').then(m => ({ Component: m.LoginPage })),
            },
          ],
        },
      ],
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <PrivateLayout />,
          children: [
            {
              path: '/app',
              element: <Navigate to={ROUTES.PRIVATE.HOME} replace />,
            },
            {
              path: ROUTES.PRIVATE.HOME,
              lazy: () =>
                import('@pages/HomePage').then(m => ({ Component: m.HomePage })),
            },
          ],
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to={ROUTES.PUBLIC.LOGIN} replace />,
    },
  ],
  { basename: import.meta.env.BASE_URL }
)

export function AppRouter() {
  return <RouterProvider router={router} />
}
