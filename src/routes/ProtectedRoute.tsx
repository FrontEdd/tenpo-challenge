import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { ROUTES } from '@config/constants'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />
  }

  return <Outlet />
}
