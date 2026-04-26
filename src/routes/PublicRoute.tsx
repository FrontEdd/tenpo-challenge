import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { ROUTES } from '@config/constants'

export function PublicRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={ROUTES.PRIVATE.HOME} replace />
  }

  return <Outlet />
}
