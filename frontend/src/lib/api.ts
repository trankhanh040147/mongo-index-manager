import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { ApiError, ApiResponse } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8216/api/doctor-manager-api/v1'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000')

class ApiClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = this.getRefreshToken()
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken)
              const { accessToken } = response.data
              this.setAccessToken(accessToken)
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
              }
              
              return this.instance(originalRequest)
            }
          } catch (refreshError) {
            this.clearTokens()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const errorData = error.response.data as any
      return {
        error: errorData.error || errorData.message || 'An error occurred',
        statusCode: error.response.status,
        errorCode: errorData.errorCode,
      }
    }

    if (error.request) {
      return {
        error: 'Network error - please check your connection',
        statusCode: 0,
      }
    }

    return {
      error: error.message || 'An unexpected error occurred',
      statusCode: 0,
    }
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  private setAccessToken(token: string): void {
    localStorage.setItem('accessToken', token)
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  private async refreshAccessToken(refreshToken: string) {
    return this.instance.post('/auth/refresh-token', {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    })
  }

  // Public methods
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.instance.get(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.instance.post(url, data)
    return response.data
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.instance.put(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.instance.delete(url)
    return response.data
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  clearAllTokens(): void {
    this.clearTokens()
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }
}

export const apiClient = new ApiClient()