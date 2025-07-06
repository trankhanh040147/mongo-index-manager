import { ApiResponse, AuthLogin, AuthRegister, AuthTokens, UserProfile, Database, DatabaseCreate, DatabaseUpdate, Index, IndexCreate, IndexUpdate, ComparisonResult, CompareByCollectionsRequest, CompareByDatabaseRequest, SyncByCollectionsRequest, ListRequest } from '@/types/api'

const API_BASE_URL = '/api/v1'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = localStorage.getItem('access_token')
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('access_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async register(data: AuthRegister): Promise<ApiResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: AuthLogin): Promise<ApiResponse<AuthTokens>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    return this.request('/auth/refresh-token', {
      method: 'POST',
    })
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request('/auth/profile')
  }

  async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Database endpoints
  async createDatabase(data: DatabaseCreate): Promise<ApiResponse<Database>> {
    return this.request('/databases', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async listDatabases(params: ListRequest = {}): Promise<ApiResponse<Database[]>> {
    return this.request('/databases/list', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async getDatabase(id: string): Promise<ApiResponse<Database>> {
    return this.request(`/databases/${id}`)
  }

  async updateDatabase(id: string, data: DatabaseUpdate): Promise<ApiResponse<Database>> {
    return this.request(`/databases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteDatabase(id: string): Promise<void> {
    await this.request(`/databases/${id}`, {
      method: 'DELETE',
    })
  }

  async listCollections(databaseId: string): Promise<ApiResponse<string[]>> {
    return this.request('/databases/collections/list', {
      method: 'POST',
      body: JSON.stringify({ database_id: databaseId }),
    })
  }

  // Index endpoints
  async createIndex(data: IndexCreate): Promise<ApiResponse<Index>> {
    return this.request('/indexes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getIndex(id: string): Promise<ApiResponse<Index>> {
    return this.request(`/indexes/${id}`)
  }

  async updateIndex(id: string, data: IndexUpdate): Promise<ApiResponse<Index>> {
    return this.request(`/indexes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteIndex(id: string): Promise<void> {
    await this.request(`/indexes/${id}`, {
      method: 'DELETE',
    })
  }

  async listIndexesByCollection(collectionId: string): Promise<ApiResponse<Index[]>> {
    return this.request('/indexes/list-by-collection', {
      method: 'POST',
      body: JSON.stringify({ collection_id: collectionId }),
    })
  }

  async compareIndexesByCollections(data: CompareByCollectionsRequest): Promise<ApiResponse<ComparisonResult>> {
    return this.request('/indexes/compare-by-collections', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async compareIndexesByDatabase(data: CompareByDatabaseRequest): Promise<ApiResponse<ComparisonResult>> {
    return this.request('/indexes/compare-by-database', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async syncIndexesByCollections(data: SyncByCollectionsRequest): Promise<ApiResponse> {
    return this.request('/indexes/sync-by-collections', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)