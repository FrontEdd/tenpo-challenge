import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { token, user, isAuthenticated, isLoading, login, logout } =
    useAuthStore()

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}
