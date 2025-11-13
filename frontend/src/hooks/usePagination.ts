/**
 * usePagination Hook
 */

import { useState, useCallback } from 'react'
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_DEFAULT_PAGE } from '../utils/constants'

interface UsePaginationOptions {
  defaultPage?: number
  defaultLimit?: number
  maxLimit?: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    defaultPage = PAGINATION_DEFAULT_PAGE,
    defaultLimit = PAGINATION_DEFAULT_LIMIT,
    maxLimit = PAGINATION_DEFAULT_LIMIT,
  } = options

  const [page, setPage] = useState(defaultPage)
  const [limit, setLimit] = useState(defaultLimit)

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleLimitChange = useCallback((newLimit: number) => {
    const clampedLimit = Math.min(newLimit, maxLimit)
    setLimit(clampedLimit)
    setPage(1) // Reset to first page when limit changes
  }, [maxLimit])

  const reset = useCallback(() => {
    setPage(defaultPage)
    setLimit(defaultLimit)
  }, [defaultPage, defaultLimit])

  return {
    page,
    limit,
    setPage: handlePageChange,
    setLimit: handleLimitChange,
    reset,
  }
}

