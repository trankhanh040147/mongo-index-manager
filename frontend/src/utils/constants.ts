/**
 * Application Constants
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'MongoDB Index Manager'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api/doctor-manager-api/v1'

export const ACCESS_TOKEN_EXPIRY = 10 * 60 * 1000 // 10 minutes in milliseconds
export const REFRESH_TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
export const TOKEN_REFRESH_THRESHOLD = 8 * 60 * 1000 // Refresh 8 minutes before expiry

export const PAGINATION_DEFAULT_LIMIT = 50
export const PAGINATION_MAX_LIMIT = 50
export const PAGINATION_DEFAULT_PAGE = 1

