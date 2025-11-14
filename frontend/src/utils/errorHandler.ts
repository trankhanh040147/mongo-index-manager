/**
 * API Error Handler
 */

import { AxiosError } from 'axios'
import type { ApiError } from '../types/api'

/**
 * Handle API errors and return user-friendly messages
 */
export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    // Network error (no response)
    if (!error.response) {
      if (error.code === 'ECONNREFUSED') {
        return 'Cannot connect to server. Please ensure the backend API is running.'
      }
      return 'Network error. Please check your connection and ensure the backend API is running.'
    }

    const apiError = error.response.data as ApiError | undefined
    const status = error.response.status

    // Try to extract error message from response
    if (apiError) {
      if (typeof apiError.error === 'string') {
        return apiError.error
      }

      if (typeof apiError.error === 'object') {
        // Handle validation errors
        const errors = Object.values(apiError.error).flat()
        return errors.join(', ')
      }
    }

    // Handle status codes
    switch (status) {
      case 400:
        return apiError?.error as string || 'Validation Error. Please check your input.'
      case 401:
        return 'Unauthorized. Please login again.'
      case 404:
        return 'Resource not found.'
      case 409:
        return apiError?.error as string || 'Conflict. This resource already exists.'
      case 412:
        return 'Precondition Failed. Please check your connection.'
      case 500:
        // Try to get more details from response
        const errorDetail = apiError?.error || error.response.data?.message || error.response.data
        return `Server error: ${typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail)}. Please check backend logs.`
      default:
        return `Error ${status}: ${apiError?.error || 'An error occurred. Please try again.'}`
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}

