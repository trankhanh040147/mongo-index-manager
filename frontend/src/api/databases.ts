/**
 * Database API
 */

import { apiClient } from './client'
import type {
  CreateDatabaseRequest,
  UpdateDatabaseRequest,
  ListDatabasesRequest,
  ListCollectionsRequest,
  Database,
  Collection,
} from '../types/database'
import type { ApiResponse } from '../types/api'

export const databaseApi = {
  /**
   * List databases with pagination
   */
  list: async (params: ListDatabasesRequest) => {
    const response = await apiClient.post<
      ApiResponse<Database[]>
    >('/databases/list', params)
    return response
  },

  /**
   * Get database by ID
   */
  get: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Database>>(`/databases/${id}`)
    return response
  },

  /**
   * Create new database
   */
  create: async (data: CreateDatabaseRequest) => {
    const response = await apiClient.post<ApiResponse<{ id: string }>>(
      '/databases/',
      data
    )
    return response
  },

  /**
   * Update database
   */
  update: async (id: string, data: UpdateDatabaseRequest) => {
    const response = await apiClient.put<ApiResponse<{ success: boolean }>>(
      `/databases/${id}/`,
      data
    )
    return response
  },

  /**
   * Delete database
   */
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/databases/${id}/`
    )
    return response
  },

  /**
   * List collections for a database
   */
  listCollections: async (params: ListCollectionsRequest) => {
    const response = await apiClient.post<
      ApiResponse<Collection[]>
    >('/databases/collections/list', params)
    return response
  },
}

