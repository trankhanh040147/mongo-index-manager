import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile } from '@/types/api'
import { apiClient } from '@/lib/api'

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (identity: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (identity: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await apiClient.login({ identity, password })
          if (response.data) {
            apiClient.setToken(response.data.access_token)
            localStorage.setItem('refresh_token', response.data.refresh_token)
            await get().loadUser()
          }
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true })
        try {
          await apiClient.register({ username, email, password })
          // After successful registration, automatically log in
          await get().login(email, password)
        } catch (error) {
          console.error('Registration failed:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        apiClient.clearToken()
        set({ user: null, isAuthenticated: false })
      },

      loadUser: async () => {
        try {
          const response = await apiClient.getProfile()
          if (response.data) {
            set({ user: response.data, isAuthenticated: true })
          }
        } catch (error) {
          console.error('Failed to load user:', error)
          get().logout()
        }
      },

      updateProfile: async (data: Partial<UserProfile>) => {
        try {
          const response = await apiClient.updateProfile(data)
          if (response.data) {
            set({ user: response.data })
          }
        } catch (error) {
          console.error('Failed to update profile:', error)
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)