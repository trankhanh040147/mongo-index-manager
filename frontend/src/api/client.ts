/**
 * API Client Configuration
 */

import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '../utils/constants'
import { useAuthStore } from '../store/authStore'
import { isTokenExpired, isTokenExpiringSoon } from '../utils/token'
import { authApi } from './auth'

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor: Handle token refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = useAuthStore.getState().refreshToken

      if (!refreshToken || isTokenExpired(refreshToken)) {
        // Refresh token expired, logout
        useAuthStore.getState().logout()
        processQueue(error, null)
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        // Try to refresh token
        const response = await authApi.refreshToken()
        const { access_token, refresh_token } = response.data.data!

        // Update store
        useAuthStore.getState().refreshAccessToken(access_token)
        if (refresh_token) {
          useAuthStore.setState({ refreshToken: refresh_token })
        }

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`
        }

        processQueue(null, access_token)
        isRefreshing = false

        // Retry original request
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout
        useAuthStore.getState().logout()
        processQueue(refreshError as AxiosError, null)
        isRefreshing = false
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auto-refresh token before expiration (only in browser)
if (typeof window !== 'undefined') {
  // Use a ref to track interval ID for cleanup if needed
  const intervalId = setInterval(() => {
    const { accessToken, refreshToken } = useAuthStore.getState()

    if (accessToken && refreshToken && isTokenExpiringSoon(accessToken)) {
      // Token is expiring soon, refresh it
      authApi
        .refreshToken()
        .then((response) => {
          const { access_token, refresh_token } = response.data.data!
          useAuthStore.getState().refreshAccessToken(access_token)
          if (refresh_token) {
            useAuthStore.setState({ refreshToken: refresh_token })
          }
        })
        .catch(() => {
          // Refresh failed, logout will be handled by interceptor
        })
    }
  }, 60000) // Check every minute

  // Cleanup on page unload (optional)
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId)
  })
}

