/**
 * Index API
 */

import { apiClient } from './client'
import type {
  CreateIndexRequest,
  UpdateIndexRequest,
  ListIndexesRequest,
  CompareIndexesRequest,
  CompareByDatabaseRequest,
  SyncIndexesRequest,
  Index,
  IndexComparison,
} from '../types/index'
import type { ApiResponse } from '../types/api'

export const indexApi = {
  /**
   * List indexes by collection
   */
  listByCollection: async (params: ListIndexesRequest) => {
    const response = await apiClient.post<ApiResponse<Index[]>>(
      '/indexes/list-by-collection',
      params
    )
    return response
  },

  /**
   * Get index by ID
   */
  get: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Index>>(`/indexes/${id}`)
    return response
  },

  /**
   * Create new index
   */
  create: async (data: CreateIndexRequest) => {
    const response = await apiClient.post<ApiResponse<{ id: string }>>(
      '/indexes/',
      data
    )
    return response
  },

  /**
   * Update index
   */
  update: async (id: string, data: UpdateIndexRequest) => {
    const response = await apiClient.put<ApiResponse<{ success: boolean }>>(
      `/indexes/${id}`,
      data
    )
    return response
  },

  /**
   * Delete index
   */
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/indexes/${id}`
    )
    return response
  },

  /**
   * Compare indexes by collections
   */
  compareByCollections: async (params: CompareIndexesRequest) => {
    const response = await apiClient.post<ApiResponse<IndexComparison[]>>(
      '/indexes/compare-by-collections',
      params
    )
    return response
  },

  /**
   * Compare all indexes in database
   */
  compareByDatabase: async (params: CompareByDatabaseRequest) => {
    const response = await apiClient.post<ApiResponse<IndexComparison[]>>(
      '/indexes/compare-by-database',
      params
    )
    return response
  },

  /**
   * Sync indexes by collections
   */
  syncByCollections: async (params: SyncIndexesRequest) => {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      '/indexes/sync-by-collections',
      params
    )
    return response
  },
}

