/**
 * API Error Handler
 */

import { AxiosError } from 'axios'
import type { ApiError } from '../types/api'

/**
 * Handle API errors and return user-friendly messages
 */
export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError && error.response) {
    const apiError = error.response.data as ApiError

    if (typeof apiError.error === 'string') {
      return apiError.error
    }

    if (typeof apiError.error === 'object') {
      // Handle validation errors
      const errors = Object.values(apiError.error).flat()
      return errors.join(', ')
    }

    switch (apiError.status_code) {
      case 400:
        return 'Validation Error. Please check your input.'
      case 401:
        return 'Unauthorized. Please login again.'
      case 404:
        return 'Resource not found.'
      case 409:
        return 'Conflict. This resource already exists.'
      case 412:
        return 'Precondition Failed. Please check your connection.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return 'An error occurred. Please try again.'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Network error. Please check your connection.'
}

