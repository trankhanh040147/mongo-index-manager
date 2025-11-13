/**
 * Index Types
 */

export interface IndexKey {
  field: string
  value: 1 | -1 // 1 for ascending, -1 for descending
}

export interface IndexOptions {
  expire_after_seconds?: number | null
  is_unique: boolean
}

export interface Index {
  id: string
  database_id: string
  created_at: string
  updated_at: string
  collection: string
  name: string
  key_signature: string
  options: IndexOptions
  keys: IndexKey[]
}

export interface CreateIndexRequest {
  database_id: string
  collection: string
  name?: string
  options?: IndexOptions
  keys: IndexKey[]
}

export interface UpdateIndexRequest {
  name?: string
  options?: IndexOptions
  keys?: IndexKey[]
}

export interface ListIndexesRequest {
  database_id: string
  collection: string
  query?: string
  page?: number
  limit?: number
}

export interface CompareIndexesRequest {
  database_id: string
  collections: string[]
}

export interface CompareByDatabaseRequest {
  database_id: string
}

export interface SyncIndexesRequest {
  database_id: string
  collections: string[]
}

export interface IndexComparison {
  collection: string
  missing_indexes: Index[]
  matched_indexes: Index[]
  redundant_indexes: Index[]
}

