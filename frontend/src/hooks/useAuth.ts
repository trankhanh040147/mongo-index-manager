/**
 * useAuth Hook
 */

import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import { handleApiError } from '../utils/errorHandler'
import { useMessage } from './useMessage'
import type { LoginRequest, RegisterRequest } from '../types/auth'

// Import store directly for setState
const authStore = useAuthStore

export function useAuth() {
  const { login: setLogin, logout, updateProfile, isAuthenticated, user } =
    useAuthStore()
  const message = useMessage()

  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data)
      const { access_token, refresh_token } = response.data.data!

      // Store tokens first so they're available for subsequent API calls
      authStore.setState({
        accessToken: access_token,
        refreshToken: refresh_token,
        isAuthenticated: true,
      })

      // Get user profile (now with token in store, interceptor will add it to request)
      const profileResponse = await authApi.getProfile()
      const userProfile = profileResponse.data.data!

      // Update store with user profile (setLogin will update user and ensure isAuthenticated is true)
      setLogin(access_token, refresh_token, userProfile)
      
      message.success('Login successful')
      return { success: true }
    } catch (error) {
      // If profile fetch fails, clear tokens
      authStore.getState().logout()
      const errorMessage = handleApiError(error)
      message.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      await authApi.register(data)
      message.success('Registration successful. Please login.')
      return { success: true }
    } catch (error) {
      const errorMessage = handleApiError(error)
      message.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateUserProfile = async (data: Parameters<typeof authApi.updateProfile>[0]) => {
    try {
      await authApi.updateProfile(data)
      const profileResponse = await authApi.getProfile()
      if (profileResponse.data.data) {
        updateProfile(profileResponse.data.data)
      }
      message.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      const errorMessage = handleApiError(error)
      message.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const handleLogout = () => {
    logout()
    message.info('Logged out successfully')
  }

  return {
    login,
    register,
    logout: handleLogout,
    updateProfile: updateUserProfile,
    isAuthenticated,
    user,
  }
}

