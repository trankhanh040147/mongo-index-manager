/**
 * Authentication API
 */

import { apiClient } from './client'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateProfileRequest,
  UserProfile,
} from '../types/auth'
import type { ApiResponse } from '../types/api'

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      '/auth/register',
      data
    )
    return response
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      data
    )
    return response
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/refresh-token'
    )
    return response
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/auth/profile')
    return response
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileRequest) => {
    const response = await apiClient.put<ApiResponse<{ success: boolean }>>(
      '/auth/profile',
      data
    )
    return response
  },
}

