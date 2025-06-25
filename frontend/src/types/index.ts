export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  identity: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface Database {
  id: string
  name: string
  description: string
  uri: string
  dbName: string
  createdAt: string
  updatedAt: string
}

export interface DatabaseCreateRequest {
  name: string
  description?: string
  uri: string
  dbName: string
  isTestConnection?: boolean
  isSyncIndex?: boolean
}

export interface Collection {
  collection: string
  totalIndexes: number
}

export interface Index {
  id: string
  collection: string
  name: string
  keySignature: string
  keys: IndexKey[]
  options: IndexOptions
  databaseId: string
  createdAt: string
  updatedAt: string
}

export interface IndexKey {
  field: string
  value: number
}

export interface IndexOptions {
  expireAfterSeconds?: number
  isUnique: boolean
}

export interface IndexCreateRequest {
  collection: string
  name?: string
  keys: IndexKey[]
  options: IndexOptions
  databaseId: string
}

export interface CompareResult {
  collection: string
  missingIndexes: CompareIndex[]
  matchedIndexes: CompareIndex[]
  redundantIndexes: CompareIndex[]
}

export interface CompareIndex {
  name: string
  keys: IndexKey[]
  options: IndexOptions
}

export interface ApiResponse<T> {
  data: T
  statusCode: number
  errorCode?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  statusCode: number
  extra: {
    limit: number
    page: number
    total: number
  }
}

export interface ApiError {
  error: string
  statusCode: number
  errorCode?: number
}