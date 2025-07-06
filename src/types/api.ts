// API Response Types
export interface ApiResponse<T = any> {
  status_code: number
  error_code: number
  data?: T
  error?: string | object
  extra?: {
    page?: number
    limit?: number
    total?: number
  }
}

// Auth Types
export interface AuthRegister {
  username: string
  email: string
  password: string
}

export interface AuthLogin {
  identity: string
  password: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface UserProfile {
  username: string
  email: string
  first_name?: string
  last_name?: string
  avatar?: string
}

// Database Types
export interface Database {
  id: string
  name: string
  connection_string: string
  created_at: string
  updated_at: string
}

export interface DatabaseCreate {
  name: string
  connection_string: string
}

export interface DatabaseUpdate {
  name?: string
  connection_string?: string
}

// Index Types
export interface Index {
  id: string
  collection_id: string
  name: string
  keys: Record<string, number>
  unique: boolean
  created_at?: string
  updated_at?: string
}

export interface IndexCreate {
  collection_id: string
  name: string
  keys: Record<string, number>
  unique?: boolean
}

export interface IndexUpdate {
  name?: string
  unique?: boolean
}

// Comparison Types
export interface ComparisonResult {
  only_in_source: Index[]
  only_in_target: Index[]
  different: {
    source: Index
    target: Index
  }[]
}

export interface CompareByCollectionsRequest {
  source_collection_id: string
  target_collection_id: string
}

export interface CompareByDatabaseRequest {
  source_database_id: string
  target_database_id: string
}

export interface SyncByCollectionsRequest {
  source_collection_id: string
  target_collection_id: string
}

// List Request
export interface ListRequest {
  page?: number
  limit?: number
}

// Collection Type (assumed)
export interface Collection {
  name: string
  database_id: string
  document_count?: number
  size?: number
}