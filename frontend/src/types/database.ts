/**
 * Database Types
 */

export interface Database {
  id: string
  created_at: string
  updated_at: string
  name: string
  description?: string
  uri: string
  db_name: string
}

export interface CreateDatabaseRequest {
  name: string
  description?: string
  uri: string
  db_name: string
  is_test_connection?: boolean
  is_sync_index?: boolean
}

export interface UpdateDatabaseRequest {
  name: string
  description?: string
  uri: string
  db_name: string
  is_test_connection?: boolean
}

export interface ListDatabasesRequest {
  query?: string
  page?: number
  limit?: number
}

export interface Collection {
  collection: string
  total_indexes: number
}

export interface ListCollectionsRequest {
  database_id: string
  query?: string
  page?: number
  limit?: number
}

