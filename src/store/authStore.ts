import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@app-types/index'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string) => {
        set({ isLoading: true })

        try {
          // Simular delay de red
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Fake login - generar token fake
          const fakeToken = `fake-jwt-token-${Date.now()}`
          const fakeUser: User = {
            id: '1',
            email,
            name: email.split('@')[0],
          }

          set({
            token: fakeToken,
            user: fakeUser,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw new Error('Error en el login')
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'auth-storage', // nombre en localStorage
      partialize: state => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
