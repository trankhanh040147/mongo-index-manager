/**
 * API Response Types
 */

export interface ApiResponse<T = unknown> {
  status_code: number
  error_code: number
  data?: T
  error?: string | Record<string, unknown>
  extra?: PaginationExtra
}

export interface PaginationExtra {
  limit: number
  page: number
  total: number | null
}

export interface ApiError {
  status_code: number
  error_code: number
  error: string | Record<string, unknown>
}

